import axiosInstance from './axios.config';

export const getProductos = async () => {
  const { data } = await axiosInstance.get('/productos');
  return data;
};

export const getProductoById = async (id) => {
  const { data } = await axiosInstance.get(`/productos/${id}`);
  return data;
};

export const createProducto = async (producto) => {
  const { data } = await axiosInstance.post('/productos', producto);
  return data;
};

export const updateProducto = async (id, producto) => {
  const { data } = await axiosInstance.put(`/productos/${id}`, producto);
  return data;
};

export const deleteProducto = async (id) => {
  await axiosInstance.delete(`/productos/${id}`);
};

export const createPresentacion = async (productoId, presentacion) => {
  const { data } = await axiosInstance.post(
    `/productos/${productoId}/presentaciones`,
    presentacion
  );
  return data;
};

export const updatePresentacion = async (presentacionId, presentacion) => {
  const { data } = await axiosInstance.put(
    `/productos/presentaciones/${presentacionId}`,
    presentacion
  );
  return data;
};

export const getStockBajo = async () => {
  const { data } = await axiosInstance.get('/productos/stock-bajo');
  return data;
};

export const buscarPorCodigoBarras = async (codigo) => {
  const { data } = await axiosInstance.get(`/productos/codigo-barras/${codigo}`);
  return data;
};

export const asignarSintomas = async (presentacionId, sintomaIds) => {
  await axiosInstance.put(
    `/productos/presentaciones/${presentacionId}/sintomas`,
    sintomaIds
  );
};

export const deletePresentacion = async (id) => {
  await axiosInstance.delete(`/productos/presentaciones/${id}`);
};