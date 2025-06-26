import { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Navbar from './components/Navbar';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Add this near the top of your component
function App() {
  const [messages, setMessages] = useState([]);
  const [style, setStyle] = useState('formal');
  const [isAiResponding, setIsAiResponding] = useState(false); // Add this state
  const [user] = useState({
    name: 'You',
    avatar: 'https://ui-avatars.com/api/?name=You&background=random'
  });

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const addMessage = async (content, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      content,
      sender,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);

    if (sender === 'user') {
      setIsAiResponding(true);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(content);
        const response = await result.response;
        const aiResponse = response.text();
        
        const aiMessage = {
          id: Date.now(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage = {
          id: Date.now(),
          content: 'Sorry, I encountered an error while processing your message.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAiResponding(false);
      }
    }
  };

  const rewriteMessage = async (messageId, rewriteType) => {
    const messageToRewrite = messages.find(msg => msg.id === messageId);
    if (!messageToRewrite) return;

    let prompt;
    switch (rewriteType) {
      case 'polite':
        prompt = `Rewrite the following message to sound more polite and ${style}. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case 'casual':
        prompt = `Rewrite the following message to sound more casual. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case 'shorter':
        prompt = `Rewrite the following message to be shorter and more concise while maintaining the ${style} tone. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case 'funny':
        prompt = `Rewrite the following message to be funny while maintaining a ${style} tone. Provide only the rewritten version without explanations or options: "${messageToRewrite.content}"`;
        break;
      case 'clearer':
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
      if (text.includes('Option') || text.includes('Here are')) {
        // Try to extract just the first rewritten version
        const lines = text.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          // Look for lines that don't contain "Option" or instructional text
          if (!line.includes('Option') && 
              !line.includes('Here are') && 
              !line.includes('Choose the') &&
              line.length > 10) {
            text = line.replace(/^"|"$/g, '').trim(); // Remove quotes if present
            break;
          }
        }
      }
      
      return {
        original: messageToRewrite,
        rewritten: text
      };
    } catch (error) {
      console.error('Error rewriting message:', error);
      return null;
    }
  };

  const updateMessage = (messageId, newContent) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    );
  };

  return (
    <div className="app">
      <Navbar style={style} setStyle={setStyle} />
      <ChatInterface 
        messages={messages} 
        addMessage={addMessage} 
        rewriteMessage={rewriteMessage}
        updateMessage={updateMessage}
        user={user}
        isAiResponding={isAiResponding}
      />
    </div>
  );
}

export default App;
