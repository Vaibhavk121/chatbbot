import React from "react";
import { FaPen, FaTrash, FaComments } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ style, setStyle, clearChatContext, messageCount = 0 }) => {
  const toggleStyle = () => {
    setStyle((prev) => (prev === "formal" ? "casual" : "formal"));
  };

  const handleClearChat = () => {
    if (
      messageCount > 0 &&
      window.confirm(
        "Are you sure you want to clear the entire chat history? This action cannot be undone."
      )
    ) {
      clearChatContext();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaPen className="navbar-icon" />
        <h1>AI Chat Rewriter</h1>
      </div>
      <div className="navbar-controls">
        <div className="chat-info">
          <FaComments className="chat-icon" />
          <span className="message-count">{messageCount} messages</span>
        </div>
        <div className="style-toggle">
          <span className={style === "formal" ? "active" : ""}>Formal</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={style === "casual"}
              onChange={toggleStyle}
            />
            <span className="slider round"></span>
          </label>
          <span className={style === "casual" ? "active" : ""}>Casual</span>
        </div>
        <button
          className="clear-chat-btn"
          onClick={handleClearChat}
          disabled={messageCount === 0}
          title="Clear chat history"
        >
          <FaTrash />
          Clear Chat
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
