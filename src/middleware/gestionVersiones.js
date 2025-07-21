
PoliticaNegocioSchema.pre('save', function (next) {
    if (this.isModified('contenido')) {
      // Incrementa la versión
      const currentVersion = parseFloat(this.version) || 0;
      this.version = (currentVersion + 1).toFixed(1).toString(); // Incrementa la versión a 1 decimal
  
      // Guarda el historial
      this.historial.push({
        version: this.version,
        contenido: this.contenido,
        fechaCreacion: this.fechaCreacion,
        estado: 'no vigente', // Marca la versión anterior como no vigente
      });
    }
    next();
  });
  