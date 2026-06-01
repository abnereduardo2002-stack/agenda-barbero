// ============================================================
//  ✂️  CONFIGURACIÓN DE TU BARBERÍA — EDITA AQUÍ
//  Todo lo que necesitas cambiar está en este archivo.
//  Guarda y listo, los cambios se ven al instante.
// ============================================================

var CONFIG = {

  // ----------------------------------------------------------
  // 1. DATOS DE LA BARBERÍA
  // ----------------------------------------------------------
  barberia: {
    nombre:    "El Barbero",
    slogan:    "Barbería Clásica",
    direccion: "Tu dirección aquí, Santiago",
    telefono:  "+56912345678",   // SIN espacios, con código país
    instagram: "@elbarbero.cl",
  },

  // ----------------------------------------------------------
  // 2. GOOGLE APPS SCRIPT
  //    Pega aquí la URL que obtienes al publicar el script
  //    (ver instrucciones en README.md)
  // ----------------------------------------------------------
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbySRtOzk0yeJotrdCougb-4oKQSMV-9MZvgp8CIl3Aex8zrCxf_G7woDBqgNQPmsmvS/exec",

  // ----------------------------------------------------------
  // 3. SERVICIOS
  //    Agrega o quita servicios según quieras.
  //    precio: número sin puntos (ej: 8000, no "$8.000")
  //    duracion: minutos (para calcular la hora de término)
  // ----------------------------------------------------------
  servicios: [
    { nombre: "Corte clásico",   emoji: "✂️",  duracion: 20, precio: 8000  },
    { nombre: "Corte + barba",   emoji: "🪒",  duracion: 40, precio: 12000 },
    { nombre: "Afeitado navaja", emoji: "🪓",  duracion: 30, precio: 9000  },
    { nombre: "Barba completa",  emoji: "🧔",  duracion: 25, precio: 7000  },
    { nombre: "Degradado",       emoji: "💈",  duracion: 30, precio: 10000 },
    { nombre: "Cejas",           emoji: "✨",  duracion: 15, precio: 4000  },
  ],

  // ----------------------------------------------------------
  // 4. HORARIOS DISPONIBLES
  //    dias: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  //    Quita el día de la semana que no trabajas
  // ----------------------------------------------------------
  diasHabiles: [1, 2, 3, 4, 5, 6],   // Lun a Sáb

  horarios: [
    "09:00","09:30","10:00","10:30","11:00","11:30","12:00",
    "14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"
  ],

  // ----------------------------------------------------------
  // 5. DATOS BANCARIOS (para opción "Transferencia")
  // ----------------------------------------------------------
  banco: {
    banco:   "Banco Estado",
    tipo:    "Cuenta Vista",
    cuenta:  "123456789",
    rut:     "12.345.678-9",
    nombre:  "Tu Nombre Aquí",
  },

  // ----------------------------------------------------------
  // 6. MÉTODOS DE PAGO ACTIVOS
  //    Pon false para desactivar una opción
  // ----------------------------------------------------------
  pagos: {
    efectivo:     true,
    transferencia: true,
    webpay:       false,   // Activar cuando tengas integración
  },

};
// ============================================================
//  FIN DE LA CONFIGURACIÓN — No toques app.js ni index.html
// ============================================================
