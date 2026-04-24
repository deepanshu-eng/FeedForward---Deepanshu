import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Only set if different to avoid infinite loops, though useEffect only runs on token change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(prev => JSON.stringify(prev) !== savedUser ? parsedUser : prev);
    }
  }, [token]);

  const login = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};