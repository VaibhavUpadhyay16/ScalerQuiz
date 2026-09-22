import axios from 'axios';

const BASE_URL = 'https://scalarquiz.onrender.com/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies (refreshToken) to be sent
});

// Request interceptor to add the access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using native axios (to avoid interceptor loops)
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        // Save the new token
        const { token } = refreshResponse.data;
        localStorage.setItem('token', token);

        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and emit event
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-error'));
        return Promise.reject(refreshError);
      }
    }

    // For other errors, extract the message
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const apiError = new Error(message);
    apiError.code = error.response?.data?.code;
    apiError.status = error.response?.status;
    return Promise.reject(apiError);
  }
);

// --- Auth Endpoints ---
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const logoutUser = () => apiClient.post('/auth/logout');
export const getMe = () => apiClient.get('/auth/me');

// --- User Endpoints ---
export const listUsers = () => apiClient.get('/users');
export const getUserStats = (username) => apiClient.get(`/users/${encodeURIComponent(username)}`);
export const updatePreferences = (username, preferences) => apiClient.patch(`/users/${encodeURIComponent(username)}/preferences`, preferences);

// --- Quiz Endpoints ---
export const getDomains = () => apiClient.get('/quiz/domains');
export const getGeminiStatus = () => apiClient.get('/quiz/status');
export const fetchQuestions = (domain, difficulty, count) => apiClient.post('/quiz/questions', { domain, difficulty, count });
export const streamQuestions = async (domain, difficulty, count, onQuestion) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiClient.defaults.baseURL}/quiz/questions/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include',
    body: JSON.stringify({ domain, difficulty, count })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Could not start the quiz');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processLines = (text) => {
    buffer += text;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const item = JSON.parse(line);
      if (item.error) {
        const error = new Error(item.error);
        error.code = item.code;
        throw error;
      }
      onQuestion(item);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    processLines(decoder.decode(value, { stream: true }));
  }

  processLines(decoder.decode());
  if (buffer.trim()) onQuestion(JSON.parse(buffer));
};
export const submitQuizResult = (payload) => apiClient.post('/quiz/submit', payload);
