// ========== REUNIONES ==========
function guardarReunion(){
  console.log("🔧 guardarReunion() ejecutándose");
  
  if(usuarioActivo && ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
    mostrarNotificacion('Sin permiso para guardar');
    return;
  }
  
  const titulo = document.getElementById('tituloReunion').value.trim();
  const fecha = document.getElementById('fechaReunion').value;
  const hora = document.getElementById('horaReunion').value;
  const observaciones = document.getElementById('observacionesReunion').value.trim();
  const grupoSeleccionado = document.getElementById('grupoReunion').value;
  
  console.log("📝 Datos capturados:", { titulo, fecha, hora, grupoSeleccionado });
  
  if(!titulo || !fecha || !grupoSeleccionado) {
    mostrarNotificacion('❌ Título, fecha y grupo son obligatorios');
    return;
  }
  
  // Obtener el grado del grupo seleccionado
  let grado = '';
  if (grupoSeleccionado === 'todos') {
    grado = usuarioActivo.grado; // Para "todos los padres", usar el grado del usuario
  } else {
    const grupoObj = grupos.find(g => g.nombre === grupoSeleccionado);
    grado = grupoObj ? grupoObj.grado : usuarioActivo.grado;
  }
  
  console.log("🎓 Grado asignado a la reunión:", grado);
  
  // Obtener padres seleccionados
  const padresPresentes = [];
  document.querySelectorAll('#listaPadresCheck input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.checked) {
      padresPresentes.push(checkbox.value);
    }
  });
  
  console.log("👥 Padres seleccionados:", padresPresentes);
  
  if (editandoIndex !== -1 && moduloEditando === 'reuniones') {
    console.log("✏️ Editando reunión existente, índice:", editandoIndex);
    reuniones[editandoIndex] = { titulo, fecha, hora, observaciones, grupo: grupoSeleccionado, grado, padresPresentes };
    registrarAccion(`Editó reunión: ${titulo} (${grupoSeleccionado})`);
    mostrarNotificacion('✅ Reunión actualizada correctamente');
    editandoIndex = -1;
    moduloEditando = '';
  } else {
    console.log("➕ Creando nueva reunión");
    reuniones.push({ titulo, fecha, hora, observaciones, grupo: grupoSeleccionado, grado, padresPresentes });
    registrarAccion(`Nueva reunión: ${titulo} (${grupoSeleccionado})`);
    mostrarNotificacion('✅ Reunión agregada correctamente');
  }
  
  console.log("💾 Reuniones después de guardar:", reuniones);
  
  guardarDatos();
  mostrarReuniones();
  limpiarFormularioReunion();
}

function limpiarFormularioReunion() {
  document.getElementById('tituloReunion').value = '';
  document.getElementById('fechaReunion').value = '';
  document.getElementById('horaReunion').value = '';
  document.getElementById('observacionesReunion').value = '';
  document.getElementById('grupoReunion').value = '';
  
  // Limpiar checkboxes
  document.querySelectorAll('#listaPadresCheck input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  editandoIndex = -1;
  moduloEditando = '';
  document.getElementById('btnGuardarReunion').textContent = 'Guardar';
}

function mostrarReuniones(){
  console.log("👀 mostrarReuniones() ejecutándose");
  const cont = document.getElementById('listaReuniones');
  if (!cont) {
    console.log("❌ No se encontró listaReuniones");
    return;
  }
  
  const q = document.getElementById('buscarReunion')?.value?.toLowerCase() || '';
  console.log("🔍 Búsqueda:", q);
  console.log("📋 Todas las reuniones en localStorage:", reuniones);
  console.log("👤 Usuario activo:", usuarioActivo);
  
  cont.innerHTML = '';
  
  const reunionesFiltradas = reuniones.filter(r => {
    console.log("🔎 Analizando reunión:", r);
    
    if (!r || !r.titulo) {
      console.log("❌ Reunión inválida o sin título");
      return false;
    }
    
    const tieneTitulo = r.titulo.toLowerCase().includes(q);
    const perteneceAlGrado = perteneceAGrado(r.grado); // ← CAMBIADO: usar r.grado en lugar de r.grupo
    
    console.log(`📊 Filtros - Título: ${tieneTitulo}, Grado: ${perteneceAlGrado}, Grupo: "${r.grupo}", Grado reunión: "${r.grado}", Grado usuario: "${usuarioActivo?.grado}"`);
    
    return tieneTitulo && perteneceAlGrado;
  });
  
  console.log("🎯 Reuniones filtradas:", reunionesFiltradas);
  
  if (reunionesFiltradas.length === 0) {
    console.log("📭 No hay reuniones para mostrar después del filtrado");
    cont.innerHTML = '<div class="item">No hay reuniones registradas.</div>';
    return;
  }
  
  reunionesFiltradas.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'item';
    
    // Obtener nombres de padres presentes
    let padresTexto = 'Sin padres invitados';
    if (r.padresPresentes && r.padresPresentes.length > 0) {
      const nombresPadres = r.padresPresentes.map(id => {
        const padre = padres.find(p => p.nombre === id);
        return padre ? padre.nombre : 'Desconocido';
      });
      padresTexto = `Padres presentes: ${nombresPadres.join(', ')}`;
    }
    
    div.innerHTML = `
      <b>${r.titulo}</b> (${r.grupo}) - Grado: ${r.grado}<br>
      Fecha: ${r.fecha} ${r.hora || ''}<br>
      Observaciones: ${r.observaciones || '—'}<br>
      ${padresTexto}
      <div class="item-actions">
        <button class="btn-edit" onclick="editarReunion(${i})">Editar</button>
        <button class="btn-delete" onclick="eliminarReunion(${i})">Eliminar</button>
      </div>
    `;
    
    cont.appendChild(div);
  });
  
  console.log("✅ Reuniones mostradas correctamente");
}

function editarReunion(index) {
  console.log("✏️ Editando reunión en índice:", index);
  const r = reuniones[index];
  document.getElementById('tituloReunion').value = r.titulo;
  document.getElementById('fechaReunion').value = r.fecha;
  document.getElementById('horaReunion').value = r.hora || '';
  document.getElementById('observacionesReunion').value = r.observaciones || '';
  document.getElementById('grupoReunion').value = r.grupo;
  
  // Cargar padres del grupo seleccionado
  cargarPadresCheck(r.grupo);
  
  // Marcar checkboxes de padres presentes
  setTimeout(() => {
    document.querySelectorAll('#listaPadresCheck input[type="checkbox"]').forEach(cb => {
      cb.checked = r.padresPresentes?.includes(cb.value) || false;
    });
  }, 100);
  
  editandoIndex = index;
  moduloEditando = 'reuniones';
  document.getElementById('btnGuardarReunion').textContent = 'Actualizar';
  document.getElementById('tituloReunion').focus();
}

function eliminarReunion(index) {
  console.log("🗑️ Eliminando reunión en índice:", index);
  if (confirm(`¿Eliminar reunión ${reuniones[index].titulo}?`)) {
    const titulo = reuniones[index].titulo;
    reuniones.splice(index, 1);
    registrarAccion(`Eliminó reunión: ${titulo}`);
    guardarDatos();
    mostrarReuniones();
    mostrarNotificacion('✅ Reunión eliminada');
  }
}

function cargarGrupoReunionSelect() {
  console.log("📋 cargarGrupoReunionSelect() ejecutándose");
  const select = document.getElementById('grupoReunion');
  if (!select) {
    console.log("❌ No se encontró grupoReunion select");
    return;
  }
  
  select.innerHTML = '<option value="">Seleccionar grupo</option>';
  
  // Agregar opción "Todos los padres"
  const optTodos = document.createElement('option');
  optTodos.value = 'todos';
  optTodos.textContent = '🎯 TODOS LOS PADRES';
  select.appendChild(optTodos);
  
  // Filtrar grupos por grado del usuario
  const gruposFiltrados = grupos.filter(g => 
    ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
    usuarioActivo.grado === 'Todos' || 
    g.grado === usuarioActivo.grado
  );
  
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
  
  // Event listener para cargar padres cuando se selecciona un grupo
  select.addEventListener('change', function() {
    const grupoSeleccionado = this.value;
    cargarPadresCheck(grupoSeleccionado);
  });
}

function cargarPadresCheck(grupoSeleccionado) {
  console.log("👥 cargarPadresCheck() ejecutándose, grupo:", grupoSeleccionado);
  const cont = document.getElementById('listaPadresCheck');
  if (!cont) {
    console.log("❌ No se encontró listaPadresCheck");
    return;
  }
  
  // LIMPIAR el contenido completamente
  cont.innerHTML = '';
  
  let padresFiltrados = [];
  
  if (grupoSeleccionado === 'todos') {
    // Mostrar todos los padres del grado del usuario
    padresFiltrados = padres.filter(p => 
      ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
      usuarioActivo.grado === 'Todos' || 
      perteneceAGrado(p.grado)
    );
  } else {
    // Mostrar solo padres del grupo seleccionado
    padresFiltrados = padres.filter(p => p.grupo === grupoSeleccionado);
  }
  
  if (padresFiltrados.length === 0) {
    cont.innerHTML = '<div style="color: #666; padding: 10px; text-align: center;">No hay padres registrados para este grupo</div>';
    return;
  }
  
  // Agrupar padres por grado para mejor organización
  const padresPorGrado = {};
  padresFiltrados.forEach(padre => {
    if (!padresPorGrado[padre.grado]) {
      padresPorGrado[padre.grado] = [];
    }
    padresPorGrado[padre.grado].push(padre);
  });
  
  // Crear secciones por grado
  Object.keys(padresPorGrado).sort().forEach(grado => {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';
    section.style.padding = '10px';
    section.style.backgroundColor = '#f8f9fa';
    section.style.borderRadius = '8px';
    
    const tituloGrado = document.createElement('h5');
    tituloGrado.textContent = `Grado ${grado}`;
    tituloGrado.style.margin = '0 0 10px 0';
    tituloGrado.style.color = '#333';
    section.appendChild(tituloGrado);
    
    padresPorGrado[grado].forEach(padre => {
      const divPadre = document.createElement('div');
      divPadre.style.display = 'flex';
      divPadre.style.alignItems = 'center';
      divPadre.style.margin = '5px 0';
      divPadre.style.padding = '5px';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = padre.nombre;
      checkbox.id = `padre-${padre.nombre.replace(/\s+/g, '-')}`;
      checkbox.style.marginRight = '10px';
      checkbox.style.transform = 'scale(1.2)';
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = `${padre.nombre} - ${padre.telefono || 'Sin teléfono'}`;
      label.style.cursor = 'pointer';
      label.style.flex = '1';
      
      divPadre.appendChild(checkbox);
      divPadre.appendChild(label);
      section.appendChild(divPadre);
    });
    
    cont.appendChild(section);
  });
  
  // Agregar botón "Seleccionar todos"
  const divBotones = document.createElement('div');
  divBotones.style.marginTop = '15px';
  divBotones.style.textAlign = 'center';
  
  const btnSeleccionarTodos = document.createElement('button');
  btnSeleccionarTodos.textContent = '✅ Seleccionar todos';
  btnSeleccionarTodos.className = 'form-btn';
  btnSeleccionarTodos.style.marginRight = '10px';
  btnSeleccionarTodos.onclick = () => {
    document.querySelectorAll('#listaPadresCheck input[type="checkbox"]').forEach(cb => {
      cb.checked = true;
    });
  };
  
  const btnDeseleccionarTodos = document.createElement('button');
  btnDeseleccionarTodos.textContent = '❌ Deseleccionar todos';
  btnDeseleccionarTodos.className = 'form-btn';
  btnDeseleccionarTodos.onclick = () => {
    document.querySelectorAll('#listaPadresCheck input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
  };
  
  divBotones.appendChild(btnSeleccionarTodos);
  divBotones.appendChild(btnDeseleccionarTodos);
  cont.appendChild(divBotones);
}

// Función para migrar reuniones existentes
function migrarReunionesExistentes() {
  console.log("🔄 Migrando reuniones existentes...");
  let migradas = 0;
  
  reuniones.forEach(r => {
    if (r.grupo && !r.grado) {
      // Buscar el grado del grupo
      const grupoObj = grupos.find(g => g.nombre === r.grupo);
      if (grupoObj) {
        r.grado = grupoObj.grado;
        migradas++;
      }
    }
  });
  
  if (migradas > 0) {
    guardarDatos();
    console.log(`✅ Migradas ${migradas} reuniones`);
  } else {
    console.log("✅ No hay reuniones que migrar");
  }
}

// Ejecutar migración al cargar el módulo
migrarReunionesExistentes();
