const express = require("express");
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan"); // Importamos morgan

// creamos el servidor
const app = express();

// conectamos a la base de datos
conectarDB();

// Configuración de CORS
const corsOptions = {
  origin: [
    "https://proyecto-atr.vercel.app", // URL de tu frontend en producción
    "http://localhost:4200",
    "https://localhost:4200",
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

// Rutas padres
app.use("/api/v1/msj", require("./Routes/WhatsappRoute.js"));
app.use("/api/v1/producto", require("./Routes/ProductRoute"));
app.use("/api/v1/accesorio", require("./Routes/AccesorioRoute.js"));
app.use("/api/v1/vestidos-accesorios", require("./Routes/VestidoAccesorioRoute.js"));
app.use("/api/v1/enviar-notificacion", require("./Routes/NotificacionRoute"));
app.use("/api/v1/enviar-correo", require("./Routes/CorreoRoute"));
app.use("/api/v1/verificacion", require("./Routes/CorreoRoute"));
app.use("/api/v1/verificar", require("./Routes/catpch"));
app.use("/api/v1/pruebaSubirImagen", require("./Routes/cloudinary.Routes"));
app.use("/api/v1/Empresa", require("./Routes/PerfilEmpresa.Routes"));
app.use("/api/v1/autentificacion", require("./Routes/AuthRoute"));

// Ruta para acciones con rol de Administrador de la página
app.use("/api/v1/admin", require("./Routes/PrivadoRoute"));
app.use("/api/v1/politicas", require("./Routes/PoliticasRoute.js"));

// Ruta para acciones con rol de Administrador
app.use("/api/v1/usuarios", require("./Routes/UsuarioRoute"));

module.exports = app;
