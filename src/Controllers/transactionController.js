// controllers/transactionController.js
const Transaction = require('../Models/Transaction');

/**
 * @desc    Obtiene todas las transacciones registradas en el sistema.
 * Incluye toda la información detallada del usuario y el vestido asociado a cada transacción.
 * @route   GET /api/transactions
 * @access  Private (requiere autenticación y/o autorización para acceder a la información de transacciones)
 * @param   {Object} req - Objeto de solicitud de Express (no se utilizan parámetros de ruta ni de consulta directamente aquí).
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación, el número total de transacciones y los datos de las transacciones.
 * @throws  {500} Si ocurre un error inesperado en el servidor durante la consulta a la base de datos.
 */
exports.getTransactions = async (req, res) => {
    try {
        // Busca todas las transacciones en la base de datos.
        // Utiliza .populate('idUsuario') para traer TODOS los campos del documento de usuario.
        // Utiliza .populate('idVestido') para traer TODOS los campos del documento de vestido.
        const transactions = await Transaction.find()
                                              .populate('idUsuario') // Ahora popula TODOS los campos del usuario
                                              .populate('idVestido'); // Ahora popula TODOS los campos del vestido

        // Responde con un estado 200 (OK) y un JSON que contiene:
        // - success: true (indicando que la operación fue exitosa)
        // - count: El número de transacciones encontradas
        // - data: Un array con los objetos de transacción poblados
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        // Registra el error en la consola del servidor para depuración.
        console.error(`Error al obtener transacciones: ${error.message}`);
        // Responde con un estado 500 (Internal Server Error) si ocurre una excepción,
        // indicando un problema en el servidor.
        res.status(500).json({ success: false, error: 'Error del servidor al recuperar las transacciones.' });
    }
};

/**
 * @desc    Obtiene una única transacción por su ID.
 * Incluye toda la información detallada del usuario y el vestido asociado.
 * @route   GET /api/transactions/:id
 * @access  Private (requiere autenticación y/o autorización)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `req.params.id` para el ID de la transacción.
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación y los datos de la transacción encontrada.
 * @throws  {404} Si la transacción con el ID proporcionado no se encuentra.
 * @throws  {500} Si ocurre un error inesperado en el servidor.
 */
exports.getTransaction = async (req, res) => {
    try {
        // Busca una transacción por su ID.
        // Popula TODOS los campos de idUsuario y idVestido.
        const transaction = await Transaction.findById(req.params.id)
                                              .populate('idUsuario') // Ahora popula TODOS los campos del usuario
                                              .populate('idVestido'); // Ahora popula TODOS los campos del vestido

        // Si no se encuentra ninguna transacción con el ID dado, responde con un error 404.
        if (!transaction) {
            return res.status(404).json({ success: false, error: `Transacción con ID ${req.params.id} no encontrada.` });
        }

        // Responde con un estado 200 (OK) y el objeto de transacción encontrado.
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        // Registra el error.
        console.error(`Error al obtener transacción por ID ${req.params.id}: ${error.message}`);
        // Maneja errores específicos de Mongoose (ej. ID inválido).
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Formato de ID de transacción inválido.' });
        }
        // Responde con un error 500 para otros errores del servidor.
        res.status(500).json({ success: false, error: 'Error del servidor al recuperar la transacción.' });
    }
};

// Las funciones createTransaction, updateTransaction, deleteTransaction y updateReturnStatus
// permanecen sin cambios, ya que no utilizan directamente el método populate.
// Solo se incluirán aquí si es necesario copiar y pegar todo el archivo.

/**
 * @desc    Crea una nueva transacción en la base de datos.
 * La información de la transacción se espera en el cuerpo de la solicitud (req.body).
 * @route   POST /api/transactions
 * @access  Private (requiere autenticación y/o autorización para crear transacciones)
 * @param   {Object} req - Objeto de solicitud de Express, esperando el cuerpo de la transacción en `req.body`.
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación y los datos de la transacción creada.
 * @throws  {400} Si los datos proporcionados no cumplen con las validaciones del esquema de Mongoose.
 * @throws  {500} Si ocurre un error inesperado en el servidor.
 */
exports.createTransaction = async (req, res) => {
    try {
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

/**
 * @desc    Actualiza una transacción existente por su ID.
 * Los campos a actualizar se esperan en el cuerpo de la solicitud (req.body).
 * @route   PUT /api/transactions/:id
 * @access  Private (requiere autenticación y/o autorización para modificar transacciones)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `req.params.id` y `req.body` con los datos a actualizar.
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación y los datos de la transacción actualizada.
 * @throws  {404} Si la transacción con el ID proporcionado no se encuentra.
 * @throws  {400} Si los datos proporcionados para la actualización no cumplen con las validaciones del esquema.
 * @throws  {500} Si ocurre un error inesperado en el servidor.
 */
exports.updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: `Transacción con ID ${req.params.id} no encontrada.` });
        }
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error(`Error al actualizar transacción con ID ${req.params.id}: ${error.message}`);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Formato de ID de transacción inválido.' });
        }
        res.status(500).json({ success: false, error: 'Error del servidor al actualizar la transacción.' });
    }
};

/**
 * @desc    Elimina una transacción existente por su ID.
 * @route   DELETE /api/transactions/:id
 * @access  Private (requiere autenticación y/o autorización para eliminar transacciones)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `req.params.id` para el ID de la transacción a eliminar.
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación y un objeto vacío (indicando éxito).
 * @throws  {404} Si la transacción con el ID proporcionado no se encuentra.
 * @throws  {500} Si ocurre un error inesperado en el servidor.
 */
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ success: false, error: `Transacción con ID ${req.params.id} no encontrada.` });
        }
        await transaction.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error(`Error al eliminar transacción con ID ${req.params.id}: ${error.message}`);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Formato de ID de transacción inválido.' });
        }
        res.status(500).json({ success: false, error: 'Error del servidor al eliminar la transacción.' });
    }
};

/**
 * @desc    Actualiza el estado de devolución de una transacción de renta.
 * Este endpoint es específico para gestionar el proceso de retorno de un vestido rentado.
 * @route   PUT /api/transactions/:id/return
 * @access  Private (requiere autenticación y/o autorización, típicamente para personal del local)
 * @param   {Object} req - Objeto de solicitud de Express, esperando `req.params.id` y `req.body`
 * con `fechaDevolucion`, `condicionVestidoAlDevolver`, `notaInternaLocal`,
 * `estadoDeposito` y `multasAplicadas`.
 * @param   {Object} res - Objeto de respuesta de Express para enviar la respuesta HTTP.
 * @returns {Object} JSON con el estado de la operación y los datos de la transacción actualizada.
 * @throws  {404} Si la transacción con el ID proporcionado no se encuentra.
 * @throws  {400} Si la transacción no es de tipo 'renta' o si los datos de actualización son inválidos.
 * @throws  {500} Si ocurre un error inesperado en el servidor.
 */
exports.updateReturnStatus = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: `Transacción con ID ${req.params.id} no encontrada.` });
        }

        if (transaction.tipoTransaccion !== 'renta') {
            return res.status(400).json({ success: false, error: 'Esta operación solo es válida para transacciones de renta.' });
        }

        const { fechaDevolucion, condicionVestidoAlDevolver, notaInternaLocal, estadoDeposito, multasAplicadas } = req.body;

        transaction.detallesDevolucionLocal = {
            fechaDevolucion: fechaDevolucion || new Date(),
            condicionVestidoAlDevolver: condicionVestidoAlDevolver || 'excelente',
            notaInternaLocal: notaInternaLocal || 'Vestido devuelto en el local.'
        };

        transaction.detallesRenta.estadoDeposito = estadoDeposito || 'devuelto_total';
        transaction.detallesRenta.multasAplicadas = multasAplicadas || 0;

        if (transaction.detallesRenta.estadoDeposito === 'devuelto_total' || transaction.detallesRenta.estadoDeposito === 'devuelto_parcial') {
            transaction.estado = 'completada';
        } else if (transaction.detallesRenta.estadoDeposito === 'retenido') {
            transaction.estado = 'en_proceso_devolucion';
        }

        await transaction.save();

        res.status(200).json({
            success: true,
            message: `Estado de devolución de la transacción ${req.params.id} actualizado con éxito.`,
            data: transaction
        });

    } catch (error) {
        console.error(`Error al actualizar estado de devolución para transacción con ID ${req.params.id}: ${error.message}`);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Formato de ID de transacción inválido.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Error del servidor al actualizar el estado de devolución.' });
    }
};