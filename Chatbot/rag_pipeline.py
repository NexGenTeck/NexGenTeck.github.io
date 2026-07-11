"""
RAG Pipeline using LangGraph for the NexGenTeck AI Chatbot.
Fully softcoded - uses LLM for all interpretation.
The chatbot is trained on website content and uses that as context for all responses.
"""

from typing import Dict, List, TypedDict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
import logging

from config import config
from vector_store import vector_store
from sentiment import llm_analyzer
from reranker import reranker

logger = logging.getLogger(__name__)


class ChatState(TypedDict):
    """State for the RAG pipeline."""
    message: str
    analysis: Dict
    candidates: List[tuple]
    context: List[str]
    response: str
    error: str


async def analyze_message(state: ChatState) -> ChatState:
    """
    Analyze the user message using LLM.
    No hardcoded patterns - LLM determines intent and needs.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with analysis
    """
    logger.info("Analyzing message with LLM")
    
    try:
        analysis = await llm_analyzer.analyze(state['message'])
        state['analysis'] = analysis
        logger.info(f"LLM determined: greeting={analysis.get('is_greeting')}, needs_context={analysis.get('needs_context')}")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        state['analysis'] = {
            'is_greeting': False,
            'needs_context': True,
            'intent': 'general',
            'sentiment': 'neutral'
        }
    
    return state


def should_retrieve(state: ChatState) -> str:
    """
    Route based on LLM's decision about whether context is needed.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Next node name
    """
    analysis = state.get('analysis', {})
    
    if llm_analyzer.should_retrieve_context(analysis):
        return "retrieve_context"
    else:
        return "generate_response"


def _is_list_or_entity_question(message: str) -> bool:
    text = (message or "").lower()
    keywords = (
        "list",
        "who is",
        "who are",
        "team",
        "partner",
        "portfolio",
        "projects",
        "services",
        "which project",
        "tell me about",
        "founder",
        "ceo",
        "pricing",
        "contact",
    )
    return any(k in text for k in keywords)


async def retrieve_context(state: ChatState) -> ChatState:
    """
    Stage 1 of 2-stage retrieval: broad bi-encoder candidate fetch from Qdrant.

    Fetches RERANK_CANDIDATE_DOCS candidates — a wider pool than
    what the LLM will ultimately see.  The next node (rerank_context) will
    re-score this pool with a cross-encoder and keep only the best MAX_CONTEXT_DOCS.

    Args:
        state: Current pipeline state

    Returns:
        Updated state with raw candidates list
    """
    logger.info("[Stage 1/2] Bi-encoder retrieval from Qdrant")

    try:
        search_query = llm_analyzer.get_search_query(
            state['message'],
            state['analysis']
        )

        candidate_count = (
            config.RERANK_CANDIDATE_DOCS
            if config.ENABLE_RERANKING
            else config.MAX_CONTEXT_DOCS
        )
        if _is_list_or_entity_question(state.get("message", "")):
            candidate_count = max(candidate_count, 40)

        results = vector_store.search(
            query=search_query,
            n_results=candidate_count
        )

        state['candidates'] = results
        logger.info(
            "[Stage 1/2] Fetched %d candidates (re-ranking %s)",
            len(results),
            "enabled" if config.ENABLE_RERANKING else "disabled",
        )

    except Exception as exc:
        logger.error(f"Context retrieval error: {exc}")
        state['candidates'] = []

    return state


async def rerank_context(state: ChatState) -> ChatState:
    """
    Stage 2 of 2-stage retrieval: cross-encoder re-ranking.

    Takes the wide candidate pool from Stage 1, scores every (query, doc)
    pair jointly with a cross-encoder, and keeps only the top-N most
    relevant documents for the LLM.  This removes noisy / tangential chunks
    that bi-encoder similarity lets through.

    If re-ranking is disabled or the model failed to load, the bi-encoder
    ordering is preserved and the pool is simply trimmed to MAX_CONTEXT_DOCS.

    Args:
        state: Current pipeline state (must contain 'candidates')

    Returns:
        Updated state with 'context' list ready for prompt injection
    """
    logger.info("[Stage 2/2] Cross-encoder re-ranking")

    candidates = state.get('candidates', [])
    top_n = config.MAX_CONTEXT_DOCS
    if _is_list_or_entity_question(state.get("message", "")):
        top_n = max(top_n, 12)

    try:
        reranked = reranker.rerank(
            query=state['message'],
            candidates=candidates,
            top_n=top_n,
        )

        context = []
        for doc, score, metadata in reranked:
            source = metadata.get('source', 'website')

            logger.debug("[rerank] score=%.3f  source=%s  preview=%s", score, source, doc[:80])
            context.append(f"[Source: {source}]\n{doc}")

        state['context'] = context
        logger.info(
            "[Stage 2/2] Re-ranking complete: %d candidates → %d final docs for LLM",
            len(candidates),
            len(context),
        )

    except Exception as exc:
        logger.error(f"Re-ranking error: {exc} — using raw candidates")
       
        state['context'] = [
            f"[Source: {meta.get('source', 'website')}]\n{doc}"
            for doc, _dist, meta in candidates[:config.MAX_CONTEXT_DOCS]
        ]

    return state


async def generate_response(state: ChatState) -> ChatState:
    """
    Generate a response using Groq LLM with website context.
    The LLM uses ONLY the website content to respond.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with response
    """
    logger.info("Generating LLM response using website context")
    
    try:

        llm = ChatGroq(
            api_key=config.GROQ_API_KEY,
            model=config.LLM_MODEL,
            temperature=config.LLM_TEMPERATURE,
            max_tokens=config.LLM_MAX_TOKENS
        )
        

        system_prompt = build_system_prompt(state['context'], state['analysis'])
        

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=state['message'])
        ]
        
        response = llm.invoke(messages)
        state['response'] = response.content
        
        logger.info("Response generated successfully")
        
    except Exception as e:
        logger.error(f"LLM generation error: {e}")
        state['error'] = str(e)
        state['response'] = get_fallback_response()
    
    return state


def build_system_prompt(context: List[str], analysis: Dict) -> str:
    """
    Build the AgenticRAG system prompt with website context.
    Implements lead generation awareness and professional RAG responses.
    
    Args:
        context: Retrieved context documents from website
        analysis: LLM analysis of the message
        
    Returns:
        System prompt string
    """

    base_prompt = """You are the NexGenTeck website assistant.

=== ROLE & MISSION ===
1. Answer questions about NexGenTeck using retrieved website knowledge documents
2. Identify contact / hire intent and guide users to the contact page

=== AUTHORITATIVE KNOWLEDGE RULES ===
- Retrieved website documents are the primary source of truth for company facts
- Distinguish services, portfolio projects, team members, and partners clearly
- Do NOT invent team members, partners, portfolio projects, pricing, or metrics
- Do NOT treat contact-form labels alone as an official service catalogue
- If context is incomplete, say so and offer contact: info@nexgenteck.com
- Ignore emergency-fallback snippets when richer source documents are present
- Prefer current metrics/services from context over any remembered training data

=== SERVICES GUIDANCE ===
When listing services, use only service documents in context. Do not infer an
official offering from a contact-form option, remembered information, or a
fallback snippet. If a service is not in the retrieved current catalogue, say
that it is not confirmed by the website content available to you.

=== LIST & ENTITY QUESTIONS ===
- For "list all" questions, enumerate every matching entity found in the context
- For team questions, use names and roles exactly as published
- For portfolio questions, use project titles, categories, technologies from context
- For partners, only name partners present in context

=== OPERATIONAL CONSTRAINTS ===
**Precision (CRITICAL):**
- ONLY answer from retrieved context for company-specific facts
- If the answer is not in the context: "I don't have that specific information, but I can connect you with our human team."
- NEVER hallucinate services, pricing, team members, partners, or projects

**Language Requirement:**
- **STRICTLY ENGLISH ONLY**: respond ONLY in English, regardless of the user's language.

**Data Handling:**
- If a user provides a name, email, or project detail, acknowledge it professionally
- For contact / hire intent: invite them to https://nexgenteck.com/contact

**Tone:**
- Professional, clear, and concise
- Speak as part of the team ("we offer", "our services", "our team")
"""

    base_prompt += """
=== SCOPE BOUNDARY (NON-NEGOTIABLE) ===
You are EXCLUSIVELY a business assistant for NexGenTeck. You MUST NOT:
- Write code, scripts, programs, or technical solutions of any kind
- Solve math problems, equations, or logical puzzles
- Answer general knowledge questions unrelated to NexGenTeck
- Perform tasks that a general-purpose AI assistant would do
- Use your pre-trained knowledge to fulfill requests outside NexGenTeck's scope

Any request outside NexGenTeck's business domain must be politely declined and redirected.
"""

    if analysis.get('is_off_topic') or analysis.get('intent') == 'off_topic':
        base_prompt += """
=== OFF-TOPIC REQUEST ===
The user asked something outside NexGenTeck's business scope.
- Politely decline the specific request in one short sentence
- Warmly redirect to what you CAN help with
- Keep it natural and conversational, not robotic
- Do NOT answer the off-topic request under any circumstances
"""

    if context:
        context_text = "\n\n---\n\n".join(context)
        base_prompt += f"""
=== RETRIEVED WEBSITE CONTEXT ===

{context_text}

=== END OF RETRIEVED CONTEXT ===

Use ONLY the information above for company-specific facts. If the question cannot be
answered from this context, acknowledge the limitation and offer human contact.
"""
    else:
        base_prompt += """
=== CONTEXT STATUS ===
No website documents were retrieved for this query.
Do not invent portfolio projects, team members, partners, or pricing.
Offer to connect the user with the human team for detailed information.
"""

    sentiment = analysis.get('sentiment', 'neutral')
    intent = analysis.get('intent', 'general')
    

    if analysis.get('is_lead_intent') or intent in ['contact', 'hire', 'quote']:
        base_prompt += """
=== LEAD GENERATION DETECTED ===
The user has expressed interest in contacting us or hiring our services.
- Acknowledge their interest enthusiastically
- Ask what specific service or project they're interested in (if not mentioned)
- Inform them: "I'm noting this as a lead in our system. Our team will reach out shortly!"
- If they provide contact details, confirm you've captured them
"""
    

    if sentiment == 'negative' and intent in ['question', 'request']:
        base_prompt += """
Note: The user's tone may seem frustrated, but they are seeking information.
Focus on being helpful and providing accurate information rather than being overly apologetic.
"""
    elif sentiment == 'negative' or intent == 'complaint':
        base_prompt += """
The user has a concern. Be especially empathetic, solution-oriented, and offer to escalate to our human team if needed.
"""
    elif analysis.get('is_greeting'):
        base_prompt += """
=== GREETING DETECTED ===
The user is greeting you. Keep your response SHORT and friendly (1-2 sentences max).
Example: "Hi! Welcome to NexGenTeck. How can I help you today?"
Do NOT give long introductions or list all services. Just greet back warmly and ask how you can help.
"""
    
    return base_prompt


def get_fallback_response() -> str:
    """
    Generate a fallback response when LLM fails.
    
    Returns:
        Fallback response string
    """
    return (
        "I apologize, but I'm having some technical difficulties right now. "
        "Please try again in a moment, or contact us directly at info@nexgenteck.com "
        "for immediate assistance with your questions about our services."
    )


def build_rag_pipeline() -> StateGraph:
    """
    Build the LangGraph RAG pipeline.
    Fully LLM-driven with no hardcoded routing.
    
    Returns:
        Compiled state graph
    """

    workflow = StateGraph(ChatState)
    

    workflow.add_node("analyze", analyze_message)
    workflow.add_node("retrieve_context", retrieve_context)   
    workflow.add_node("rerank_context", rerank_context)       
    workflow.add_node("generate_response", generate_response)
    workflow.set_entry_point("analyze")
    workflow.add_conditional_edges(
        "analyze",
        should_retrieve,
        {
            "retrieve_context": "retrieve_context",
            "generate_response": "generate_response"
        }
    )


    workflow.add_edge("retrieve_context", "rerank_context")
    workflow.add_edge("rerank_context", "generate_response")
    workflow.add_edge("generate_response", END)
    
    return workflow.compile()



rag_pipeline = build_rag_pipeline()


async def process_message(message: str) -> str:
    """
    Process a user message through the RAG pipeline.
    Uses LLM for all interpretation and website content for context.
    
    Args:
        message: User's message
        
    Returns:
        Bot's response
    """
    logger.info(f"Processing message: {message[:50]}...")
    initial_state: ChatState = {
        'message': message,
        'analysis': {},
        'candidates': [],
        'context': [],
        'response': '',
        'error': ''
    }
    
    try:
        result = await rag_pipeline.ainvoke(initial_state)
        return result.get('response', get_fallback_response())
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        return get_fallback_response()
