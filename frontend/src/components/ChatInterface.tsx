import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Button,
  Chip,
  Badge,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Fade,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

interface ChatInterfaceProps {
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const { user } = useAuth();
  const {
    isConnected,
    rooms,
    activeRoom,
    messages,
    loadingMessages,
    onlineUsers,
    typingUsers,
    joinRoom,
    sendMessage,
    markRoomAsRead,
    loadMoreMessages,
    createRoom,
    searchMessages
  } = useChat();

  // State
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',  
    type: 'general' as 'general' | 'department' | 'project' | 'private',
    allowedRoles: ['admin', 'manager', 'user']
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus message input when room changes
  useEffect(() => {
    if (activeRoom) {
      messageInputRef.current?.focus();
    }
  }, [activeRoom]);

  // Handle message send
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeRoom) return;

    sendMessage(messageInput, replyToMessage?._id);
    setMessageInput('');
    setReplyToMessage(null);
  };

  // Handle key press in message input
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle room selection
  const handleRoomSelect = (room: any) => {
    joinRoom(room._id);
    markRoomAsRead(room._id);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await searchMessages(searchQuery, activeRoom?._id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle create room
  const handleCreateRoom = async () => {
    try {
      await createRoom(newRoomData);
      setShowCreateRoom(false);
      setNewRoomData({
        name: '',
        description: '',
        type: 'general',
        allowedRoles: ['admin', 'manager', 'user']
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Format message timestamp
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get room typing indicator
  const getRoomTypingUsers = () => {
    if (!activeRoom) return [];
    return typingUsers.filter(user => 
      user.roomId === activeRoom._id && user.userId !== user.userId
    );
  };

  if (!isConnected) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Connecting to chat...
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Debug Info: User={user?.name || 'Not logged in'}, Rooms count={rooms.length}
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'warning.main' }}>
          If this persists, check browser console for errors
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', maxHeight: '600px' }}>
      {/* Room List */}
      <Paper sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Team Chat</Typography>
            <Box>
              <IconButton size="small" onClick={() => setShowSearch(!showSearch)}>
                <SearchIcon />
              </IconButton>
              <IconButton size="small" onClick={() => setShowCreateRoom(true)}>
                <AddIcon />
              </IconButton>
              {onClose && (
                <IconButton size="small" onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {/* Search */}
          <Fade in={showSearch}>
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Fade>
        </Box>

        {/* Room List */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {rooms.map((room) => (
            <ListItem
              key={room._id}
              button
              selected={activeRoom?._id === room._id}
              onClick={() => handleRoomSelect(room)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {room.type === 'general' ? <GroupIcon /> : getUserInitials(room.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" noWrap>
                      {room.name}
                    </Typography>
                    {room.unreadCount > 0 && (
                      <Badge badgeContent={room.unreadCount} color="error" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {room.lastMessage?.content || 'No messages yet'}
                    </Typography>
                    {room.lastActivity && (
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(room.lastActivity)}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Connection Status */}
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Chip
            size="small"
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isConnected ? 'success.main' : 'error.main' }} />}
            label={isConnected ? 'Connected' : 'Disconnected'}
            variant="outlined"
          />
        </Box>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{activeRoom.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {onlineUsers.length} online • {activeRoom.participants.length} members
                  </Typography>
                </Box>
                <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedRoom(activeRoom); }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {loadingMessages && (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {messages.map((message) => (
                <Box
                  key={message._id}
                  sx={{
                    mb: 1,
                    p: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                    {getUserInitials(message.sender.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {message.sender.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={message.sender.role}
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.6rem', mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.createdAt)}
                      </Typography>
                    </Box>
                    
                    {message.replyTo && (
                      <Box sx={{ p: 1, mb: 1, bgcolor: 'action.hover', borderRadius: 1, borderLeft: 3, borderColor: 'primary.main' }}>
                        <Typography variant="caption" color="primary">
                          Replying to {message.replyTo.sender.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {message.replyTo.content}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                    
                    {message.isEdited && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        (edited)
                      </Typography>
                    )}
                  </Box>
                  
                  <IconButton
                    size="small"
                    onClick={() => setReplyToMessage(message)}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <ReplyIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              {/* Typing Indicator */}
              {getRoomTypingUsers().length > 0 && (
                <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {getRoomTypingUsers().map(u => u.userName).join(', ')} {getRoomTypingUsers().length === 1 ? 'is' : 'are'} typing...
                  </Typography>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Reply Indicator */}
            {replyToMessage && (
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="primary">
                      Replying to {replyToMessage.sender.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {replyToMessage.content.substring(0, 100)}...
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setReplyToMessage(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <TextField
                  inputRef={messageInputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                />
                <Tooltip title="Send message">
                  <span>
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Select a room to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {/* Room Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SettingsIcon sx={{ mr: 1 }} />
          Room Settings
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <RefreshIcon sx={{ mr: 1 }} />
          Refresh
        </MenuItem>
      </Menu>

      {/* Create Room Dialog */}
      <Dialog open={showCreateRoom} onClose={() => setShowCreateRoom(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Chat Room</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Name"
                value={newRoomData.name}
                onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newRoomData.description}
                onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Room Type"
                value={newRoomData.type}
                onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value as any })}
                SelectProps={{ native: true }}
              >
                <option value="general">General</option>
                <option value="department">Department</option>
                <option value="project">Project</option>
                <option value="private">Private</option>
                {user?.role === 'admin' && <option value="announcement">Announcement</option>}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateRoom(false)}>Cancel</Button>
          <Button onClick={handleCreateRoom} variant="contained" disabled={!newRoomData.name.trim()}>
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatInterface;