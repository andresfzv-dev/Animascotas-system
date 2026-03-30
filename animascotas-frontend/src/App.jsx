import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductosPage from './pages/productos/ProductosPage';
import VentasPage from './pages/ventas/VentasPage';
import ClientesPage from './pages/clientes/ClientesPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import InventarioPage from './pages/inventario/InventarioPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;