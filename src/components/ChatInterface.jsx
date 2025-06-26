import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane, FaMagic } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import RewriteModal from "./RewriteModal";
import "./ChatInterface.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
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

  const handleSuggest = async () => {
    if (!input.trim()) return;
    setIsSuggesting(true);
    setShowSuggestions(true);
    setSuggestions([]);
    const prompts = [
      {
        label: "Funny",
        prompt: `Rewrite this message to be funny or humorous, but keep it SHORT (1-2 sentences), direct, and concise. Do NOT use brackets, markdown, or extra formatting. Only return the rewritten message:\n"${input}"`,
      },
      {
        label: "Casual",
        prompt: `Rewrite this message to be more casual and friendly, but keep it SHORT (1-2 sentences), direct, and concise. Do NOT use brackets, markdown, or extra formatting. Only return the rewritten message:\n"${input}"`,
      },
      {
        label: "Formal",
        prompt: `Rewrite this message to be more polite and professional, but keep it SHORT (1-2 sentences), direct, and concise. Do NOT use brackets, markdown, or extra formatting. Only return the rewritten message:\n"${input}"`,
      },
    ];
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const results = await Promise.all(
        prompts.map(async ({ label, prompt }) => {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text();
          return { label, text };
        })
      );
      setSuggestions(results);
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    setShowSuggestions(false);
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

      <form className="message-input" onSubmit={handleSubmit} style={{ position: "relative" }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isSuggesting}
        />
        <button type="button" onClick={handleSuggest} disabled={!input.trim() || isSuggesting} style={{ marginRight: "0.5rem" }}>
          <FaMagic />
        </button>
        <button type="submit" disabled={!input.trim() || isSuggesting}>
          <FaPaperPlane />
        </button>
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: "absolute",
            bottom: "60px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            zIndex: 200,
          }}>
            {suggestions.map((s) => {
              let bubbleStyle = {
                color: "white",
                borderRadius: "20px",
                padding: "0.7rem 1.2rem",
                cursor: "pointer",
                fontWeight: 500,
                boxShadow: "0 2px 8px rgba(138,98,255,0.3)",
                transition: "transform 0.1s",
                maxWidth: "320px",
                whiteSpace: "pre-line",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              };
              let labelStyle = {
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "0.3rem",
                letterSpacing: "0.5px",
                borderRadius: "12px",
                padding: "2px 10px",
                display: "inline-block",
              };
              if (s.label === "Funny") {
                bubbleStyle.background = "linear-gradient(135deg, #ffb347, #ffcc33)";
                labelStyle.background = "#ffb347";
                labelStyle.color = "#7c4d00";
              } else if (s.label === "Casual") {
                bubbleStyle.background = "linear-gradient(135deg, #62d0ff, #4d9fff)";
                labelStyle.background = "#62d0ff";
                labelStyle.color = "#003366";
              } else if (s.label === "Formal") {
                bubbleStyle.background = "linear-gradient(135deg, #8a62ff, #7c4dff)";
                labelStyle.background = "#8a62ff";
                labelStyle.color = "#fff";
              }
              return (
                <div
                  key={s.label}
                  onClick={() => handleSuggestionClick(s.text)}
                  style={bubbleStyle}
                  title={s.label}
                >
                  <span style={labelStyle}>{s.label}</span>
                  {s.text}
                </div>
              );
            })}
          </div>
        )}
        {isSuggesting && (
          <div style={{
            position: "absolute",
            bottom: "60px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 200,
          }}>
            <div style={{
              background: "#fff",
              color: "#7c4dff",
              borderRadius: "20px",
              padding: "0.7rem 1.2rem",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(138,98,255,0.3)",
            }}>
              Generating suggestions...
            </div>
          </div>
        )}
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
