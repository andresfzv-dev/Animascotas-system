import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CreditCard, Syringe } from 'lucide-react';
import { getClientes } from '../../api/clientes.api';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ClienteFormModal from './components/ClienteFormModal';
import CreditoModal from './components/CreditoModal';
import HistorialVacunasClienteModal from './components/HistorialVacunasClienteModal';
import styles from './ClientesPage.module.css';

const ClientesPage = () => {
  const [search, setSearch] = useState('');
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isCreditoModalOpen, setIsCreditoModalOpen] = useState(false);
  const [isVacunasModalOpen, setIsVacunasModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filtroCredito, setFiltroCredito] = useState(false);
  const [filtroSoloVacunas, setFiltroSoloVacunas] = useState(false);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const clientesFiltrados = clientes
    .filter((c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefono && c.telefono.includes(search))
    )
    .filter((c) => (filtroCredito ? c.tieneCredito : true))
    .filter((c) => (filtroSoloVacunas ? (!c.tieneCredito && c.tieneVacunas) : true))
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

  const handleVerVacunas = (cliente) => {
    setClienteSeleccionado(cliente);
    setIsVacunasModalOpen(true);
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

      <div className={styles.filtrosBar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o teléfono..."
        />
        <button
          className={`${styles.filtroToggle} ${filtroCredito ? styles.filtroToggleActive : ''}`}
          onClick={() => setFiltroCredito(!filtroCredito)}
        >
          Con crédito
        </button>
        <button
          className={`${styles.filtroToggle} ${filtroSoloVacunas ? styles.filtroToggleActive : ''}`}
          onClick={() => setFiltroSoloVacunas(!filtroSoloVacunas)}
        >
          Solo vacunas
        </button>
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
                {cliente.tieneVacunas && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerVacunas(cliente)}
                  >
                    <Syringe size={15} />
                    Vacunas
                  </Button>
                )}
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

      <HistorialVacunasClienteModal
        isOpen={isVacunasModalOpen}
        onClose={() => {
          setIsVacunasModalOpen(false);
          setClienteSeleccionado(null);
        }}
        cliente={clienteSeleccionado}
      />
    </div>
  );
};

export default ClientesPage;