// Minimal api config - extend when integrating real backend
// For local development set EXPO_PUBLIC_AI_BASE_URL to http://<your_machine_ip>:8000
const API = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  // aiBaseUrl prefers a dedicated env var, then falls back to baseUrl. For local dev, export EXPO_PUBLIC_AI_BASE_URL
  aiBaseUrl: process.env.EXPO_PUBLIC_AI_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.EXPO_PUBLIC_API_KEY || null,
  timeout: 15000,
};

export default API;
