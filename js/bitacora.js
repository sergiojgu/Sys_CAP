// ========== BITÁCORA ==========
function mostrarBitacora() {
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

async function limpiarBitacora() {
    if (!usuarioActivo || (!ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol) && !ROLE_ALIASES.SUPER.includes(usuarioActivo.rol))) {
        mostrarNotificacion('❌ No tienes permisos para limpiar la bitácora');
        return;
    }
    
    if (confirm('¿Estás seguro de que deseas limpiar toda la bitácora? Esta acción no se puede deshacer.')) {
        bitacora = [];
        registrarAccion('Limpio toda la bitácora');
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarBitacora();
        mostrarNotificacion('✅ Bitácora limpiada correctamente');
    }
}

async function eliminarRegistroBitacora(index) {
    if (!usuarioActivo || (!ROLE_ALIASES.ADMIN.includes(usuarioActivo.rol) && !ROLE_ALIASES.SUPER.includes(usuarioActivo.rol))) {
        mostrarNotificacion('❌ No tienes permisos para eliminar registros de la bitácora');
        return;
    }
    
    const registro = bitacora[index];
    if (confirm(`¿Estás seguro de eliminar este registro: "${registro.texto}"?`)) {
        bitacora.splice(index, 1);
        registrarAccion(`Eliminó registro de bitácora: ${registro.texto.substring(0, 50)}...`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarBitacora();
        mostrarNotificacion('✅ Registro eliminado correctamente');
    }
                                                             }
