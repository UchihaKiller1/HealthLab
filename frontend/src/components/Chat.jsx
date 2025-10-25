import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useChat } from "../contexts/ChatContext";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const Chat = () => {
  const { currentUser } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('Current user in Chat component:', currentUser);
  }, [currentUser]);

  // Use a ref to track if we've already set up the socket
  const socketInitialized = useRef(false);

  useEffect(() => {
    // Only initialize socket once
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    // Initialize socket with proper configuration
    const socketUrl = 'http://localhost:4000';
    console.log('Attempting to connect to WebSocket at:', socketUrl);
    
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:5173'
      }
    });

    // Connection event handlers
    const onConnect = () => {
      console.log('Connected to WebSocket server, socket ID:', newSocket.id);
    };

    const onConnectError = (error) => {
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
    };

    const onMessage = (message) => {
      console.log('Received message event with data:', message);
      // Only add the message if it's not already in the messages array
      // This prevents duplicates that might come from multiple connections
      setMessages(prevMessages => {
        // Check if we already have this message (by timestamp and text)
        const messageExists = prevMessages.some(
          msg => msg.timestamp === message.timestamp && msg.text === message.text
        );
        
        if (!messageExists) {
          console.log('Adding new message to state');
          return [...prevMessages, message];
        }
        console.log('Duplicate message detected, not adding to state');
        return prevMessages;
      });
    };

    // Set up event listeners
    console.log('Setting up socket event listeners');
    newSocket.on('connect', onConnect);
    newSocket.on('connect_error', onConnectError);
    newSocket.on('message', onMessage);
    
    // Set the socket in state
    setSocket(newSocket);

    // Load previous messages
    const fetchMessages = async () => {
      try {
        console.log('Fetching previous messages...');
        const response = await fetch("http://localhost:4000/api/messages");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (newSocket) {
        newSocket.off('connect', onConnect);
        newSocket.off('connect_error', onConnectError);
        newSocket.off('message', onMessage);
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      }
      socketInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track if a message is currently being sent to prevent duplicates
  const isSending = useRef(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    
    // If currentUser is not available, use a default user
    const sender = currentUser?.username || 'Anonymous';
    
    if (!messageText || !socket || isSending.current) {
      console.log('Message sending prevented:', { hasText: !!messageText, hasSocket: !!socket, isSending: isSending.current });
      return;
    }

    const message = {
      text: messageText,
      sender: sender,
      timestamp: new Date().toISOString(),
      senderId: currentUser?.id || 'anonymous',
      // Add a unique ID to help with deduplication
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Sending message:', message);
    isSending.current = true;

    try {
      // Optimistically update the UI with a temporary ID
      setMessages(prevMessages => [...prevMessages, message]);
      
      // Clear the input immediately
      setNewMessage("");
      
      // Send the message to the server
      socket.emit("sendMessage", message, (acknowledgement) => {
        isSending.current = false;
        console.log('Received acknowledgement:', acknowledgement);
        
        if (acknowledgement?.error) {
          console.error('Failed to send message:', acknowledgement.error);
          // Remove the message if it fails to send
          setMessages(prevMessages => 
            prevMessages.filter(m => m.tempId !== message.tempId)
          );
        } else {
          console.log('Message sent successfully');
          // Update the message with any server-generated ID if needed
          if (acknowledgement?.id) {
            setMessages(prevMessages => 
              prevMessages.map(m => 
                m.tempId === message.tempId 
                  ? { ...m, id: acknowledgement.id, tempId: undefined } 
                  : m
              )
            );
          }
        }
      });
    } catch (error) {
      isSending.current = false;
      console.error('Error sending message:', error);
      // Remove the message if there was an error
      setMessages(prevMessages => 
        prevMessages.filter(m => m.tempId !== message.tempId)
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1,
          minHeight: 0, // This is important for the flex container to properly handle overflow
        }}
      >
        <List sx={{ width: "100%" }}>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{ px: 1, py: 0.5 }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.875rem" }}>
                  {msg.sender ? msg.sender[0].toUpperCase() : "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" component="span">
                      {msg.sender || "Anonymous"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {msg.text}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          display: "flex",
          gap: 1,
          p: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
              bgcolor: "background.paper",
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            minWidth: "auto",
            px: 2,
            borderRadius: 4,
            "& .MuiButton-endIcon": {
              margin: 0,
            },
          }}
          endIcon={<SendIcon />}
          disabled={!newMessage.trim()}
        />
      </Box>
    </Box>
  );
};

export default Chat;
