// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });

  useEffect(() => {
    // On component mount, check for a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuth({
          token,
          user: {
            username: decoded.sub, // Adjust based on your JWT payload
            role: decoded.role,
            userId: decoded.userId,
          },
        });
      } catch (error) {
        console.error('Invalid token:', error);
        setAuth({ token: null, user: null });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
