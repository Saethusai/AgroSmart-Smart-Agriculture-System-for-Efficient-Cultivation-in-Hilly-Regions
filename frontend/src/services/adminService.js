import api from './api';

const BASE_PATH = '/admin';

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (params = {}) => {
    const response = await api.get(`${BASE_PATH}/users`, { params });
    return response.data;
};

export const getUserById = async (userId) => {
    const response = await api.get(`${BASE_PATH}/users/${userId}`);
    return response.data;
};

export const updateUserStatus = async (userId, isActive) => {
    const response = await api.put(`${BASE_PATH}/users/${userId}/status`, { isActive });
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`${BASE_PATH}/users/${userId}`);
    return response.data;
};

// ============================================
// CROP MANAGEMENT
// ============================================

export const createCrop = async (cropData) => {
    const response = await api.post(`${BASE_PATH}/crops`, cropData);
    return response.data;
};

export const updateCrop = async (cropId, cropData) => {
    const response = await api.put(`${BASE_PATH}/crops/${cropId}`, cropData);
    return response.data;
};

export const deleteCrop = async (cropId) => {
    const response = await api.delete(`${BASE_PATH}/crops/${cropId}`);
    return response.data;
};

// ============================================
// SYSTEM MONITORING
// ============================================

export const getSystemStats = async () => {
    const response = await api.get(`${BASE_PATH}/system/stats`);
    return response.data;
};

export const getAllSensorData = async (params = {}) => {
    const response = await api.get(`${BASE_PATH}/sensors/all`, { params });
    return response.data;
};

export const getAllIrrigationLogs = async (params = {}) => {
    const response = await api.get(`${BASE_PATH}/irrigation/all`, { params });
    return response.data;
};

// ============================================
// ANALYTICS
// ============================================

export const getWaterUsageAnalytics = async (days = 30) => {
    const response = await api.get(`${BASE_PATH}/analytics/water-usage`, { params: { days } });
    return response.data;
};

export const getSensorTrends = async (days = 7) => {
    const response = await api.get(`${BASE_PATH}/analytics/sensor-trends`, { params: { days } });
    return response.data;
};

export const getIrrigationEfficiency = async () => {
    const response = await api.get(`${BASE_PATH}/analytics/irrigation-efficiency`);
    return response.data;
};

// ============================================
// ALERT & CONFIG
// ============================================

export const getAlerts = async (params = {}) => {
    const response = await api.get(`${BASE_PATH}/alerts`, { params });
    return response.data;
};

export const sendBroadcast = async (message, severity = 'info') => {
    const response = await api.post(`${BASE_PATH}/alerts/broadcast`, { message, severity });
    return response.data;
};

export const getSystemConfig = async () => {
    const response = await api.get(`${BASE_PATH}/config`);
    return response.data;
};

export const updateSystemConfig = async (configData) => {
    const response = await api.put(`${BASE_PATH}/config`, configData);
    return response.data;
};

export default {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    createCrop,
    updateCrop,
    deleteCrop,
    getSystemStats,
    getAllSensorData,
    getAllIrrigationLogs,
    getWaterUsageAnalytics,
    getSensorTrends,
    getIrrigationEfficiency,
    getAlerts,
    sendBroadcast,
    getSystemConfig,
    updateSystemConfig
};
