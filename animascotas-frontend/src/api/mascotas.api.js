import axiosInstance from './axios.config';

export const getMascotasPorCliente = async (clienteId) => {
  const { data } = await axiosInstance.get(`/mascotas/cliente/${clienteId}`);
  return data;
};

export const createMascota = async (mascota) => {
  const { data } = await axiosInstance.post('/mascotas', mascota);
  return data;
};

export const getRecordatorios = async () => {
  const { data } = await axiosInstance.get('/mascotas/vacunas/recordatorios');
  return data;
};

export const registrarVacuna = async (mascotaId, vacuna) => {
  const { data } = await axiosInstance.post(`/mascotas/${mascotaId}/vacunas`, vacuna);
  return data;
};

export const getVacunasPorMascota = async (mascotaId) => {
  const { data } = await axiosInstance.get(`/mascotas/${mascotaId}/vacunas`);
  return data;
};