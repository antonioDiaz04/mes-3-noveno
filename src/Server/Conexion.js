const mongoose = require("mongoose");

require("dotenv").config({ path: "variables.env" });

const conectarDB = async () => {
  try {
    
    await mongoose.connect(process.env.DB_MONGO, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log(`\x1b[32m{ \x1b[32mOK }\x1b[0m ` + "\x1b[0m");
  } catch (error) {
    console.log("conexion fallida");
  }
};

module.exports = conectarDB;
