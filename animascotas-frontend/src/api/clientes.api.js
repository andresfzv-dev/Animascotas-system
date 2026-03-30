import axiosInstance from './axios.config';

export const getClientes = async () => {
  const { data } = await axiosInstance.get('/clientes');
  return data;
};

export const createCliente = async (cliente) => {
  const { data } = await axiosInstance.post('/clientes', cliente);
  return data;
};

export const updateCliente = async (id, cliente) => {
  const { data } = await axiosInstance.put(`/clientes/${id}`, cliente);
  return data;
};

export const getCredito = async (clienteId) => {
  const { data } = await axiosInstance.get(`/clientes/${clienteId}/credito`);
  return data;
};

export const registrarAbono = async (clienteId, abono) => {
  const { data } = await axiosInstance.post(
    `/clientes/${clienteId}/credito/abonos`,
    abono
  );
  return data;
};