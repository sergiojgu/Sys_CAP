// ========== GRUPOS ==========
function mostrarGrupos() {
    const cont = document.getElementById('listaGrupos');
    if (!cont) return;
    
    const q = document.getElementById('buscarGrupo')?.value?.toLowerCase() || '';
    cont.innerHTML = '';
    
    // Filtrar grupos según permisos del usuario
    let gruposFiltrados = grupos.filter(g => 
        g.nombre.toLowerCase().includes(q) && 
        (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
         usuarioActivo.grado === 'Todos' || 
         g.grado === usuarioActivo.grado)
    );
    
    if (gruposFiltrados.length === 0) {
        cont.innerHTML = '<div class="item">No se encontraron grupos</div>';
        return;
    }
    
    gruposFiltrados.forEach((g, i) => {
        const div = document.createElement('div');
        div.className = 'item';
        
        // Contar alumnos en este grupo
        const alumnosEnGrupo = alumnos.filter(a => a.grado === g.grado);
        // Contar padres en este grupo
        const padresEnGrupo = padres.filter(p => p.grupo === g.grado);
        
        div.innerHTML = `
            <b>${g.nombre}</b><br>
            🎓 Grado: ${g.grado}<br>
            📝 Descripción: ${g.descripcion || '—'}<br>
            👥 Estadísticas: ${alumnosEnGrupo.length} alumnos, ${padresEnGrupo.length} padres
        `;
        
        // Botones de acción (solo para usuarios con permisos)
        if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
            const acciones = document.createElement('div');
            acciones.className = 'item-actions';
            
            const btnEdit = document.createElement('button');
            btnEdit.textContent = 'Editar';
            btnEdit.className = 'btn-edit';
            btnEdit.onclick = () => editarGrupo(i);
            acciones.appendChild(btnEdit);
            
            // Solo permitir eliminar si no hay alumnos o padres asociados
            if (alumnosEnGrupo.length === 0 && padresEnGrupo.length === 0) {
                const btnDelete = document.createElement('button');
                btnDelete.textContent = 'Eliminar';
                btnDelete.className = 'btn-delete';
                btnDelete.onclick = () => eliminarGrupo(i);
                acciones.appendChild(btnDelete);
            }
            
            div.appendChild(acciones);
        }
        
        cont.appendChild(div);
    });
}

function cargarGradosGrupoSelect(selectElement = null) {
    const select = selectElement || document.getElementById('gradoGrupo');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar grado</option>';
    
    // Si es superusuario, mostrar todos los grados
    if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol)) {
        const optTodos = document.createElement('option');
        optTodos.value = 'Todos';
        optTodos.textContent = 'Todos';
        select.appendChild(optTodos);
    }
    
    // Agregar grados de PRIMARIA
    const optGroupPrimaria = document.createElement('optgroup');
    optGroupPrimaria.label = 'PRIMARIA';
    select.appendChild(optGroupPrimaria);
    
    const gradosPrimaria = [
        '1° A', '1° B', '2° A', '2° B', '3° A', '3° B', 
        '4° A', '4° B', '5° A', '5° B', '6° A', '6° B'
    ];
    
    gradosPrimaria.forEach(grado => {
        if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
            usuarioActivo.grado === 'Todos' || 
            usuarioActivo.grado === grado) {
            const opt = document.createElement('option');
            opt.value = grado;
            opt.textContent = grado;
            optGroupPrimaria.appendChild(opt);
        }
    });
    
    // Agregar grados de SECUNDARIA
    const optGroupSecundaria = document.createElement('optgroup');
    optGroupSecundaria.label = 'SECUNDARIA';
    select.appendChild(optGroupSecundaria);
    
    const gradosSecundaria = [
        '1° A Sec.', '1° B Sec.', '2° A Sec.', '2° B Sec.', 
        '3° A Sec.', '3° B Sec.', '4° A Sec.', '4° B Sec.'
    ];
    
    gradosSecundaria.forEach(grado => {
        if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
            usuarioActivo.grado === 'Todos' || 
            usuarioActivo.grado === grado) {
            const opt = document.createElement('option');
            opt.value = grado;
            opt.textContent = grado;
            optGroupSecundaria.appendChild(opt);
        }
    });
    
    // Agregar grados de PROMOCIONES
    const optGroupPromo = document.createElement('optgroup');
    optGroupPromo.label = 'PROMOCIONES';
    select.appendChild(optGroupPromo);
    
    const gradosPromo = [
        'Pre Promo A', 'Pre Promo B', 'Promo A', 'Promo B'
    ];
    
    gradosPromo.forEach(grado => {
        if (ROLE_ALIASES.SUPER.includes(usuarioActivo.rol) || 
            usuarioActivo.grado === 'Todos' || 
            usuarioActivo.grado === grado) {
            const opt = document.createElement('option');
            opt.value = grado;
            opt.textContent = grado;
            optGroupPromo.appendChild(opt);
        }
    });
}

async function guardarGrupo() {
    const nombre = document.getElementById('nombreGrupo').value.trim();
    const descripcion = document.getElementById('descripcionGrupo').value.trim();
    const grado = document.getElementById('gradoGrupo').value;
    
    if (!nombre || !grado) {
        return mostrarNotificacion('❌ Complete todos los campos obligatorios');
    }
    
    if (editandoIndex !== -1 && moduloEditando === 'grupos') {
        // Edición de grupo existente
        grupos[editandoIndex] = {
            ...grupos[editandoIndex],
            nombre,
            descripcion,
            grado
        };
        registrarAccion(`Editó grupo: ${nombre}`);
        mostrarNotificacion('✅ Grupo actualizado correctamente');
    } else {
        // Nuevo grupo
        const nuevoGrupo = {
            id: Date.now().toString(),
            nombre,
            descripcion,
            grado,
            fechaCreacion: new Date().toLocaleString()
        };
        
        grupos.push(nuevoGrupo);
        registrarAccion(`Nuevo grupo: ${nombre}`);
        mostrarNotificacion('✅ Grupo creado correctamente');
    }
    
    // GUARDAR EN GITHUB
    await guardarDatos();
    
    mostrarGrupos();
    cancelarEdicionGrupo();
}

function editarGrupo(index) {
    const g = grupos[index];
    
    document.getElementById('nombreGrupo').value = g.nombre || '';
    document.getElementById('descripcionGrupo').value = g.descripcion || '';
    
    // Cargar grados en el select
    cargarGradosGrupoSelect();
    
    // Seleccionar el grado actual
    document.getElementById('gradoGrupo').value = g.grado;
    
    editandoIndex = index;
    moduloEditando = 'grupos';
    document.getElementById('btnGuardarGrupo').textContent = 'Actualizar';
}

async function eliminarGrupo(index) {
    const g = grupos[index];
    
    // Verificar si hay alumnos o padres asociados
    const alumnosEnGrupo = alumnos.filter(a => a.grado === g.grado);
    const padresEnGrupo = padres.filter(p => p.grupo === g.grado);
    
    if (alumnosEnGrupo.length > 0 || padresEnGrupo.length > 0) {
        mostrarNotificacion('❌ No se puede eliminar, hay alumnos o padres asociados');
        return;
    }
    
    if (confirm(`¿Eliminar grupo ${g.nombre}?`)) {
        grupos.splice(index, 1);
        registrarAccion(`Eliminó grupo: ${g.nombre}`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarGrupos();
        mostrarNotificacion('✅ Grupo eliminado');
    }
}

function cancelarEdicionGrupo() {
    document.getElementById('nombreGrupo').value = '';
    document.getElementById('descripcionGrupo').value = '';
    document.getElementById('gradoGrupo').value = '';
    
    editandoIndex = -1;
    moduloEditando = '';
    document.getElementById('btnGuardarGrupo').textContent = 'Guardar';
                             }
