import axios from 'axios';

const API_URL = 'http://localhost:5000/api/crops';

export const getAllCrops = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getCropById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const searchCrops = async (name) => {
    const response = await axios.get(`${API_URL}/search/${name}`);
    return response.data;
};

export default {
    getAllCrops,
    getCropById,
    searchCrops
};
