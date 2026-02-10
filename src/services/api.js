import axios from 'axios';

const API_URL = 'https://worship-team-manager.onrender.com/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

// Members
export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getOne: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  toggleStatus: (id) => api.patch(`/members/${id}/toggle-status`)
};

// Cotisations
export const cotisationsAPI = {
  generate: (mois) => api.post('/cotisations/generate', { mois }),
  getByMonth: (mois) => api.get(`/cotisations/month/${mois}`),
  getStats: (mois) => api.get(`/cotisations/stats/${mois}`),
  markAsPaid: (id, data) => api.patch(`/cotisations/${id}/pay`, data),
  update: (id, data) => api.patch(`/cotisations/${id}`, data),
  getMemberHistory: (memberId) => api.get(`/cotisations/member/${memberId}`)
};

// Attendance
export const attendanceAPI = {
  getAll: () => api.get('/attendance/all'), // NOUVELLE FONCTION
  getByDate: (date) => api.get('/attendance', { params: { date } }),
  getMemberHistory: (memberId) => api.get(`/attendance/member/${memberId}`),
  mark: (data) => api.post('/attendance', data)
};

// Notes
export const notesAPI = {
  getByMember: (memberId) => api.get(`/notes/member/${memberId}`),
  create: (data) => api.post('/notes', data),
  delete: (id) => api.delete(`/notes/${id}`)
};

export default api;
