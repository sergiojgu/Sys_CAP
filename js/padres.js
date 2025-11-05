// ========== PADRES ==========
function mostrarPadres() {
    const cont = document.getElementById('listaPadres');
    if (!cont) return;
    
    const q = document.getElementById('buscarPadre')?.value?.toLowerCase() || '';
    cont.innerHTML = '';
    
    // Filtrar padres según permisos del usuario
    let padresFiltrados = padres.filter(p => 
        p.nombre.toLowerCase().includes(q) && perteneceAGrado(p.grupo)
    );
    
    if (padresFiltrados.length === 0) {
        cont.innerHTML = '<div class="item">No se encontraron padres/tutores</div>';
        return;
    }
    
    padresFiltrados.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        // Contar alumnos asociados
        const alumnosAsociados = alumnos.filter(a => a.padreId === p.id);
        
        div.innerHTML = `
            <b>${p.nombre}</b><br>
            📞 Teléfono: ${p.telefono}<br>
            🎓 Grupo: ${p.grupo}<br>
            👨‍👦 Alumnos: ${alumnosAsociados.length}
        `;
        
        // Botones de acción (solo para usuarios con permisos)
        if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
            const acciones = document.createElement('div');
            acciones.className = 'item-actions';
            
            const btnEdit = document.createElement('button');
            btnEdit.textContent = 'Editar';
            btnEdit.className = 'btn-edit';
            btnEdit.onclick = () => editarPadre(i);
            acciones.appendChild(btnEdit);
            
            const btnDelete = document.createElement('button');
            btnDelete.textContent = 'Eliminar';
            btnDelete.className = 'btn-delete';
            btnDelete.onclick = () => eliminarPadre(i);
            acciones.appendChild(btnDelete);
            
            div.appendChild(acciones);
        }
        
        cont.appendChild(div);
    });
}

function cargarGruposPadreSelect() {
    const select = document.getElementById('grupoPadre');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar grupo</option>';
    
    // Cargar grupos según permisos del usuario
    cargarGradosGrupoSelect(select);
}

async function guardarPadre() {
    const nombre = document.getElementById('nombrePadre').value.trim();
    const telefono = document.getElementById('telefonoPadre').value.trim();
    const grupo = document.getElementById('grupoPadre').value;
    
    if (!nombre || !telefono || !grupo) {
        return mostrarNotificacion('❌ Complete todos los campos obligatorios');
    }
    
    if (editandoIndex !== -1 && moduloEditando === 'padres') {
        // Edición de padre existente
        padres[editandoIndex] = {
            ...padres[editandoIndex],
            nombre,
            telefono,
            grupo
        };
        registrarAccion(`Editó padre/tutor: ${nombre}`);
        mostrarNotificacion('✅ Padre/tutor actualizado correctamente');
    } else {
        // Nuevo padre
        const nuevoPadre = {
            id: Date.now().toString(),
            nombre,
            telefono,
            grupo,
            fechaCreacion: new Date().toLocaleString()
        };
        
        padres.push(nuevoPadre);
        registrarAccion(`Nuevo padre/tutor: ${nombre}`);
        mostrarNotificacion('✅ Padre/tutor creado correctamente');
    }
    
    // GUARDAR EN GITHUB
    await guardarDatos();
    
    mostrarPadres();
    cancelarEdicionPadre();
}

function editarPadre(index) {
    const p = padres[index];
    
    document.getElementById('nombrePadre').value = p.nombre || '';
    document.getElementById('telefonoPadre').value = p.telefono || '';
    
    // Cargar grupos en el select
    cargarGruposPadreSelect();
    
    // Seleccionar el grupo actual
    document.getElementById('grupoPadre').value = p.grupo;
    
    editandoIndex = index;
    moduloEditando = 'padres';
    document.getElementById('btnGuardarPadre').textContent = 'Actualizar';
}

async function eliminarPadre(index) {
    const p = padres[index];
    
    // Verificar si tiene alumnos asociados
    const alumnosAsociados = alumnos.filter(a => a.padreId === p.id);
    
    if (alumnosAsociados.length > 0) {
        mostrarNotificacion('❌ No se puede eliminar, tiene alumnos asociados');
        return;
    }
    
    if (confirm(`¿Eliminar padre/tutor ${p.nombre}?`)) {
        padres.splice(index, 1);
        registrarAccion(`Eliminó padre/tutor: ${p.nombre}`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarPadres();
        mostrarNotificacion('✅ Padre/tutor eliminado');
    }
}

function cancelarEdicionPadre() {
    document.getElementById('nombrePadre').value = '';
    document.getElementById('telefonoPadre').value = '';
    document.getElementById('grupoPadre').value = '';
    
    editandoIndex = -1;
    moduloEditando = '';
    document.getElementById('btnGuardarPadre').textContent = 'Guardar';
                       }
