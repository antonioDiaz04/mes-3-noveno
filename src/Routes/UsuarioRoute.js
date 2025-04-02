const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jw = require("jsonwebtoken");
const UsuarioController = require("../Controllers/usuarioController");
const validarDatos = require("../Midlewares/validator.middleware");
const { registerSchema } = require("../schemas/authSchema");
// router.get("/admin", UsuarioController.adminRoute);

// agrega cliente
router.post("/", UsuarioController.crearUsuario);
router.post("/check-email", UsuarioController.checkEmail);
router.post("/check-telefono", UsuarioController.checkTelefono);

router.post("/check-code", UsuarioController.checkCode);

router.put("/editarUsuario/:id", UsuarioController.editarUsuario);
router.delete("/:id", UsuarioController.eliminarUsuario);

// router.get("/", UsuarioController.clienteRoute);
router.put("/actualizaRol/:id", UsuarioController.actualizaRolUsuario);
router.put("/actualiza/:id", UsuarioController.actualizaDatos);
// router.delete("/deleteCliente/:id", UsuarioController.eliminarCliente);
// obtener detalles del cliente por id
router.get("/:id", UsuarioController.obtenerUsuarioById);
// obtener todos los clientes registrados
// router.get("/", UsuarioController.obtenerUsuarios);
// busca un usuario por correo
router.get("/:correo", UsuarioController.buscaUsuarioByCorreo);
router.put("/actualizaxCorreo", UsuarioController.actualizarPasswordxCorreo);
router.put(
  "/actualizaxPregunta",
  UsuarioController.actualizarPasswordxPregunta
);
router.post("/token", UsuarioController.BuscaUsuarioByToken);
router.post("/correo", UsuarioController.BuscaUsuarioByCorreo);
router.get("/miPerfil/:correo", UsuarioController.perfilUsuario);
router.post("/respuesta", UsuarioController.BuscaUsuarioByPreguntayRespuesta);
// router.post("/signIn", UsuarioController.Login);
router.get("/", UsuarioController.obtenerUsuarios);
module.exports = router;
