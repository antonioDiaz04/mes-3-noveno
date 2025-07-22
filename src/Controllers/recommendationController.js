// controllers/recommendationController.js
const Transaction = require('../Models/Transaction'); // Tu modelo Mongoose Transaction
const { runPythonScript } = require('../utils/pythonBridge'); // Importa la utilidad para Python

// --- Funciones de Recomendación basadas en Mongoose (top frecuencia/monto) ---

/**
 * @desc Obtiene los productos más frecuentes para un clúster dado.
 * NOTA: Esta función asume que el `cluster` del cliente puede ser inferido o está disponible
 * de alguna manera en las transacciones o es un criterio de filtro general.
 * Si el cluster del cliente no está en Transaction, esta función debería ser más general.
 * @param {number} clusterId El ID del clúster (usado para contextualizar la búsqueda, si aplica).
 * @param {string} cliente_nombre El identificador del cliente.
 * @param {number} [numProductos=3] El número de productos a devolver.
 * @returns {Promise<Array<string>>} Una promesa que resuelve con una lista de nombres de productos.
 */
async function obtenerProductosTopFrecuencia(clusterId, cliente_nombre, numProductos = 3) {
    try {
        // En este escenario sin modelo Client, filtraremos por el cliente y luego por algún atributo
        // O simplemente daremos los top productos generales para ese 'cluster' inferido si la transaccion no tiene el cluster
        // Para simular, asumamos que buscamos productos comunes entre clientes con un comportamiento similar al de este cluster
        // Esto es un lugar donde podrías necesitar ajustar tu estrategia de DB si 'cluster' no está en Transaction.

        const topProducts = await Transaction.aggregate([
            // Si las transacciones no tienen el campo 'cluster', esta línea no funcionará.
            // Una alternativa sería filtrar por otros atributos que definen el cluster (ej. rango de monto_total)
            // { $match: { 'cliente.cluster': clusterId } }, // Si Transaction tiene un campo 'cluster' desnormalizado
            { $group: { _id: '$producto_nombre', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: numProductos }
        ]);
        return topProducts.map(p => p._id);
    } catch (error) {
        console.error(`Error al obtener productos top por frecuencia para el clúster ${clusterId}:`, error.message);
        return [];
    }
}

/**
 * @desc Obtiene los productos que generan mayor monto para un clúster dado.
 * @param {number} clusterId El ID del clúster (usado para contextualizar la búsqueda, si aplica).
 * @param {string} cliente_nombre El identificador del cliente.
 * @param {number} [numProductos=3] El número de productos a devolver.
 * @returns {Promise<Array<string>>} Una promesa que resuelve con una lista de nombres de productos.
 */
async function obtenerProductosTopMonto(clusterId, cliente_nombre, numProductos = 3) {
    try {
        const topProducts = await Transaction.aggregate([
            // { $match: { 'cliente.cluster': clusterId } }, // Si Transaction tiene un campo 'cluster' desnormalizado
            { $group: { _id: '$producto_nombre', totalMonto: { $sum: '$monto_total' } } },
            { $sort: { totalMonto: -1 } },
            { $limit: numProductos }
        ]);
        return topProducts.map(p => p._id);
    } catch (error) {
        console.error(`Error al obtener productos top por monto para el clúster ${clusterId}:`, error.message);
        return [];
    }
}

// --- Controlador de Express para Recomendaciones ---

/**
 * @desc    Genera recomendaciones de productos para un cliente basado en una nueva transacción.
 * Las métricas del cliente se calculan al momento de la solicitud.
 * @route   POST /api/recommendations
 * @access  Private (requiere autenticación/autorización)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `nueva_transaccion` en `req.body`.
 * @param   {Object} res - Objeto de respuesta de Express.
 * @returns {Object} JSON con el estado de la operación y las recomendaciones.
 */
exports.getRecommendationsForTransaction = async (req, res) => {
    try {
        const nuevaTransaccion = req.body;
        const clienteAfectadoEmail = nuevaTransaccion.cliente_nombre; // Usamos el email como identificador del cliente
        const productoBaseParaReglas = nuevaTransaccion.producto_nombre;

        // --- 1. Calcular Métricas del Cliente Sobre la Marcha ---
        const transaccionesExistentesCliente = await Transaction.find({ cliente_nombre: clienteAfectadoEmail });

        let numTransaccionesActual = transaccionesExistentesCliente.length;
        let montoTotalGastadoActual = transaccionesExistentesCliente.reduce((sum, t) => sum + t.monto_total, 0);

        // Sumar la nueva transacción (aún no guardada en la DB) para obtener el estado actual
        numTransaccionesActual += 1;
        montoTotalGastadoActual += nuevaTransaccion.monto_total;
        
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
            return res.status(500).json({ success: false, error: `Error en el servicio de ML: ${pyError.message}` });
        }

        const nuevoClusterPredicho = pythonResult.cluster;
        const sugerenciasReglas = pythonResult.sugerencias_reglas;

        console.log(`El cliente '${clienteAfectadoEmail}' (con la nueva transacción) ahora pertenece al Clúster: ${nuevoClusterPredicho}`);
        
        // --- 3. Generar Recomendaciones Integradas ---
        const recomendaciones = {
            sugerencias_cluster: [],
            sugerencias_reglas: sugerenciasReglas // Vienen directamente de Python
        };

        // Recomendación por Clúster (Perfil del Cliente)
        console.log(`\n🔥 Vestidos TOP para tu perfil (Clúster ${nuevoClusterPredicho}):`);
        let sugerenciasCluster = [];

        // NOTA: Las funciones `obtenerProductosTopFrecuencia` y `obtenerProductosTopMonto`
        // deben estar diseñadas para funcionar sin el campo `cluster` en Transaction
        // o si ese campo se desnormaliza en Transaction durante la creación de la transacción.
        // Si no tienes el cluster en Transaction, estas funciones buscarán los top productos en general.
        if (nuevoClusterPredicho === 0) {
            sugerenciasCluster = await obtenerProductosTopMonto(nuevoClusterPredicho, clienteAfectadoEmail, 3);
            console.log("Sugerencias de productos (basadas en alto ingreso para el clúster):");
            console.log("Acción estratégica: Ofrécele descuentos exclusivos o acceso anticipado a colecciones premium.");
        } else if (nuevoClusterPredicho === 1) {
            sugerenciasCluster = await obtenerProductosTopFrecuencia(nuevoClusterPredicho, clienteAfectadoEmail, 3);
            console.log("Sugerencias de productos (basadas en frecuencia para el clúster):");
            console.log("Acción estratégica: Sugiere productos complementarios o programas de fidelidad para aumentar el valor promedio de su compra.");
        } else if (nuevoClusterPredicho === 2) {
            sugerenciasCluster = await obtenerProductosTopMonto(nuevoClusterPredicho, clienteAfectadoEmail, 3);
            console.log("Sugerencias de productos (basadas en alto ingreso para el clúster):");
            console.log("Acción estratégica: Recuérdale las últimas novedades de lujo o productos de alta gama que suelen interesarle.");
        } else {
            console.log("Clúster no reconocido. Ofrecer recomendaciones generales.");
            // Fallback: obtener los productos más vendidos en general
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
                console.log(`- ${rec.producto} (Confianza: ${(rec.confianza * 100).toFixed(1)}%)`);
            });
        } else {
            console.log("No se encontraron productos complementarios basados en hábitos de compra anteriores.");
        }

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