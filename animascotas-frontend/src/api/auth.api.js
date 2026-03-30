import axiosInstance from './axios.config';

export const loginApi = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials);
  return data;
};