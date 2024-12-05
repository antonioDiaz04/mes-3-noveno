const express = require("express");
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// creamos el servidor
const app = express();
// conectamos a la base de datos
// const fileUpload = require('express-fileupload');
conectarDB();
const corsOptions = {
  origin: [
    "https://proyecto-atr.vercel.app", // URL de tu frontend en producción
    "http://localhost:4200",
    "https://localhost:4200",
    "http://localhost:5278",
    "https://proyectoatr.com", // URL local para desarrollo
    // "https://nhnwlf08-4200.usw3.devtunnels.ms/" // URL local para desarrollo
  ],
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Permitir el envío de cookies
  // optionsSuccessStatus: 200, // Responder exitosamente a solicitudes preflight
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
// Rutas padres
// app.use(fileUpload());

app.use("/api/v1/msj", require("./Routes/WhatsappRoute.js"));
app.use("/api/v1/producto", require("./Routes/ProductRoute"));
app.use("/api/v1/enviar-notificacion", require("./Routes/NotificacionRoute"));
app.use("/api/v1/enviar-correo", require("./Routes/CorreoRoute"));
app.use("/api/v1/verificacion", require("./Routes/CorreoRoute"));
app.use("/api/v1/verificar", require("./Routes/catpch"));
app.use("/api/v1/pruebaSubirImagen", require("./Routes/cloudinary.Routes"));
app.use("/api/v1/Empresa", require("./Routes/PerfilEmpresa.Routes"));
app.use("/api/v1/autentificacion", require("./Routes/AuthRoute"));
// Ruta para acciones con rol de Administrador de la pagina
app.use("/api/v1/admin", require("./Routes/PrivadoRoute"));
app.use("/api/v1/politicas", require("./Routes/PoliticasRoute.js"));
// Ruta para acciones con rol de Administrador
app.use("/api/v1/usuarios", require("./Routes/UsuarioRoute"));

module.exports = app;
