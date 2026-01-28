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

logger = logging.getLogger(__name__)


class ChatState(TypedDict):
    """State for the RAG pipeline."""
    message: str
    analysis: Dict
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
    
    # LLM decides if context is needed - no hardcoded rules
    if llm_analyzer.should_retrieve_context(analysis):
        return "retrieve_context"
    else:
        return "generate_response"


async def retrieve_context(state: ChatState) -> ChatState:
    """
    Retrieve relevant context from the website knowledge base.
    This is the ONLY source of information for the chatbot.
    
    Args:
        state: Current pipeline state
        
    Returns:
        Updated state with context
    """
    logger.info("Retrieving context from website knowledge base")
    
    try:
        # Build search query using LLM-identified topics
        search_query = llm_analyzer.get_search_query(
            state['message'], 
            state['analysis']
        )
        
        # Search for relevant documents from scraped website
        results = vector_store.search(
            query=search_query,
            n_results=config.MAX_CONTEXT_DOCS
        )
        
        # Extract content from results
        context = []
        for doc, distance, metadata in results:
            source = metadata.get('source', 'website')
            context.append(f"[Source: {source}]\n{doc}")
            logger.debug(f"Retrieved (distance={distance:.3f}): {doc[:100]}...")
        
        state['context'] = context
        logger.info(f"Retrieved {len(context)} relevant documents from website")
        
    except Exception as e:
        logger.error(f"Context retrieval error: {e}")
        state['context'] = []
    
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
        # Initialize Groq client
        llm = ChatGroq(
            api_key=config.GROQ_API_KEY,
            model=config.LLM_MODEL,
            temperature=config.LLM_TEMPERATURE,
            max_tokens=config.LLM_MAX_TOKENS
        )
        
        # Build system prompt with website context
        system_prompt = build_system_prompt(state['context'], state['analysis'])
        
        # Generate response
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
    Build the system prompt with website context.
    The LLM responds based ONLY on the website content provided.
    
    Args:
        context: Retrieved context documents from website
        analysis: LLM analysis of the message
        
    Returns:
        System prompt string
    """
    # Base prompt - instructs LLM to use ONLY website content with strong anti-hallucination rules
    base_prompt = """You are the AI assistant for NexGenTeck, a leading technology company.

CRITICAL RULES (MUST FOLLOW):
1. You MUST respond based ONLY on the website content provided below
2. If the information is not in the provided context, explicitly say "I don't have that specific information" and offer to help with what you do know
3. NEVER make up information about services, pricing, team members, or any details
4. If asked about a service NexGenTeck doesn't offer, explicitly state "We don't currently offer [service name]" - do NOT guess or assume
5. When uncertain about any specific detail, say "I'm not sure about that specific detail" rather than providing potentially inaccurate information
6. Be helpful, professional, and friendly
7. Keep responses concise but comprehensive

You represent NexGenTeck and should speak as part of the team ("we offer", "our services", etc.)
"""
    
    # Add website context
    if context:
        context_text = "\n\n---\n\n".join(context)
        base_prompt += f"""
=== WEBSITE CONTENT (Use this to answer) ===

{context_text}

=== END OF WEBSITE CONTENT ===

Respond to the user using ONLY the information above. If their question cannot be answered from this content, acknowledge that and offer to help with related topics you do have information about.
"""
    else:
        base_prompt += """
Note: No specific website content was retrieved for this query. 
Provide a helpful general response and offer to help with questions about NexGenTeck's services.
Do NOT make up services or details - only discuss what you know from previous context.
"""
    
    # SENTIMENT-INTENT RECONCILIATION
    # Prevents over-apologetic responses on neutral technical queries
    sentiment = analysis.get('sentiment', 'neutral')
    intent = analysis.get('intent', 'general')
    
    # If sentiment is negative but intent is a question/request, prioritize helpfulness
    if sentiment == 'negative' and intent in ['question', 'request']:
        base_prompt += """
Note: The user's tone may seem frustrated, but they are asking a question or making a request.
Focus on being helpful and providing accurate information rather than being overly apologetic.
Address their actual question directly and professionally.
"""
    elif sentiment == 'negative' or intent == 'complaint':
        base_prompt += """
The user seems to have a concern. Be especially empathetic and solution-oriented.
"""
    elif analysis.get('is_greeting'):
        base_prompt += """
The user is greeting you. Respond warmly and offer to help with information about NexGenTeck's services.
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
    # Create the graph
    workflow = StateGraph(ChatState)
    
    # Add nodes
    workflow.add_node("analyze", analyze_message)
    workflow.add_node("retrieve_context", retrieve_context)
    workflow.add_node("generate_response", generate_response)
    
    # Set entry point
    workflow.set_entry_point("analyze")
    
    # LLM decides the routing - no hardcoded greeting detection
    workflow.add_conditional_edges(
        "analyze",
        should_retrieve,
        {
            "retrieve_context": "retrieve_context",
            "generate_response": "generate_response"
        }
    )
    
    # After retrieval, always generate
    workflow.add_edge("retrieve_context", "generate_response")
    workflow.add_edge("generate_response", END)
    
    return workflow.compile()


# Create the pipeline instance
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
    
    # Initialize state
    initial_state: ChatState = {
        'message': message,
        'analysis': {},
        'context': [],
        'response': '',
        'error': ''
    }
    
    # Run the pipeline
    try:
        result = await rag_pipeline.ainvoke(initial_state)
        return result.get('response', get_fallback_response())
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        return get_fallback_response()
