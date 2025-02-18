const express = require("express");
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan"); // Importamos morgan
require('dotenv').config(); // Cargar variables de entorno

// creamos el servidor
const app = express();

// conectamos a la base de datos
conectarDB();

// Configuración de CORS
const corsOptions = {
  origin: [
    "https://proyecto-atr.vercel.app", // URL de tu frontend en producción
    "http://localhost:4200",
    "http://192.168.0.108:4200",
    "http://localhost:5278",
    "https://proyectoatr.com", // URL local para desarrollo
  ],
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Configuración de Morgan
app.use(morgan("dev")); // Registra las peticiones en consola

// Ruta dinámica para la API
const apiVersion = process.env.API_VERSION || 'v1'; // Si no se define, usa 'v1'

// Rutas padres
app.use(`/api/${apiVersion}/msj`, require("./Routes/WhatsappRoute.js"));
app.use(`/api/${apiVersion}/producto`, require("./Routes/ProductRoute"));
app.use(`/api/${apiVersion}/accesorio`, require("./Routes/AccesorioRoute.js"));
app.use(`/api/${apiVersion}/vestidos-accesorios`, require("./Routes/VestidoAccesorioRoute.js"));
app.use(`/api/${apiVersion}/enviar-notificacion`, require("./Routes/NotificacionRoute"));
app.use(`/api/${apiVersion}/enviar-correo`, require("./Routes/CorreoRoute"));
app.use(`/api/${apiVersion}/verificacion`, require("./Routes/CorreoRoute"));
app.use(`/api/${apiVersion}/verificar`, require("./Routes/catpch"));
app.use(`/api/${apiVersion}/pruebaSubirImagen`, require("./Routes/cloudinary.Routes"));
app.use(`/api/${apiVersion}/Empresa`, require("./Routes/PerfilEmpresa.Routes"));
app.use(`/api/${apiVersion}/autentificacion`, require("./Routes/AuthRoute"));
app.use(`/api/${apiVersion}/renta`, require("./Routes/Renta&Venta"));

// Ruta para acciones con rol de Administrador de la página
app.use(`/api/${apiVersion}/admin`, require("./Routes/PrivadoRoute"));
app.use(`/api/${apiVersion}/politicas`, require("./Routes/PoliticasRoute.js"));

// Ruta para acciones con rol de Administrador
app.use(`/api/${apiVersion}/usuarios`, require("./Routes/UsuarioRoute"));

module.exports = app;
