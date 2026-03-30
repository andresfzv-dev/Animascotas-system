import axiosInstance from './axios.config';

export const getCategorias = async () => {
  const { data } = await axiosInstance.get('/categorias');
  return data;
};