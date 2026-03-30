import axiosInstance from './axios.config';

export const createVenta = async (venta) => {
  const { data } = await axiosInstance.post('/ventas', venta);
  return data;
};

export const getVentaById = async (id) => {
  const { data } = await axiosInstance.get(`/ventas/${id}`);
  return data;
};

export const getVentasPorFecha = async (inicio, fin) => {
  const { data } = await axiosInstance.get('/ventas', {
    params: { inicio, fin },
  });
  return data;
};