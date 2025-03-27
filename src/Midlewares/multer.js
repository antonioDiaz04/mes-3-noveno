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

module.exports = upload;