<<<<<<< HEAD
const multer = require('multer');
const path = require('path');

// Configuración segura de Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];//Permite solo archivos JPEG y PNG 
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

=======
const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 10 * 1024 * 1024, // Aumentar límite a 10MB por campo
    fileSize: 10 * 1024 * 1024, // Aumentar límite de archivo a 10MB
  },
});

>>>>>>> b3af643d4314dc37444a2d084b1186988b2d9c61
module.exports = upload;