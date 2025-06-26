import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import RewriteModal from './RewriteModal';
import './ChatInterface.css';

const ChatInterface = ({ messages, addMessage, rewriteMessage, updateMessage, user, isAiResponding }) => {
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rewriteData, setRewriteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage(input);
      setInput('');
    }
  };

  const handleRewriteRequest = async (messageId, rewriteType) => {
    setIsLoading(true);
    const result = await rewriteMessage(messageId, rewriteType);
    setIsLoading(false);
    
    if (result) {
      setRewriteData(result);
      setShowModal(true);
    }
  };

  const handleRewriteAction = (action) => {
    if (!rewriteData) return;
    
    switch (action) {
      case 'accept':
        updateMessage(rewriteData.original.id, rewriteData.rewritten);
        break;
      case 'send':
        addMessage(rewriteData.rewritten);
        break;
      case 'copy':
        navigator.clipboard.writeText(rewriteData.rewritten);
        break;
      default:
        break;
    }
    
    setShowModal(false);
    setRewriteData(null);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="feature-hint">
        <small>💡 Tap the magic wand on your messages to rewrite them</small>
      </div>
      <div className="messages-container">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.sender === 'user'}
            onRewrite={handleRewriteRequest}
            user={user}
          />
        ))}
        {isAiResponding && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!input.trim()}>
          <FaPaperPlane />
        </button>
      </form>
      
      {showModal && (
        <RewriteModal
          rewriteData={rewriteData}
          onClose={() => setShowModal(false)}
          onAction={handleRewriteAction}
        />
      )}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Rewriting message...</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;