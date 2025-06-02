
const tiposNotificacion = {
  info: {
    icon: 'ℹ️',
    vibrate: [100, 50, 100],
  },
  advertencia: {
    icon: '⚠️',
    vibrate: [200, 100, 200],
  },
  alerta: {
    icon: '⚠️',
    vibrate: [200, 100, 200],
  },
  error: {
    icon: '❌',
    vibrate: [300, 100, 400],
  },
  exito: {
    icon: '✅',
    vibrate: [100, 50, 100, 50, 100],
  },
};

const prioridadesNotificacion = {
  baja: { urgency: 'baja' },
  media: { urgency: 'media' },
  alta: { urgency: 'alta' },
};

const mensajesNotificacion = {
  enviarNotificacionCorreo: {
    title: 'Código enviado',
    body: 'Hemos enviado un código a tu correo electrónico. Por favor, revisa tu bandeja de entrada.',
    actions: [
      { action: 'check_email', title: 'Revisar Correo' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionNuevosProductos: {
    title: '¡Nuevos productos disponibles!',
    body: 'Descubre los últimos productos que hemos agregado a nuestra tienda.',
    actions: [
      { action: 'view_products', title: 'Ver Productos' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionComentarios: {
    title: '¡Nuevo comentario!',
    body: 'Alguien ha comentado en tu publicación. Haz clic para verlo.',
    actions: [
      { action: 'view_comment', title: 'Ver Comentario' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionComentariosRespuesta: {
    title: '¡Nueva respuesta a tu comentario!',
    body: 'Alguien ha respondido a tu comentario. Haz clic para verlo.',
    actions: [
      { action: 'view_response', title: 'Ver Respuesta' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionProductosOfertas: {
    title: '¡Nuevas ofertas en productos!',
    body: 'Aprovecha nuestras ofertas especiales en productos seleccionados.',
    actions: [
      { action: 'view_offers', title: 'Ver Ofertas' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionBienvenidaAteleier: {
    title: '¡Bienvenido a Ateleier!',
    body: 'Explora nuestras ofertas y productos exclusivos.',
    actions: [
      { action: 'explore', title: 'Explorar' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionSuscripcion: {
    title: '¡Gracias por suscribirte!',
    body: 'Recibirás las últimas novedades y ofertas.',
    actions: [
      { action: 'view_offers', title: 'Ver Ofertas' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionSuscripcionRenovacion: {
    title: '¡Renovación de suscripción exitosa!',
    body: 'Tu suscripción ha sido renovada. ¡Gracias por seguir con nosotros!',
    actions: [
      { action: 'view_offers', title: 'Ver Ofertas' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
  enviarNotificacionNuevosProductosSuscriptores: {
    title: '¡Nuevos productos para suscriptores!',
    body: 'Descubre los nuevos productos que hemos agregado para nuestros suscriptores.',
    actions: [
      { action: 'view_products', title: 'Ver Productos' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
    enviarNotificacionRecordatorioCarrito: {
        title: '¡No olvides tu carrito!',
        body: 'Tienes productos en tu carrito esperando por ti. ¡Completa tu compra ahora!',
        actions: [
        { action: 'view_cart', title: 'Ver Carrito' },
        { action: 'dismiss', title: 'Descartar' },
        ],
    },
    enviarNotificacionRecordatorioSuscripcion: {

        title: '¡Recordatorio de suscripción!',
        body: 'Tu suscripción está a punto de vencer. ¡Renovala ahora!',
        actions: [
            { action: 'renew_subscription', title: 'Renovar Suscripción' },
            { action: 'dismiss', title: 'Descartar' },
        ],
    },
    enviarNotificacionRecocordarRenta: {
        title: '¡Recordatorio de renta!',
        body: 'Tu renta está a punto de vencer. ¡Paga ahora para evitar cargos adicionales!',
        actions: [
            { action: 'pay_rent', title: 'Pagar Renta' },
            { action: 'dismiss', title: 'Descartar' },
        ],
    },
  enviarNotificacionRecordatorioPago: {
    title: '¡Recordatorio de pago!',
    body: 'Tienes un pago pendiente. Por favor, realiza el pago a tiempo.',
    actions: [
      { action: 'make_payment', title: 'Realizar Pago' },
      { action: 'dismiss', title: 'Descartar' },
    ],
  },
};
module.exports = { tiposNotificacion, prioridadesNotificacion, mensajesNotificacion };
