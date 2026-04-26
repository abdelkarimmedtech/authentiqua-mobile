// Minimal api config - extend when integrating real backend
const API = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  aiBaseUrl: process.env.EXPO_PUBLIC_AI_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.EXPO_PUBLIC_API_KEY || null,
  timeout: 15000,
};

export default API;
