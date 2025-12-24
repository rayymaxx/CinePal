import axios from 'axios';
import { ChatRequest, ChatResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for chat requests
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinepal-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Chat API error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('cinepal-token');
      localStorage.removeItem('cinepal-session');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

class ChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      console.log('Sending chat message:', request.message.substring(0, 50) + '...');
      
      const response = await api.post('/api/chat', request);
      
      console.log('Chat response received');
      return response.data;
    } catch (error: any) {
      console.error('Failed to send chat message:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const chatService = new ChatService();