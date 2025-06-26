import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import RewriteModal from "./RewriteModal";
import "./ChatInterface.css";

const ChatInterface = ({
  messages,
  addMessage,
  rewriteMessage,
  updateMessage,
  user,
  isAiResponding,
}) => {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rewriteData, setRewriteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage(input);
      setInput("");
      setShowHint(false); // Hide hint when user starts chatting
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.trim() && showHint) {
      setShowHint(false); // Hide hint when user starts typing
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
      case "accept":
        updateMessage(rewriteData.original.id, rewriteData.rewritten);
        break;
      case "send":
        addMessage(rewriteData.rewritten);
        break;
      case "copy":
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            {showHint && messages.length === 0 && (
              <div
                className="feature-hint  "
                style={{ backgroundColor: "#4B0082", borderRadius: "20px" }}
              >
                <small>
                  💡 Tap the magic wand on your messages to rewrite them
                </small>
                <small className="storage-hint">
                  💾 Chat context is automatically saved
                </small>
              </div>
            )}
            <h2>👋 Welcome to AI Chat Rewriter!</h2>
            <p>
              Start a conversation and I'll remember our entire chat context.
            </p>
            <p>✨ Your conversation is automatically saved in your browser</p>
            <p>
              🪄 Use the magic wand to rewrite any message in different styles
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.sender === "user"}
              onRewrite={handleRewriteRequest}
              user={user}
            />
          ))
        )}
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
          onChange={handleInputChange}
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
