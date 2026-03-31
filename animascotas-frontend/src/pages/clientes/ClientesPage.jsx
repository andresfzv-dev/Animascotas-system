import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CreditCard } from 'lucide-react';
import { getClientes } from '../../api/clientes.api';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ClienteFormModal from './components/ClienteFormModal';
import CreditoModal from './components/CreditoModal';
import styles from './ClientesPage.module.css';

const ClientesPage = () => {
  const [search, setSearch] = useState('');
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isCreditoModalOpen, setIsCreditoModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const clientesFiltrados = clientes
    .filter((c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono && c.telefono.includes(search))
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const handleNuevoCliente = () => {
    setClienteSeleccionado(null);
    setIsClienteModalOpen(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setIsClienteModalOpen(true);
  };

  const handleVerCredito = (cliente) => {
    setClienteSeleccionado(cliente);
    setIsCreditoModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes registrados`}
        actions={
          <Button onClick={handleNuevoCliente}>
            <Plus size={18} />
            Nuevo cliente
          </Button>
        }
      />

      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o teléfono..."
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState message="No se encontraron clientes" />
      ) : (
        <div className={styles.tabla}>
          <div className={styles.header}>
            <span>Nombre</span>
            <span>Teléfono</span>
            <span>Acciones</span>
          </div>
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className={styles.row}>
              <span className={styles.nombre}>{cliente.nombre}</span>
              <span className={styles.telefono}>
                {cliente.telefono || '—'}
              </span>
              <div className={styles.acciones}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditarCliente(cliente)}
                >
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVerCredito(cliente)}
                >
                  <CreditCard size={15} />
                  Crédito
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClienteFormModal
        isOpen={isClienteModalOpen}
        onClose={() => {
          setIsClienteModalOpen(false);
          setClienteSeleccionado(null);
        }}
        cliente={clienteSeleccionado}
      />

      <CreditoModal
        isOpen={isCreditoModalOpen}
        onClose={() => {
          setIsCreditoModalOpen(false);
          setClienteSeleccionado(null);
        }}
        cliente={clienteSeleccionado}
      />
    </div>
  );
};

export default ClientesPage;