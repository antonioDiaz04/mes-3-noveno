const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jw = require("jsonwebtoken");
const AutController = require("../Controllers/AuthController");

router.post("/signIn", AutController.Login);

module.exports = router;
