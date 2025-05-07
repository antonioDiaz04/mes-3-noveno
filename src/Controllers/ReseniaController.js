const Resenia = require('../Models/ReseniaModel');

// Crear una nueva reseña
exports.crearResenia = async (req, res) => {
    try {
        const nuevaResenia = new Resenia(req.body);
        const guardadaResenia = await nuevaResenia.save();
        res.status(201).json(guardadaResenia);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la reseña', details: error.message });
    }
};

// Obtener todas las reseñas
exports.obtenerResenias = async (req, res) => {
    try {
        const resenias = await Resenia.find();
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};

// Obtener una reseña por id
exports.obtenerResenia = async (req, res) => {
    try {
        const resenia = await Resenia.findById(req.params.id);
        if (!resenia) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.status(200).json(resenia);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la reseña', details: error.message });
    }
};

// Actualizar una reseña por id
exports.actualizarResenia = async (req, res) => {
    try {
        const reseniaActualizada = await Resenia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reseniaActualizada) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.status(200).json(reseniaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la reseña', details: error.message });
    }
};

// Eliminar una reseña por id
exports.eliminarResenia = async (req, res) => {
    try {
        const reseniaEliminada = await Resenia.findByIdAndDelete(req.params.id);
        if (!reseniaEliminada) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.status(200).json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la reseña', details: error.message });
    }
};
// Obtener reseñas por usuarioId
exports.obtenerReseniasPorUsuarioId = async (req, res) => {
    try {
        const resenias = await Resenia.find({ usuarioId: req.params.usuarioId });
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};
// Obtener reseñas por productoId
exports.obtenerReseniasPorProductoId = async (req, res) => {
    try {
        const resenias = await Resenia.find({ productoId: req.params.productoId });
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};
// Obtener reseñas aceptadas
exports.obtenerReseniasAceptadas = async (req, res) => {
    try {
        const resenias = await Resenia.find({ aceptado: true });
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};
// Obtener reseñas no aceptadas
exports.obtenerReseniasNoAceptadas = async (req, res) => {
    try {
        const resenias = await Resenia.find({ aceptado: false });
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};
// Actualizar estado de aceptación de una reseña
exports.actualizarEstadoAceptacion = async (req, res) => {
    try {
        const reseniaActualizada = await Resenia.findByIdAndUpdate(req.params.id, { aceptado: req.body.aceptado }, { new: true });
        if (!reseniaActualizada) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.status(200).json(reseniaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la reseña', details: error.message });
    }
};
// Obtener estadísticas de reseñas
exports.generarEstadisticasResenias = async (req, res) => {
    try {
        const totalResenias = await Resenia.countDocuments();
        const promedioEstrellas = await Resenia.aggregate([
            { $group: { _id: null, promedio: { $avg: "$estrellas" } } }
        ]);
        const totalReseniasAceptadas = await Resenia.countDocuments({ aceptado: true });
        const totalReseniasNoAceptadas = await Resenia.countDocuments({ aceptado: false });

        res.status(200).json({
            totalResenias,
            promedioEstrellas: promedioEstrellas[0] ? promedioEstrellas[0].promedio : 0,
            totalReseniasAceptadas,
            totalReseniasNoAceptadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar estadísticas de reseñas', details: error.message });
    }
};
// Obtener estadísticas de reseñas por productoId
exports.generarEstadisticasReseniasPorProductoId = async (req, res) => {
    try {
        const totalResenias = await Resenia.countDocuments({ productoId: req.params.productoId });
        const promedioEstrellas = await Resenia.aggregate([
            { $match: { productoId: req.params.productoId } },
            { $group: { _id: null, promedio: { $avg: "$estrellas" } } }
        ]);
        const totalReseniasAceptadas = await Resenia.countDocuments({ productoId: req.params.productoId, aceptado: true });
        const totalReseniasNoAceptadas = await Resenia.countDocuments({ productoId: req.params.productoId, aceptado: false });

        res.status(200).json({
            totalResenias,
            promedioEstrellas: promedioEstrellas[0] ? promedioEstrellas[0].promedio : 0,
            totalReseniasAceptadas,
            totalReseniasNoAceptadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar estadísticas de reseñas por producto', details: error.message });
    }
};
// Obtener estadísticas de reseñas por usuarioId
exports.generarEstadisticasReseniasPorUsuarioId = async (req, res) => {
    try {
        const totalResenias = await Resenia.countDocuments({ usuarioId: req.params.usuarioId });
        const promedioEstrellas = await Resenia.aggregate([
            { $match: { usuarioId: req.params.usuarioId } },
            { $group: { _id: null, promedio: { $avg: "$estrellas" } } }
        ]);
        const totalReseniasAceptadas = await Resenia.countDocuments({ usuarioId: req.params.usuarioId, aceptado: true });
        const totalReseniasNoAceptadas = await Resenia.countDocuments({ usuarioId: req.params.usuarioId, aceptado: false });

        res.status(200).json({
            totalResenias,
            promedioEstrellas: promedioEstrellas[0] ? promedioEstrellas[0].promedio : 0,
            totalReseniasAceptadas,
            totalReseniasNoAceptadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar estadísticas de reseñas por usuario', details: error.message });
    }
};
// Obtener estadísticas de reseñas por rango de fechas
exports.generarEstadisticasReseniasPorFechas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.body;
        const totalResenias = await Resenia.countDocuments({
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) }
        });
        const promedioEstrellas = await Resenia.aggregate([
            { $match: { createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) } } },
            { $group: { _id: null, promedio: { $avg: "$estrellas" } } }
        ]);
        const totalReseniasAceptadas = await Resenia.countDocuments({
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
            aceptado: true
        });
        const totalReseniasNoAceptadas = await Resenia.countDocuments({
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
            aceptado: false
        });

        res.status(200).json({
            totalResenias,
            promedioEstrellas: promedioEstrellas[0] ? promedioEstrellas[0].promedio : 0,
            totalReseniasAceptadas,
            totalReseniasNoAceptadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar estadísticas de reseñas por fechas', details: error.message });
    }
};
// Obtener estadísticas de reseñas por rango de fechas y productoId
exports.generarEstadisticasReseniasPorFechasYProductoId = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.body;
        const totalResenias = await Resenia.countDocuments({
            productoId: req.params.productoId,
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) }
        });
        const promedioEstrellas = await Resenia.aggregate([
            { $match: { productoId: req.params.productoId, createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) } } },
            { $group: { _id: null, promedio: { $avg: "$estrellas" } } }
        ]);
        const totalReseniasAceptadas = await Resenia.countDocuments({
            productoId: req.params.productoId,
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
            aceptado: true
        });
        const totalReseniasNoAceptadas = await Resenia.countDocuments({
            productoId: req.params.productoId,
            createdAt: { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) },
            aceptado: false
        });

        res.status(200).json({
            totalResenias,
            promedioEstrellas: promedioEstrellas[0] ? promedioEstrellas[0].promedio : 0,
            totalReseniasAceptadas,
            totalReseniasNoAceptadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar estadísticas de reseñas por fechas y producto', details: error.message });
    }
};