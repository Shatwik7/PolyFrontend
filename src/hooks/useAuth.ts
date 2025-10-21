import { useState, useEffect, useContext } from 'react';
import { User } from '@/types/api';
import { apiService } from '@/services/api';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await apiService.login(email, password);
      setUser(user);
      localStorage.setItem('auth_token', 'mock-jwt-token');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const { user } = await apiService.register(userData);
      setUser(user);
      localStorage.setItem('auth_token', 'mock-jwt-token');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
      setUser(null);
      localStorage.removeItem('auth_token');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    if (token) {
      const currentUser = apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  return {
    user,
    login,
    register,
    logout,
    loading,
    updateUser
  };
};