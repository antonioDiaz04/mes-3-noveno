const app = require("./src/app.js");
const process = require("process");
// Puerto de escucha
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("El servidor está corriendo perfectamente en el puerto", PORT);
});

