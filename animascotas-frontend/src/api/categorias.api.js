import axiosInstance from './axios.config';

export const getCategorias = async () => {
  const { data } = await axiosInstance.get('/categorias');
  return data;
};

export const createCategoria = async (nombre) => {
  const { data } = await axiosInstance.post('/categorias', { nombre });
  return data;
};