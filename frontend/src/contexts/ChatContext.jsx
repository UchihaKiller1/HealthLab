import React, { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  // In a real app, you would fetch the current user from your auth context
  useEffect(() => {
    // Example: Set a default user or fetch from auth context
    setCurrentUser({
      id: "user123",
      username: "User",
      // Add other user properties as needed
    });
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const clearMessages = async () => {
    try {
      // Clear messages from the database
      const response = await fetch('http://localhost:4000/api/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear messages from server');
      }
      
      // Clear local messages state
      setMessages([]);
      
      // Notify all connected clients to clear their messages
      // This would require setting up a socket event
      
    } catch (error) {
      console.error('Error clearing messages:', error);
      // Even if server clear fails, we'll still clear the local state
      setMessages([]);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      currentUser, 
      isChatOpen, 
      toggleChat, 
      messages,
      setMessages,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
