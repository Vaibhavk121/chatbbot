import { useState, useEffect } from "react";
import {
  saveMessagesToStorage,
  loadMessagesFromStorage,
  clearStoredMessages,
} from "./chatStorage";

/**
 * Custom hook for managing chat messages with localStorage persistence
 * @returns {Object} Object containing messages state and management functions
 */
export const useChatPersistence = () => {
  const [messages, setMessages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = loadMessagesFromStorage();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    setIsLoaded(true);
  }, []);

  // Save messages to localStorage whenever messages change (but only after initial load)
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages, isLoaded]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId, newContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    );
  };

  const clearMessages = () => {
    setMessages([]);
    clearStoredMessages();
  };

  const getStorageInfo = () => {
    try {
      const stored = localStorage.getItem("chatbot_conversation");
      if (stored) {
        const size = new Blob([stored]).size;
        return {
          size: (size / 1024).toFixed(2) + " KB",
          messageCount: messages.length,
          lastSaved: new Date().toLocaleString(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  };

  return {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearMessages,
    getStorageInfo,
    isLoaded,
  };
};
