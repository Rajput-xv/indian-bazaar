import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

export type UserRole = 'vendor' | 'supplier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessName?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  businessName?: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('bazaar_user');
    const savedToken = localStorage.getItem('bazaar_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.token && response.user) {
        const userResponse = response.user as Record<string, unknown>;
        const userData: User = {
          id: userResponse.id as string,
          name: userResponse.name as string,
          email: userResponse.email as string,
          role: userResponse.role as UserRole,
          phone: userResponse.phone as string,
          businessName: userResponse.businessName as string,
          location: userResponse.location as User['location'],
        };
        
        setUser(userData);
        localStorage.setItem('bazaar_user', JSON.stringify(userData));
        localStorage.setItem('bazaar_token', response.token);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.token && response.user) {
        const userResponse = response.user as Record<string, unknown>;
        const userInfo: User = {
          id: userResponse.id as string,
          name: userResponse.name as string,
          email: userResponse.email as string,
          role: userResponse.role as UserRole,
          phone: userResponse.phone as string,
          businessName: userResponse.businessName as string,
          location: userResponse.location as User['location'],
        };
        
        setUser(userInfo);
        localStorage.setItem('bazaar_user', JSON.stringify(userInfo));
        localStorage.setItem('bazaar_token', response.token);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bazaar_user');
    localStorage.removeItem('bazaar_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};