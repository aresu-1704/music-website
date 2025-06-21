import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const fetchSearchResults = async (query) => {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { query }
  });
  return response.data;
};
