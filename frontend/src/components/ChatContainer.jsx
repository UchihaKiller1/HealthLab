import React from 'react';
import { Box, Paper, Slide, Typography } from '@mui/material';
import { useChat } from '../contexts/ChatContext';
import Chat from './Chat';

const ChatContainer = () => {
  const { isChatOpen } = useChat();
  
  return (
    <Slide direction="up" in={isChatOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          width: 350,
          height: 500,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            minHeight: '60px'
          }}
        >
          <Typography variant="h6" component="h3" sx={{ m: 0, fontWeight: 600 }}>
            Chat
          </Typography>
        </Box>
        <Box sx={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}>
          <Chat />
        </Box>
      </Paper>
    </Slide>
  );
};

export default ChatContainer;
