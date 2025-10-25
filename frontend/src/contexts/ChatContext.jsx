import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // In a real app, you would fetch the current user from your auth context
  useEffect(() => {
    // Example: Set a default user or fetch from auth context
    setCurrentUser({
      id: 'user123',
      username: 'User',
      // Add other user properties as needed
    });
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <ChatContext.Provider value={{ currentUser, isChatOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
