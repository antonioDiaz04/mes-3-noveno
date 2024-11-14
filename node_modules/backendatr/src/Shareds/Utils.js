class Utils {
  getFechaDDMMYYYY() {
    let fecha = new Date();
    let año = fecha.getFullYear();
    let mes = String(fecha.getMonth() + 1).padStart(2, "0");
    let dia = String(fecha.getDate()).padStart(2, "0");

    return `${dia}-${mes}-${año}`;
  }

 isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

}

module.exports = Utils;
