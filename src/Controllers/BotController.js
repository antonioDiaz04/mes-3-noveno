const Producto = require('../Models/ProductModel');
const Venta = require('../Models/VentaModel');
const Renta = require('../Models/RentaModel');
const Categoria = require('../Models/CategoriaModel');



// Obtener tendencias (productos nuevos disponibles)
exports.obtenerTendencias = async (req, res) => {
    try {
        const productos = await Producto.find({ nuevo: true, disponible: true })
            .sort({ fechaCreacion: -1 })
            .limit(5)
            .select('nombre precioActual imagenes descripcion');

        if (!productos.length) {
            return res.status(200).json({
                mensaje: 'Actualmente no hay vestidos en tendencia.',
                productos: []
            });
        }

        const lista = productos.map(p => ({
            nombre: p.nombre,
            descripcion: p.descripcion || 'Sin descripción disponible.',
            precio: `$${p.precioActual}`,
            imagen: p.imagenes?.[0] || '',
        }));

        return res.status(200).json({
            mensaje: 'Yo te recomiendo:',
            productos: lista
        });

    } catch (error) {
        console.error('❌ Error al obtener tendencias:', error);
        return res.status(500).json({ mensaje: 'Error al obtener las tendencias.', productos: [] });
    }
};


// Obtener un consejo aleatorio
exports.obtenerConsejo = async (req, res) => {
    try {
        const ventas = await Venta.aggregate([
            { $unwind: '$productos' },
            {
                $group: {
                    _id: '$productos.producto',
                    total: { $sum: '$productos.cantidad' }
                }
            }
        ]);

        const rentas = await Renta.aggregate([
            {
                $group: {
                    _id: '$producto',
                    total: { $sum: 1 }
                }
            }
        ]);

        const popularidad = new Map();

        for (const v of ventas) {
            popularidad.set(v._id.toString(), (popularidad.get(v._id.toString()) || 0) + v.total);
        }

        for (const r of rentas) {
            popularidad.set(r._id.toString(), (popularidad.get(r._id.toString()) || 0) + r.total);
        }

        if (popularidad.size === 0) {
            return res.json({
                mensaje: 'Aún no hay datos suficientes para recomendar un vestido. ¡Sé el primero en rentar o comprar uno!',
                productos: []
            });
        }

        const productosOrdenados = [...popularidad.entries()].sort((a, b) => b[1] - a[1]);
        const productoTopId = productosOrdenados[0][0];

        const productoTop = await Producto.findById(productoTopId)
            .populate('idCategoria')
            .select('nombre descripcion precioActual imagenes');

        if (!productoTop) {
            return res.json({
                mensaje: 'Hubo un problema al buscar recomendaciones. Intenta más tarde.',
                productos: []
            });
        }

        const nombreCategoria = productoTop.idCategoria?.nombre || 'una categoría especial';

        const mensaje = `Los vestidos más populares últimamente son de la categoría "${nombreCategoria}". ¿Te gustaría probar uno como el "${productoTop.nombre}"?`;

        return res.status(200).json({
            mensaje,
            productos: [{
                nombre: productoTop.nombre,
                descripcion: productoTop.descripcion || 'Sin descripción.',
                precio: `$${productoTop.precioActual}`,
                imagen: productoTop.imagenes?.[0] || ''
            }]
        });

    } catch (error) {
        console.error('❌ Error en obtenerConsejo:', error);
        return res.status(500).json({ mensaje: 'Error al generar el consejo.', productos: [] });
    }
};

exports.vestidosPorCategoria = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        const productos = [];

        for (const categoria of categorias) {
            const vestidos = await Producto.find({
                idCategoria: categoria._id,
                disponible: true
            })
                .sort({ fechaCreacion: -1 })
                .limit(5)
                .select('nombre precioActual imagenes descripcion');

            vestidos.forEach(v => {
                productos.push({
                    nombre: v.nombre,
                    descripcion: v.descripcion || 'Sin descripción.',
                    precio: `$${v.precioActual}`,
                    imagen: v.imagenes?.[0] || '',
                    categoria: categoria.nombre
                });
            });
        }

        const mensaje = productos.length > 0
            ? 'Aquí tienes vestidos disponibles por categoría:'
            : 'Actualmente no hay vestidos disponibles por categoría.';

        res.status(200).json({ mensaje, productos });

    } catch (error) {
        console.error('❌ Error al obtener vestidos por categoría:', error);
        res.status(500).json({ mensaje: 'Error al consultar categorías.', productos: [] });
    }
};



// Obtener precio de un vestido por nombre
exports.obtenerPrecio = async (req, res) => {
    const nombreVestido = req.query.vestido?.toLowerCase();
    if (!nombreVestido) {
        return res.status(400).json({
            mensaje: 'Debes proporcionar el nombre del vestido.',
            productos: []
        });
    }

    try {
        const producto = await Producto.findOne({
            nombre: { $regex: new RegExp(nombreVestido, 'i') }
        }).select('nombre precioActual descripcion imagenes');

        if (!producto) {
            return res.status(200).json({
                mensaje: `No encontré el precio del vestido "${nombreVestido}".`,
                productos: []
            });
        }

        return res.status(200).json({
            mensaje: `El precio del vestido "${producto.nombre}" es:`,
            productos: [
                {
                    nombre: producto.nombre,
                    descripcion: producto.descripcion || 'Sin descripción.',
                    precio: `$${producto.precioActual}`,
                    imagen: producto.imagenes?.[0] || ''
                }
            ]
        });

    } catch (error) {
        console.error('❌ Error al obtener precio:', error);
        return res.status(500).json({
            mensaje: 'Error al consultar el precio.',
            productos: []
        });
    }
};


// Obtener horarios (respuesta fija)
exports.obtenerHorarios = async (req, res) => {
    try {
        const horarios = 'Nuestro horario es de lunes a sábado de 10 AM a 8 PM, y domingos de 11 AM a 5 PM.';
        res.status(200).json({ horarios });
    } catch (error) {
        res.status(500).json({ respuesta: 'Error al obtener horarios.', detalles: error.message });
    }
};
