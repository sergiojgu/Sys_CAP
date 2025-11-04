// ========== CONFIGURACIÓN INICIAL ==========
console.log("Inicializando sistema...");

// Variables globales
var alumnos = [];
var padres = [];
var grupos = [];
var reuniones = [];
var pagos = [];
var bitacora = [];
var usuarios = [];
var usuarioActivo = null;

// Role aliases
var ROLE_ALIASES = { 
  SUPER: ['superadmin','superusuario'], 
  ADMIN: ['administrador','admin'], 
  OPER: ['operador'], 
  VISIT: ['visitante'] 
};

// Variables para edición
var editandoIndex = -1;
var moduloEditando = '';

// ========== CONFIGURACIÓN TELEGRAM ==========
const TELEGRAM_CONFIG = {
  botToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
  chatId: '123456789'
};

// ========== SISTEMA DE CARGA DE DATOS DESDE JSON ==========
async function cargarDatosIniciales() {
  console.log("📂 Cargando datos iniciales...");
  
  try {
    // Intentar cargar desde el archivo JSON estático
    const response = await fetch('datos_sistema.json');
    
    if (response.ok) {
      const datos = await response.json();
      
      // Cargar datos desde el JSON
      alumnos = datos.alumnos || [];
      padres = datos.padres || [];
      grupos = datos.grupos || [];
      reuniones = datos.reuniones || [];
      pagos = datos.pagos || [];
      bitacora = datos.bitacora || [];
      usuarios = datos.usuarios || [];
      
      console.log("✅ Datos cargados desde JSON:", {
        usuarios: usuarios.length,
        alumnos: alumnos.length,
        padres: padres.length
      });
      
    } else {
      console.log("⚠️ No se encontró datos_sistema.json - usando datos por defecto");
      cargarDatosPorDefecto();
    }
    
  } catch (error) {
    console.log("❌ Error cargando datos JSON:", error);
    cargarDatosPorDefecto();
  }
  
  // También intentar cargar datos de sesión desde localStorage
  cargarSesionUsuario();
}

function cargarDatosPorDefecto() {
  // Datos por defecto para cuando no hay JSON
  usuarios = [
    {
      user: 'root',
      pass: 'toor',
      rol: 'superusuario',
      grado: 'Todos',
      telefono: '591',
      activo: true
    }
  ];
  console.log("📝 Usando datos por defecto");
}

function cargarSesionUsuario() {
  try {
    if (typeof Storage !== 'undefined') {
      const usuarioGuardado = localStorage.getItem('usuarioActivo');
      if (usuarioGuardado) {
        usuarioActivo = JSON.parse(usuarioGuardado);
        console.log("👤 Sesión cargada:", usuarioActivo.user);
      }
    }
  } catch (error) {
    console.log("⚠️ Error cargando sesión:", error);
  }
}

function guardarDatos() {
  try {
    if (typeof Storage !== 'undefined') {
      // Guardar solo la sesión del usuario en localStorage
      if (usuarioActivo) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));
      }
      
      // Los demás datos se mantienen en memoria durante la sesión
      // Para persistencia completa, necesitarías un backend
    }
  } catch (error) {
    console.log("⚠️ Error guardando datos:", error);
  }
}

// ========== SISTEMA DE LOGIN ==========
function login() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  
  if (!user || !pass) {
    mostrarNotificacion('❌ Ingrese usuario y contraseña');
    return;
  }
  
  // Buscar usuario
  const u = usuarios.find(x => x.user === user && x.pass === pass);
  
  if (u) {
    if (u.activo === false) {
      mostrarNotificacion('❌ Usuario inactivo. Contacte al administrador.');
      return;
    }
    
    usuarioActivo = u;
    guardarDatos();
    
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    
    configurarVisibilidadPorRol();
    renderMenuHeader();
    mostrarNotificacion(`✅ Bienvenido ${u.user}`);
    
  } else {
    mostrarNotificacion('❌ Usuario o contraseña incorrecta');
  }
}

// ========== SISTEMA DE REGISTRO ==========
function mostrarRegistro() {
  document.getElementById('loginScreen').innerHTML = `
    <div style="text-align:center;">
      <h2>Registro de Usuario</h2>
      <input type="text" id="nombreRegistro" placeholder="Usuario" />
      <input type="password" id="passRegistro" placeholder="Contraseña" />
      <input type="text" id="telefonoRegistro" placeholder="Teléfono (ej: 591XXXXXXXX)" value="591" />
      <select id="gradoRegistro">
        <option value="">Seleccionar grado</option>
      </select>
      <br>
      <button onclick="enviarSolicitudRegistro()" style="margin-top: 10px;">Enviar Solicitud</button>
      <button onclick="volverLogin()" style="background: #666; margin-left: 10px; margin-top: 10px;">Cancelar</button>
      <div id="mensajeRegistro" style="margin-top: 15px;"></div>
    </div>
  `;
  
  cargarGradosRegistro();
}

function cargarGradosRegistro() {
  const gradoSelect = document.getElementById('gradoRegistro');
  if (!gradoSelect) return;
  
  gradoSelect.innerHTML = '<option value="">Seleccionar grado</option>';
  
  const optGroupPrimaria = document.createElement('optgroup');
  optGroupPrimaria.label = 'PRIMARIA';
  gradoSelect.appendChild(optGroupPrimaria);
  
  ['1° A', '1° B', '2° A', '2° B', '3° A', '3° B', '4° A', '4° B', '5° A', '5° B', '6° A', '6° B']
    .forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      opt.textContent = grado;
      optGroupPrimaria.appendChild(opt);
    });
  
  const optGroupSecundaria = document.createElement('optgroup');
  optGroupSecundaria.label = 'SECUNDARIA';
  gradoSelect.appendChild(optGroupSecundaria);
  
  ['1° A Sec.', '1° B Sec.', '2° A Sec.', '2° B Sec.', '3° A Sec.', '3° B Sec.', '4° A Sec.', '4° B Sec.']
    .forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      opt.textContent = grado;
      optGroupSecundaria.appendChild(opt);
    });
  
  const optGroupPromo = document.createElement('optgroup');
  optGroupPromo.label = 'PROMOCIONES';
  gradoSelect.appendChild(optGroupPromo);
  
  ['Pre Promo A', 'Pre Promo B', 'Promo A', 'Promo B']
    .forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      opt.textContent = grado;
      optGroupPromo.appendChild(opt);
    });
}

function enviarSolicitudRegistro() {
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const pass = document.getElementById('passRegistro').value;
  const telefono = document.getElementById('telefonoRegistro').value.trim();
  const grado = document.getElementById('gradoRegistro').value;
  
  if (!nombre || !pass || !grado) {
    document.getElementById('mensajeRegistro').innerHTML = '<div style="color: red;">❌ Complete todos los campos</div>';
    return;
  }
  
  if (usuarios.some(u => u.user === nombre)) {
    document.getElementById('mensajeRegistro').innerHTML = '<div style="color: red;">❌ El usuario ya existe</div>';
    return;
  }
  
  // Agregar nuevo usuario al array en memoria
  usuarios.push({ 
    user: nombre, 
    pass, 
    rol: 'operador',
    grado, 
    telefono,
    activo: false,
    fechaSolicitud: new Date().toLocaleString()
  });
  
  // En GitHub, los datos solo persisten durante la sesión actual
  // Para persistencia, necesitarías actualizar el archivo JSON via GitHub API
  mostrarNotificacion('✅ Usuario registrado (sesión actual)');
  
  // Enviar notificación a Telegram
  enviarNotificacionTelegram(nombre, grado);
  
  document.getElementById('loginScreen').innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2 style="color: green;">✅ Solicitud Enviada</h2>
      <p style="color:#666; margin-bottom:18px; font-size: 16px; line-height: 1.5;">
        La solicitud de creación de usuario ha sido enviada.<br>
        En las próximas 48 horas, obtendrá respuesta.
      </p>
      <div style="background: #e3f2fd; border: 2px solid #2196F3; border-radius: 10px; padding: 15px; margin: 20px 0;">
        <p style="color: #1976D2; margin: 0; font-weight: bold;">
          📱 Notificación enviada al administrador
        </p>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">
          El superusuario ha sido notificado vía Telegram
        </p>
      </div>
      <button onclick="volverLogin()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">
        Volver al Inicio
      </button>
    </div>
  `;
}

// ========== TELEGRAM ==========
function enviarNotificacionTelegram(usuario, grado) {
  if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken.includes('1234567890')) {
    return;
  }
  
  const mensaje = `🚨 NUEVO REGISTRO PENDIENTE

👤 Usuario: ${usuario}
🎓 Grado: ${grado}  
📅 Fecha: ${new Date().toLocaleString()}

⚠️ Activa el usuario en el sistema de gestión`;

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
  
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CONFIG.chatId,
      text: mensaje
    })
  }).catch(error => {
    console.log('Error enviando notificación');
  });
}

// ========== FUNCIONES PRINCIPALES ==========
function logoutAndShowBlank(){
  usuarioActivo = null;
  localStorage.removeItem('usuarioActivo');
  
  document.getElementById('menu').style.display='none';
  document.getElementById('mainHeader').style.display='none';
  
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginScreen').innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2>Sesión cerrada</h2>
      <p style="color:#666; margin-bottom:18px;">Pulsa para iniciar sesión</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Iniciar sesión</button>
    </div>
  `;
}

function renderMenuHeader(){
  const mh = document.getElementById('menuHeader');
  if(!mh || !usuarioActivo) return;
  
  document.getElementById('mhUser').innerText = `Usuario: ${usuarioActivo.user}`;
  document.getElementById('mhRole').innerText = `Rol: ${usuarioActivo.rol}`;
  document.getElementById('mhGrado').innerText = `Grado: ${usuarioActivo.grado || '-'}`;
  mh.style.display = 'block';
}

function configurarVisibilidadPorRol(){
  if (!usuarioActivo) return;
  
  const botonUsuarios = document.querySelector("button[onclick*='usuarios']");
  const botonBitacora = document.querySelector("button[onclick*='bitacora']");

  if (ROLE_ALIASES.OPER.includes(usuarioActivo.rol) || ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
    if(botonUsuarios) botonUsuarios.style.display='none';
    if(botonBitacora) botonBitacora.style.display='none';
  } else {
    if(botonUsuarios) botonUsuarios.style.display='block';
    if(botonBitacora) botonBitacora.style.display='block';
  }
}

function mostrarNotificacion(msg){
  const n = document.getElementById('notificacion');
  if (!n) return;
  n.textContent = msg;
  n.style.display = 'block';
  setTimeout(() => n.style.display = 'none', 3000);
}

function abrirModulo(id){
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('menu').style.display = 'none';
  document.getElementById('mainHeader').style.display = 'none';
  
  editandoIndex = -1;
  moduloEditando = '';
  
  if (id === 'usuarios' && typeof mostrarUsuarios === 'function') {
    mostrarUsuarios();
  }
  if (id === 'bitacora') {
    mostrarBitacora();
  }
  
  window.scrollTo(0,0);
}

function volverLogin() {
  location.reload();
}

function volverMenu(){
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('active'));
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('mainHeader').style.display = 'block';
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async function() {
  // Cargar datos desde el JSON estático
  await cargarDatosIniciales();
  
  // Configurar eventos
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  
  if (loginUser && loginPass) {
    loginUser.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
    loginPass.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  }
  
  // Si hay usuario activo, mostrar menú
  if (usuarioActivo) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    configurarVisibilidadPorRol();
    renderMenuHeader();
  }
});
