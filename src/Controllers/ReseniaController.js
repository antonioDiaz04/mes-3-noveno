const Resenia = require('../Models/ReseniaModel');
// Obtener reseñas aceptadas
const { enviaCorreoDinamico } = require('../Controllers/CorreoController');

exports.obtenerReseniasAceptadas = async (req, res) => {
    try {
        const resenias = await Resenia.find({ estado: 'aprobada' });
        if (!resenias || resenias.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reseñas aprobadas' });
        }
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};

exports.crearResenia = async (req, res) => {
    try {
        const nuevaResenia = new Resenia({
            ...req.body,
            estado: 'pendiente' // Asegurar que todas las nuevas reseñas sean pendientes
        });

        const guardadaResenia = await nuevaResenia.save();

        // Notificar al usuario
        const correoData = {
            email: guardadaResenia.correo,
            asunto: '¡Gracias por tu reseña en Atelier!',
            mensaje: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #d4af37; text-align: center;">¡Gracias por compartir tu experiencia!</h2>
                    <p>Hola ${guardadaResenia.usuario.nombre},</p>
                    <p>Hemos recibido tu reseña con una calificación de ${guardadaResenia.calificacion} estrellas:</p>
                    <blockquote style="font-style: italic; border-left: 3px solid #d4af37; padding-left: 15px; margin: 20px 0;">
                        "${guardadaResenia.contenido}"
                    </blockquote>
                    <p>Nuestro equipo la revisará en breve. Recibirás otra notificación cuando sea aprobada y publicada.</p>
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'https://atelier.com'}" 
                           style="background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
                            Visitar Atelier
                        </a>
                    </p>
                    <p style="font-size: 0.9em; color: #777; text-align: center; margin-top: 30px;">
                        Atentamente,<br>El equipo de Atelier
                    </p>
                </div>
            `
        };

        // Enviar correo (usando el método existente)
        const mockReq = { body: correoData };
        const mockRes = {
            status: () => ({ json: () => { } })
        };

        await enviaCorreoDinamico(mockReq, mockRes);

        res.status(201).json(guardadaResenia);

    } catch (error) {
        console.error('Error al crear reseña:', error);
        res.status(500).json({
            error: 'Error al crear la reseña',
            details: error.message
        });
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
        console.log("paramas=>", req.params.id)
        console.log("body=>", req.body)
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

// Aprobar reseña y enviar notificación
exports.aprobarResenia = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Actualizar el estado de la reseña
        const resenia = await Resenia.findByIdAndUpdate(
            id,
            { estado: 'aprobada' },
            { new: true }
        );

        if (!resenia) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        // 2. Preparar y enviar el correo usando la función existente
        const correoData = {
            email: resenia.correo,
            asunto: 'Tu reseña ha sido aprobada en Atelier',
            mensaje: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d4af37;">¡Gracias por tu reseña!</h2>
                    <p>Hola ${resenia.usuario.nombre},</p>
                    <p>Nos complace informarte que tu reseña ha sido aprobada y ahora es visible para nuestra comunidad.</p>
                    <p><strong>Tu comentario:</strong></p>
                    <p style="font-style: italic;">"${resenia.contenido}"</p>
                    <p>Valoramos mucho tu opinión. ¡Esperamos verte pronto de nuevo en Atelier!</p>
                    <p style="color: #888;">El equipo de Atelier</p>
                </div>
            `
        };

        // Simulamos una request para usar la función existente
        const mockRequest = {
            body: correoData
        };

        const mockResponse = {
            status: (code) => ({
                json: (data) => {
                    console.log('Correo enviado:', data);
                    return res.status(200).json({
                        message: "Reseña aprobada y notificación enviada",
                        resenia: resenia,
                        correoStatus: data
                    });
                }
            })
        };

        await enviaCorreoDinamico(mockRequest, mockResponse);

    } catch (error) {
        console.error("Error al aprobar reseña:", error);
        res.status(500).json({
            error: 'Error en el servidor',
            details: error.message
        });
    }
};
// Obtener reseñas rechazadas
exports.obtenerReseniasRechazadas = async (req, res) => {
    try {
        const resenias = await Resenia.find({ estado: 'rechazada' });
        res.status(200).json(resenias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas', details: error.message });
    }
};
// Actualizar estado de aceptación de una reseña
exports.actualizarEstadoAceptacion = async (req, res) => {
    try {
        const { estado } = req.body;
        const reseniaActualizada = await Resenia.findByIdAndUpdate(req.params.id, { estado }, { new: true });
        if (!reseniaActualizada) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        res.status(200).json(reseniaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de aceptación', details: error.message });
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
exports.eliminarReseniasSeleccionadas = async (req, res) => {
    try {
        const { ids } = req.body; // Se espera un array de IDs en el cuerpo de la solicitud
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Se deben proporcionar IDs válidos' });
        }
        const result = await Resenia.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Reseñas eliminadas exitosamente', result });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar las reseñas seleccionadas', details: error.message });
    }
}