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
        if LLMAnalyzer._llm is None:
            logger.info("Initializing LLM analyzer")
            try:
                LLMAnalyzer._llm = ChatGroq(
                    api_key=config.GROQ_API_KEY,
                    model=config.LLM_MODEL,
                    temperature=0.1, 
                )
                logger.info("LLM analyzer initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize LLM analyzer: {e}")
                LLMAnalyzer._llm = None
        
        if LLMAnalyzer._sentiment_model is None:
            logger.info("Initializing RoBERTa sentiment model")
            try:
                import os
                os.environ["TOKENIZERS_PARALLELISM"] = "false"
                
                from transformers import AutoModelForSequenceClassification, AutoTokenizer
                
                model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
                

                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(
                    model_name,
                    low_cpu_mem_usage=False 
                )
                
                LLMAnalyzer._sentiment_model = pipeline(
                    "sentiment-analysis",
                    model=model,
                    tokenizer=tokenizer,
                    top_k=None,
                    device=-1,
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
        
        sentiment_result = self._analyze_sentiment_roberta(message)
        result.update(sentiment_result)
        
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
            results = LLMAnalyzer._sentiment_model(message[:512])
            
            if results and results[0]:
                best = max(results[0], key=lambda x: x['score'])
                label = best['label'].lower()
                
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
4. **is_off_topic**: Is this message completely unrelated to NexGenTeck's business scope? (true/false)
   - NexGenTeck scope: web dev, mobile apps, e-commerce, SEO, social media, software, 3D graphics, video editing, AI/ML, company info, pricing, contact
   - OFF-TOPIC: writing code snippets, solving math, general knowledge, weather, jokes, creative writing, explaining unrelated tech
   - ON-TOPIC: service questions, pricing, project inquiries, contact requests
5. **needs_context**: Does this need our knowledge base? Greetings and off-topic do NOT. Service/pricing questions DO. (true/false)
6. **context_topics**: If needs_context is true, search keywords. (list)
7. **contact_data**: Extracted contact info if provided, else null.
 
...
 
Respond ONLY with valid JSON:
{
    "is_greeting": true/false,
    "intent": "greeting|question|request|complaint|feedback|contact|hire|quote|general|off_topic",
    "is_lead_intent": true/false,
    "is_off_topic": true/false,
    "needs_context": true/false,
    "context_topics": ["topic1", "topic2"],
    "contact_data": null or {...}
}"""
            
            response = LLMAnalyzer._llm.invoke([
                SystemMessage(content=analysis_prompt),
                HumanMessage(content=f"Analyze this message: \"{message}\"")
            ])
            
            return self._parse_intent_response(response.content)
            
        except Exception as e:
            logger.error(f"LLM intent analysis error: {e}")
            return self._get_default_intent()
    
    def _parse_intent_response(self, response: str) -> Dict[str, any]:
        """Parse the LLM's JSON response for intent analysis."""
        try:
            response = response.strip()
        
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


llm_analyzer = LLMAnalyzer()