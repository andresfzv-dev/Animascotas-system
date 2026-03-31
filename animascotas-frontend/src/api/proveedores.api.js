import axiosInstance from './axios.config';

export const getProveedores = async () => {
  const { data } = await axiosInstance.get('/proveedores');
  return data;
};

export const createProveedor = async (proveedor) => {
  await axiosInstance.post('/proveedores', proveedor);
};

export const getFacturasPendientes = async () => {
  const { data } = await axiosInstance.get('/proveedores/facturas/pendientes');
  return data;
};

export const getAlertasVencimiento = async () => {
  const { data } = await axiosInstance.get('/proveedores/facturas/alertas');
  return data;
};

export const registrarFactura = async (proveedorId, factura) => {
  const { data } = await axiosInstance.post(
    `/proveedores/${proveedorId}/facturas`,
    factura
  );
  return data;
};

export const registrarAbonoProveedor = async (facturaId, abono) => {
  const { data } = await axiosInstance.post(
    `/proveedores/facturas/${facturaId}/abonos`,
    abono
  );
  return data;
};

export const getTodasFacturas = async () => {
  const { data } = await axiosInstance.get('/proveedores/facturas/todas');
  return data;
};