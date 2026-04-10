import qz from 'qz-tray';

qz.security.setCertificatePromise((resolve) => resolve());
qz.security.setSignatureAlgorithm('SHA512');
qz.security.setSignaturePromise((toSign) => (resolve) => resolve());

const IMPRESORA = 'XP-58';

export const conectar = async () => {
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect({ retries: 2, delay: 1 });
  }
};

const formatPesos = (valor) =>
  `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const linea = (texto1, texto2, ancho = 32) => {
  const espacios = ancho - texto1.length - texto2.length;
  return texto1 + ' '.repeat(Math.max(1, espacios)) + texto2 + '\n';
};

const separador = (char = '-', ancho = 32) => char.repeat(ancho) + '\n';

export const imprimirTicketVenta = async (venta, cajero) => {
  try {
    await conectar();

    const config = qz.configs.create(IMPRESORA, {
      raw: true,
      encoding: 'ISO-8859-1',
    });

    const fecha = new Date(venta.fecha).toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

    const lineas = [
      '\x1B@',           // Init
      '\x1Ba\x01',       // Centro
      '\x1BE\x01',       // Bold on
      '\x1B!\x30',       // Fuente grande
      'ANIMASCOTAS\n',
      '\x1B!\x00',       // Fuente normal
      '\x1BE\x00',       // Bold off
      'La Tebaida, Quindio\n',
      '\n',
      '\x1Ba\x00',       // Izquierda
      separador(),
      `Fecha: ${fecha}\n`,
      `Cajero: ${cajero}\n`,
      `Cliente: ${venta.cliente}\n`,
      separador(),
      '\x1BE\x01',
      'PRODUCTOS\n',
      '\x1BE\x00',
      ...venta.items.flatMap((item) => [
        `${item.producto}\n`,
        `  ${item.variante}\n`,
        linea(
          `  x${item.cantidad} @ ${formatPesos(item.precioUnitario)}`,
          formatPesos(item.subtotal)
        ),
      ]),
      separador(),
      '\x1BE\x01',
      linea('TOTAL', formatPesos(venta.total)),
      '\x1BE\x00',
      linea('Recibido', formatPesos(venta.montoRecibido)),
      linea('Cambio', formatPesos(venta.cambio)),
      linea('Metodo', venta.metodoPago),
      separador(),
      '\x1Ba\x01',
      '\x1BE\x01',
      'Gracias por su compra!\n',
      '\x1BE\x00',
      '\n',
      '\n',
      '\n',
      '\x1DVA\x03',     // Corte
    ];

    await qz.print(config, [{ type: 'raw', format: 'plain', data: lineas.join('') }]);
    return true;
  } catch (error) {
    console.error('Error al imprimir ticket:', error);
    throw new Error('No se pudo imprimir. Verifica que QZ Tray esté corriendo.');
  }
};

export const imprimirResumenDia = async (ventas, fecha, cajero, ganancia = 0) => {
  try {
    await conectar();

    const config = qz.configs.create(IMPRESORA, {
      raw: true,
      encoding: 'ISO-8859-1',
    });

    const totalDia = ventas
      .filter((v) => v.metodoPago !== 'CREDITO')
      .reduce((acc, v) => acc + v.total, 0);
    const totalEfectivo = ventas
      .filter((v) => v.metodoPago === 'EFECTIVO')
      .reduce((acc, v) => acc + v.total, 0);
    const totalTransferencia = ventas
      .filter((v) => v.metodoPago === 'TRANSFERENCIA')
      .reduce((acc, v) => acc + v.total, 0);
    const totalAbonos = ventas
      .filter((v) => v.metodoPago === 'ABONO')
      .reduce((acc, v) => acc + v.total, 0);

    const lineas = [
      '\x1B@',
      '\x1Ba\x01',
      '\x1BE\x01',
      '\x1B!\x30',
      'ANIMASCOTAS\n',
      '\x1B!\x00',
      '\x1BE\x00',
      'La Tebaida, Quindio\n',
      '\n',
      '\x1Ba\x00',
      '='.repeat(32) + '\n',
      '\x1Ba\x01',
      '\x1BE\x01',
      'RESUMEN DEL DIA\n',
      '\x1BE\x00',
      '\x1Ba\x00',
      '='.repeat(32) + '\n',
      `Fecha: ${fecha}\n`,
      `Cajero: ${cajero}\n`,
      `Generado: ${new Date().toLocaleTimeString('es-CO')}\n`,
      '-'.repeat(32) + '\n',
      ...ventas.map((v) => {
        const hora = new Date(v.fecha).toLocaleTimeString('es-CO', {
          hour: '2-digit', minute: '2-digit',
        });
        return linea(`${hora} ${v.cliente}`, formatPesos(v.total));
      }),
      '-'.repeat(32) + '\n',
      linea('Efectivo:', formatPesos(totalEfectivo)),
      linea('Transferencia:', formatPesos(totalTransferencia)),
      linea('Abonos:', formatPesos(totalAbonos)),
      '='.repeat(32) + '\n',
      '\x1BE\x01',
      '\x1B!\x30',
      linea('TOTAL DIA:', formatPesos(totalDia)),
      '\x1B!\x00',
      '\x1BE\x00',
      '-'.repeat(32) + '\n',
      '\x1BE\x01',
      linea('GANANCIA:', formatPesos(ganancia)),
      '\x1BE\x00',
      '='.repeat(32) + '\n',
      linea('Ventas:', ventas.filter((v) => v.metodoPago !== 'ABONO').length.toString()),
      '='.repeat(32) + '\n',
      '\n',
      '\n',
      '\n',
      '\x1DVA\x03',
    ];

    await qz.print(config, [{ type: 'raw', format: 'plain', data: lineas.join('') }]);
    return true;
  } catch (error) {
    console.error('Error al imprimir resumen:', error);
    throw new Error('No se pudo imprimir. Verifica que QZ Tray esté corriendo.');
  }
};

export const imprimirTicketCredito = async (cliente, credito, ventas) => {
  try {
    await conectar();
    const config = qz.configs.create(IMPRESORA);

    const formatP = (valor) =>
      `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

    const linea = (t1, t2) => {
      const espacios = 32 - t1.length - t2.length;
      return t1 + ' '.repeat(Math.max(1, espacios)) + t2 + '\n';
    };

    const datos = [
      '\x1B@',
      '\x1Ba\x01',
      '\x1BE\x01',
      '\x1B!\x30',
      'ANIMASCOTAS\n',
      '\x1B!\x00',
      '\x1BE\x00',
      'La Tebaida, Quindio\n',
      '\n',
      '\x1Ba\x00',
      '='.repeat(32) + '\n',
      '\x1Ba\x01',
      '\x1BE\x01',
      'ESTADO DE CUENTA\n',
      '\x1BE\x00',
      '\x1Ba\x00',
      '='.repeat(32) + '\n',
      `Cliente: ${cliente}\n`,
      `Fecha: ${new Date().toLocaleDateString('es-CO')}\n`,
      '-'.repeat(32) + '\n',
      linea('Deuda total:', formatP(credito.deudaTotal)),
      linea('Saldo pendiente:', formatP(credito.saldoPendiente)),
      '-'.repeat(32) + '\n',
      '\x1BE\x01',
      'COMPRAS\n',
      '\x1BE\x00',
      ...ventas.slice(0, 10).map((v) => {
        const fecha = new Date(v.fecha).toLocaleDateString('es-CO');
        const productos = v.items.map((i) => `${i.producto} x${i.cantidad}`).join(', ');
        return `${fecha}\n${productos}\n${linea('Total:', formatP(v.total))}`;
      }),
      '='.repeat(32) + '\n',
      '\x1Ba\x01',
      '\x1BE\x01',
      'Gracias por su compra!\n',
      '\x1BE\x00',
      '\n\n\n',
      '\x1DVA\x03',
    ];

    await qz.print(config, [{ type: 'raw', format: 'plain', data: datos.join('') }]);
    return true;
  } catch (error) {
    console.error('Error al imprimir:', error);
    throw new Error('No se pudo imprimir. Verifica que QZ Tray esté corriendo.');
  }
};