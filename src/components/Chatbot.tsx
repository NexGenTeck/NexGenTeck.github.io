import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    id: number;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

export const Chatbot: React.FC = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const botGreeting: Message = {
                id: Date.now(),
                text: t('chatbot.defaultMessage'),
                isBot: true,
                timestamp: new Date(),
            };
            setMessages([botGreeting]);
        }
    }, [isOpen, t, messages.length]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputMessage,
            isBot: false,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentMessage = inputMessage;
        setInputMessage('');
        setIsTyping(true);


        try {
            // API URL: use environment variable for production, fallback for development
            const apiUrl = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: currentMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to get response from chatbot: ${response.status}`);
            }


            const data = await response.json();

            const botResponse: Message = {
                id: Date.now() + 1,
                text: data.response || "I'm sorry, I couldn't generate a response.",
                isBot: true,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "I apologize, but I'm having trouble connecting to the server. Please make sure the chatbot backend is running and try again.";

            const errorResponse: Message = {
                id: Date.now() + 1,
                text: errorMessage,
                isBot: true,
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className="ai-chatbot-container">
                <button
                    className={`ai-chatbot-toggle ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open AI Chatbot"
                >
                    <Bot />
                    {!isOpen && <span className="pulse-dot"></span>}
                </button>

                {isOpen && (
                    <div className="ai-chatbot-popover">
                        <div className="chatbot-header">
                            <div className="header-info">
                                <div className="avatar">
                                    <Bot />
                                </div>
                                <div className="header-text">
                                    <h4>AI Assistant (Beta)</h4>
                                    <span className="status">Online • {messages.length} messages</span>
                                </div>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close Chat"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="chatbot-messages">
                            {messages.length === 0 && !isTyping && (
                                <div className="empty-state">
                                    <MessageSquare className="empty-icon" />
                                    <p className="empty-text">Start a conversation!</p>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
                                >
                                    <div className="message-content">
                                        <p>{message.text}</p>
                                        <span className="message-time">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="message bot-message typing">
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input">
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="message-input"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    className="send-btn"
                                    aria-label="Send message"
                                >
                                    <Send />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
