import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connected to BizFlow360 server');

        // Join user's personal room
        socketRef.current?.emit('join-user-room', user.id);
        
        // Join department room
        socketRef.current?.emit('join-department-room', user.department);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('📴 Disconnected from server');
      });

      // Listen for basic notifications (simplified)
      socketRef.current.on('notification', (data) => {
        console.log('🔔 Notification:', data.message);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setIsConnected(false);
      };
    }
  }, [user]);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
