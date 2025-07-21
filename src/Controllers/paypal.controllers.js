// require('dotenv').config();
// var fs = require('fs')
// var path = require('path')
// const axios = require("axios")
// const uniqid = require('uniqid');
// const http = require('https');

// var controller = {
//     generarTokenPaypal: async function (req, res) {
//         console.log('Ruta activada');

//         const username = process.env.PAYPAL_API_CLIENT || 'AeZOP-qO4LO-FDvwrifHoqS0cZRxnCkqJrQyyBJ327qg8kK74BXCeGtxvZwOElQrEpa1Y9sg_zsqZDFd';
//         const password = process.env.PAYPAL_API_SECRET || 'EBLDMZqR09R1B1Yjp-veAXFrQpVpJIVXQ64iKmgdtMd_UClx_3UQd8jCLoqShxZLT_O4_5v0OjQ9Iu6q';

//         try {
//             const { data: { access_token, token_type } } = await axios({
//                 method: 'post',
//                 url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
//                 headers: {
//                     'Accept': 'application/json',
//                     'Accept-Language': 'en_US',
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 auth: {
//                     username: username,
//                     password: password,
//                 },
//                 params: {
//                     grant_type: 'client_credentials'
//                 }
//             });

//             return res.status(200).send({
//                 status: 'success',
//                 message: "Su token es:",
//                 access_token: access_token,
//                 token_type: token_type
//             });

//         } catch (error) {
//             console.error('Error en PayPal:', error.response?.data || error.message);
//             return res.status(400).send({
//                 status: 'error',
//                 message: 'Error de PayPal',
//                 details: error.response?.data || error.message
//             });
//         }

//     },

//     generarPayoutPaypal: async function (req, res) {
//         let params = req.body
//         let modo = params.modo;
//         let batch_code = uniqid();


//         const options = {
//             method: 'POST',
//             hostname: 'api.sandbox.paypal.com',
//             path: '/v1/payments/payouts',
//             headers: {
//                 'Accept': 'application/json',
//                 'Authorization': 'Bearer A21AAK2S7Ugv6JjDnSoHNuOREeCM3ayW2JhvjLnVHNIa9upqcLJb7GlqtVQzKXlVCJ2oMOFLAqzBWqGZ1FrruA2u591t1Frgg',
//                 'Content-Type': 'application/json'
//             }
//         };

//         var req = http.request(options, function (res) {
//             var chunks = []

//             res.on("data", function (chunk) {
//                 chunks.push(chunk);
//             })
//             res.on("end", function () {
//                 var body = Buffer.concat(chunks)

//                 //ver respuestas
//                 console.log(body.toString())
//             })
//         })


//         if (modo == 'EMAIL') {
//             let email = params.email;//Destinatario
//             let monto_a_cobrar = params.value;//precio

//             req.write(JSON.stringify({
//                 sender_batch_header:
//                 {
//                     email_subject: 'pago realizado',
//                     sender_batch_id: 'batch-' + batch_code
//                 },
//                 items: [
//                     {
//                         recipient_type: 'EMAIL',
//                         amount: {
//                             value: monto_a_cobrar, // Asegúrate de tener definida esta variable
//                             currency: 'USD'
//                         },
//                         receiver: email, // Asegúrate de tener definida esta variable
//                         note: 'Pago desde el backend con Node.js, token funcionando'
//                     }
//                 ]
//             }));
//             req.end();

//             return res.status(200).send({
//                 status: 'success',
//                 message: "Pago realizado a : " + email,
//             });

//         }

//     }
// };

// module.exports = controller
