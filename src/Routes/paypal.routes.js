const express = require("express");
const router = express.Router();

const PaypalController = require("../Controllers/paypal.controllers.js");

router.get("/paypal-token", PaypalController.generarTokenPaypal);
router.post("/paypal-new-checkout", PaypalController.generarPayoutPaypal);

module.exports = router;

