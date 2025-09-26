import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container
} from '@mui/material';
import ChatInterface from '../components/ChatInterface';

const TeamChat: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Team Chat
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Collaborate with your team in real-time messaging
        </Typography>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 200px)', minHeight: 600 }}>
        <ChatInterface />
      </Paper>
    </Container>
  );
};

export default TeamChat;