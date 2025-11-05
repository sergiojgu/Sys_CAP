// ========== REUNIONES ==========
function mostrarReuniones() {
    const cont = document.getElementById('listaReuniones');
    if (!cont) return;
    
    const q = document.getElementById('buscarReunion')?.value?.toLowerCase() || '';
    cont.innerHTML = '';
    
    // Filtrar reuniones según permisos del usuario
    let reunionesFiltradas = reuniones.filter(r => 
        r.titulo.toLowerCase().includes(q) && perteneceAGrado(r.grupo)
    );
    
    if (reunionesFiltradas.length === 0) {
        cont.innerHTML = '<div class="item">No se encontraron reuniones</div>';
        return;
    }
    
    reunionesFiltradas.forEach((r, i) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        // Contar padres presentes
        const padresPresentesCount = r.padresPresentes ? r.padresPresentes.length : 0;
        
        div.innerHTML = `
            <b>${r.titulo}</b><br>
            📅 Fecha: ${r.fecha} ${r.hora || ''}<br>
            🎓 Grupo: ${r.grupo}<br>
            👥 Padres presentes: ${padresPresentesCount}<br>
            📝 Observaciones: ${r.observaciones || '—'}
        `;
        
        // Botones de acción (solo para usuarios con permisos)
        if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
            const acciones = document.createElement('div');
            acciones.className = 'item-actions';
            
            const btnEdit = document.createElement('button');
            btnEdit.textContent = 'Editar';
            btnEdit.className = 'btn-edit';
            btnEdit.onclick = () => editarReunion(i);
            acciones.appendChild(btnEdit);
            
            const btnDelete = document.createElement('button');
            btnDelete.textContent = 'Eliminar';
            btnDelete.className = 'btn-delete';
            btnDelete.onclick = () => eliminarReunion(i);
            acciones.appendChild(btnDelete);
            
            div.appendChild(acciones);
        }
        
        cont.appendChild(div);
    });
}

function cargarGrupoReunionSelect() {
    const select = document.getElementById('grupoReunion');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar grupo</option>';
    
    // Cargar grupos según permisos del usuario
    cargarGradosGrupoSelect(select);
}

function cargarPadresCheck() {
    const cont = document.getElementById('listaPadresCheck');
    if (!cont) return;
    
    cont.innerHTML = '';
    
    const grupoSeleccionado = document.getElementById('grupoReunion').value;
    if (!grupoSeleccionado) return;
    
    // Filtrar padres del grupo seleccionado
    const padresGrupo = padres.filter(p => p.grupo === grupoSeleccionado);
    
    if (padresGrupo.length === 0) {
        cont.innerHTML = '<div class="item">No hay padres en este grupo</div>';
        return;
    }
    
    padresGrupo.forEach(p => {
        const div = document.createElement('div');
        div.style.margin = '5px 0';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `padre_${p.id}`;
        checkbox.value = p.id;
        checkbox.style.marginRight = '8px';
        
        const label = document.createElement('label');
        label.htmlFor = `padre_${p.id}`;
        label.textContent = `${p.nombre} (${p.telefono})`;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        cont.appendChild(div);
    });
}

async function guardarReunion() {
    const titulo = document.getElementById('tituloReunion').value.trim();
    const fecha = document.getElementById('fechaReunion').value;
    const hora = document.getElementById('horaReunion').value;
    const observaciones = document.getElementById('observacionesReunion').value.trim();
    const grupo = document.getElementById('grupoReunion').value;
    
    if (!titulo || !fecha || !grupo) {
        return mostrarNotificacion('❌ Complete todos los campos obligatorios');
    }
    
    // Obtener padres presentes
    const padresPresentes = [];
    const checkboxes = document.querySelectorAll('#listaPadresCheck input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            padresPresentes.push(checkbox.value);
        }
    });
    
    if (editandoIndex !== -1 && moduloEditando === 'reuniones') {
        // Edición de reunión existente
        reuniones[editandoIndex] = {
            ...reuniones[editandoIndex],
            titulo,
            fecha,
            hora,
            observaciones,
            grupo,
            padresPresentes
        };
        registrarAccion(`Editó reunión: ${titulo}`);
        mostrarNotificacion('✅ Reunión actualizada correctamente');
    } else {
        // Nueva reunión
        const nuevaReunion = {
            id: Date.now().toString(),
            titulo,
            fecha,
            hora,
            observaciones,
            grupo,
            padresPresentes,
            fechaCreacion: new Date().toLocaleString()
        };
        
        reuniones.push(nuevaReunion);
        registrarAccion(`Nueva reunión: ${titulo}`);
        mostrarNotificacion('✅ Reunión creada correctamente');
    }
    
    // GUARDAR EN GITHUB
    await guardarDatos();
    
    mostrarReuniones();
    cancelarEdicionReunion();
}

function editarReunion(index) {
    const r = reuniones[index];
    
    document.getElementById('tituloReunion').value = r.titulo || '';
    document.getElementById('fechaReunion').value = r.fecha || '';
    document.getElementById('horaReunion').value = r.hora || '';
    document.getElementById('observacionesReunion').value = r.observaciones || '';
    
    // Cargar grupos en el select
    cargarGrupoReunionSelect();
    
    // Seleccionar el grupo actual
    document.getElementById('grupoReunion').value = r.grupo;
    
    // Cargar padres y marcar los presentes
    setTimeout(() => {
        cargarPadresCheck();
        
        // Marcar checkboxes de padres presentes
        if (r.padresPresentes) {
            r.padresPresentes.forEach(padreId => {
                const checkbox = document.getElementById(`padre_${padreId}`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    }, 100);
    
    editandoIndex = index;
    moduloEditando = 'reuniones';
    document.getElementById('btnGuardarReunion').textContent = 'Actualizar';
}

async function eliminarReunion(index) {
    const r = reuniones[index];
    
    if (confirm(`¿Eliminar reunión "${r.titulo}"?`)) {
        reuniones.splice(index, 1);
        registrarAccion(`Eliminó reunión: ${r.titulo}`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarReuniones();
        mostrarNotificacion('✅ Reunión eliminada');
    }
}

function cancelarEdicionReunion() {
    document.getElementById('tituloReunion').value = '';
    document.getElementById('fechaReunion').value = '';
    document.getElementById('horaReunion').value = '';
    document.getElementById('observacionesReunion').value = '';
    document.getElementById('grupoReunion').value = '';
    document.getElementById('listaPadresCheck').innerHTML = '';
    
    editandoIndex = -1;
    moduloEditando = '';
    document.getElementById('btnGuardarReunion').textContent = 'Guardar';
}

// Event listener para cargar padres cuando se selecciona un grupo
document.addEventListener('DOMContentLoaded', function() {
    const grupoSelect = document.getElementById('grupoReunion');
    if (grupoSelect) {
        grupoSelect.addEventListener('change', cargarPadresCheck);
    }
});
