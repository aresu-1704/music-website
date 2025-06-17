import axios from 'axios';

export const fetchSearchResults = async (query) => {
  const response = await axios.get(`http://localhost:5270/api/search?query=${query}`);
  return response.data;
};
