// controllers/recommendationController.js
const Transaction = require('../Models/Transaction'); // Tu modelo Mongoose Transaction
const { runPythonScript } = require('../utils/pythonBridge'); // Importa la utilidad para llamar a Python

// --- Funciones de Recomendación basadas en Mongoose (top frecuencia/monto) ---
// Estas funciones consultan directamente tu base de datos MongoDB
// NO necesitan pasar df_transacciones_con_cluster, operan sobre el modelo Transaction.

async function obtenerProductosTopFrecuencia(clusterId, numProductos = 3) {
    try {
        // Asumiendo que el campo 'cluster' no está directamente en la transacción.
        // Si tienes un modelo de Cliente con 'cluster' asociado, tendrías que poblarlo o filtrar por sus atributos.
        // Para este ejemplo, haremos una búsqueda general de productos más frecuentes.
        // Si deseas filtrar por clientes de un CLUSTER ESPECÍFICO, el clusterId debe ser un atributo en Transaction
        // o debes filtrar las transacciones por atributos que corresponden a ese cluster (ej. rango de monto_total_gastado).
        // Por simplicidad, aquí se obtienen los productos más frecuentes GENERALES.
        // Si el cliente_nombre se puede mapear a un cluster sin un modelo Cliente, es más complejo.
        
        // Si tu modelo Transaction tuviera un campo 'cluster_cliente':
        // const topProducts = await Transaction.aggregate([
        //     { $match: { cluster_cliente: clusterId } },
        //     { $group: { _id: '$producto_nombre', count: { $sum: 1 } } },
        //     { $sort: { count: -1 } },
        //     { $limit: numProductos }
        // ]);

        // Opción general si no tienes el cluster en Transaction:
        const topProducts = await Transaction.aggregate([
            { $group: { _id: '$producto_nombre', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: numProductos }
        ]);
        return topProducts.map(p => p._id);
    } catch (error) {
        console.error(`Error al obtener productos top por frecuencia:`, error.message);
        return [];
    }
}

async function obtenerProductosTopMonto(clusterId, numProductos = 3) {
    try {
        // Similar a la función anterior, si tu Transaction no tiene 'cluster_cliente',
        // esta obtendrá los productos que más monto generan en general.
        const topProducts = await Transaction.aggregate([
            { $group: { _id: '$producto_nombre', totalMonto: { $sum: '$monto_total' } } },
            { $sort: { totalMonto: -1 } },
            { $limit: numProductos }
        ]);
        return topProducts.map(p => p._id);
    } catch (error) {
        console.error(`Error al obtener productos top por monto:`, error.message);
        return [];
    }
}

// --- Controlador de Express para Recomendaciones (función principal) ---

/**
 * @desc    Genera recomendaciones de productos para un cliente basado en una nueva transacción.
 * Las métricas del cliente se calculan al momento de la solicitud.
 * @route   POST /api/recommendations (o llamada interna)
 * @access  Private (requiere autenticación/autorización)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `nueva_transaccion` en `req.body`.
 * @param   {Object} res - Objeto de respuesta de Express.
 * @returns {Object} JSON con el estado de la operación y las recomendaciones.
 */
exports.getRecommendationsForTransaction = async (req, res) => {
    try {
        const nuevaTransaccion = req.body;
        const clienteAfectadoEmail = nuevaTransaccion.cliente_nombre;
        const productoBaseParaReglas = nuevaTransaccion.producto_nombre;

        // --- 1. Calcular Métricas del Cliente Sobre la Marcha ---
        // Se buscan todas las transacciones del cliente (incluyendo la que se acaba de guardar si esta función es llamada POST-SAVE)
        const transaccionesExistentesCliente = await Transaction.find({ cliente_nombre: clienteAfectadoEmail });

        let numTransaccionesActual = transaccionesExistentesCliente.length;
        let montoTotalGastadoActual = transaccionesExistentesCliente.reduce((sum, t) => sum + t.monto_total, 0);
        
        console.log(`\nMétricas calculadas para '${clienteAfectadoEmail}':`);
        console.log(`Transacciones: ${numTransaccionesActual}, Gasto Total: ${montoTotalGastadoActual}`);

        // --- 2. Enviar Datos a Python para Clasificar Clúster y Obtener Reglas de Asociación ---
        const pythonInput = {
            cliente_data_actualizada: {
                num_transacciones: numTransaccionesActual,
                monto_total_gastado: montoTotalGastadoActual
            },
            producto_base_para_reglas: productoBaseParaReglas
        };

        let pythonResult;
        try {
            pythonResult = await runPythonScript('predict_and_recommend.py', pythonInput);
        } catch (pyError) {
            console.error('Error al ejecutar el script Python:', pyError.message);
            // Si hay un error en Python, respondemos con un error para el cliente
            return res.status(500).json({ success: false, error: `Error en el servicio de ML: ${pyError.message}` });
        }

        const nuevoClusterPredicho = pythonResult.cluster;
        const sugerenciasReglas = pythonResult.sugerencias_reglas; // ¡Estas vienen de Python!

        console.log(`El cliente '${clienteAfectadoEmail}' (con la nueva transacción) ahora pertenece al Clúster: ${nuevoClusterPredicho}`);
        
        // --- 3. Generar Recomendaciones Integradas (incluyendo las de Mongoose) ---
        const recomendaciones = {
            sugerencias_cluster: [],
            sugerencias_reglas: sugerenciasReglas // ¡Aquí están las reglas de asociación de Python!
        };

        // Recomendación por Clúster (Perfil del Cliente) - Calculado en Node.js con Mongoose
        console.log(`\n🔥 Vestidos TOP para tu perfil (Clúster ${nuevoClusterPredicho}):`);
        let sugerenciasCluster = [];
        // Las funciones obtenerProductosTopFrecuencia y obtenerProductosTopMonto
        // ahora NO usan un `df_transacciones_con_cluster_local` de Pandas.
        // Hacen una consulta directa a MongoDB a través de Mongoose.
        // NOTA: Si necesitas que estas funciones filtren por 'clusterId',
        // el clusterId debe estar en el modelo Transaction o debes implementar
        // una lógica de filtrado más sofisticada basada en los atributos del cliente.
        // Por ahora, estas darán los top productos generales.

        if (nuevoClusterPredicho === 0) {
            sugerenciasCluster = await obtenerProductosTopMonto(nuevoClusterPredicho, 3);
            console.log("Sugerencias de productos (basadas en alto ingreso para el clúster):");
            console.log("Acción estratégica: Ofrécele descuentos exclusivos o acceso anticipado a colecciones premium.");
        } else if (nuevoClusterPredicho === 1) {
            sugerenciasCluster = await obtenerProductosTopFrecuencia(nuevoClusterPredicho, 3);
            console.log("Sugerencias de productos (basadas en frecuencia para el clúster):");
            console.log("Acción estratégica: Sugiere productos complementarios o programas de fidelidad para aumentar el valor promedio de su compra.");
        } else if (nuevoClusterPredicho === 2) {
            sugerenciasCluster = await obtenerProductosTopMonto(nuevoClusterPredicho, 3);
            console.log("Sugerencias de productos (basadas en alto ingreso para el clúster):");
            console.log("Acción estratégica: Recuérdale las últimas novedades de lujo o productos de alta gama que suelen interesarle.");
        } else {
            console.log("Clúster no reconocido. Ofrecer recomendaciones generales (top más vendidos).");
            const topProductsOverall = await Transaction.aggregate([
                { $group: { _id: '$producto_nombre', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 3 }
            ]);
            sugerenciasCluster = topProductsOverall.map(p => p._id);
        }

        if (sugerenciasCluster.length > 0) {
            recomendaciones.sugerencias_cluster = sugerenciasCluster;
            sugerenciasCluster.forEach(prod => console.log(`- ${prod}`));
        } else {
            console.log("No se encontraron sugerencias de productos para este clúster.");
        }

        // Recomendación por Reglas de Asociación (Productos Relacionados)
        console.log(`\n🛍️ Combina con tu '${productoBaseParaReglas}':`);
        if (sugerenciasReglas && sugerenciasReglas.length > 0) {
            sugerenciasReglas.forEach(rec => {
                // Asegúrate de que rec.confianza sea un número para el toFixed
                console.log(`- ${rec.producto} (Confianza: ${(rec.confianza * 100).toFixed(1)}%)`);
            });
        } else {
            console.log("No se encontraron productos complementarios basados en hábitos de compra anteriores.");
        }

        // Envía la respuesta final (con recomendaciones de cluster y reglas)
        // Nota: Si esta función es llamada internamente (desde createTransaction),
        // `res` será el mockRes, y no enviará una respuesta HTTP real hasta que createTransaction lo haga.
        res.status(200).json({
            success: true,
            message: 'Recomendaciones generadas exitosamente.',
            recommendations: recomendaciones
        });

    } catch (error) {
        console.error(`Error al generar recomendaciones: ${error.message}`);
        res.status(500).json({ success: false, error: 'Error del servidor al generar recomendaciones.' });
    }
};

// --- (Otras funciones como createTransaction, updateTransaction, etc., si están en este mismo archivo) ---
// Normalmente, createTransaction estaría en transactionController.js y llamaría a esta función.
// --- Función createTransaction original (si aplica) ---
exports.createTransaction = async (req, res) => {
    try {
        console.log(req.body)
        const transaction = await Transaction.create(req.body);
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error(`Error al crear transacción: ${error.message}`);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Error del servidor al crear la transacción.' });
    }
};