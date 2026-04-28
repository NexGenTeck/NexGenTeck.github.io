"""
LLM + RoBERTa based analysis for the NexGenTeck AI Chatbot.
Uses:
- RoBERTa for sentiment analysis (word-level understanding)
- Groq LLM for intent interpretation (no hardcoded patterns)

This is a hybrid approach: RoBERTa for sentiment, LLM for intent.
"""

from transformers import pipeline
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Dict
import logging
import json

from config import config

logger = logging.getLogger(__name__)


class LLMAnalyzer:
    """
    Hybrid analyzer combining RoBERTa and LLM.
    - RoBERTa: Sentiment analysis (word dictionary based)
    - LLM: Intent detection and greeting classification (softcoded)
    """
    
    _instance = None
    _llm = None
    _sentiment_model = None
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the LLM and RoBERTa models."""
        # Initialize LLM for intent detection
        if LLMAnalyzer._llm is None:
            logger.info("Initializing LLM analyzer")
            try:
                LLMAnalyzer._llm = ChatGroq(
                    api_key=config.GROQ_API_KEY,
                    model=config.LLM_MODEL,
                    temperature=0.1,  # Low temperature for consistent analysis
                    max_tokens=256
                )
                logger.info("LLM analyzer initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize LLM analyzer: {e}")
                LLMAnalyzer._llm = None
        
        # Initialize RoBERTa for sentiment analysis
        if LLMAnalyzer._sentiment_model is None:
            logger.info("Initializing RoBERTa sentiment model")
            try:
                # Use explicit device=-1 for CPU and disable multiprocessing on Windows
                import os
                os.environ["TOKENIZERS_PARALLELISM"] = "false"
                
                # Explicitly load model with low_cpu_mem_usage=False to avoid multiprocessing issues on Windows
                from transformers import AutoModelForSequenceClassification, AutoTokenizer
                
                model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
                
                # Load tokenizer and model explicitly
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(
                    model_name,
                    low_cpu_mem_usage=False  # Disable multiprocessing-based loading
                )
                
                LLMAnalyzer._sentiment_model = pipeline(
                    "sentiment-analysis",
                    model=model,
                    tokenizer=tokenizer,
                    top_k=None,
                    device=-1,  # Force CPU
                )
                logger.info("RoBERTa sentiment model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize RoBERTa model: {e}")
                LLMAnalyzer._sentiment_model = None
    
    async def analyze(self, message: str) -> Dict[str, any]:
        """
        Analyze the user message using RoBERTa (sentiment) and LLM (intent).
        
        Args:
            message: User message to analyze
            
        Returns:
            Dict with analysis results
        """
        result = {
            'is_greeting': False,
            'intent': 'general',
            'sentiment': 'neutral',
            'sentiment_score': 0.5,
            'needs_context': True,
            'context_topics': [],
            'confidence': 0.5
        }
        
        # Step 1: RoBERTa sentiment analysis
        sentiment_result = self._analyze_sentiment_roberta(message)
        result.update(sentiment_result)
        
        # Step 2: LLM intent analysis (softcoded - no hardcoded patterns)
        intent_result = await self._analyze_intent_llm(message)
        result.update(intent_result)
        
        logger.info(f"Analysis: sentiment={result['sentiment']}, intent={result['intent']}, needs_context={result['needs_context']}")
        return result
    
    def _analyze_sentiment_roberta(self, message: str) -> Dict[str, any]:
        """
        Analyze sentiment using RoBERTa model.
        RoBERTa uses word-level understanding for accurate sentiment detection.
        
        Args:
            message: Text to analyze
            
        Returns:
            Dict with 'sentiment' and 'sentiment_score'
        """
        if LLMAnalyzer._sentiment_model is None:
            return {'sentiment': 'neutral', 'sentiment_score': 0.5}
        
        try:
            # Truncate to model's max length
            results = LLMAnalyzer._sentiment_model(message[:512])
            
            if results and results[0]:
                # Find the highest scoring sentiment
                best = max(results[0], key=lambda x: x['score'])
                label = best['label'].lower()
                
                # Map RoBERTa labels to standard sentiments
                sentiment_map = {
                    'positive': 'positive',
                    'negative': 'negative',
                    'neutral': 'neutral',
                    'pos': 'positive',
                    'neg': 'negative',
                    'neu': 'neutral'
                }
                
                sentiment = sentiment_map.get(label, 'neutral')
                logger.debug(f"RoBERTa sentiment: {sentiment} (score: {best['score']:.3f})")
                
                return {
                    'sentiment': sentiment,
                    'sentiment_score': best['score']
                }
                
        except Exception as e:
            logger.error(f"RoBERTa sentiment analysis error: {e}")
        
        return {'sentiment': 'neutral', 'sentiment_score': 0.5}
    
    async def _analyze_intent_llm(self, message: str) -> Dict[str, any]:
        """
        Analyze intent using LLM (fully softcoded).
        LLM interprets intent dynamically without hardcoded patterns.
        
        Args:
            message: Text to analyze
            
        Returns:
            Dict with intent analysis results
        """
        if LLMAnalyzer._llm is None:
            return self._get_default_intent()
        
        try:
            analysis_prompt = """You are an intelligent message analyzer for a business website chatbot (NexGenTeck - a tech company).

Analyze the user's message and determine:

1. **is_greeting**: Is this a greeting or casual hello? (true/false)
2. **intent**: What does the user want? One of: "greeting", "question", "request", "complaint", "feedback", "contact", "hire", "quote", "general", "off_topic"
3. **is_lead_intent**: Does this message indicate the user wants to contact us, hire us, get a quote, or work with us? (true/false)
   - Examples: "I want to hire you", "contact me", "get a quote", "I need your services", "how can I work with you"
4. **is_off_topic**: Is this message completely unrelated to NexGenTeck's business scope? (true/false)
   - NexGenTeck scope: web dev, mobile apps, e-commerce, SEO, social media, software, 3D graphics, video editing, AI/ML, company info, pricing, contact
   - OFF-TOPIC: writing code snippets, solving math, general knowledge, weather, jokes, creative writing, explaining unrelated tech
   - ON-TOPIC: service questions, pricing, project inquiries, contact requests
5. **needs_context**: Does this message need information from our knowledge base to answer properly? (true/false)
   - Greetings, casual chat, and off-topic messages do NOT need context
   - Questions about services, pricing, company info DO need context
6. **context_topics**: If needs_context is true, what topics should we search for? (list of keywords)
7. **contact_data**: If the user provides name, email, phone, or project details, extract them (or null if none)

IMPORTANT:
- Be intelligent about understanding what the user wants
- Do not use rigid rules - understand the intent naturally
- Detect lead generation intent (contact, hire, quote requests)
- The sentiment is already analyzed by a separate model, focus on INTENT

Respond ONLY with valid JSON in this exact format:
{
    "is_greeting": true/false,
    "intent": "greeting|question|request|complaint|feedback|contact|hire|quote|general|off_topic",
    "is_lead_intent": true/false,
    "is_off_topic": true/false,
    "needs_context": true/false,
    "context_topics": ["topic1", "topic2"],
    "contact_data": null or {"name": "...", "email": "...", "phone": "...", "project": "..."}
}"""
            
            response = LLMAnalyzer._llm.invoke([
                SystemMessage(content=analysis_prompt),
                HumanMessage(content=f"Analyze this message: \"{message}\"")
            ])
            
            # Parse JSON response
            return self._parse_intent_response(response.content)
            
        except Exception as e:
            logger.error(f"LLM intent analysis error: {e}")
            return self._get_default_intent()
    
    def _parse_intent_response(self, response: str) -> Dict[str, any]:
        """Parse the LLM's JSON response for intent analysis."""
        try:
            response = response.strip()
            
            # Handle markdown code blocks
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            result = json.loads(response.strip())
            
            return {
                "is_greeting": result.get("is_greeting", False),
                "intent": result.get("intent", "general"),
                "is_lead_intent": result.get("is_lead_intent", False),
                "is_off_topic": result.get("is_off_topic", False),
                "needs_context": result.get("needs_context", True),
                "context_topics": result.get("context_topics", []),
                "confidence": 0.9
            }
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse LLM response as JSON: {e}")
            return self._get_default_intent()
    
    def _get_default_intent(self) -> Dict[str, any]:
        """Return default intent when LLM fails."""
        return {
            "is_greeting": False,
            "intent": "general",
            "is_lead_intent": False,
            "is_off_topic": False,
            "needs_context": True,
            "context_topics": [],
            "confidence": 0.5
        }
    
    def should_retrieve_context(self, analysis: Dict) -> bool:
        """Determine if we should retrieve context - based on LLM's decision."""
        return analysis.get("needs_context", True)
    
    def get_search_query(self, message: str, analysis: Dict) -> str:
        """Build the search query for vector store using LLM-identified topics."""
        topics = analysis.get("context_topics", [])
        
        if topics:
            return f"{message} {' '.join(topics)}"
        
        return message


# Singleton instance
llm_analyzer = LLMAnalyzer()
