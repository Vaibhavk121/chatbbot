import { useState, useEffect } from "react";
import "./App.css";
import ChatInterface from "./components/ChatInterface";
import Navbar from "./components/Navbar";
import TranslateModal from "./components/TranslateModal";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createContextualPrompt } from "./utils/chatStorage";
import { useChatPersistence } from "./utils/useChatPersistence";

// Add this near the top of your component
function App() {
  const {
    messages,
    setMessages,
    addMessage: addMessageToPersistence,
    updateMessage: updateMessageInPersistence,
    clearMessages,
    isLoaded,
  } = useChatPersistence();

  const [style, setStyle] = useState("formal");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [translateData, setTranslateData] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [user] = useState({
    name: "You",
    avatar: "👤", // Using emoji instead of broken image
  });

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Clear chat context function
  const clearChatContext = () => {
    clearMessages();
  };

  const addMessage = async (content, sender = "user") => {
    const newMessage = {
      id: Date.now(),
      content,
      sender,
      timestamp: new Date().toISOString(),
    };

    // Add message using the persistence hook
    setMessages((prev) => [...prev, newMessage]);

    if (sender === "user") {
      setIsAiResponding(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Create contextual prompt that includes conversation history
        const contextualPrompt = createContextualPrompt(content, messages);

        const result = await model.generateContent(contextualPrompt);
        const response = await result.response;
        const aiResponse = response.text();

        const aiMessage = {
          id: Date.now() + 1, // Ensure unique ID
          content: aiResponse,
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error getting AI response:", error);
        const errorMessage = {
          id: Date.now() + 1,
          content:
            "Sorry, I encountered an error while processing your message. Please try again.",
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsAiResponding(false);
      }
    }
  };

  const rewriteMessage = async (messageId, rewriteType) => {
    const messageToRewrite = messages.find((msg) => msg.id === messageId);
    if (!messageToRewrite) return;

    // Handle translate separately as it needs user input
    if (rewriteType === "translate") {
      setTranslateData({ messageId, originalText: messageToRewrite.content });
      setShowTranslateModal(true);
      return;
    }

    let prompt;
    switch (rewriteType) {
      case "polite":
        prompt = `Rewrite the following message to sound more polite and ${style}. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case "casual":
        prompt = `Rewrite the following message to sound more casual. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case "shorter":
        prompt = `Rewrite the following message to be shorter and more concise while maintaining the ${style} tone. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case "funny":
        prompt = `Rewrite the following message to be funny while maintaining a ${style} tone. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case "clearer":
        prompt = `Rewrite the following message to be clearer and more understandable while maintaining a ${style} tone. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      default:
        return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Extract just the first paragraph if there are multiple options
      if (text.includes("Option") || text.includes("Here are")) {
        // Try to extract just the first rewritten version
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        for (const line of lines) {
          // Look for lines that don't contain "Option" or instructional text
          if (
            !line.includes("Option") &&
            !line.includes("Here are") &&
            !line.includes("Choose the") &&
            line.length > 10
          ) {
            text = line.replace(/^"|"$/g, "").trim(); // Remove quotes if present
            break;
          }
        }
      }

      return {
        original: messageToRewrite,
        rewritten: text,
      };
    } catch (error) {
      console.error("Error rewriting message:", error);
      return null;
    }
  };

  const translateMessage = async (originalText, targetLanguage) => {
    setIsTranslating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation without any explanations or additional text: "${originalText}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let translation = response.text().trim();

      // Clean up the response if it contains quotes or extra formatting
      translation = translation.replace(/^["']|["']$/g, "");

      return translation;
    } catch (error) {
      console.error("Error translating message:", error);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateClose = (translatedText) => {
    if (translatedText && translateData) {
      // Update the original message with the translation
      updateMessage(translateData.messageId, translatedText);
    }
    setShowTranslateModal(false);
    setTranslateData(null);
  };

  const updateMessage = (messageId, newContent) => {
    updateMessageInPersistence(messageId, newContent);
  };

  return (
    <div className="app">
      <Navbar
        style={style}
        setStyle={setStyle}
        clearChatContext={clearChatContext}
        messageCount={messages.length}
      />
      <ChatInterface
        messages={messages}
        addMessage={addMessage}
        rewriteMessage={rewriteMessage}
        updateMessage={updateMessage}
        user={user}
        isAiResponding={isAiResponding}
      />
      {showTranslateModal && translateData && (
        <TranslateModal
          originalText={translateData.originalText}
          onClose={handleTranslateClose}
          onTranslate={translateMessage}
          isLoading={isTranslating}
        />
      )}
    </div>
  );
}

export default App;
