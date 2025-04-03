const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jw = require("jsonwebtoken");
const AutController = require("../Controllers/AuthController");
const validarDatos = require("../Midlewares/validator.middleware");
const {loginSchema} = require("../schemas/authSchema");

// router.post("/signIn", validarDatos(loginSchema), AutController.Login);
router.post("/signIn", AutController.Login);
router.post("/signIn-Google-Facebook", AutController.signInGoogleFacebook);
// router.post("/enviar-confirmar", AutController.enviarConfirmar);
//autentificacion/signIn-Google-Facebook
// router.post("/verficar-codigo", AutController.verificarCodigo);

module.exports = router;
