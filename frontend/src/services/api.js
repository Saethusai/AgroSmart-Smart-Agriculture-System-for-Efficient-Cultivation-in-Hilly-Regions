import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Crops API
export const cropsAPI = {
    getAll: (params) => api.get('/crops', { params }),
    getById: (id) => api.get(`/crops/${id}`),
    search: (name) => api.get(`/crops/search/${name}`),
    create: (data) => api.post('/crops', data),
    update: (id, data) => api.put(`/crops/${id}`, data),
    delete: (id) => api.delete(`/crops/${id}`)
};

// Sensors API
export const sensorsAPI = {
    sendData: (data) => api.post('/sensors/data', data),
    getLatest: (fieldId) => api.get('/sensors/latest', { params: { fieldId } }),
    getHistory: (params) => api.get('/sensors/history', { params }),
    getStats: (params) => api.get('/sensors/stats', { params })
};

// Irrigation API
export const irrigationAPI = {
    getRecommendation: (fieldId) => api.get('/irrigation/recommendation', { params: { fieldId } }),
    start: (data) => api.post('/irrigation/start', data),
    stop: (irrigationId) => api.post(`/irrigation/stop/${irrigationId}`),
    getStatus: (params) => api.get('/irrigation/status', { params }),
    getLogs: (params) => api.get('/irrigation/logs', { params }),
    getStats: (params) => api.get('/irrigation/stats', { params }),
    // Schedule Methods
    getSchedules: () => api.get('/irrigation/schedules'),
    createSchedule: (data) => api.post('/irrigation/schedules', data),
    updateSchedule: (id, data) => api.put(`/irrigation/schedules/${id}`, data),
    deleteSchedule: (id) => api.delete(`/irrigation/schedules/${id}`)
};

// Reports API
export const reportsAPI = {
    getSummary: (params) => api.get('/reports/summary', { params }),
    exportData: (params) => api.get('/reports/export', {
        params,
        responseType: 'blob' // Important for file downloads
    })
};

// Weather API
export const weatherAPI = {
    getCurrent: () => api.get('/weather/current'),
    getForecast: () => api.get('/weather/forecast')
};

export default api;
