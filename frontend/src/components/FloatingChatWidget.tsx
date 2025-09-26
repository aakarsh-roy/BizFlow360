import React, { useState } from 'react';
import {
  Box,
  Fab,
  Paper,
  Slide,
  Badge,
  Tooltip,
  IconButton,
  Typography
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon
} from '@mui/icons-material';
import ChatInterface from './ChatInterface';
import { useChat } from '../contexts/ChatContext';

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { rooms, isConnected } = useChat();

  // Calculate total unread messages
  const totalUnreadCount = rooms.reduce((total, room) => total + room.unreadCount, 0);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Tooltip title="Open Team Chat" placement="left">
          <Fab
            color="primary"
            onClick={handleToggleChat}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }
            }}
          >
            <Badge badgeContent={totalUnreadCount} color="error" max={99}>
              <ChatIcon />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isMinimized ? 300 : 800,
            height: isMinimized ? 60 : 600,
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: (theme) => theme.shadows[16],
            borderRadius: 2,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              cursor: isMinimized ? 'pointer' : 'default'
            }}
            onClick={isMinimized ? handleMinimize : undefined}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon />
              <Typography variant="subtitle1" fontWeight="bold">
                Team Chat
              </Typography>
              {totalUnreadCount > 0 && (
                <Badge
                  badgeContent={totalUnreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'error.main',
                      color: 'error.contrastText'
                    }
                  }}
                />
              )}
              {/* Connection Indicator */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.light' : 'error.light',
                  ml: 1
                }}
              />
            </Box>
            
            <Box>
              <Tooltip title={isMinimized ? "Expand" : "Minimize"}>
                <IconButton
                  size="small"
                  onClick={handleMinimize}
                  sx={{ color: 'inherit', mr: 0.5 }}
                >
                  {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  size="small"
                  onClick={handleClose}
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Chat Content */}
          {!isMinimized && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <ChatInterface onClose={handleClose} />
            </Box>
          )}
        </Paper>
      </Slide>
    </>
  );
};

export default FloatingChatWidget;