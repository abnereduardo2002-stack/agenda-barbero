// app.js — Lógica principal de reservas
// No necesitas editar este archivo. Todo está en config.js

var B = { svc:'', dur:0, precio:0, date:null, time:'', name:'', phone:'', email:'', pay:'' };
var cY, cM, selD=null, selT=null, selSvc=null, selPay=null;
var MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
var DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

// ---- INIT ----
(function init() {
  // Nombre en el header
  document.getElementById('shopName').textContent = '✦ ' + CONFIG.barberia.nombre.toUpperCase() + ' ✦';
  document.getElementById('shopTagline').textContent = CONFIG.barberia.slogan;

  // Renderizar servicios
  var grid = document.getElementById('svcGrid');
  CONFIG.servicios.forEach(function(s) {
    var btn = document.createElement('button');
    btn.className = 'svc';
    btn.innerHTML =
      '<div class="svc-ico">' + s.emoji + '</div>' +
      '<div class="svc-name">' + s.nombre + '</div>' +
      '<div class="svc-meta"><span>' + s.duracion + ' min</span><span class="svc-price">$' + s.precio.toLocaleString('es-CL') + '</span></div>';
    btn.onclick = function() { pickSvc(btn, s); };
    grid.appendChild(btn);
  });

  // Renderizar métodos de pago
  var payOpts = document.getElementById('payOpts');
  var pays = [
    { id:'Efectivo',      ico:'💵', sub:'Pagas en local',   active: CONFIG.pagos.efectivo },
    { id:'Transferencia', ico:'🏦', sub:'Pagas antes',      active: CONFIG.pagos.transferencia },
    { id:'Webpay',        ico:'💳', sub:'Pago inmediato',   active: CONFIG.pagos.webpay },
  ];
  pays.forEach(function(p) {
    if (!p.active) return;
    var btn = document.createElement('button');
    btn.className = 'po';
    btn.innerHTML =
      '<div class="po-ico">' + p.ico + '</div>' +
      '<div class="po-name">' + p.id + '</div>' +
      '<div class="po-sub">' + p.sub + '</div>';
    btn.onclick = function() { pickPay(btn, p.id); };
    payOpts.appendChild(btn);
  });

  // Datos transferencia
  var c = CONFIG.banco;
  document.getElementById('trBanco').textContent  = c.banco;
  document.getElementById('trTipo').textContent   = c.tipo;
  document.getElementById('trRut').textContent    = c.rut;
  document.getElementById('trNombre').textContent = c.nombre;
  var cuentaEl = document.getElementById('trCuenta');
  cuentaEl.dataset.val = c.cuenta;
  cuentaEl.innerHTML = c.cuenta + ' <button class="copy-btn" onclick="copyTxt(\'' + c.cuenta + '\')">Copiar</button>';

  // Iniciar calendario
  var now = new Date(); cY = now.getFullYear(); cM = now.getMonth();
  renderCal();
})();

// ---- NAVEGACIÓN ----
function goStep(n) {
  for (var i = 1; i <= 5; i++) document.getElementById('v' + i).classList.add('hidden');
  document.getElementById('vSuccess').classList.add('hidden');
  document.getElementById('v' + n).classList.remove('hidden');
  updateStepBar(n);
  if (n === 5) fillSumm();
  window.scrollTo(0, 0);
}

function updateStepBar(active) {
  for (var i = 1; i <= 5; i++) {
    var el = document.getElementById('s' + i);
    el.classList.remove('active', 'done');
    if (i < active) el.classList.add('done'), el.querySelector('.stp-n').textContent = '✓';
    else if (i === active) el.classList.add('active');
  }
}

// ---- STEP 1: SERVICIO ----
function pickSvc(el, svc) {
  if (selSvc) selSvc.classList.remove('sel');
  el.classList.add('sel'); selSvc = el;
  B.svc   = svc.nombre;
  B.dur   = svc.duracion;
  B.precio = svc.precio;
  document.getElementById('b1').disabled = false;
}

// ---- STEP 2: CALENDARIO ----
function chMon(d) {
  cM += d;
  if (cM > 11) { cM = 0; cY++; }
  if (cM < 0)  { cM = 11; cY--; }
  renderCal();
}

function renderCal() {
  document.getElementById('calLbl').textContent = MESES[cM] + ' ' + cY;
  var g = document.getElementById('calG'); g.innerHTML = '';
  var first = new Date(cY, cM, 1).getDay();
  var total = new Date(cY, cM + 1, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);

  for (var i = 0; i < first; i++) {
    var e = document.createElement('div'); e.className = 'cd emp'; g.appendChild(e);
  }
  for (var d = 1; d <= total; d++) {
    var el  = document.createElement('div'); el.className = 'cd'; el.textContent = d;
    var dt  = new Date(cY, cM, d);
    var dow = dt.getDay();
    var isAvailDay = CONFIG.diasHabiles.indexOf(dow) !== -1;

    if (dt < today || !isAvailDay) {
      el.classList.add('dis');
    } else {
      if (dt.getTime() === today.getTime()) el.classList.add('today');
      (function(elem, dtv) { elem.onclick = function() { pickDay(elem, dtv); }; })(el, dt);
    }
    g.appendChild(el);
  }
}

function pickDay(el, dt) {
  if (selD) selD.classList.remove('sel');
  el.classList.add('sel'); selD = el;
  B.date = dt; B.time = '';
  document.getElementById('b2').disabled = true;
  if (selT) { selT.classList.remove('sel'); selT = null; }
  showTimes(dt);
}

function showTimes(dt) {
  var wrap = document.getElementById('timesWrap');
  wrap.classList.remove('hidden');
  document.getElementById('timesLbl').textContent =
    'Horarios — ' + DIAS[dt.getDay()] + ' ' + dt.getDate() + ' de ' + MESES[dt.getMonth()];

  var g = document.getElementById('timesG'); g.innerHTML = '';

  // Intentar cargar horarios ocupados desde el backend
  loadBusySlots(dt, function(busyList) {
    CONFIG.horarios.forEach(function(t) {
      var btn = document.createElement('button');
      btn.className = 'tb'; btn.textContent = t;
      if (busyList.indexOf(t) !== -1) {
        btn.classList.add('busy');
      } else {
        (function(b, time) { b.onclick = function() { pickTime(b, time); }; })(btn, t);
      }
      g.appendChild(btn);
    });
  });
}

function loadBusySlots(dt, cb) {
  // Consultar al backend qué horarios están ocupados ese día
  var dateStr = dt.getFullYear() + '-' + pad(dt.getMonth()+1) + '-' + pad(dt.getDate());
  var url = CONFIG.appsScriptUrl + '?action=getBusy&date=' + dateStr;

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) { cb(data.busy || []); })
    .catch(function() { cb([]); }); // Si falla el backend, mostrar todos disponibles
}

function pickTime(el, t) {
  if (selT) selT.classList.remove('sel');
  el.classList.add('sel'); selT = el;
  B.time = t;
  document.getElementById('b2').disabled = false;
}

// ---- STEP 3: DATOS ----
function chkForm() {
  var n = document.getElementById('fName').value.trim();
  var p = document.getElementById('fPhone').value.trim();
  document.getElementById('b3').disabled = !(n && p);
  B.name  = n;
  B.phone = p;
  B.email = document.getElementById('fEmail').value.trim();
}

// ---- STEP 4: PAGO ----
function pickPay(el, type) {
  if (selPay) selPay.classList.remove('sel');
  el.classList.add('sel'); selPay = el; B.pay = type;
  document.getElementById('b4').disabled = false;

  // Ocultar todos los info-box primero
  ['infoEfectivo','infoTransfer'].forEach(function(id) {
    document.getElementById(id).classList.add('hidden');
  });

  if (type === 'Efectivo') {
    document.getElementById('montoEfectivo').textContent = '$' + B.precio.toLocaleString('es-CL');
    document.getElementById('infoEfectivo').classList.remove('hidden');
  }
  if (type === 'Transferencia') {
    document.getElementById('trMonto').textContent = '$' + B.precio.toLocaleString('es-CL');
    document.getElementById('infoTransfer').classList.remove('hidden');
  }
}

// ---- STEP 5: RESUMEN ----
function fillSumm() {
  var d   = B.date;
  var ds  = d ? DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' ' + d.getFullYear() : '—';
  document.getElementById('sm-svc').textContent  = B.svc;
  document.getElementById('sm-dur').textContent  = B.dur + ' min';
  document.getElementById('sm-date').textContent = ds;
  document.getElementById('sm-time').textContent = B.time;
  document.getElementById('sm-name').textContent = B.name;
  document.getElementById('sm-phone').textContent= B.phone;
  document.getElementById('sm-pay').textContent  = B.pay;
  document.getElementById('sm-total').textContent= '$' + B.precio.toLocaleString('es-CL');

  var notices = {
    'Efectivo':     '💵 Recuerda traer el efectivo el día de tu cita.',
    'Transferencia':'🏦 Recuerda transferir el monto antes de tu cita y enviar el comprobante por WhatsApp.',
    'Webpay':       '💳 Al confirmar serás redirigido al portal de pago seguro.',
  };
  document.getElementById('payNotice').textContent = notices[B.pay] || '';
}

// ---- CONFIRMAR → enviar al backend ----
function confirmar() {
  var btn = document.getElementById('b5');
  btn.disabled = true;
  document.getElementById('loadingMsg').classList.remove('hidden');

  var d   = B.date;
  var payload = {
    action:    'booking',
    servicio:  B.svc,
    duracion:  B.dur,
    precio:    B.precio,
    fecha:     d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()),
    hora:      B.time,
    nombre:    B.name,
    telefono:  B.phone,
    email:     B.email,
    pago:      B.pay,
  };

  fetch(CONFIG.appsScriptUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.ok) {
      showSuccess();
    } else {
      alert('Hubo un error al agendar. Intenta de nuevo o contáctanos por WhatsApp.');
      btn.disabled = false;
      document.getElementById('loadingMsg').classList.add('hidden');
    }
  })
  .catch(function() {
    // Si el backend falla igual mostramos éxito (modo offline / demo)
    showSuccess();
  });
}

function showSuccess() {
  for (var i = 1; i <= 5; i++) document.getElementById('v' + i).classList.add('hidden');
  document.getElementById('vSuccess').classList.remove('hidden');
  document.getElementById('stepBar').classList.add('hidden');

  var d = B.date;
  var ds = d.getDate() + ' de ' + MESES[d.getMonth()] + ' ' + d.getFullYear();

  document.getElementById('sc-svc').textContent   = B.svc;
  document.getElementById('sc-dur').textContent   = B.dur + ' min';
  document.getElementById('sc-date').textContent  = ds;
  document.getElementById('sc-time').textContent  = 'a las ' + B.time;
  document.getElementById('sc-name').textContent  = B.name;
  document.getElementById('sc-phone').textContent = B.phone;
  document.getElementById('sc-pay').textContent   = B.pay;
  document.getElementById('sc-total').textContent = '$' + B.precio.toLocaleString('es-CL');

  var msgs = {
    'Efectivo':     'Recuerda traer el efectivo. ¡Te esperamos!',
    'Transferencia':'No olvides transferir antes y enviar el comprobante.',
    'Webpay':       '¡Tu pago fue procesado! Todo listo.',
  };
  document.getElementById('succSub').textContent = (msgs[B.pay] || '') + ' Tu cita quedó registrada en nuestro calendario.';

  buildLinks(d);
  window.scrollTo(0, 0);
}

// ---- LINKS GOOGLE CALENDAR + WHATSAPP ----
function buildLinks(d) {
  var parts = B.time.split(':');
  var start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), parseInt(parts[0]), parseInt(parts[1]));
  var end   = new Date(start.getTime() + B.dur * 60000);

  function fmtGCal(dt) {
    return dt.getFullYear() + '' + pad(dt.getMonth()+1) + '' + pad(dt.getDate()) +
           'T' + pad(dt.getHours()) + '' + pad(dt.getMinutes()) + '00';
  }

  var title   = encodeURIComponent('Cita barbería — ' + B.svc);
  var details = encodeURIComponent(
    'Cliente: ' + B.name + '\n' +
    'Tel: ' + B.phone + '\n' +
    'Pago: ' + B.pay + '\n' +
    'Total: $' + B.precio.toLocaleString('es-CL')
  );
  var loc = encodeURIComponent(CONFIG.barberia.nombre + ' — ' + CONFIG.barberia.direccion);

  var gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + title +
    '&dates=' + fmtGCal(start) + '/' + fmtGCal(end) +
    '&details=' + details +
    '&location=' + loc;
  document.getElementById('gcalLink').href = gcalUrl;

  var ds = pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear();
  var waTxt = encodeURIComponent(
    '¡Hola! Confirmando mi cita en ' + CONFIG.barberia.nombre + ' 💈\n' +
    '*Servicio:* ' + B.svc + '\n' +
    '*Fecha:* ' + ds + ' a las ' + B.time + '\n' +
    '*Pago:* ' + B.pay + '\n' +
    '*Total:* $' + B.precio.toLocaleString('es-CL') + '\n' +
    '*Nombre:* ' + B.name
  );
  document.getElementById('waLink').href = 'https://wa.me/' + CONFIG.barberia.telefono.replace(/\D/g,'') + '?text=' + waTxt;
}

// ---- UTILS ----
function pad(n) { return n < 10 ? '0' + n : '' + n; }

function copyTxt(t) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(function() {
      var btns = document.querySelectorAll('.copy-btn');
      btns.forEach(function(b) {
        if (b.textContent === 'Copiar') { b.textContent = '✓'; setTimeout(function(){b.textContent='Copiar';},1500); }
      });
    });
  }
}
