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

export const registrarDeuda = async (clienteId, monto) => {
  const { data } = await axiosInstance.post(
    `/clientes/${clienteId}/credito/deuda`,
    null,
    { params: { monto } }
  );
  return data;
};

export const eliminarCliente = async (id) => {
  await axiosInstance.delete(`/clientes/${id}`);
};

export const getAbonosPorCliente = async (clienteId) => {
  const { data } = await axiosInstance.get(`/clientes/${clienteId}/abonos`);
  return data;
};

export const getTotalCreditosPendientes = async () => {
  const { data } = await axiosInstance.get('/clientes/creditos/total-pendiente');
  return data;
};