import axiosInstance from './axios.config';

export const registrarMovimiento = async (presentacionId, movimiento) => {
  await axiosInstance.post(
    `/inventario/presentaciones/${presentacionId}/movimientos`,
    movimiento
  );
};

export const getMovimientosPorPresentacion = async (presentacionId) => {
  const { data } = await axiosInstance.get(
    `/inventario/presentaciones/${presentacionId}/movimientos`
  );
  return data;
};