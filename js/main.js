
// ========== CONFIGURACIÓN INICIAL ==========
console.log("Inicializando sistema...");

// Variables globales - INICIALIZAR CON VALORES POR DEFECTO
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
  // REEMPLAZA CON TUS DATOS REALES:
  botToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz', // Token de @BotFather
  chatId: '123456789' // Tu Chat ID
};

// Función para inicializar datos
function inicializarDatos() {
  console.log("📂 Inicializando datos desde localStorage...");
  
  try {
    alumnos = JSON.parse(localStorage.getItem('alumnos') || '[]');
    padres = JSON.parse(localStorage.getItem('padres') || '[]');
    grupos = JSON.parse(localStorage.getItem('grupos') || '[]');
    reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    pagos = JSON.parse(localStorage.getItem('pagos') || '[]');
    bitacora = JSON.parse(localStorage.getItem('bitacora') || '[]');
    usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
    
    // Asegurar que siempre sean arrays
    if (!Array.isArray(alumnos)) alumnos = [];
    if (!Array.isArray(padres)) padres = [];
    if (!Array.isArray(grupos)) grupos = [];
    if (!Array.isArray(reuniones)) reuniones = [];
    if (!Array.isArray(pagos)) pagos = [];
    if (!Array.isArray(bitacora)) bitacora = [];
    if (!Array.isArray(usuarios)) usuarios = [];
    
    console.log("✅ Datos inicializados:", {
      alumnos: alumnos.length,
      padres: padres.length,
      grupos: grupos.length,
      reuniones: reuniones.length,
      pagos: pagos.length,
      bitacora: bitacora.length,
      usuarios: usuarios.length,
      usuarioActivo: usuarioActivo ? usuarioActivo.user : 'null'
    });
    
  } catch (error) {
    console.error("❌ Error inicializando datos:", error);
    // Resetear datos en caso de error
    alumnos = []; padres = []; grupos = []; reuniones = []; 
    pagos = []; bitacora = []; usuarios = [];
  }
}

// Crear usuario root si no existe
function crearUsuarioRootSiNoExiste() {
  console.log("🔍 Verificando usuario root...");
  
  if (!usuarios.some(u => u.user === 'root')) {
    console.log("👤 Creando usuario root...");
    usuarios.push({
      user: 'root',
      pass: 'toor',
      rol: 'superusuario',
      grado: 'Todos',
      telefono: '591',
      activo: true
    });
    guardarDatos();
    console.log('✅ Usuario root creado');
  } else {
    console.log('✅ Usuario root ya existe');
  }
}

// ========== SISTEMA DE LOGIN ==========
function login() {
  console.log("🔐 Intentando login...");
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  
  if (!userInput || !passInput) {
    console.error("❌ No se encontraron los campos de login");
    return;
  }
  
  const user = userInput.value.trim();
  const pass = passInput.value.trim();
  
  console.log("Buscando usuario:", user);
  console.log("Usuarios en sistema:", usuarios);
  
  const u = usuarios.find(x => x.user === user && x.pass === pass && x.activo !== false);

  if (u) {
    console.log("✅ Login exitoso:", u.user);
    usuarioActivo = u;
    localStorage.setItem('usuarioActivo', JSON.stringify(u));
    registrarAccion(`Inicio sesión: ${u.user}`);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    configurarVisibilidadPorRol();
    renderMenuHeader();
    mostrarNotificacion(`✅ Bienvenido ${u.user}`);
  } else {
    console.log("❌ Login fallido");
    const usuarioInactivo = usuarios.find(x => x.user === user && x.pass === pass && x.activo === false);
    if (usuarioInactivo) {
      mostrarNotificacion('❌ Usuario inactivo. Contacte al administrador.');
    } else {
      mostrarNotificacion('❌ Usuario o contraseña incorrecta');
    }
  }
}

// ========== SISTEMA DE REGISTRO ==========
function mostrarRegistro() {
  console.log("📝 Mostrando formulario de registro");
  const loginScreen = document.getElementById('loginScreen');
  if (!loginScreen) return;
  
  loginScreen.innerHTML = `
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

function volverLogin() {
  location.reload();
}

function cargarGradosRegistro() {
  const gradoSelect = document.getElementById('gradoRegistro');
  if (!gradoSelect) return;
  
  gradoSelect.innerHTML = '<option value="">Seleccionar grado</option>';
  
  // Agregar grados de PRIMARIA
  const optGroupPrimaria = document.createElement('optgroup');
  optGroupPrimaria.label = 'PRIMARIA';
  gradoSelect.appendChild(optGroupPrimaria);
  
  const gradosPrimaria = [
    '1° A', '1° B', '2° A', '2° B', '3° A', '3° B', 
    '4° A', '4° B', '5° A', '5° B', '6° A', '6° B'
  ];
  
  gradosPrimaria.forEach(grado => {
    const opt = document.createElement('option');
    opt.value = grado;
    opt.textContent = grado;
    optGroupPrimaria.appendChild(opt);
  });
  
  // Agregar grados de SECUNDARIA
  const optGroupSecundaria = document.createElement('optgroup');
  optGroupSecundaria.label = 'SECUNDARIA';
  gradoSelect.appendChild(optGroupSecundaria);
  
  const gradosSecundaria = [
    '1° A Sec.', '1° B Sec.', '2° A Sec.', '2° B Sec.', 
    '3° A Sec.', '3° B Sec.', '4° A Sec.', '4° B Sec.'
  ];
  
  gradosSecundaria.forEach(grado => {
    const opt = document.createElement('option');
    opt.value = grado;
    opt.textContent = grado;
    optGroupSecundaria.appendChild(opt);
  });
  
  // Agregar grados de PROMOCIONES
  const optGroupPromo = document.createElement('optgroup');
  optGroupPromo.label = 'PROMOCIONES';
  gradoSelect.appendChild(optGroupPromo);
  
  const gradosPromo = [
    'Pre Promo A', 'Pre Promo B', 'Promo A', 'Promo B'
  ];
  
  gradosPromo.forEach(grado => {
    const opt = document.createElement('option');
    opt.value = grado;
    opt.textContent = grado;
    optGroupPromo.appendChild(opt);
  });
}

function enviarSolicitudRegistro() {
  console.log("📤 Enviando solicitud de registro");
  
  const nombreInput = document.getElementById('nombreRegistro');
  const passInput = document.getElementById('passRegistro');
  const telefonoInput = document.getElementById('telefonoRegistro');
  const gradoSelect = document.getElementById('gradoRegistro');
  
  if (!nombreInput || !passInput || !telefonoInput || !gradoSelect) {
    console.error("❌ Elementos del formulario no encontrados");
    return;
  }
  
  const nombre = nombreInput.value.trim();
  const pass = passInput.value;
  const telefono = telefonoInput.value.trim();
  const grado = gradoSelect.value;
  
  console.log("Datos del registro:", { nombre, grado });
  
  if (!nombre || !pass || !grado) {
    const mensajeDiv = document.getElementById('mensajeRegistro');
    if (mensajeDiv) {
      mensajeDiv.innerHTML = '<div style="color: red;">❌ Complete todos los campos</div>';
    }
    return;
  }
  
  // Verificar si ya existe el usuario
  if (usuarios.some(u => u.user === nombre)) {
    const mensajeDiv = document.getElementById('mensajeRegistro');
    if (mensajeDiv) {
      mensajeDiv.innerHTML = '<div style="color: red;">❌ El usuario ya existe</div>';
    }
    return;
  }
  
  // Crear usuario INACTIVO por defecto
  usuarios.push({ 
    user: nombre, 
    pass, 
    rol: 'operador',
    grado, 
    telefono,
    activo: false,
    fechaSolicitud: new Date().toLocaleString()
  });
  
  guardarDatos();
  
  // 🔔 ENVIAR NOTIFICACIÓN A TELEGRAM
  if (typeof enviarNotificacionTelegram === 'function') {
    enviarNotificacionTelegram(nombre, grado);
  }
  
  // Mostrar mensaje de confirmación
  const loginScreen = document.getElementById('loginScreen');
  if (loginScreen) {
    loginScreen.innerHTML = `
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
}

// ========== TELEGRAM NOTIFICATIONS ==========
function enviarNotificacionTelegram(usuario, grado) {
  console.log("📱 Enviando notificación a Telegram...");
  
  // Validar que la configuración esté completa
  if (!TELEGRAM_CONFIG.botToken || !TELEGRAM_CONFIG.chatId || 
      TELEGRAM_CONFIG.botToken.includes('TU_TOKEN') || 
      TELEGRAM_CONFIG.chatId.includes('123456789')) {
    console.log('⚠️ Configuración de Telegram incompleta');
    return;
  }
  
  const mensaje = `🚨 *NUEVO REGISTRO PENDIENTE*

👤 *Usuario:* ${usuario}
🎓 *Grado:* ${grado}  
📅 *Fecha:* ${new Date().toLocaleString()}

⚠️ _Activa el usuario en el sistema de gestión_`;

  const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
  
  console.log('URL Telegram:', url);
  
  fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CONFIG.chatId,
      text: mensaje,
      parse_mode: 'Markdown'
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      console.log('✅ Notificación enviada a Telegram');
    } else {
      console.log('❌ Error Telegram:', data.description);
    }
  })
  .catch(error => {
    console.log('❌ Error enviando notificación:', error);
  });
}

// ========== FUNCIONES PRINCIPALES ==========
function logoutAndShowBlank(){
  if(usuarioActivo){
    registrarAccion(`Cerró sesión`);
  }
  usuarioActivo = null;
  localStorage.removeItem('usuarioActivo');
  
  document.getElementById('menu').style.display='none';
  document.getElementById('mainHeader').style.display='none';
  
  const login = document.getElementById('loginScreen');
  if (login) {
    login.style.display = 'flex';
    login.innerHTML = `
      <div style="text-align:center; padding:40px;">
        <h2>Sesión cerrada</h2>
        <p style="color:#666; margin-bottom:18px;">Pulsa para iniciar sesión</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Iniciar sesión</button>
      </div>
    `;
  }
  document.getElementById('notificacion').style.display = 'none';
}

function renderMenuHeader(){
  const mh = document.getElementById('menuHeader');
  if(!mh) return;
  if(!usuarioActivo){
    mh.style.display = 'none';
    return;
  }
  document.getElementById('mhUser').innerText = `Usuario: ${usuarioActivo.user}`;
  document.getElementById('mhRole').innerText = `Rol: ${usuarioActivo.rol}`;
  document.getElementById('mhGrado').innerText = `Grado: ${usuarioActivo.grado || '-'}`;
  mh.style.display = 'block';
}

function configurarVisibilidadPorRol(){
  const rol = usuarioActivo ? usuarioActivo.rol : null;
  const isSuper = ROLE_ALIASES.SUPER.includes(rol);
  const isAdmin = ROLE_ALIASES.ADMIN.includes(rol);
  const isOper = ROLE_ALIASES.OPER.includes(rol);
  const isVisit = ROLE_ALIASES.VISIT.includes(rol);

  const botonUsuarios = document.querySelector("button[onclick*='usuarios']");
  const botonBitacora = document.querySelector("button[onclick*='bitacora']");

  if(isVisit || isOper){
    if(botonUsuarios) botonUsuarios.style.display='none';
    if(botonBitacora) botonBitacora.style.display='none';
    return;
  }
  if(isSuper){
    if(botonUsuarios) botonUsuarios.style.display='block';
    if(botonBitacora) botonBitacora.style.display='block';
    return;
  }
  if(isAdmin){
    if(botonUsuarios) botonUsuarios.style.display='block';
    if(botonBitacora) botonBitacora.style.display='block';
    return;
  }
}

function mostrarNotificacion(msg){
  const n = document.getElementById('notificacion');
  if (!n) return;
  n.textContent = msg;
  n.style.display = 'block';
  setTimeout(()=>{ n.style.display = 'none'; }, 3000);
}

function guardarDatos(){
  localStorage.setItem('alumnos', JSON.stringify(alumnos));
  localStorage.setItem('padres', JSON.stringify(padres));
  localStorage.setItem('grupos', JSON.stringify(grupos));
  localStorage.setItem('reuniones', JSON.stringify(reuniones));
  localStorage.setItem('pagos', JSON.stringify(pagos));
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('bitacora', JSON.stringify(bitacora));
}

function registrarAccion(texto){
  const fecha = new Date().toLocaleString();
  const usuario = usuarioActivo ? usuarioActivo.user : 'sistema';
  bitacora.unshift({ fecha, usuario, texto });
  if(bitacora.length > 300) bitacora.pop();
  mostrarBitacora();
  guardarDatos();
}

function mostrarBitacora(){
  const cont = document.getElementById('bitacoraLista');
  if (!cont) return;
  
  cont.innerHTML = '';
  
  if (usuarioActivo && (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol))) {
    const btnLimpiar = document.createElement('button');
    btnLimpiar.textContent = 'Limpiar Bitácora';
    btnLimpiar.className = 'btn-clear';
    btnLimpiar.onclick = limpiarBitacora;
    cont.appendChild(btnLimpiar);
  }
  
  if (bitacora.length === 0) {
    cont.innerHTML = '<div class="item">No hay registros en la bitácora.</div>';
    return;
  }
  
  bitacora.forEach((b, index) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<b>${b.fecha}</b> - ${b.usuario}: ${b.texto}`;
    
    if (usuarioActivo && (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol))) {
      const acciones = document.createElement('div');
      acciones.className = 'item-actions';
      
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.className = 'btn-delete';
      btnEliminar.onclick = () => eliminarRegistroBitacora(index);
      acciones.appendChild(btnEliminar);
      
      div.appendChild(acciones);
    }
    
    cont.appendChild(div);
  });
}

function limpiarBitacora() {
  if (!usuarioActivo || (!ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol) && !ROLE_ALIASES.SUPER.includes(usuarioActivo.rol))) {
    mostrarNotificacion('❌ No tienes permisos para limpiar la bitácora');
    return;
  }
  
  if (confirm('¿Estás seguro de que deseas limpiar toda la bitácora? Esta acción no se puede deshacer.')) {
    bitacora = [];
    registrarAccion('Limpio toda la bitácora');
    guardarDatos();
    mostrarBitacora();
    mostrarNotificacion('✅ Bitácora limpiada correctamente');
  }
}

function eliminarRegistroBitacora(index) {
  if (!usuarioActivo || (!ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol) && !ROLE_ALIASES.SUPER.includes(usuarioActivo.rol))) {
    mostrarNotificacion('❌ No tienes permisos para eliminar registros de la bitácora');
    return;
  }
  
  const registro = bitacora[index];
  if (confirm(`¿Estás seguro de eliminar este registro: "${registro.texto}"?`)) {
    bitacora.splice(index, 1);
    registrarAccion(`Eliminó registro de bitácora: ${registro.texto.substring(0, 50)}...`);
    guardarDatos();
    mostrarBitacora();
    mostrarNotificacion('✅ Registro eliminado correctamente');
  }
}

function abrirModulo(id){
  document.querySelectorAll('.modulo').forEach(m=>m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('menu').style.display='none';
  document.getElementById('mainHeader').style.display='none';
  
  editandoIndex = -1;
  moduloEditando = '';
  
  if(id === 'alumnos') { 
    if (typeof mostrarAlumnos === 'function') mostrarAlumnos(); 
    if (typeof cargarPadresSelect === 'function') cargarPadresSelect(); 
  }
  if(id === 'padres') { 
    if (typeof mostrarPadres === 'function') mostrarPadres(); 
    if (typeof cargarGruposPadreSelect === 'function') cargarGruposPadreSelect();
  }
  if(id === 'grupos') { 
    if (typeof mostrarGrupos === 'function') mostrarGrupos(); 
    if (typeof cargarGradosGrupoSelect === 'function') cargarGradosGrupoSelect(); 
  }
  if(id === 'reuniones') { 
    if (typeof mostrarReuniones === 'function') mostrarReuniones(); 
    if (typeof cargarGrupoReunionSelect === 'function') cargarGrupoReunionSelect();
    if (typeof cargarPadresCheck === 'function') cargarPadresCheck(); 
  }
  if(id === 'pagos') { 
    if (typeof mostrarPagos === 'function') mostrarPagos(); 
    if (typeof cargarPadresPagoSelect === 'function') cargarPadresPagoSelect(); 
  }
  if(id === 'usuarios') { 
    if (typeof mostrarUsuarios === 'function') mostrarUsuarios(); 
    const formulario = document.getElementById('formularioUsuario');
    const botonNuevo = document.getElementById('botonNuevoUsuarioContainer');
    if (formulario) formulario.style.display = 'none';
    if (botonNuevo) {
      botonNuevo.style.display = 
        (usuarioActivo && (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol))) ? 'block' : 'none';
    }
  }
  if(id === 'bitacora') mostrarBitacora();
  
  window.scrollTo(0,0);
}

function volverMenu(){
  document.querySelectorAll('.modulo').forEach(m=>m.classList.remove('active'));
  document.getElementById('menu').style.display='flex';
  document.getElementById('mainHeader').style.display='block';
}

function perteneceAGrado(gradoElemento) {
  if (!usuarioActivo) return false;
  if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol)) return true;
  if (usuarioActivo.grado === 'Todos') return true;
  return gradoElemento === usuarioActivo.grado;
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 DOM cargado - Inicializando sistema completo");
  
  // Inicializar datos
  inicializarDatos();
  crearUsuarioRootSiNoExiste();
  
  // Configurar eventos
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  
  if (loginUser) {
    loginUser.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  }
  
  if (loginPass) {
    loginPass.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  }
  
  // Configurar búsquedas en tiempo real
  const configurarBusqueda = (elemento, funcion) => {
    if (elemento && typeof funcion === 'function') {
      elemento.addEventListener('input', funcion);
    }
  };
  
  configurarBusqueda(document.getElementById('buscarAlumno'), mostrarAlumnos);
  configurarBusqueda(document.getElementById('buscarPadre'), mostrarPadres);
  configurarBusqueda(document.getElementById('buscarGrupo'), mostrarGrupos);
  configurarBusqueda(document.getElementById('buscarReunion'), mostrarReuniones);
  configurarBusqueda(document.getElementById('buscarPago'), mostrarPagos);
  configurarBusqueda(document.getElementById('buscarUsuario'), mostrarUsuarios);
  
  // Si hay usuario activo, mostrar menú principal
  if (usuarioActivo) {
    console.log("👤 Usuario activo detectado:", usuarioActivo.user);
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    configurarVisibilidadPorRol();
    renderMenuHeader();
  } else {
    console.log("🔒 No hay usuario activo - Mostrando login");
  }
  
  console.log("✅ Sistema inicializado correctamente");
});
