// ========== CONFIGURACIÓN INICIAL ==========
console.log("Inicializando sistema...");

// Variables globales - INICIALIZAR PRIMERO
var alumnos, padres, grupos, reuniones, pagos, bitacora, usuarios, usuarioActivo;

// Función para inicializar datos
function inicializarDatos() {
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
}

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

// 🔒 Detectar si es dispositivo personal y crear usuario root si no existe
function esMiDispositivo() {
  // Método 1: Verificar User Agent específico (opcional)
  const userAgent = navigator.userAgent.toLowerCase();
  const esMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Método 2: Verificar si ya existe data previa (indicando que es tu celular)
  const tieneDataPrevia = localStorage.getItem('usuarios') || 
                         localStorage.getItem('alumnos') || 
                         localStorage.getItem('padres');
  
  // Método 3: Verificar dominio/host
  const esLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.protocol === 'file:';
  
  return (esMobile && tieneDataPrevia) || esLocal;
}

function inicializarUsuariosPorDefecto() {
  // Solo crear usuario root si es mi dispositivo y no existe
  if (esMiDispositivo() && !usuarios.some(u => u.user === 'root')) {
    usuarios.push({
      user: 'root',
      pass: 'toor',
      rol: 'superusuario',
      grado: 'Todos',
      telefono: '591',
      activo: true
    });
    guardarDatos();
    console.log('Usuario root creado para dispositivo personal');
  }
}

// Inicializar datos al cargar
inicializarDatos();
inicializarUsuariosPorDefecto();

console.log("Datos cargados:", {
  alumnos: alumnos.length,
  padres: padres.length,
  grupos: grupos.length,
  reuniones: reuniones.length,
  pagos: pagos.length,
  bitacora: bitacora.length,
  usuarios: usuarios.length,
  usuarioActivo: usuarioActivo
});

// ========== SISTEMA DE LOGIN ==========
function login() {
  console.log("Intentando login...");
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const u = usuarios.find(x => x.user === user && x.pass === pass && x.activo !== false);

  if (u) {
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
    const usuarioInactivo = usuarios.find(x => x.user === user && x.pass === pass && x.activo === false);
    if (usuarioInactivo) {
      mostrarNotificacion('❌ Usuario inactivo. Contacte al administrador.');
    } else {
      mostrarNotificacion('❌ Usuario o contraseña incorrecta');
    }
  }
}

// Logout solicitado: limpiar sesión y mostrar pantalla en blanco con botón "Iniciar sesión"
function logoutAndShowBlank(){
  if(usuarioActivo){
    registrarAccion(`Cerró sesión`);
  }
  usuarioActivo = null;
  localStorage.removeItem('usuarioActivo');
  
  // Ocultar todo lo demás
  document.getElementById('menu').style.display='none';
  document.getElementById('mainHeader').style.display='none';
  
  // Mostrar pantalla limpia con botón "Iniciar sesión" que recarga la página
  const login = document.getElementById('loginScreen');
  login.style.display = 'flex';
  login.innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2>Sesión cerrada</h2>
      <p style="color:#666; margin-bottom:18px;">Pulsa para iniciar sesión</p>
      <button id="loginBlankButton" onclick="location.reload()">Iniciar sesión</button>
    </div>
  `;
  document.getElementById('notificacion').style.display = 'none';
}

// ======= UTILIDADES: RENDER MENU HEADER =======
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

// Control de visibilidad por rol
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

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(msg){
  const n = document.getElementById('notificacion');
  n.textContent = msg;
  n.style.display = 'block';
  setTimeout(()=>{ n.style.display = 'none'; }, 3000);
}

// ========== GESTIÓN DE DATOS ==========
function guardarDatos(){
  localStorage.setItem('alumnos', JSON.stringify(alumnos));
  localStorage.setItem('padres', JSON.stringify(padres));
  localStorage.setItem('grupos', JSON.stringify(grupos));
  localStorage.setItem('reuniones', JSON.stringify(reuniones));
  localStorage.setItem('pagos', JSON.stringify(pagos));
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('bitacora', JSON.stringify(bitacora));
}

// ========== BITÁCORA ==========
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
  
  // Botón para limpiar bitácora (solo para superusuario y admin)
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
    
    // Botones de acción (solo para superusuario y admin)
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

// ========== NAVEGACIÓN ==========
function abrirModulo(id){
  document.querySelectorAll('.modulo').forEach(m=>m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('menu').style.display='none';
  document.getElementById('mainHeader').style.display='none';
  
  // Resetear estado de edición
  editandoIndex = -1;
  moduloEditando = '';
  
  if(id === 'alumnos') { 
    mostrarAlumnos(); 
    cargarPadresSelect(); 
  }
  if(id === 'padres') { 
    mostrarPadres(); 
    cargarGruposPadreSelect();
  }
  if(id === 'grupos') { 
    mostrarGrupos(); 
    cargarGradosGrupoSelect(); 
  }
  if(id === 'reuniones') { 
    mostrarReuniones(); 
    cargarGrupoReunionSelect();
    cargarPadresCheck(); 
  }
  if(id === 'pagos') { 
    mostrarPagos(); 
    cargarPadresPagoSelect(); 
  }
  if(id === 'usuarios') { 
    mostrarUsuarios(); 
    // Asegurar que el formulario esté oculto al entrar
    document.getElementById('formularioUsuario').style.display = 'none';
    document.getElementById('botonNuevoUsuarioContainer').style.display = 
      (usuarioActivo && (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol))) ? 'block' : 'none';
  }
  if(id === 'bitacora') mostrarBitacora();
  
  window.scrollTo(0,0);
}

function volverMenu(){
  document.querySelectorAll('.modulo').forEach(m=>m.classList.remove('active'));
  document.getElementById('menu').style.display='flex';
  document.getElementById('mainHeader').style.display='block';
}

// Función auxiliar para verificar si un elemento pertenece al grado del usuario
function perteneceAGrado(gradoElemento) {
  if (!usuarioActivo) return false;
  if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol)) return true;
  if (usuarioActivo.grado === 'Todos') return true;
  return gradoElemento === usuarioActivo.grado;
}

// ========== EXPORTACIÓN DE DATOS ==========
function exportarDatos() {
  const datos = {
    alumnos: alumnos.filter(a => perteneceAGrado(a.grado)),
    padres: padres.filter(p => perteneceAGrado(p.grupo)),
    grupos: grupos.filter(g => 
      ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
      usuarioActivo.grado === 'Todos' || 
      g.grado === usuarioActivo.grado
    ),
    reuniones: reuniones.filter(r => perteneceAGrado(r.grupo)),
    pagos: pagos.filter(p => perteneceAGrado(p.grupo)),
    usuarios,
    bitacora,
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `datos_sistema_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó todos los datos del sistema');
  mostrarNotificacion('✅ Datos exportados correctamente');
}

function exportarAlumnos() {
  const datos = {
    alumnos: alumnos.filter(a => perteneceAGrado(a.grado)),
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alumnos_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó datos de alumnos');
  mostrarNotificacion('✅ Alumnos exportados correctamente');
}

function exportarPadres() {
  const datos = {
    padres: padres.filter(p => perteneceAGrado(p.grupo)),
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `padres_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó datos de padres');
  mostrarNotificacion('✅ Padres exportados correctamente');
}

function exportarGrupos() {
  const datos = {
    grupos: grupos.filter(g => 
      ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
      usuarioActivo.grado === 'Todos' || 
      g.grado === usuarioActivo.grado
    ),
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grupos_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó datos de grupos');
  mostrarNotificacion('✅ Grupos exportados correctamente');
}

function exportarReuniones() {
  const datos = {
    reuniones: reuniones.filter(r => perteneceAGrado(r.grupo)),
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reuniones_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó datos de reuniones');
  mostrarNotificacion('✅ Reuniones exportados correctamente');
}

function exportarPagos() {
  const datos = {
    pagos: pagos.filter(p => perteneceAGrado(p.grupo)),
    exportado: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pagos_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  registrarAccion('Exportó datos de pagos');
  mostrarNotificacion('✅ Pagos exportados correctamente');
}

// ========== SISTEMA DE SOLICITUDES DE REGISTRO ==========
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
      <button onclick="enviarSolicitudRegistro()">Enviar Solicitud</button>
      <button onclick="volverLogin()" style="background: #666; margin-left: 10px;">Cancelar</button>
      <div id="mensajeRegistro" style="margin-top: 15px;"></div>
    </div>
  `;
  
  // Cargar grados en el select
  cargarGradosRegistro();
}

function volverLogin() {
  location.reload();
}

function cargarGradosRegistro() {
  const gradoSelect = document.getElementById('gradoRegistro');
  gradoSelect.innerHTML = '<option value="">Seleccionar grado</option>';
  
  // Agregar todos los grados disponibles
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
  const nombre = document.getElementById('nombreRegistro').value.trim();
  const pass = document.getElementById('passRegistro').value;
  const telefono = document.getElementById('telefonoRegistro').value.trim();
  const grado = document.getElementById('gradoRegistro').value;
  
  if (!nombre || !pass || !grado) {
    document.getElementById('mensajeRegistro').innerHTML = '<div style="color: red;">❌ Complete todos los campos</div>';
    return;
  }
  
  // Verificar si ya existe el usuario
  if (usuarios.some(u => u.user === nombre)) {
    document.getElementById('mensajeRegistro').innerHTML = '<div style="color: red;">❌ El usuario ya existe</div>';
    return;
  }
  
  // Crear usuario INACTIVO por defecto (rol operador por defecto)
  usuarios.push({ 
    user: nombre, 
    pass, 
    rol: 'operador', // Rol por defecto para solicitudes
    grado, 
    telefono,
    activo: false, // Usuarios creados aquí están INACTIVOS por defecto
    fechaSolicitud: new Date().toLocaleString()
  });
  
  guardarDatos();
  
  // Mostrar mensaje de confirmación
  document.getElementById('loginScreen').innerHTML = `
    <div style="text-align:center; padding:40px;">
      <h2 style="color: green;">✅ Solicitud Enviada</h2>
      <p style="color:#666; margin-bottom:18px; font-size: 16px; line-height: 1.5;">
        La solicitud de creación de usuario ha sido enviada.<br>
        En las próximas 48 horas, obtendrá respuesta.
      </p>
      <button id="loginBlankButton" onclick="volverLogin()">Volver al Inicio</button>
    </div>
  `;
}

// ========== INICIALIZACIÓN AL CARGAR ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM cargado");
  
  // Inicializar datos nuevamente por si acaso
  inicializarDatos();
  
  // Mostrar credenciales demo solo en desarrollo
  if (esMiDispositivo()) {
    const demoCreds = document.getElementById('demoCredentials');
    if (demoCreds) demoCreds.style.display = 'block';
    // Auto-completar credenciales en desarrollo
    const loginUser = document.getElementById('loginUser');
    const loginPass = document.getElementById('loginPass');
    if (loginUser) loginUser.value = 'root';
    if (loginPass) loginPass.value = 'toor';
  }
  
  // Si hay usuario activo, mostrar menú principal
  if (usuarioActivo) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('menu').style.display = 'flex';
    configurarVisibilidadPorRol();
    renderMenuHeader();
  }
  
  // Configurar búsquedas en tiempo real
  document.getElementById('buscarAlumno')?.addEventListener('input', mostrarAlumnos);
  document.getElementById('buscarPadre')?.addEventListener('input', mostrarPadres);
  document.getElementById('buscarGrupo')?.addEventListener('input', mostrarGrupos);
  document.getElementById('buscarReunion')?.addEventListener('input', mostrarReuniones);
  document.getElementById('buscarPago')?.addEventListener('input', mostrarPagos);
  document.getElementById('buscarUsuario')?.addEventListener('input', mostrarUsuarios);
  
  // Permitir login con Enter
  document.getElementById('loginUser')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  document.getElementById('loginPass')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
  });
  
  console.log("Sistema inicializado correctamente");
});
