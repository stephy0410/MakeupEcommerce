async function cargarPedidos() {
    const user = JSON.parse(localStorage.getItem('user'));
    const container = document.getElementById('pedidosContainer');

    if (!user) {
      container.innerHTML = '<p>Inicia sesión para ver tus pedidos.</p>';
      return;
    }

    try {
      const res = await fetch(`/api/orders/${user.id}`);
      const pedidos = await res.json();

      if (pedidos.length === 0) {
        container.innerHTML = '<p>No has realizado pedidos aún.</p>';
        return;
      }

      pedidos.forEach(p => {
        const div = document.createElement("div");
        div.className = "pedido-card";
        div.innerHTML = `
        <h5>Pedido del ${new Date(p.createdAt).toLocaleDateString()}</h5>
          <p><b>Dirección:</b> ${p.direccion}</p>
          <div>
            ${p.items.map(i => `
              <div class="producto-item">
                <span>${i.nombre} (x${i.cantidad})</span>
                <span>$${(i.precio * i.cantidad).toFixed(2)}</span>
              </div>
            `).join("")}
          </div>
          <p class="mt-2"><b>Total:</b> $${p.total.toFixed(2)}</p>
        `;
        container.appendChild(div);
      });
      sessionStorage.removeItem("pedidoGuardado");

    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      container.innerHTML = '<p>Hubo un problema al cargar tus pedidos.</p>';
    }
  }

  // ✅ Ahora sí se puede llamar
  document.addEventListener("DOMContentLoaded", () => {
    AuthController.handleNavigation();
    cargarPedidos();
  });