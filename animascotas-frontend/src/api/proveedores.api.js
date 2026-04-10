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

export const actualizarFactura = async (facturaId, factura) => {
  const { data } = await axiosInstance.put(`/proveedores/facturas/${facturaId}`, factura);
  return data;
};

export const getAbonosPorFactura = async (facturaId) => {
  const { data } = await axiosInstance.get(`/proveedores/facturas/${facturaId}/abonos`);
  return data;
};



export const subirImagenFactura = async (facturaId, archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const { data } = await axiosInstance.post(
    `/proveedores/facturas/${facturaId}/imagen`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const getFacturasPorProveedor = async (proveedorId) => {
  const { data } = await axiosInstance.get(`/proveedores/${proveedorId}/facturas`);
  return data;
};