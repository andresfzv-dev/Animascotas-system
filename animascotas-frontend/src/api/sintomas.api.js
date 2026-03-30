import axiosInstance from './axios.config';

export const getSintomas = async () => {
  const { data } = await axiosInstance.get('/sintomas');
  return data;
};

export const createSintoma = async (sintoma) => {
  const { data } = await axiosInstance.post('/sintomas', sintoma);
  return data;
};

export const getMedicamentosPorSintoma = async (sintomaId) => {
  const { data } = await axiosInstance.get(`/sintomas/${sintomaId}/medicamentos`);
  return data;
};