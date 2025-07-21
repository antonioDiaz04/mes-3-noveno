// routes/transactionRoutes.js
const express = require('express');
const {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateReturnStatus
} = require('../Controllers/transactionController');

const router = express.Router();

// Rutas para /api/transactions
router.route('/')
    .get(getTransactions) // Obtener todas las transacciones
    .post(createTransaction); // Crear una nueva transacción

// Rutas para /api/transactions/:id
router.route('/:id')
    .get(getTransaction)    // Obtener una transacción por ID
    .put(updateTransaction) // Actualizar una transacción
    .delete(deleteTransaction); // Eliminar una transacción

// Ruta específica para actualizar el estado de devolución de una renta
router.route('/:id/return')
    .put(updateReturnStatus);

module.exports = router;