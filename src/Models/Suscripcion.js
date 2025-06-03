const mongoose = require('mongoose');

const { Schema } = mongoose;

const SuscripcionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: false },
  email: { type: String, required: false },
  endpoint: { type: String, required: true, unique: true },
  p256dh: { type: String, required: true },
  auth: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports =  mongoose.model('Suscripcion', SuscripcionSchema);
