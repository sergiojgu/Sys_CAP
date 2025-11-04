  <input id="buscarPadre" class="search" type="text" placeholder="Buscar padre">
  <div id="listaPadres" class="lista"></div>
  <div style="text-align:center">
    <button class="btn-exportar" onclick="exportarPadres()">Exportar Padres</button>
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<!-- ===== GRUPOS ===== -->
<section id="grupos" class="modulo">
  <h2>Grupos</h2>
  <div class="formulario">
    <input id="nombreGrupo" type="text" placeholder="Nombre del grupo">
    <textarea id="descripcionGrupo" placeholder="Descripción"></textarea>
    <select id="gradoGrupo">
      <option value="">Seleccionar grado</option>
    </select>

    <div style="text-align:center;">
      <button class="form-btn" id="btnGuardarGrupo" onclick="guardarGrupo()">Guardar</button>
      <button class="form-btn" onclick="mostrarGrupos()">Actualizar</button>
    </div>
  </div>

  <input id="buscarGrupo" class="search" type="text" placeholder="Buscar grupo">
  <div id="listaGrupos" class="lista"></div>
  <div style="text-align:center">
    <button class="btn-exportar" onclick="exportarGrupos()">Exportar Grupos</button>
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<!-- ===== REUNIONES ===== -->
<section id="reuniones" class="modulo">
  <h2>Reuniones</h2>
  <div class="formulario">
    <input id="tituloReunion" type="text" placeholder="Título de la reunión">
    <input id="fechaReunion" type="date">
    <input id="horaReunion" type="time">
    <textarea id="observacionesReunion" placeholder="Observaciones"></textarea>
    <select id="grupoReunion">
      <option value="">Seleccionar grupo</option>
    </select>
    <h4>Seleccionar padres presentes:</h4>
    <div id="listaPadresCheck"></div>

    <div style="text-align:center;">
      <button class="form-btn" id="btnGuardarReunion" onclick="guardarReunion()">Guardar</button>
      <button class="form-btn" onclick="mostrarReuniones()">Actualizar</button>
    </div>
  </div>

  <input id="buscarReunion" class="search" type="text" placeholder="Buscar reunión">
  <div id="listaReuniones" class="lista"></div>
  <div style="text-align:center">
    <button class="btn-exportar" onclick="exportarReuniones()">Exportar Reuniones</button>
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<!-- ===== PAGOS ===== -->
<section id="pagos" class="modulo">
  <h2>Pagos</h2>
  <div class="formulario">
    <select id="padrePago"><option value="">Seleccionar padre</option></select>
    <input id="montoPago" type="number" placeholder="Monto (Bs)">
    <input id="fechaPago" type="date">
    <input id="conceptoPago" type="text" placeholder="Concepto / detalle">
    <div style="text-align:center;">
      <button class="form-btn" id="btnGuardarPago" onclick="guardarPago()">Guardar</button>
      <button class="form-btn" onclick="mostrarPagos()">Actualizar</button>
    </div>
  </div>

  <input id="buscarPago" class="search" type="text" placeholder="Buscar pago (por padre)">
  <div id="listaPagos" class="lista"></div>
  <div style="text-align:center">
    <button class="btn-exportar" onclick="exportarPagos()">Exportar Pagos</button>
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<!-- ===== GESTIÓN DE USUARIOS ===== -->
<section id="usuarios" class="modulo">
  <h2>Gestión de usuarios</h2>
  <div class="formulario" id="formularioUsuario" style="display:none;">
    <input id="nombreUsuario" type="text" placeholder="Usuario">
    <input id="passUsuario" type="password" placeholder="Contraseña">
    <input id="telefonoUsuario" type="text" placeholder="Teléfono (ej: 591XXXXXXXX)" value="591">
    <select id="rolUsuario">
      <!-- Las opciones se cargarán dinámicamente según el rol del usuario -->
    </select>
    <select id="gradoUsuario">
      <option value="">Seleccionar grado</option>
    </select>
    <div style="text-align:center;">
      <button class="form-btn" id="btnGuardarUsuario" onclick="guardarUsuario()">Guardar</button>
      <button class="form-btn" onclick="cancelarEdicionUsuario()">Cancelar</button>
    </div>
  </div>

  <div style="text-align:center; margin-bottom: 15px;" id="botonNuevoUsuarioContainer">
    <button class="form-btn" onclick="nuevoUsuario()" id="btnNuevoUsuario">Nuevo Usuario</button>
  </div>

  <input id="buscarUsuario" class="search" type="text" placeholder="Buscar usuario">
  <div id="listaUsuarios" class="lista"></div>
  <div style="text-align:center">
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<!-- ===== BITÁCORA ===== -->
<section id="bitacora" class="modulo">
  <h2>Bitácora del sistema</h2>
  <div id="logContainer" style="background:#fff; padding:12px; border-radius:10px; box-shadow:0 1px 4px rgba(0,0,0,.1);">
    <div id="bitacoraLista" style="max-height:400px; overflow:auto; font-family:monospace; white-space:pre-wrap;"></div>
  </div>
  <div style="text-align:center">
    <button class="volver" onclick="volverMenu()">Volver</button>
  </div>
</section>

<script src="js/main.js"></script>
<script src="js/alumnos.js"></script>
<script src="js/padres.js"></script>
<script src="js/grupos.js"></script>
<script src="js/reuniones.js"></script>
<script src="js/pagos.js"></script>
<script src="js/usuarios.js"></script>
<script src="js/bitacora.js"></script>

</body>
</html>
