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
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Reporte PDF del día — tabla completa
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
  doc.text('Reporte de Ventas del Día', 105, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${fecha}`, 14, 48);
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
  doc.text(`Total del día: ${formatPesos(totalDia)}`, 14, finalY);
  doc.text(`Total ventas: ${ventas.length}`, 14, finalY + 7);

  doc.save(`reporte-ventas-${fecha}.pdf`);
};

// Ticket individual por venta
export const generarTicketVentaPDF = (venta, usuario) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200],
  });

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
  doc.text(`Cajero: ${usuario}`, 5, y); y += 5;
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
  center('www.animascotas.com', 7);

  doc.save(`ticket-venta-${venta.id.slice(0, 8)}.pdf`);
};