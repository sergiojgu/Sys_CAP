function guardarAlumno(){
  if(usuarioActivo && ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) return mostrarNotificacion('Sin permiso para guardar');
  
  const nombre = document.getElementById('nombreAlumno').value.trim();
  const padre = document.getElementById('padreAlumno').value;
  const grado = (usuarioActivo && usuarioActivo.grado && !ROLE_ALIASES.SUPER.includes(usuarioActivo.rol)) ? usuarioActivo.grado : 'Todos';
  const comentarios = document.getElementById('comentariosAlumno').value.trim();
  
  if(!nombre) return mostrarNotificacion('Completar campos obligatorios');
  
  if (editandoIndex !== -1 && moduloEditando === 'alumnos') {
    alumnos[editandoIndex] = { nombre, padre, grado, comentarios };
    registrarAccion(`Editó alumno: ${nombre} (${grado})`);
    mostrarNotificacion('✅ Alumno actualizado correctamente');
    editandoIndex = -1;
    moduloEditando = '';
  } else {
    alumnos.push({ nombre, padre, grado, comentarios });
    registrarAccion(`Nuevo alumno: ${nombre} (${grado})`);
    mostrarNotificacion('✅ Alumno agregado correctamente');
  }
  
  guardarDatos();
  mostrarAlumnos();
  limpiarFormularioAlumno();
}

function limpiarFormularioAlumno() {
  document.getElementById('nombreAlumno').value = '';
  document.getElementById('padreAlumno').value = '';
  document.getElementById('comentariosAlumno').value = '';
}

function mostrarAlumnos(){
  const cont = document.getElementById('listaAlumnos');
  if (!cont) return;
  
  const q = document.getElementById('buscarAlumno')?.value?.toLowerCase() || '';
  cont.innerHTML = '';
  
  alumnos.filter(a => a.nombre.toLowerCase().includes(q) && perteneceAGrado(a.grado))
    .forEach((a, i) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<b>${a.nombre}</b> (${a.grado})<br>Padre: ${a.padre || '—'}<br>Comentarios: ${a.comentarios || '—'}`;
      
      if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
        const acciones = document.createElement('div');
        acciones.className = 'item-actions';
        
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        btnEdit.className = 'btn-edit';
        btnEdit.onclick = () => editarAlumno(i);
        acciones.appendChild(btnEdit);
        
        const btnDelete = document.createElement('button');
        btnDelete.textContent = 'Eliminar';
        btnDelete.className = 'btn-delete';
        btnDelete.onclick = () => eliminarAlumno(i);
        acciones.appendChild(btnDelete);
        
        div.appendChild(acciones);
      }
      
      cont.appendChild(div);
    });
}

function editarAlumno(index) {
  const a = alumnos[index];
  document.getElementById('nombreAlumno').value = a.nombre;
  document.getElementById('padreAlumno').value = a.padre || '';
  document.getElementById('comentariosAlumno').value = a.comentarios || '';
  
  editandoIndex = index;
  moduloEditando = 'alumnos';
  document.getElementById('btnGuardarAlumno').textContent = 'Actualizar';
  document.getElementById('nombreAlumno').focus();
}

function eliminarAlumno(index) {
  if (confirm(`¿Eliminar a ${alumnos[index].nombre}?`)) {
    const nombre = alumnos[index].nombre;
    alumnos.splice(index, 1);
    registrarAccion(`Eliminó alumno: ${nombre}`);
    guardarDatos();
    mostrarAlumnos();
    mostrarNotificacion('✅ Alumno eliminado');
  }
}

function cargarPadresSelect() {
  const select = document.getElementById('padreAlumno');
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccionar padre/tutor</option>';
  
  padres.filter(p => perteneceAGrado(p.grupo))
    .forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nombre;
      opt.textContent = p.nombre;
      select.appendChild(opt);
    });
}
