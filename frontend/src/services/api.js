import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const getMenu = () => api.get('/menu').then(res => res.data);
export const createOrder = (data) => api.post('/orders', data).then(res => res.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then(res => res.data);

export default api;
