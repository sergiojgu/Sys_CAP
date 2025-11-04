// ========== PADRES ==========
function guardarPadre(){
  console.log("🔧 guardarPadre() ejecutándose");
  
  if(usuarioActivo && ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
    mostrarNotificacion('Sin permiso para guardar');
    return;
  }
  
  const nombre = document.getElementById('nombrePadre').value.trim();
  const telefono = document.getElementById('telefonoPadre').value.trim();
  const grupoSeleccionado = document.getElementById('grupoPadre').value;
  
  console.log("📝 Datos capturados:", { nombre, telefono, grupoSeleccionado });
  
  if(!nombre || !grupoSeleccionado) {
    mostrarNotificacion('❌ Nombre y grupo son obligatorios');
    return;
  }
  
  // Obtener el grado del grupo seleccionado
  const grupoObj = grupos.find(g => g.nombre === grupoSeleccionado);
  const grado = grupoObj ? grupoObj.grado : usuarioActivo.grado;
  
  console.log("🎓 Grado asignado:", grado);
  
  if (editandoIndex !== -1 && moduloEditando === 'padres') {
    console.log("✏️ Editando padre existente, índice:", editandoIndex);
    // Editar padre existente
    padres[editandoIndex] = { nombre, telefono, grupo: grupoSeleccionado, grado };
    registrarAccion(`Editó padre: ${nombre} (${grupoSeleccionado})`);
    mostrarNotificacion('✅ Padre actualizado correctamente');
    editandoIndex = -1;
    moduloEditando = '';
  } else {
    console.log("➕ Creando nuevo padre");
    // Nuevo padre
    padres.push({ nombre, telefono, grupo: grupoSeleccionado, grado });
    registrarAccion(`Nuevo padre: ${nombre} (${grupoSeleccionado})`);
    mostrarNotificacion('✅ Padre agregado correctamente');
  }
  
  console.log("💾 Padres después de guardar:", padres);
  
  guardarDatos();
  mostrarPadres();
  limpiarFormularioPadre();
}

function limpiarFormularioPadre() {
  document.getElementById('nombrePadre').value = '';
  document.getElementById('telefonoPadre').value = '';
  document.getElementById('grupoPadre').value = '';
  editandoIndex = -1;
  moduloEditando = '';
  document.getElementById('btnGuardarPadre').textContent = 'Guardar';
}

function mostrarPadres(){
  console.log("👀 mostrarPadres() ejecutándose");
  const cont = document.getElementById('listaPadres');
  if (!cont) {
    console.log("❌ No se encontró listaPadres");
    return;
  }
  
  const q = document.getElementById('buscarPadre')?.value?.toLowerCase() || '';
  console.log("🔍 Búsqueda:", q);
  console.log("📋 Todos los padres:", padres);
  console.log("👤 Usuario activo:", usuarioActivo);
  
  cont.innerHTML = '';
  
  // Debug detallado del filtrado
  const padresFiltrados = padres.filter(p => {
    console.log("🔎 Analizando padre:", p);
    
    if (!p || !p.nombre) {
      console.log("❌ Padre inválido o sin nombre");
      return false;
    }
    
    const tieneNombre = p.nombre.toLowerCase().includes(q);
    const perteneceAlGrado = perteneceAGrado(p.grado); // ← CAMBIADO: usar p.grado en lugar de p.grupo
    
    console.log(`📊 Filtros - Nombre: ${tieneNombre}, Grado: ${perteneceAlGrado}, Grado del padre: "${p.grado}", Grado del usuario: "${usuarioActivo?.grado}"`);
    
    return tieneNombre && perteneceAlGrado;
  });
  
  console.log("🎯 Padres filtrados:", padresFiltrados);
  
  if (padresFiltrados.length === 0) {
    console.log("📭 No hay padres para mostrar después del filtrado");
    cont.innerHTML = '<div class="item">No hay padres/tutores registrados.</div>';
    return;
  }
  
  padresFiltrados.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<b>${p.nombre}</b> (${p.grupo}) - Grado: ${p.grado}<br>Teléfono: ${p.telefono || '—'}`;
    
    if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
      const acciones = document.createElement('div');
      acciones.className = 'item-actions';
      
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Editar';
      btnEdit.className = 'btn-edit';
      btnEdit.onclick = () => editarPadre(padres.indexOf(p));
      acciones.appendChild(btnEdit);
      
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Eliminar';
      btnDelete.className = 'btn-delete';
      btnDelete.onclick = () => eliminarPadre(padres.indexOf(p));
      acciones.appendChild(btnDelete);
      
      div.appendChild(acciones);
    }
    
    cont.appendChild(div);
  });
  
  console.log("✅ Padres mostrados correctamente");
}

function editarPadre(index) {
  console.log("✏️ Editando padre en índice:", index);
  if(usuarioActivo && ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
    mostrarNotificacion('Sin permiso para editar');
    return;
  }
  
  const p = padres[index];
  console.log("📝 Datos del padre a editar:", p);
  
  document.getElementById('nombrePadre').value = p.nombre;
  document.getElementById('telefonoPadre').value = p.telefono || '';
  document.getElementById('grupoPadre').value = p.grupo || '';
  
  editandoIndex = index;
  moduloEditando = 'padres';
  document.getElementById('btnGuardarPadre').textContent = 'Actualizar';
  document.getElementById('nombrePadre').focus();
}

function eliminarPadre(index) {
  console.log("🗑️ Eliminando padre en índice:", index);
  if(usuarioActivo && ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
    mostrarNotificacion('Sin permiso para eliminar');
    return;
  }
  
  if (confirm(`¿Eliminar a ${padres[index].nombre}?`)) {
    const nombre = padres[index].nombre;
    padres.splice(index, 1);
    registrarAccion(`Eliminó padre: ${nombre}`);
    guardarDatos();
    mostrarPadres();
    mostrarNotificacion('✅ Padre eliminado');
  }
}

function cargarGruposPadreSelect() {
  console.log("📋 cargarGruposPadreSelect() ejecutándose");
  const select = document.getElementById('grupoPadre');
  if (!select) {
    console.log("❌ No se encontró grupoPadre select");
    return;
  }
  
  select.innerHTML = '<option value="">Seleccionar grupo</option>';
  
  // Filtrar grupos por grado del usuario
  const gruposFiltrados = grupos.filter(g => 
    ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
    usuarioActivo.grado === 'Todos' || 
    g.grado === usuarioActivo.grado
  );
  
  console.log("📊 Grupos disponibles:", gruposFiltrados);
  
  if (gruposFiltrados.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No hay grupos disponibles';
    opt.disabled = true;
    select.appendChild(opt);
    return;
  }
  
  // Agrupar grupos por grado para mejor organización
  const gruposPorGrado = {};
  gruposFiltrados.forEach(grupo => {
    if (!gruposPorGrado[grupo.grado]) {
      gruposPorGrado[grupo.grado] = [];
    }
    gruposPorGrado[grupo.grado].push(grupo);
  });
  
  // Crear optgroups por grado
  Object.keys(gruposPorGrado).sort().forEach(grado => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = `Grado ${grado}`;
    
    gruposPorGrado[grado].forEach(grupo => {
      const opt = document.createElement('option');
      opt.value = grupo.nombre;
      opt.textContent = `${grupo.nombre} - ${grupo.descripcion || 'Sin descripción'}`;
      optgroup.appendChild(opt);
    });
    
    select.appendChild(optgroup);
  });
  
  console.log("✅ Select de grupos cargado");
}

// Función para migrar padres existentes (solo una vez)
function migrarPadresExistente() {
  console.log("🔄 Migrando padres existentes...");
  let migrados = 0;
  
  padres.forEach(p => {
    if (p.grupo && !p.grado) {
      // Buscar el grado del grupo
      const grupoObj = grupos.find(g => g.nombre === p.grupo);
      if (grupoObj) {
        p.grado = grupoObj.grado;
        migrados++;
      }
    }
  });
  
  if (migrados > 0) {
    guardarDatos();
    console.log(`✅ Migrados ${migrados} padres`);
  } else {
    console.log("✅ No hay padres que migrar");
  }
}

// Ejecutar migración al cargar el módulo
migrarPadresExistente();
