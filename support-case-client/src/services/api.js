import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const getCases = () => api.get('/cases');
export const createCase = (data) => api.post('/cases', data);
export const updateCase = (id, data) => api.put(`/cases/${id}`, data);
export const deleteCase = (id) => api.delete(`/cases/${id}`);