import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, User, X } from 'lucide-react';
import { Client } from '@gradio/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useLanguage } from '../contexts/LanguageContext';
import logo from '../nexgentech-01.png';

interface Message {
    id: number;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

interface GradioMessage {
    role: 'user' | 'assistant';
    content: string;
}

const SPACE_ID =
    import.meta.env.VITE_HF_SPACE_ID ||
    'muhammadhasaan82/NexGenTeck';

type GradioClient = Awaited<ReturnType<typeof Client.connect>>;

let chatbotClientPromise: Promise<GradioClient> | null = null;

/**
 * Connect to the public NexGenTeck Hugging Face Space.
 *
 * The promise is reused between requests so the browser does not establish
 * a new Gradio client connection for every message.
 */
const getChatbotClient = (): Promise<GradioClient> => {
    if (!chatbotClientPromise) {
        chatbotClientPromise = Client.connect(SPACE_ID).catch((error) => {
            // Reset the cached connection after failure so a later request
            // can retry, for example after a sleeping Space wakes up.
            chatbotClientPromise = null;
            throw error;
        });
    }

    return chatbotClientPromise;
};

/** Render assistant Markdown without enabling raw HTML. */
export const BotMessageMarkdown: React.FC<{ text: string }> = ({ text }) => (
    <div className="chatbot-markdown">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({ node: _node, ...props }) => (
                    <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ),
            }}
        >
            {text}
        </ReactMarkdown>
    </div>
);

/** Keep user-provided text literal rather than rendering it as Markdown. */
export const PlainUserMessage: React.FC<{ text: string }> = ({ text }) => (
    <p className="chatbot-user-text">{text}</p>
);

/**
 * Extract an assistant response from different Gradio output formats.
 *
 * A ChatInterface normally returns a string, but this also supports message
 * objects and complete message-history arrays.
 */
const extractAssistantText = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const text = value.trim();
        return text || null;
    }

    if (Array.isArray(value)) {
        // Prefer the most recent assistant message when a complete history
        // array is returned by the endpoint.
        for (let index = value.length - 1; index >= 0; index -= 1) {
            const item = value[index];

            if (
                item &&
                typeof item === 'object' &&
                'role' in item &&
                item.role === 'assistant' &&
                'content' in item
            ) {
                const content = extractAssistantText(item.content);

                if (content) {
                    return content;
                }
            }
        }

        // Otherwise inspect each returned output.
        for (const item of value) {
            const content = extractAssistantText(item);

            if (content) {
                return content;
            }
        }

        return null;
    }

    if (value && typeof value === 'object') {
        if ('content' in value) {
            const content = extractAssistantText(value.content);

            if (content) {
                return content;
            }
        }

        if ('text' in value) {
            const text = extractAssistantText(value.text);

            if (text) {
                return text;
            }
        }

        if ('value' in value) {
            const text = extractAssistantText(value.value);

            if (text) {
                return text;
            }
        }
    }

    return null;
};

export const Chatbot: React.FC = () => {
    const { t } = useLanguage();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages, isTyping]);

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
    }, [isOpen, messages.length, t]);

    const handleSendMessage = async (): Promise<void> => {
        const currentMessage = inputMessage.trim();

        if (!currentMessage || isTyping) {
            return;
        }

        const userMessage: Message = {
            id: Date.now(),
            text: currentMessage,
            isBot: false,
            timestamp: new Date(),
        };

        // The current message is sent separately to the Gradio endpoint.
        // Only previous conversation messages belong in history.
        const history: GradioMessage[] = messages.map((message) => ({
            role: message.isBot ? 'assistant' : 'user',
            content: message.text,
        }));

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage,
        ]);

        setInputMessage('');
        setIsTyping(true);

        try {
            const client = await getChatbotClient();

            /*
             * The backend Gradio ChatInterface endpoint receives:
             *
             * 1. message
             * 2. history
             *
             * The Hugging Face app.py must expose:
             *
             * api_name="chat"
             */
            const result = await client.predict('/chat', [
                currentMessage,
                history,
            ]);

            const responseText =
                extractAssistantText(result.data) ||
                "I'm sorry, I couldn't generate a response.";

            const botResponse: Message = {
                id: Date.now() + 1,
                text: responseText,
                isBot: true,
                timestamp: new Date(),
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                botResponse,
            ]);
        } catch (error) {
            console.error(
                'Hugging Face chatbot request failed:',
                error,
            );

            const errorResponse: Message = {
                id: Date.now() + 1,
                text:
                    'The AI assistant is temporarily unavailable. ' +
                    'The Hugging Face Space may be waking up. ' +
                    'Please wait a moment and try again.',
                isBot: true,
                timestamp: new Date(),
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                errorResponse,
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            void handleSendMessage();
        }
    };

    return (
        <>
            <div className="ai-chatbot-container">
                <button
                    type="button"
                    className={`ai-chatbot-toggle ${
                        isOpen ? 'active' : ''
                    }`}
                    onClick={() => setIsOpen((previous) => !previous)}
                    aria-label={
                        isOpen
                            ? 'Close AI Chatbot'
                            : 'Open AI Chatbot'
                    }
                    aria-expanded={isOpen}
                >
                    <img
                        src={logo}
                        alt="NexGenTeck Logo"
                        className="chatbot-toggle-logo"
                    />

                    {!isOpen && (
                        <span
                            className="pulse-dot"
                            aria-hidden="true"
                        />
                    )}
                </button>

                {isOpen && (
                    <div className="ai-chatbot-popover">
                        <div className="chatbot-surface">
                            <div className="chatbot-header">
                                <div className="header-info">
                                    <div className="avatar">
                                        <img
                                            src={logo}
                                            alt="NexGenTeck Logo"
                                            className="bot-logo"
                                        />
                                    </div>

                                    <div className="header-text">
                                        <h4>NGT – AI Assistant</h4>

                                        <span className="status">
                                            Online • {messages.length}{' '}
                                            messages
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="close-btn"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close Chat"
                                >
                                    <X />
                                </button>
                            </div>

                            <div
                                className="chatbot-messages"
                                aria-live="polite"
                                aria-busy={isTyping}
                            >
                                {messages.length === 0 &&
                                    !isTyping && (
                                        <div className="empty-state">
                                            <MessageSquare className="empty-icon" />

                                            <p className="empty-text">
                                                Start a conversation!
                                            </p>
                                        </div>
                                    )}

                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${
                                            message.isBot
                                                ? 'bot-message'
                                                : 'user-message'
                                        }`}
                                    >
                                        {message.isBot && (
                                            <div
                                                className="message-avatar"
                                                aria-hidden="true"
                                            >
                                                <img
                                                    src={logo}
                                                    alt=""
                                                    className="bot-logo"
                                                />
                                            </div>
                                        )}

                                        <div className="message-content">
                                            {message.isBot ? (
                                                <BotMessageMarkdown
                                                    text={message.text}
                                                />
                                            ) : (
                                                <PlainUserMessage
                                                    text={message.text}
                                                />
                                            )}

                                            <span className="message-time">
                                                {message.timestamp.toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </span>
                                        </div>

                                        {!message.isBot && (
                                            <div
                                                className="message-avatar"
                                                aria-hidden="true"
                                            >
                                                <User />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="message bot-message typing">
                                        <div
                                            className="message-avatar"
                                            aria-hidden="true"
                                        >
                                            <img
                                                src={logo}
                                                alt=""
                                                className="bot-logo"
                                            />
                                        </div>

                                        <div className="message-content">
                                            <div
                                                className="typing-indicator"
                                                aria-label="Assistant is typing"
                                            >
                                                <span />
                                                <span />
                                                <span />
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
                                        onChange={(event) =>
                                            setInputMessage(
                                                event.target.value,
                                            )
                                        }
                                        onKeyDown={handleKeyPress}
                                        placeholder={
                                            isTyping
                                                ? 'Waiting for response...'
                                                : 'Type your message...'
                                        }
                                        className="message-input"
                                        disabled={isTyping}
                                        autoComplete="off"
                                        aria-label="Chat message"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleSendMessage()
                                        }
                                        disabled={
                                            !inputMessage.trim() ||
                                            isTyping
                                        }
                                        className="send-btn"
                                        aria-label="Send message"
                                    >
                                        <Send />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
