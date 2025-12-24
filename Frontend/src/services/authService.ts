import axios from 'axios';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('cinepal-token');
      localStorage.removeItem('cinepal-session');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

class AuthService {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      console.log('Attempting login for user:', credentials.user_name);
      
      // Try form data first (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', credentials.user_name);
      formData.append('password', credentials.password);
      
      let response;
      try {
        response = await api.post('/auth/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (formError: any) {
        console.log('Form data failed, trying JSON format...');
        // If form data fails, try JSON
        response = await api.post('/auth/token', {
          user_name: credentials.user_name,
          password: credentials.password
        });
      }
      
      console.log('Login successful');
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      console.log('Attempting registration for user:', userData.user_name);
      const response = await api.post('/auth/register', userData);
      console.log('Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      console.log('Fetching user profile');
      const response = await api.get('/auth/profile');
      console.log('Profile fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await api.get('/');
      console.log('Backend connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();