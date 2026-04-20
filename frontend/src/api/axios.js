// frontend/src/api/axios.js

import axios from 'axios';

const API = axios.create({
baseURL: 'https://ai-resume-analyzer-7o2w.onrender.com/api',
  // All requests will start with this URL
  // So instead of: 'http://localhost:5000/api/auth/login'
  // We just write: '/auth/login'
});

// ───────────────────────────────────────
// Interceptor: Automatically add token
// to every request
// ───────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // localStorage = browser's storage
  // We'll save token here after login

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Automatically adds token to every request
    // No need to manually add it each time!
  }

  return config;
});

export default API;