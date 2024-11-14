const express = require("express");
const Captcha = require("../Controllers/recaptchaController");

// const { VerificarCaptcha } = require('../controllers/verificarCaptchaController'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

// Ruta para verificar el captcha
router.post("/:token", Captcha.VerificarCaptcha); // Asegúrate de que este método esté definido

module.exports = router;
