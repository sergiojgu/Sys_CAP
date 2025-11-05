// ========== PAGOS ==========
function mostrarPagos() {
    const cont = document.getElementById('listaPagos');
    if (!cont) return;
    
    const q = document.getElementById('buscarPago')?.value?.toLowerCase() || '';
    cont.innerHTML = '';
    
    // Filtrar pagos según permisos del usuario
    let pagosFiltrados = pagos.filter(p => {
        const padre = padres.find(pa => pa.id === p.padreId);
        return padre && padre.nombre.toLowerCase().includes(q) && perteneceAGrado(p.grupo);
    });
    
    if (pagosFiltrados.length === 0) {
        cont.innerHTML = '<div class="item">No se encontraron pagos</div>';
        return;
    }
    
    pagosFiltrados.forEach((p, i) => {
        const padre = padres.find(pa => pa.id === p.padreId);
        if (!padre) return;
        
        const div = document.createElement('div');
        div.className = 'item';
        
        div.innerHTML = `
            <b>${padre.nombre}</b><br>
            💰 Monto: Bs ${p.monto}<br>
            📅 Fecha: ${p.fecha}<br>
            📝 Concepto: ${p.concepto}<br>
            🎓 Grupo: ${p.grupo}
        `;
        
        // Botones de acción (solo para usuarios con permisos)
        if (usuarioActivo && !ROLE_ALIASES.VISIT.includes(usuarioActivo.rol)) {
            const acciones = document.createElement('div');
            acciones.className = 'item-actions';
            
            const btnEdit = document.createElement('button');
            btnEdit.textContent = 'Editar';
            btnEdit.className = 'btn-edit';
            btnEdit.onclick = () => editarPago(i);
            acciones.appendChild(btnEdit);
            
            const btnDelete = document.createElement('button');
            btnDelete.textContent = 'Eliminar';
            btnDelete.className = 'btn-delete';
            btnDelete.onclick = () => eliminarPago(i);
            acciones.appendChild(btnDelete);
            
            div.appendChild(acciones);
        }
        
        cont.appendChild(div);
    });
}

function cargarPadresPagoSelect() {
    const select = document.getElementById('padrePago');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar padre</option>';
    
    // Filtrar padres según permisos del usuario
    const padresFiltrados = padres.filter(p => perteneceAGrado(p.grupo));
    
    padresFiltrados.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.nombre} (${p.grupo})`;
        select.appendChild(opt);
    });
}

async function guardarPago() {
    const padreId = document.getElementById('padrePago').value;
    const monto = parseFloat(document.getElementById('montoPago').value);
    const fecha = document.getElementById('fechaPago').value;
    const concepto = document.getElementById('conceptoPago').value.trim();
    
    if (!padreId || !monto || !fecha || !concepto) {
        return mostrarNotificacion('❌ Complete todos los campos obligatorios');
    }
    
    if (monto <= 0) {
        return mostrarNotificacion('❌ El monto debe ser mayor a 0');
    }
    
    const padre = padres.find(p => p.id === padreId);
    if (!padre) {
        return mostrarNotificacion('❌ Padre no encontrado');
    }
    
    if (editandoIndex !== -1 && moduloEditando === 'pagos') {
        // Edición de pago existente
        pagos[editandoIndex] = {
            ...pagos[editandoIndex],
            padreId,
            monto,
            fecha,
            concepto,
            grupo: padre.grupo
        };
        registrarAccion(`Editó pago: ${concepto} - Bs ${monto}`);
        mostrarNotificacion('✅ Pago actualizado correctamente');
    } else {
        // Nuevo pago
        const nuevoPago = {
            id: Date.now().toString(),
            padreId,
            monto,
            fecha,
            concepto,
            grupo: padre.grupo,
            fechaCreacion: new Date().toLocaleString()
        };
        
        pagos.push(nuevoPago);
        registrarAccion(`Nuevo pago: ${concepto} - Bs ${monto}`);
        mostrarNotificacion('✅ Pago registrado correctamente');
    }
    
    // GUARDAR EN GITHUB
    await guardarDatos();
    
    mostrarPagos();
    cancelarEdicionPago();
}

function editarPago(index) {
    const p = pagos[index];
    const padre = padres.find(pa => pa.id === p.padreId);
    
    // Cargar padres en el select
    cargarPadresPagoSelect();
    
    document.getElementById('padrePago').value = p.padreId;
    document.getElementById('montoPago').value = p.monto;
    document.getElementById('fechaPago').value = p.fecha;
    document.getElementById('conceptoPago').value = p.concepto || '';
    
    editandoIndex = index;
    moduloEditando = 'pagos';
    document.getElementById('btnGuardarPago').textContent = 'Actualizar';
}

async function eliminarPago(index) {
    const p = pagos[index];
    const padre = padres.find(pa => pa.id === p.padreId);
    
    if (confirm(`¿Eliminar pago de ${padre?.nombre} por Bs ${p.monto}?`)) {
        pagos.splice(index, 1);
        registrarAccion(`Eliminó pago: ${p.concepto} - Bs ${p.monto}`);
        
        // GUARDAR EN GITHUB
        await guardarDatos();
        
        mostrarPagos();
        mostrarNotificacion('✅ Pago eliminado');
    }
}

function cancelarEdicionPago() {
    document.getElementById('padrePago').value = '';
    document.getElementById('montoPago').value = '';
    document.getElementById('fechaPago').value = '';
    document.getElementById('conceptoPago').value = '';
    
    editandoIndex = -1;
    moduloEditando = '';
    document.getElementById('btnGuardarPago').textContent = 'Guardar';
          }
