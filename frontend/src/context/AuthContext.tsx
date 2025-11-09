import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { gameSocket } from '../services/socket';

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      console.log('AuthContext: Found stored user and token, connecting WebSocket');
      setUser(JSON.parse(storedUser));
      // Connect WebSocket
      gameSocket.connect(token);
    } else {
      console.log('AuthContext: No stored user or token found');
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    console.log('AuthContext: login() called with token:', token ? 'present' : 'missing');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    // Connect WebSocket
    console.log('AuthContext: About to call gameSocket.connect()');
    gameSocket.connect(token);
    console.log('AuthContext: gameSocket.connect() finished');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    // Disconnect WebSocket
    gameSocket.disconnect();
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
