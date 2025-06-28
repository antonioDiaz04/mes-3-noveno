const Venta = require('../Models/VentaModel');
const Renta = require('../models/RentaModel');

// === 1. Ventas ===
exports.obtenerResumenVentas = async (req, res) => {
    try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const ventas = await Venta.find({
            createdAt: { $gte: inicioMes, $lte: finMes },
            estado: { $in: ['Pagado', 'Entregado'] }
        });

        const totalVentas = ventas.reduce((sum, v) => sum + (v.resumen?.total || 0), 0);

        res.json({ totalVentas });
    } catch (error) {
        console.error('Error en obtenerResumenVentas:', error);
        res.status(500).json({ message: 'Error al obtener resumen de ventas' });
    }
};

// === 2. Rentas ===
exports.obtenerResumenRentas = async (req, res) => {
    try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const rentas = await Renta.find({
            'detallesRenta.fechaRecoge': { $gte: inicioMes, $lte: finMes },
            estado: { $in: ['Activo', 'Completado'] }
        });

        const totalRentas = rentas.reduce((sum, r) => sum + (r.detallesPago?.precioRenta || 0), 0);

        res.json({ totalRentas });
    } catch (error) {
        console.error('Error en obtenerResumenRentas:', error);
        res.status(500).json({ message: 'Error al obtener resumen de rentas' });
    }
};

// === 3. Clientes únicos ===
exports.obtenerClientesUnicos = async (req, res) => {
    try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const ventas = await Venta.find({
            createdAt: { $gte: inicioMes, $lte: finMes },
            estado: { $in: ['Pagado', 'Entregado'] }
        }).select('usuario');

        const rentas = await Renta.find({
            'detallesRenta.fechaRecoge': { $gte: inicioMes, $lte: finMes },
            estado: { $in: ['Activo', 'Completado'] }
        }).select('usuario');

        const clientesVentas = ventas.map(v => v.usuario.toString());
        const clientesRentas = rentas.map(r => r.usuario.toString());
        const totalClientes = new Set([...clientesVentas, ...clientesRentas]).size;

        res.json({ totalClientes });
    } catch (error) {
        console.error('Error en obtenerClientesUnicos:', error);
        res.status(500).json({ message: 'Error al obtener clientes únicos' });
    }
};

// === 4. Productos más vendidos ===
exports.obtenerProductosMasVendidos = async (req, res) => {
    try {
        const now = new Date();
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
        const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const ventas = await Venta.find({
            createdAt: { $gte: inicioMes, $lte: finMes },
            estado: { $in: ['Pagado', 'Entregado'] }
        }).populate('productos.producto');

        const productosVendidos = {};

        for (const venta of ventas) {
            for (const item of venta.productos) {
                const prod = item.producto;
                if (!prod || !prod._id) continue;

                const key = prod._id.toString();

                if (!productosVendidos[key]) {
                    productosVendidos[key] = {
                        nombre: prod.nombre,
                        color: prod.color || 'Desconocido',
                        talla: prod.talla || 'N/A',
                        cantidad: 0
                    };
                }

                productosVendidos[key].cantidad += item.cantidad;
            }
        }

        const vestidosMasVendidos = Object.values(productosVendidos);

        res.json({ productosMasVendidos: vestidosMasVendidos });
    } catch (error) {
        console.error('Error en obtenerProductosMasVendidos:', error);
        res.status(500).json({ message: 'Error al obtener productos más vendidos' });
    }
};

// === 5. Datos simulados de gráficas ===
exports.obtenerDatosGraficos = (req, res) => {
    const ventasMensuales = Array(12).fill(0);
    const rentasMensuales = Array(12).fill(0);

    const clientesFrecuentes = {
        labels: ['Buenavista', 'Altamira', 'Chapultepec', 'Centro', 'Tulancingo'],
        datos: [120, 90, 80, 70, 60]
    };

    const radarVentaRenta = {
        labels: ['Jaltocán', 'Atlapexco', 'Buena Vista', 'Huejutla', 'Pachuca'],
        rentas: [50, 40, 30, 20, 10],
        ventas: [40, 50, 60, 70, 80]
    };

    res.json({ ventasMensuales, rentasMensuales, clientesFrecuentes, ventasRentasRadar: radarVentaRenta });
};
