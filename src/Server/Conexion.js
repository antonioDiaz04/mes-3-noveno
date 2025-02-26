const mongoose = require("mongoose");
// Importa la biblioteca mongoose
//  que se utiliza para interactuar con bases de datos MongoDB desde Node.js.
//ruta del archivo de variable.env
require("dotenv").config({ path: "variables.env" });

const conectarDB = async () => {
  try {
    //  establecer la conexión. La URL de conexión se toma de la variable de entorno DB_MONGO.
    await mongoose.connect(process.env.DB_MONGO, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    // console.log(process.env.DB_MONGO)
    console.log(
      `
                  \x1b[32m{ \x1b[32mOK }\x1b[0m 
` + "\x1b[0m"
    );
  } catch (error) {
    console.log("conexion fallida");
  }
};

module.exports = conectarDB;