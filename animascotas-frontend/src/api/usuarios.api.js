import axiosInstance from './axios.config';

export const getUsuarios = async () => {
  const { data } = await axiosInstance.get('/usuarios');
  return data;
};

export const createUsuario = async (usuario) => {
  const { data } = await axiosInstance.post('/usuarios', usuario);
  return data;
};

export const updateUsuario = async (id, usuario) => {
  const { data } = await axiosInstance.put(`/usuarios/${id}`, usuario);
  return data;
};

export const desactivarUsuario = async (id) => {
  await axiosInstance.delete(`/usuarios/${id}`);
};

export const eliminarUsuario = async (id) => {
  await axiosInstance.delete(`/usuarios/${id}`);
};