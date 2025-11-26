import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Create a default user with Administrator role to grant full access
  const defaultUser = {
    username: 'default_user',
    role: 'Administrator'
  };

  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(false); // No need to load anything

  // Since we're removing authentication, we don't need the token handling
  const login = () => {
    // No-op function as login is no longer required
  };

  const logout = () => {
    // No-op function as logout is no longer required
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};