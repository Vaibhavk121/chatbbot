// Chat storage utilities for persisting conversation context
const CHAT_STORAGE_KEY = "chatbot_conversation";
const MAX_MESSAGES = 100; // Limit to prevent localStorage from getting too large

/**
 * Save messages to localStorage in JSON format
 * @param {Array} messages - Array of message objects
 */
export const saveMessagesToStorage = (messages) => {
  try {
    // Keep only the last MAX_MESSAGES to prevent storage overflow
    const messagesToSave = messages.slice(-MAX_MESSAGES);
    const chatData = {
      messages: messagesToSave,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
  } catch (error) {
    console.error("Error saving messages to localStorage:", error);
  }
};

/**
 * Load messages from localStorage
 * @returns {Array} Array of message objects or empty array if none found
 */
export const loadMessagesFromStorage = () => {
  try {
    const storedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedData) {
      const chatData = JSON.parse(storedData);
      return chatData.messages || [];
    }
    return [];
  } catch (error) {
    console.error("Error loading messages from localStorage:", error);
    return [];
  }
};

/**
 * Clear all messages from localStorage
 */
export const clearStoredMessages = () => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing messages from localStorage:", error);
  }
};

/**
 * Get conversation context for AI - includes all previous messages
 * @param {Array} messages - Current messages array
 * @returns {string} Formatted conversation context
 */
export const getConversationContext = (messages) => {
  if (!messages || messages.length === 0) {
    return "";
  }

  // Create context string with conversation history
  const context = messages
    .slice(-10) // Keep last 10 messages for context (adjust as needed)
    .map((msg) => {
      const role = msg.sender === "user" ? "User" : "Assistant";
      return `${role}: ${msg.content}`;
    })
    .join("\n");

  return context;
};

/**
 * Create a prompt with conversation context for the AI
 * @param {string} newMessage - The new user message
 * @param {Array} messages - Previous messages for context
 * @returns {string} Complete prompt with context
 */
export const createContextualPrompt = (newMessage, messages) => {
  const context = getConversationContext(messages);

  const baseInstructions = `You are a helpful, friendly AI assistant. Please follow these guidelines:
- Keep your responses SHORT and CONVERSATIONAL (1-3 sentences max)
- Write like you're texting a friend, not giving a lecture
- Avoid markdown formatting, bullet points, numbered lists, or headers unless asked so, reply in tone fo user
- Don't use **bold** or *italic* text unless specifically asked
- Give direct, simple answers without over-explaining
- If the user wants more detail, they will ask for it
- Be natural and casual in your tone`;

  if (context) {
    return `${baseInstructions}

Previous conversation:
${context}

User: ${newMessage}

Respond naturally and briefly:`;
  }

  return `${baseInstructions}

User: ${newMessage}

Respond naturally and briefly:`;
};

/**
 * Export conversation as JSON file
 * @param {Array} messages - Messages to export
 * @param {string} filename - Optional filename
 */
export const exportConversation = (
  messages,
  filename = "conversation.json"
) => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      conversation: messages,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = filename;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error("Error exporting conversation:", error);
  }
};
