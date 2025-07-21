const { startOfWeek, format, differenceInDays, addDays } = require('date-fns');
const Venta = require('../models/VentaModel');
const Renta = require('../models/RentaModel');

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const obtenerResumenDashboard = async (req, res) => {
  try {
    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;

    const filtroFechasVentas = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
    const filtroFechasRentas = start && end ? { 'detallesRenta.fechaOcupacion': { $gte: start, $lte: end } } : {};

    // ---------- PERIODO ANTERIOR ----------
    let startAnterior = null;
    let endAnterior = null;

    if (start && end) {
      const dias = differenceInDays(end, start);
      startAnterior = new Date(start);
      startAnterior.setDate(startAnterior.getDate() - dias - 1);

      endAnterior = new Date(start);
      endAnterior.setDate(endAnterior.getDate() - 1);
    }

    const filtroFechasVentasAnterior = startAnterior && endAnterior
      ? { createdAt: { $gte: startAnterior, $lte: endAnterior } }
      : {};

    const filtroFechasRentasAnterior = startAnterior && endAnterior
      ? { 'detallesRenta.fechaOcupacion': { $gte: startAnterior, $lte: endAnterior } }
      : {};

    const ventasAnterior = await Venta.find(filtroFechasVentasAnterior).lean();
    const rentasAnterior = await Renta.find(filtroFechasRentasAnterior).lean();

    const montoTotalVentasAnterior = ventasAnterior.reduce((sum, v) => sum + (v.resumen?.total || 0), 0);
    const montoTotalRentasAnterior = rentasAnterior.reduce((sum, r) => sum + (r.detallesPago?.precioRenta || 0), 0);

    const totalVentasAnterior = ventasAnterior.length;
    const totalRentasAnterior = rentasAnterior.length;

    const clientesVentasAnt = await Venta.find(filtroFechasVentasAnterior).distinct('usuario');
    const clientesRentasAnt = await Renta.find(filtroFechasRentasAnterior).distinct('usuario');
    const totalClientesAnterior = new Set([...clientesVentasAnt, ...clientesRentasAnt]).size;

    // ---------- PERIODO ACTUAL ----------
    const totalVentas = await Venta.countDocuments(filtroFechasVentas);
    const totalRentas = await Renta.countDocuments(filtroFechasRentas);

    const ventasFiltradas = await Venta.find(filtroFechasVentas).lean();
    const rentasFiltradas = await Renta.find(filtroFechasRentas).lean();

    const montoTotalVentas = ventasFiltradas.reduce((sum, v) => sum + (v.resumen?.total || 0), 0);
    const montoTotalRentas = rentasFiltradas.reduce((sum, r) => sum + (r.detallesPago?.precioRenta || 0), 0);

    const clientesVentas = await Venta.find(filtroFechasVentas).distinct('usuario');
    const clientesRentas = await Renta.find(filtroFechasRentas).distinct('usuario');
    const totalClientes = new Set([...clientesVentas, ...clientesRentas]).size;

    const ventas = await Venta.find(filtroFechasVentas)
      .populate('usuario')
      .populate('productos.producto')
      .lean();

    const rentas = await Renta.find(filtroFechasRentas)
      .populate('usuario')
      .populate('producto')
      .lean();

    const transacciones = [
      ...ventas.map(v => ({
        fotoDePerfil: v.usuario?.fotoDePerfil || '',
        cliente: v.usuario?.nombre || 'Usuario',
        tipo: v.esApartado ? 'Apartado' : 'Venta',
        vestido: v.productos?.[0]?.producto?.nombre || 'Producto',
        monto: v.resumen?.total || 0,
        estado: v.estado || 'Pendiente',
        fecha: v.createdAt
      })),
      ...rentas.map(r => ({
        fotoDePerfil: r.usuario?.fotoDePerfil || '',
        cliente: r.usuario?.nombre || 'Usuario',
        tipo: 'Renta',
        vestido: r.producto?.nombre || 'Producto',
        monto: r.detallesPago?.precioRenta || 0,
        estado: r.estado || 'Pendiente',
        fecha: r.fechaDeRegistro,

      }))

    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const generarColorUnico = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = `hsl(${hash % 360}, 70%, 70%)`;
      return color;
    };

    // ---------- CALENDARIO ----------
    const calendarioEventos = await Renta.find(filtroFechasRentas)
      .populate('producto')
      .lean();

    const events = calendarioEventos.map(r => {
      const desde = new Date(r.detallesRenta.fechaOcupacion);
      const hasta = new Date(r.detallesRenta.fechaRegreso);
      return {
        id: `renta-${r._id}`,
        calendarId: `renta-${r._id}`,
        title: `${r.producto?.nombre || 'Producto'} (${r.usuario?.nombre || ''})`,
        start: desde.toISOString(),
        end: hasta.toISOString(), // Toast UI calendar incluye end de forma exclusiva
        category: 'allday', // usar 'allday' para eventos que ocupan días completos
        bgColor: generarColorUnico(r._id.toString()),
        isReadOnly: true
      };
    });



    const calendarOptions = {
      initialView: 'dayGridMonth',
      events
    };

    // ---------- RESPUESTA ----------
    res.json({
      totalVentas,
      totalRentas,
      totalClientes,
      montoTotalVentas,
      montoTotalRentas,

      // Periodo anterior
      totalVentasAnterior,
      totalRentasAnterior,
      totalClientesAnterior,
      montoTotalVentasAnterior,
      montoTotalRentasAnterior,

      barChartData: await getBarChartReal(filtroFechasVentas, filtroFechasRentas),
      chartOptionsMinimal: getChartOptions(),
      calendarOptions,
      transacciones
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
};

async function getBarChartReal(filtroVentas, filtroRentas) {
  const ventas = await Venta.find(filtroVentas).lean();
  const rentas = await Renta.find(filtroRentas).lean();

  // Determina si hay rango explícito y calcula días
  const start = filtroVentas.createdAt?.$gte;
  const end = filtroVentas.createdAt?.$lte;
  const rangoDias = start && end ? differenceInDays(end, start) : 365;

  let agrupador;
  let etiquetas = [];
  let ventasAgrupadas = {};
  let rentasAgrupadas = {};

  if (rangoDias <= 31) {
    // Agrupar por día
    agrupador = (fecha) => format(new Date(fecha), 'yyyy-MM-dd');
  } else if (rangoDias <= 90) {
    // Agrupar por semana
    agrupador = (fecha) =>
      `Semana ${format(startOfWeek(new Date(fecha)), 'w')} - ${format(new Date(fecha), 'MMM')}`;
  } else {
    // Agrupar por mes
    agrupador = (fecha) => meses[new Date(fecha).getMonth()];
  }

  // Agrupa ventas
  ventas.forEach((v) => {
    const clave = agrupador(v.createdAt);
    ventasAgrupadas[clave] = (ventasAgrupadas[clave] || 0) + (v.resumen?.total || 0);
  });

  // Agrupa rentas
  rentas.forEach((r) => {
    const clave = agrupador(r.detallesRenta.fechaOcupacion);
    rentasAgrupadas[clave] = (rentasAgrupadas[clave] || 0) + (r.detallesPago?.precioRenta || 0);
  });

  // Etiquetas ordenadas por fecha
  etiquetas = Array.from(new Set([...Object.keys(ventasAgrupadas), ...Object.keys(rentasAgrupadas)]));
  etiquetas.sort((a, b) => new Date(a.split(' ')[1] || a) - new Date(b.split(' ')[1] || b));

  return {
    labels: etiquetas,
    datasets: [
      {
        label: "Rentas",
        backgroundColor: "#A5B4FC",
        data: etiquetas.map((key) => rentasAgrupadas[key] || 0),
      },
      {
        label: "Ventas",
        backgroundColor: "#FCD34D",
        data: etiquetas.map((key) => ventasAgrupadas[key] || 0),
      },
    ],
  };
}
function getChartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true }
    }
  };
}

module.exports = {
  obtenerResumenDashboard
};
