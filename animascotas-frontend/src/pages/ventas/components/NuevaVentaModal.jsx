import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Scan, Trash2, Plus, Minus } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { getProductos, buscarPorCodigoBarras } from '../../../api/productos.api';
import { getClientes } from '../../../api/clientes.api';
import { createVenta } from '../../../api/ventas.api';
import styles from './NuevaVentaModal.module.css';

const NuevaVentaModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [clienteId, setClienteId] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const codigoRef = useRef(null);

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);
  const cambio = montoRecibido ? Number(montoRecibido) - total : 0;

  useEffect(() => {
  if (metodoPago === 'TRANSFERENCIA') {
    setMontoRecibido(total.toString());
  }
  }, [metodoPago, total]);

  const todasLasPresentaciones = productos.flatMap((p) =>
    p.presentaciones.map((pres) => ({
      ...pres,
      productoNombre: p.nombre,
    }))
  );

  const presentacionesFiltradas = busqueda.length > 1
    ? todasLasPresentaciones.filter((p) =>
        p.productoNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.variante.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 6)
    : [];

  const agregarItem = (presentacion) => {
    setBusqueda('');
    const existente = items.find((i) => i.presentacionId === presentacion.id);
    if (existente) {
      actualizarCantidad(presentacion.id, existente.cantidad + 1);
      return;
    }
    setItems((prev) => [...prev, {
      presentacionId: presentacion.id,
      nombre: `${presentacion.productoNombre} - ${presentacion.variante}`,
      precio: presentacion.precioVenta,
      cantidad: 1,
      subtotal: presentacion.precioVenta,
      stockDisponible: presentacion.stock,
    }]);
  };

  const actualizarCantidad = (presentacionId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.presentacionId === presentacionId
          ? { ...item, cantidad: nuevaCantidad, subtotal: item.precio * nuevaCantidad }
          : item
      )
    );
  };

  const eliminarItem = (presentacionId) => {
    setItems((prev) => prev.filter((i) => i.presentacionId !== presentacionId));
  };

  const handleEscanear = async (e) => {
    if (e.key === 'Enter' && busqueda) {
      try {
        const presentacion = await buscarPorCodigoBarras(busqueda);
        const producto = productos.find((p) =>
          p.presentaciones.some((pres) => pres.id === presentacion.id)
        );
        if (producto) {
          agregarItem({ ...presentacion, productoNombre: producto.nombre });
        }
        setBusqueda('');
      } catch {
        toast.error('Producto no encontrado');
        setBusqueda('');
      }
    }
  };

  const mutation = useMutation({
    mutationFn: createVenta,
    onSuccess: (venta) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success(`Venta registrada — Cambio: $${venta.cambio.toLocaleString('es-CO')}`);
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar la venta');
    },
  });

  const handleRegistrar = () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    if (metodoPago === 'EFECTIVO' && (!montoRecibido || Number(montoRecibido) < total)) {
      toast.error('El monto recibido es insuficiente');
      return; 
    }
    mutation.mutate({
      clienteId: clienteId || null,
      metodoPago,
      montoRecibido: Number(montoRecibido),
      items: items.map((i) => ({
        presentacionId: i.presentacionId,
        cantidad: i.cantidad,
      })),
    });
  };

  const handleClose = () => {
    setItems([]);
    setBusqueda('');
    setMetodoPago('EFECTIVO');
    setClienteId('');
    setMontoRecibido('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva venta" size="xl">
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.buscadorWrapper}>
            <div className={styles.buscador}>
              <Scan size={18} className={styles.scanIcon} />
              <input
                ref={codigoRef}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleEscanear}
                placeholder="Buscar producto o escanear código de barras..."
                className={styles.buscadorInput}
                autoFocus
              />
            </div>
            {presentacionesFiltradas.length > 0 && (
              <div className={styles.sugerencias}>
                {presentacionesFiltradas.map((p) => (
                  <button
                    key={p.id}
                    className={styles.sugerencia}
                    onClick={() => agregarItem(p)}
                    disabled={p.stock === 0}
                  >
                    <div className={styles.sugerenciaInfo}>
                      <span className={styles.sugerenciaNombre}>
                        {p.productoNombre}
                      </span>
                      <span className={styles.sugerenciaVariante}>{p.variante}</span>
                    </div>
                    <div className={styles.sugerenciaDerecha}>
                      <span className={styles.sugerenciaPrecio}>
                        ${p.precioVenta.toLocaleString('es-CO')}
                      </span>
                      <span className={`${styles.sugerenciaStock} ${p.stock === 0 ? styles.sinStock : ''}`}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.itemsList}>
            {items.length === 0 ? (
              <div className={styles.emptyCart}>
                <p>Sin productos agregados</p>
                <span>Busca o escanea un producto para comenzar</span>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.presentacionId} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemNombre}>{item.nombre}</span>
                    <span className={styles.itemPrecio}>
                      ${item.precio.toLocaleString('es-CO')} c/u
                    </span>
                  </div>
                  <div className={styles.itemControles}>
                    <button
                      className={styles.cantBtn}
                      onClick={() => actualizarCantidad(item.presentacionId, item.cantidad - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.cantidad}>{item.cantidad}</span>
                    <button
                      className={styles.cantBtn}
                      onClick={() => actualizarCantidad(item.presentacionId, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stockDisponible}
                    >
                      <Plus size={14} />
                    </button>
                    <span className={styles.subtotal}>
                      ${item.subtotal.toLocaleString('es-CO')}
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => eliminarItem(item.presentacionId)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.resumen}>
            <h3 className={styles.resumenTitle}>Resumen</h3>

            <div className={styles.resumenField}>
              <label className={styles.resumenLabel}>Cliente (opcional)</label>
              <select
                className={styles.resumenSelect}
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Mostrador</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.resumenField}>
              <label className={styles.resumenLabel}>Método de pago</label>
              <div className={styles.metodoPago}>
                {['EFECTIVO', 'TRANSFERENCIA'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.metodoBtn} ${metodoPago === m ? styles.metodoActive : ''}`}
                    onClick={() => setMetodoPago(m)}
                  >
                    {m === 'EFECTIVO' ? '💵 Efectivo' : '📲 Transferencia'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <strong className={styles.totalValue}>
                ${total.toLocaleString('es-CO')}
              </strong>
            </div>

            {metodoPago === 'EFECTIVO' && (
              <>
                <div className={styles.resumenField}>
                  <label className={styles.resumenLabel}>Monto recibido</label>
                  <input
                    type="number"
                    className={styles.resumenInput}
                    placeholder="0"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                  />
                </div>

                {montoRecibido && (
                  <div className={`${styles.cambioRow} ${cambio < 0 ? styles.cambioNegativo : ''}`}>
                    <span>Cambio</span>
                    <strong>${cambio.toLocaleString('es-CO')}</strong>
                  </div>
                )}
              </>
            )}


            <Button
              onClick={handleRegistrar}
              isLoading={mutation.isPending}
              disabled={items.length === 0}
              size="lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              Registrar venta
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NuevaVentaModal;