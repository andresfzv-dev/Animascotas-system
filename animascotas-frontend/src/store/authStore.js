import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => set({ token, usuario }),
      login: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
      tieneModulo: (modulo) => {
        const state = get();
        if (!state.usuario) return false;
        if (state.usuario.rol === 'ADMIN') return true;
        const modulos = state.usuario.modulos;
        if (!modulos || modulos.length === 0) return true;
        return modulos.includes(modulo);
      },
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;