import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FaEllipsisV, FaMagic } from "react-icons/fa"; // Import FaMagic icon
import "./MessageBubble.css";

const MessageBubble = ({ message, isUser, onRewrite, user }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const bubbleRef = useRef(null);

  const handleContextMenu = (e) => {
    if (isUser) {
      e.preventDefault();
      const rect = bubbleRef.current.getBoundingClientRect();
      setMenuPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowMenu(true);
    }
  };

  const handleMouseDown = () => {
    if (isUser) {
      const timer = setTimeout(() => {
        const rect = bubbleRef.current.getBoundingClientRect();
        setMenuPosition({
          x: rect.width / 2,
          y: rect.height / 2,
        });
        setShowMenu(true);
      }, 500); // 500ms for long press
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchStart = (e) => {
    if (isUser) {
      const timer = setTimeout(() => {
        const rect = bubbleRef.current.getBoundingClientRect();
        setMenuPosition({
          x: rect.width / 2,
          y: rect.height / 2,
        });
        setShowMenu(true);
      }, 500); // 500ms for long press
      setLongPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleRewriteOption = (type) => {
    onRewrite(message.id, type);
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={`message-bubble-container ${isUser ? "user" : "ai"}`}>
      {!isUser && (
        <div className="avatar ai-avatar">
          <span className="avatar-emoji">🤖</span>
        </div>
      )}

      <div
        ref={bubbleRef}
        className={`message-bubble ${isUser ? "user" : "ai"}`}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>

        {isUser && (
          <div className="message-options">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Rewrite options"
            >
              <FaMagic />{" "}
              {/* Replace FaEllipsisV with FaMagic for a more intuitive icon */}
            </button>
          </div>
        )}

        {showMenu && isUser && (
          <div
            ref={menuRef}
            className="rewrite-menu"
            style={{
              top: `${menuPosition.y}px`,
              left: `${menuPosition.x}px`,
            }}
          >
            <button onClick={() => handleRewriteOption("polite")}>
              Make it Polite
            </button>
            <button onClick={() => handleRewriteOption("casual")}>
              Make it Casual
            </button>
            <button onClick={() => handleRewriteOption("shorter")}>
              Shorten It
            </button>
            <button onClick={() => handleRewriteOption("funny")}>
              Make it Funny
            </button>
            <button onClick={() => handleRewriteOption("clearer")}>
              Make it Clearer
            </button>
            <button onClick={() => handleRewriteOption("translate")}>
              🌐 Translate
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <span className="avatar-emoji">{user.avatar}</span>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
