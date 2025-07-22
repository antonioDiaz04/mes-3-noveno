// Importar módulos
const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { parseISO, format } = require('date-fns'); // Para manejar fechas

const API_URL = "http://localhost:4000/api/v1/transaccion/";
const OUTPUT_FILE = 'atelier-datshet-2024-transacciones.csv';

async function generateTransactionDataset() {
    try {
        // 1. Obtener datos de la API
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Asegurarse de que data.data existe y es un array
        if (!data || !Array.isArray(data.data)) {
            console.error("La respuesta de la API no contiene un array 'data'.");
            return;
        }

        // 2. Procesar los datos para el formato de ticket
        const tickets = data.data.map(t => {
            // Extracción de multa_aplicada: similar a tu lógica Python
            let multaAplicada = 0;
            const notaInternaDevolucion = t.detallesDevolucionLocal?.notaInternaLocal || '';
            if (notaInternaDevolucion.includes('multa')) {
                const parts = notaInternaDevolucion.split('$');
                if (parts.length > 1) {
                    const amountString = parts[parts.length - 1].split(' ')[0];
                    multaAplicada = parseFloat(amountString) || 0;
                }
            }

            // Convertir fechas a formato ISO para mantener consistencia, o dejarlas como null si no existen
            const fechaTransaccion = t.fechaTransaccion ? parseISO(t.fechaTransaccion) : null;
            const fechaEntrega = t.detallesEntregaLocal?.fechaRecogida ? parseISO(t.detallesEntregaLocal.fechaRecogida) : null;
            const fechaDevolucion = t.detallesDevolucionLocal?.fechaDevolucion ? parseISO(t.detallesDevolucionLocal.fechaDevolucion) : null;

            return {
                // Info transacción
                transaccion_id: t._id,
                fecha_transaccion: fechaTransaccion ? format(fechaTransaccion, 'yyyy-MM-dd HH:mm:ss') : null, // Formato legible
                tipo_transaccion: t.tipoTransaccion,
                estado: t.estado,
                monto_total: t.montoTotal,
                metodo_pago: t.detallesPago?.metodoPago,

                // Info cliente
                cliente_nombre: t.idUsuario?.email, // Usa email como nombre
                cliente_telefono: t.idUsuario?.telefono,

                // Info producto (ya incluye talla y color)
                producto_nombre: t.idVestido?.nombre,
                producto_talla: t.idVestido?.talla, // Ya estaba aquí, se mantiene
                producto_color: t.idVestido?.color, // Ya estaba aquí, se mantiene
                producto_temporada: t.idVestido?.temporada ? t.idVestido.temporada.join(', ') : null, // Añadido: Temporada (puede ser un array, lo unimos)
                cantidad_comprada: t.cantidad || 1, // Añadido: Suponiendo un campo 'cantidad' en la transacción, si no, por defecto 1
                
                // Entrega/devolución
                fecha_entrega: fechaEntrega ? format(fechaEntrega, 'yyyy-MM-dd HH:mm:ss') : null,
                fecha_devolucion: fechaDevolucion ? format(fechaDevolucion, 'yyyy-MM-dd HH:mm:ss') : null,
                multa_aplicada: multaAplicada,

                // Reseña
                reseña_rating: t.reseñaCliente?.rating,
            };
        });

        // 3. Configurar el escritor CSV
        const csvWriter = createCsvWriter({
            path: OUTPUT_FILE,
            header: [
                { id: 'transaccion_id', title: 'transaccion_id' },
                { id: 'fecha_transaccion', title: 'fecha_transaccion' },
                { id: 'tipo_transaccion', title: 'tipo_transaccion' },
                { id: 'estado', title: 'estado' },
                { id: 'monto_total', title: 'monto_total' },
                { id: 'metodo_pago', title: 'metodo_pago' },
                { id: 'cliente_nombre', title: 'cliente_nombre' },
                { id: 'cliente_telefono', title: 'cliente_telefono' },
                { id: 'producto_nombre', title: 'producto_nombre' },
                { id: 'producto_talla', title: 'producto_talla' },
                { id: 'producto_color', title: 'producto_color' },
                { id: 'producto_temporada', title: 'producto_temporada' }, // Añadido al header
                { id: 'cantidad_comprada', title: 'cantidad_comprada' },   // Añadido al header
                { id: 'fecha_entrega', title: 'fecha_entrega' },
                { id: 'fecha_devolucion', title: 'fecha_devolucion' },
                { id: 'multa_aplicada', title: 'multa_aplicada' },
                { id: 'reseña_rating', title: 'reseña_rating' },
            ]
        });

        // 4. Escribir los datos en el archivo CSV
        await csvWriter.writeRecords(tickets);
        console.log(`\nDataset generado exitosamente en: ${OUTPUT_FILE}`);
        console.log(`Total de transacciones procesadas: ${tickets.length}`);

    } catch (error) {
        console.error("Hubo un error al generar el dataset:", error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("Asegúrate de que el servidor en http://localhost:4000/api/v1/transaccion/ esté corriendo.");
        }
    }
}

// Ejecutar la función
generateTransactionDataset();