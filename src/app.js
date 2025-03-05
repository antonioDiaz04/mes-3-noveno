const express = require("express");
const morgan = require("morgan");
// require("dotenv").config();
const conectarDB = require("./Server/Conexion");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { logHttpRequest } = require("./util/logger.js");

const app = express();

conectarDB();

const corsOptions = {
  origin: process.env.CORS_ORIGINS.split(","), // Convierte la cadena en un array
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const start = Date.now(); //Se captura el tiempo actual en milisegundos
  res.on("finish", () => {
    const ip = req.ip;
    console.table(ip);
    const duration = Date.now() - start; // se calcula la duración de la solicitud restando el tiempo actual
    logHttpRequest(req, res, duration);
  });
  next();
});

// Solo habilitamos los mensajes por consola en el modo de desarrollo
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "trusted-scripts.com"],
      styleSrc: ["'self'", "trusted-styles.com"],
      imgSrc: ["'self'", "trusted-images.com"],
      connectSrc: ["'self'", "api.trusted.com"],
    },
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff"); // Prevenir MIME-sniffing
  next();
});

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

app.use(`/api/${apiVersion}/Empresa`, require("./Routes/PerfilEmpresa.Routes"));
app.use(`/api/${apiVersion}/autentificacion`, require("./Routes/AuthRoute"));
app.use(`/api/${apiVersion}/renta`, require("./Routes/Renta&Venta"));
app.use(
  `/api/${apiVersion}/estadisticas`,
  require("./Routes/EstadisticasRoute")
);

// Ruta para acciones control de Administrador de la página
app.use(`/api/${apiVersion}/admin`, require("./Routes/PrivadoRoute"));
app.use(`/api/${apiVersion}/politicas`, require("./Routes/PoliticasRoute.js"));

// Ruta para acciones con rol de Administrador
app.use(`/api/${apiVersion}/usuarios`, require("./Routes/UsuarioRoute"));

module.exports = app;
