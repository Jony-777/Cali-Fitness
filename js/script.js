(function () {
  const $ = id => document.getElementById(id);
  const form = $('formRegistro');
  const tabla = $('tablaUsuarios');
  const buscar = $('buscar');
  const notificacion = $('notificacion');
  const modal = $('modalRenovar');
  const modalNombre = $('modalNombre');
  const btnSemana = $('btnSemana');
  const btnMes = $('btnMes');
  const btnCancelar = $('btnCancelar');

  let usuarioRenovarID = null;

  function generarID() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let max = 0;
    usuarios.forEach(u => {
      const num = parseInt(u.id?.replace('CF', ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return 'CF' + String(max + 1).padStart(3, '0');
  }

  function hoy() {
    return new Date().toISOString().split('T')[0];
  }

  function calcularFechaFin(fechaInicio, tipo) {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + (tipo === 'semana' ? 7 : 30));
    return fecha.toISOString().split('T')[0];
  }

  function calcularDiasRestantes(fechaFin) {
    const hoyFecha = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin - hoyFecha) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }

  function mostrarUsuarios(filtro = '') {
    if (!tabla) return;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const texto = filtro.toLowerCase().trim();
    tabla.innerHTML = '';

    const filtrados = usuarios.filter(u =>
      u.id.toLowerCase().includes(texto) ||
      u.nombre.toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
      tabla.innerHTML = `<tr><td colspan="11" style="text-align:center;color:gray;">No hay resultados</td></tr>`;
      return;
    }

    filtrados.forEach(u => {
      const dias = calcularDiasRestantes(u.fechaFin);
      const tr = document.createElement('tr');
      if (dias === 0) tr.classList.add('vencido');

      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.edad}</td>
        <td>${u.sexo}</td>
        <td>${u.telefono || '-'}</td>
        <td>${u.correo || '-'}</td>
        <td>${u.suscripcion}</td>
        <td>${u.fechaInicio}</td>
        <td>${u.fechaFin}</td>
        <td>${dias === 0 ? "<span class='tag-vencido'>Vencido</span>" : dias + " días"}</td>
        <td>
          <button class="btn-primary" onclick="abrirModalRenovar('${u.id}')">🔄</button>
          <button class="btn-danger" onclick="eliminarUsuario('${u.id}')">🗑️</button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  // REGISTRO
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const tipo = $('suscripcion').value;
      const inicio = hoy();

      const nuevo = {
        id: generarID(),
        nombre: $('nombre').value.trim(),
        edad: $('edad').value.trim(),
        sexo: $('sexo').value,
        telefono: $('telefono').value.trim(),
        correo: $('correo').value.trim(),
        suscripcion: tipo,
        fechaInicio: inicio,
        fechaFin: calcularFechaFin(inicio, tipo)
      };

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      usuarios.push(nuevo);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      mostrarNotificacion(`✅ Usuario ${nuevo.nombre} registrado`);
      form.reset();
      window.location.href = 'login.html';
    });
  }

  if (buscar) buscar.addEventListener('input', () => mostrarUsuarios(buscar.value));

  window.mostrarUsuarios = mostrarUsuarios;

  window.eliminarUsuario = function (id) {
    if (confirm(`¿Eliminar usuario ${id}?`)) {
      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      usuarios = usuarios.filter(u => u.id !== id);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      mostrarUsuarios();
      mostrarNotificacion(`🗑️ Usuario eliminado`);
    }
  };

  // MODAL RENOVAR
  window.abrirModalRenovar = function (id) {
    usuarioRenovarID = id;
    modalNombre.textContent = `Renovar membresía (${id})`;
    modal.style.display = 'flex';
  };

  btnCancelar.addEventListener('click', () => modal.style.display = 'none');

  function renovar(tipo) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const u = usuarios.find(x => x.id === usuarioRenovarID);
    if (!u) return;

    u.suscripcion = tipo;
    u.fechaInicio = hoy();
    u.fechaFin = calcularFechaFin(u.fechaInicio, tipo);

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    modal.style.display = 'none';
    mostrarUsuarios();
    mostrarNotificacion(`🔄 Membresía renovada`);
  }

  btnSemana.addEventListener('click', () => renovar('semana'));
  btnMes.addEventListener('click', () => renovar('mes'));

  window.borrarDatos = function () {
    if (confirm('¿Borrar todos los usuarios?')) {
      localStorage.removeItem('usuarios');
      mostrarUsuarios();
    }
  };

  function mostrarNotificacion(msg) {
    if (!notificacion) return;
    notificacion.textContent = msg;
    notificacion.classList.add('visible');
    setTimeout(() => notificacion.classList.remove('visible'), 2000);
  }

  if (tabla) mostrarUsuarios();
})();




