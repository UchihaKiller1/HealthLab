import React from 'react';
import { Fab, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useChat } from '../contexts/ChatContext';

const ChatButton = () => {
  const { toggleChat, isChatOpen, clearMessages } = useChat();
  
  const handleClick = () => {
    if (isChatOpen) {
      // Clear messages when closing the chat
      clearMessages();
    }
    toggleChat();
  };
  
  return (
    <Fab 
      color="primary" 
      aria-label="chat"
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      {isChatOpen ? <CloseIcon /> : <ChatIcon />}
    </Fab>
  );
};

export default ChatButton;
