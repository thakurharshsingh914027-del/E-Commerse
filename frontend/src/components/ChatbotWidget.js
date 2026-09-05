import React, { useState, useRef, useEffect } from 'react';
import { HiChat, HiX, HiSparkles, HiPaperAirplane } from 'react-icons/hi';
import API from '../services/api';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hello! I'm ShopMart AI assistant. 👋 Ask me about products, orders, shipping, returns, or payments!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/api/chatbot', { message: text });
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: res.data.reply || res.data.message || "I'm sorry, I couldn't understand that. Could you please rephrase?",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className="chatbot-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        {isOpen ? <HiX /> : <HiChat />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'active' : ''}`}>
        <div className="chatbot-header">
          <h4>
            <HiSparkles /> ShopMart AI Assistant
          </h4>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>
            <HiX />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="chat-message bot typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            <HiPaperAirplane style={{ transform: 'rotate(-45deg)' }} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
