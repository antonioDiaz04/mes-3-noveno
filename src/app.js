const express = require("express");
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// creamos el servidor
const app = express();
// conectamos a la base de datos
conectarDB();
const corsOptions = {
  //Lista de URLs clientes permitidas
  origin: [
    // "https://purificadoras.vercel.app",
    "http://proyecto-atr.vercel.app",
    "http://localhost:4200", //!prueba local
  ],
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());
// Rutas padres

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
