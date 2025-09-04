// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production (Vercel handles routing)
  : 'http://localhost:5000'; // Use local server in development

export default API_BASE_URL;
