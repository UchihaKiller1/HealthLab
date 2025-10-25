import React from 'react';
import { Fab, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useChat } from '../contexts/ChatContext';

const ChatButton = () => {
  const { toggleChat, isChatOpen } = useChat();
  
  return (
    <Fab 
      color="primary" 
      aria-label="chat"
      onClick={toggleChat}
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
