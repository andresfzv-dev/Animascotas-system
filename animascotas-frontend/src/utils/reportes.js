import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NEGOCIO = {
  nombre: 'Animascotas',
  direccion: 'La Tebaida, Quindío',
  mensaje: '¡Gracias por su compra!',
};

const formatPesos = (valor) =>
  `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const formatFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

const encabezado = (doc, titulo) => {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(NEGOCIO.nombre, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(NEGOCIO.direccion, 105, 27, { align: 'center' });
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 105, 36, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 44);
  return 50;
};

export const generarReporteDiarioPDF = (ventas, fecha, usuario) => {
  const doc = new jsPDF();
  const totalDia = ventas.reduce((acc, v) => acc + v.total, 0);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(NEGOCIO.nombre, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(NEGOCIO.direccion, 105, 27, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Ventas', 105, 38, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${fecha}`, 14, 48);
  doc.text(`Cajero: ${usuario}`, 14, 54);
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 60);

  autoTable(doc, {
    startY: 68,
    head: [['Hora', 'Cliente', 'Productos', 'Método', 'Total', 'Recibido', 'Cambio']],
    body: ventas.map((v) => [
      new Date(v.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      v.cliente,
      v.items.map((i) => `${i.producto} - ${i.variante} x${i.cantidad}`).join('\n'),
      v.metodoPago,
      formatPesos(v.total),
      formatPesos(v.montoRecibido),
      formatPesos(v.cambio),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    alternateRowStyles: { fillColor: [232, 245, 233] },
    columnStyles: { 2: { cellWidth: 55 } },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total del período: ${formatPesos(totalDia)}`, 14, finalY);
  doc.text(`Total ventas: ${ventas.length}`, 14, finalY + 7);

  doc.save(`reporte-ventas-${fecha}.pdf`);
};

export const generarTicketVentaPDF = (venta, cajero) => {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
  let y = 8;

  const center = (texto, tamaño = 10, bold = false) => {
    doc.setFontSize(tamaño);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(texto, 40, y, { align: 'center' });
    y += tamaño * 0.5 + 2;
  };

  const line = (texto1, texto2, tamaño = 8) => {
    doc.setFontSize(tamaño);
    doc.setFont('helvetica', 'normal');
    doc.text(texto1, 5, y);
    doc.text(texto2, 75, y, { align: 'right' });
    y += 5;
  };

  const divider = () => {
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y);
    y += 4;
  };

  center(NEGOCIO.nombre, 14, true);
  center(NEGOCIO.direccion, 8);
  y += 2;
  divider();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${formatFecha(venta.fecha)}`, 5, y); y += 5;
  doc.text(`Cajero: ${cajero}`, 5, y); y += 5;
  doc.text(`Cliente: ${venta.cliente}`, 5, y); y += 5;
  divider();
  center('DETALLE', 9, true);
  y += 1;

  venta.items.forEach((item) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const nombre = `${item.producto} - ${item.variante}`;
    const wrappedNombre = doc.splitTextToSize(nombre, 55);
    doc.text(wrappedNombre, 5, y);
    y += wrappedNombre.length * 4;
    line(`  x${item.cantidad} @ ${formatPesos(item.precioUnitario)}`, formatPesos(item.subtotal));
  });

  divider();
  line('TOTAL', formatPesos(venta.total), 10);
  line('Recibido', formatPesos(venta.montoRecibido));
  line('Cambio', formatPesos(venta.cambio));
  divider();
  center(NEGOCIO.mensaje, 10, true);
  y += 2;
  doc.save(`ticket-venta-${venta.id.slice(0, 8)}.pdf`);
};

export const generarReporteProveedoresPDF = (facturas) => {
  const doc = new jsPDF();
  const y = encabezado(doc, 'Reporte de Créditos y Abonos — Proveedores');

  const totalDeuda = facturas.reduce((acc, f) => acc + f.total, 0);
  const totalPendiente = facturas.reduce((acc, f) => acc + f.saldoPendiente, 0);
  const totalPagado = totalDeuda - totalPendiente;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total facturas: ${facturas.length}`, 14, y + 2);
  doc.text(`Deuda total: ${formatPesos(totalDeuda)}`, 14, y + 8);
  doc.text(`Total pagado: ${formatPesos(totalPagado)}`, 14, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Saldo pendiente: ${formatPesos(totalPendiente)}`, 14, y + 20);

  autoTable(doc, {
    startY: y + 28,
    head: [['Proveedor', 'N° Factura', 'Fecha', 'Vencimiento', 'Total', 'Pagado', 'Pendiente', 'Estado']],
    body: facturas.map((f) => [
      f.proveedorNombre,
      f.numeroFactura,
      f.fecha,
      f.fechaVencimiento,
      formatPesos(f.total),
      formatPesos(f.total - f.saldoPendiente),
      formatPesos(f.saldoPendiente),
      f.vencida ? 'VENCIDA' : f.saldoPendiente === 0 ? 'PAGADA' : 'PENDIENTE',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    alternateRowStyles: { fillColor: [232, 245, 233] },
    bodyStyles: { textColor: [38, 50, 56] },
    didParseCell: (data) => {
      if (data.column.index === 7) {
        if (data.cell.raw === 'VENCIDA') data.cell.styles.textColor = [211, 47, 47];
        else if (data.cell.raw === 'PAGADA') data.cell.styles.textColor = [46, 125, 50];
        else data.cell.styles.textColor = [245, 127, 23];
      }
    },
  });

  doc.save(`reporte-proveedores-${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.pdf`);
};

export const generarReporteInventarioPDF = (productos) => {
  const doc = new jsPDF();
  const y = encabezado(doc, 'Reporte de Inventario');

  const presentaciones = productos.flatMap((p) =>
    p.presentaciones.map((pres) => ({
      ...pres,
      productoNombre: p.nombre,
      categoria: p.categoria,
    }))
  );

  const valorTotal = presentaciones.reduce(
    (acc, p) => acc + p.precioVenta * p.stock, 0
  );
  const sinStock = presentaciones.filter((p) => p.stock === 0).length;
  const stockBajo = presentaciones.filter((p) => p.stockBajo).length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total presentaciones: ${presentaciones.length}`, 14, y + 2);
  doc.text(`Sin stock: ${sinStock}`, 14, y + 8);
  doc.text(`Stock bajo: ${stockBajo}`, 14, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Valor total inventario: ${formatPesos(valorTotal)}`, 14, y + 20);

  autoTable(doc, {
    startY: y + 28,
    head: [['Producto', 'Variante', 'Categoría', 'Stock', 'Mín.', 'Precio venta', 'Valor en stock']],
    body: presentaciones
      .sort((a, b) => a.productoNombre.localeCompare(b.productoNombre, 'es'))
      .map((p) => [
        p.productoNombre,
        p.variante,
        p.categoria,
        p.stock,
        p.stockMinimo,
        formatPesos(p.precioVenta),
        formatPesos(p.precioVenta * p.stock),
      ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    alternateRowStyles: { fillColor: [232, 245, 233] },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const stock = Number(data.cell.raw);
        if (stock === 0) data.cell.styles.textColor = [211, 47, 47];
        else if (stock <= 2) data.cell.styles.textColor = [245, 127, 23];
      }
    },
    foot: [['', '', '', '', '', 'TOTAL', formatPesos(valorTotal)]],
    footStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' },
  });

  doc.save(`reporte-inventario-${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.pdf`);
};