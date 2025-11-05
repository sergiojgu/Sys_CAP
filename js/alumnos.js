// ========== ALUMNOS ==========
function mostrarAlumnos() {
    const cont = document.getElementById('listaAlumnos');
    if (!cont) return;
    
    const q = document.getElementById('buscarAlumno')?.value?.toLowerCase() || '';
    cont.innerHTML = '';
    
    // Filtrar alumnos según permisos del usuario
    let alumnosFiltrados = alumnos.filter(a => 
        a.nombre.toLowerCase().includes(q) && perteneceAGrado(a.grado)
    );
    
    if (alumnosFiltrados.length === 0) {
        cont.innerHTML = '<div class="item">No se encontraron alumnos</div>';
        return;
    }
    
    alumnosFiltrados.forEach((a, i) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        let padreInfo = '';
        if (a.padreId) {
            const padre = padres.find(p => p.id === a.padreId);
            if (padre) {
                padreInfo = `<br>👨‍👦 Padre/Tutor: ${padre.nombre}`;
            }
        }
        
        div.innerHTML = `
            <b>${a.nombre}</b>${padreInfo}<br>
            🎓 Grado: ${a.grado}<br>
            💬 Comentarios: ${a.comentarios || '—'}
        `;
        
        // Botones de acción (solo para usuarios con permisos)
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

function cargarPadresSelect() {
    const select = document.getElementById('padreAlumno');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar padre/tutor</option>';
    
    // Filtrar padres según permisos del usuario
    const padresFiltrados = padres.filter(p => perteneceAGrado(p.grupo));
    
    padresFiltrados.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} (${p.telefono})`;
        select.appendChild(opt);
    });
}

async function guardarAlumno() {
    const nombre = document.getElementById('nombreAlumno').value.trim();
    const padreId = document.getElementById('padreAlumno').value;
    const comentarios = document.getElementById('comentariosAlumno').value.trim();
    
    if (!nombre) {
        return mostrarNotificacion('❌ El nombre es obligatorio');
    }
    
    // Determinar el grado basado en el padre seleccionado o el grado del usuario
    let grado = usuarioActivo?.grado;
    if (padreId) {
        const padre = padres.find(p => p.id === padreId);
        if (padre) {
            grado = padre.grupo;
        }
    }
    
    if (!grado) {
        return mostrarNotificacion('❌ No se puede determinar el grado del alumno');
    }
    
    if (editandoIndex !== -1 && moduloEditando === 'alumnos') {
        // Edición de alumno existente
        alumnos[editandoIndex] = {
            ...alumnos[editandoIndex],
            nombre,
            padreId: padreId || null,
            comentarios,
            grado
        };
        registrarAccion(`Editó alumno: ${nombre}`);
        mostrarNotificacion('✅ Alumno actualizado correctamente');
    } else {
        // Nuevo alumno
        const nuevoAlumno = {
            id: Date.now().toString(),
            nombre,
            padreId: padreId || null,
            comentarios,
            grado,
            fechaCreacion: new Date().toLocaleString()
        };
        
        alumnos.push(nuevoAlumno);
        registrarAccion(`Nuevo alumno: ${nombre}`);
        mostrarNotificacion('✅ Alumno creado correctamente');
    }
    
    // GUARDAR EN GITHUB
    await guardarDatos();
    
    mostrarAlumnos();
    cancelarEdicionAlumno();
}

function editarAlumno(index) {
    const a = alumnos[index];
    
    document.getElementById('nombreAlumno').value = a.nombre || '';
    document.getElementById('comentariosAlumno').value = a.comentarios || '';
    
    // Cargar padres en el select
    cargarPadresSelect();
    
    // Seleccionar el padre actual si existe
    if (a.padreId) {
        document.getElementById('padreAlumno').value = a.padreId;
    }
    
    editandoIndex = index;
    moduloEditando = 'alumnos';
    document.getElementById('btnGuardarAlumno').textContent = 'Actualizar';
}

async function eliminarAlumno(index) {
    const a = alumnos[index];
    
    if (confirm(`¿Eliminar alumno ${a.nombre}?`)) {
        alumnos.splice(index, 1);
        registrarAccion(`Eliminó alumno: ${a.nombre}`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarAlumnos();
        mostrarNotificacion('✅ Alumno eliminado');
    }
}

function cancelarEdicionAlumno() {
    document.getElementById('nombreAlumno').value = '';
    document.getElementById('padreAlumno').value = '';
    document.getElementById('comentariosAlumno').value = '';
    
    editandoIndex = -1;
    moduloEditando = '';
    document.getElementById('btnGuardarAlumno').textContent = 'Guardar';
}
