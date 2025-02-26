const express = require("express");
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config(); // Cargar variables de entorno
const helmet = require('helmet');


const app = express();

conectarDB();

const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(","), // Convierte la cadena en un array
  credentials: true,
};

app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Solo habilitar logging en desarrollo
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Ruta dinámica para la API
const apiVersion = process.env.API_VERSION || "v1"; // Si no se define, usa 'v1'

// Rutas padres
app.use(`/api/${apiVersion}/msj`, require("./Routes/WhatsappRoute.js"));
app.use(`/api/${apiVersion}/producto`, require("./Routes/ProductRoute"));
app.use(`/api/${apiVersion}/accesorio`, require("./Routes/AccesorioRoute.js"));
app.use(
  `/api/${apiVersion}/vestidos-accesorios`,
  require("./Routes/VestidoAccesorioRoute.js")
);
app.use(
  `/api/${apiVersion}/enviar-notificacion`,
  require("./Routes/NotificacionRoute")
);
app.use(`/api/${apiVersion}/enviar-correo`, require("./Routes/CorreoRoute"));
app.use(`/api/${apiVersion}/verificacion`, require("./Routes/CorreoRoute"));
app.use(`/api/${apiVersion}/verificar`, require("./Routes/catpch"));
app.use(
  `/api/${apiVersion}/pruebaSubirImagen`,
  require("./Routes/cloudinary.Routes")
);
app.use(`/api/${apiVersion}/Empresa`, require("./Routes/PerfilEmpresa.Routes"));
app.use(`/api/${apiVersion}/autentificacion`, require("./Routes/AuthRoute"));
app.use(`/api/${apiVersion}/renta`, require("./Routes/Renta&Venta"));

// Ruta para acciones con rol de Administrador de la página
app.use(`/api/${apiVersion}/admin`, require("./Routes/PrivadoRoute"));
app.use(`/api/${apiVersion}/politicas`, require("./Routes/PoliticasRoute.js"));

// Ruta para acciones con rol de Administrador
app.use(`/api/${apiVersion}/usuarios`, require("./Routes/UsuarioRoute"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

module.exports = app;
