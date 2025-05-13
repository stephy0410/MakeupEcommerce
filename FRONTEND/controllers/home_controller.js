const url = 'http://localhost:3000';
//import { updateCarrito } from './carrito_controller.js';

async function loadNewProducts(){
    const carousel = document.getElementById('carouselLoMasNuevo');
    const indicatorsContainer = document.getElementById('indicatorC1');
    const user = JSON.parse(localStorage.getItem('user'));
    

    const userID = user?.id;
    const favorites = user?.favoritos || [];
    const carrito = user?.carrito || [];
    
    
    try{
        const response =  await fetch(url + '/api/products/news');
        const productos = await response.json();

        carousel.innerHTML = "";

        if (productos.length === 0) {
            carousel.innerHTML =`<div class="carousel-item active">
            <div class="text-center p-4">
                <p style="color: white">No hay productos nuevos</p>
            </div>
        </div>`
            return;
        }

        const productosSlide = 3;
        const totalSlides = Math.ceil(productos.length / productosSlide);

        indicatorsContainer.innerHTML = '';

        // Generar indicadores
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('li');
            indicator.setAttribute('data-bs-target', '#carouselId');
            indicator.setAttribute('data-bs-slide-to', i);
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            indicator.classList.add('carousel-indicator-custom');

            if (i === 0) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            }
            
            indicatorsContainer.appendChild(indicator);
        }

        for(let i = 0; i < productos.length; i += productosSlide){
            //Slide
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-item' + (i === 0 ? ' active' : '');

            //Fila
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row g-3';

            // Agregar productos a fila
            for(let j = i; j < i + productosSlide && j < productos.length; j++){
                const prod = productos[j];

                //Columna
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-4';

                //Tarjeta
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card cardW';
                
                //Iconos
                const isFav = favorites.includes(prod._id);
                const heartClass = isFav ? 'fa-solid' : 'fa-regular';

                const isInCart = carrito.some(item => item.producto === prod._id);
                const cartClass = isInCart ? 'in-cart' : '';

                cardDiv.innerHTML += `<i class="fa-heart heart-icon ${heartClass}"></i>
                                    <i class="fa-solid fa-cart-shopping cart-icon  ${cartClass}"></i>`;
                
                //Imagen
                cardDiv.innerHTML += `<img
                                        src="${prod.image}"
                                        class="card-img-top"
                                        alt="Product 1 Image"
                                    />`;
                //Producto
                cardDiv.innerHTML += `<div class="card-body">
                                    <h5 class="product-title">${prod.name}</h5>
                                    <p class="product-desc">${prod.description}</p>
                                    <div class="product-price">
                                        ${
                                        prod.discount > 0
                                            ? `
                                            <div>
                                            <span class="text-decoration-line-through me-2">$${prod.price.toFixed(2)}</span>
                                            <span class="text-danger fw-bold">$${(prod.price * (1 - prod.discount / 100)).toFixed(2)}</span>
                                            </div>
                                            <div><span class="discount-badge">-${prod.discount}%</span></div>`
                                            : `<b>$${prod.price.toFixed(2)}</b>`
                                        }
                                    </div>
                                    </div>`;
                if(user){
                    cardDiv.querySelector('.heart-icon').addEventListener('click', async (e) => {
                        const icon = e.target;
                        const r = await fetch(`${url}/api/users/${userID}/favs/${prod._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const newFavs = await r.json();
                        user.favoritos = newFavs;
                        localStorage.setItem('user', JSON.stringify(user));
                        //await loadNewProducts();
                        await loadFavoriteProducts();
                    // Alternar clase visual
                    icon.classList.toggle('fa-regular');
                    icon.classList.toggle('fa-solid');
                    });
    
                    const cartIcon = cardDiv.querySelector('.cart-icon');
                    cartIcon.addEventListener('click', async () => {    
                        try {
                            const r = await fetch(`${url}/api/users/${userID}/carrito/${prod._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
    
                        const updatedCart = await r.json();
                        user.carrito = updatedCart;
                        localStorage.setItem('user', JSON.stringify(user));
                    
                        updateCartIconInViews(prod._id);
                        //await loadNewProducts();
                        await loadFavoriteProducts(); 
                        cartIcon.classList.toggle('in-cart');

    
                        } catch (error) {
                            console.error('Error al agregar al carrito', error);
                        }
                    });
                } else {
                    const heartIcon = cardDiv.querySelector('.heart-icon');
                    const cartIcon = cardDiv.querySelector('.cart-icon');

                    heartIcon.addEventListener('click', () => {
                        alert('Favor de iniciar sesión para agregar a favoritos');
                    });

                    cartIcon.addEventListener('click', () => {
                        alert('Favor de iniciar sesión para agregar al carrito');
                    });
                }
                                    
                colDiv.appendChild(cardDiv);
                rowDiv.appendChild(colDiv);
            }
            slideDiv.appendChild(rowDiv);
            carousel.appendChild(slideDiv);
        }
        new bootstrap.Carousel(document.getElementById('carouselId'));

    }catch(error){
        console.error('Error al cargar Productos Nuevos', error);
    }
};



async function loadFavoriteProducts(){
    const carousel = document.getElementById('carouselFavoritos');
    const indicatorsContainer = document.getElementById('indicatorC2');
    const user = JSON.parse(localStorage.getItem('user'));
    const section = document.getElementById('favoritesSection'); 

    if (!user) {
        if (section) section.style.display = 'none';
        return;
    }

    const userID = user.id;
    const favorites = user.favoritos || [];
    const carrito = user.carrito || [];

    try{
        const response =  await fetch(url + '/api/products/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ids: favorites})
        });
        const productos = await response.json();

        carousel.innerHTML = "";

        if (productos.length === 0) {
            carousel.innerHTML =`<div class="carousel-item active">
            <div class="text-center p-4">
                <p style="color: white">No hay productos favoritos</p>
            </div>
        </div>`
            return;
        }

        const productosSlide = 3;
        const totalSlides = Math.ceil(productos.length / productosSlide);
        
        indicatorsContainer.innerHTML = '';

        // Generar indicadores
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('li');
            indicator.setAttribute('data-bs-target', '#carouselId2');
            indicator.setAttribute('data-bs-slide-to', i);
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            indicator.classList.add('carousel-indicator-custom');
            
            if (i === 0) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            }
            
            indicatorsContainer.appendChild(indicator);
        }

        for(let i = 0; i < productos.length; i += productosSlide){
            //Slide
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-item' + (i === 0 ? ' active' : '');

            //Fila
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row g-3';

            // Agregar productos a fila
            for(let j = i; j < i + productosSlide && j < productos.length; j++){
                const prod = productos[j];

                //Columna
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-4';

                //Tarjeta
                const cardDiv = document.createElement('div');
                cardDiv.className = 'card cardW';
                
                //Iconos
                const isFav = favorites.includes(prod._id);
                const heartClass = isFav ? 'fa-solid' : 'fa-regular';
                
                const isInCart = carrito.some(item => item.producto === prod._id);
                const cartClass = isInCart ? 'in-cart' : '';

                cardDiv.innerHTML += `<i class="fa-heart heart-icon ${heartClass}"></i>
                                    <i class="fa-solid fa-cart-shopping cart-icon  ${cartClass}"></i>`;
                
                //Imagen
                cardDiv.innerHTML += `<img
                                        src="${prod.image}"
                                        class="card-img-top"
                                        alt="${prod.name}"
                                    />`;
                //Producto
                cardDiv.innerHTML += `<div class="card-body d-flex flex-column">
                                        <h5 class="card-title">${prod.name}</h5>
                                        <p class="card-text">${prod.description}</p>
                                        <p class="card-text"><b>${prod.price}</b></p>
                                    </div>`;
                
                if (user) {
                    cardDiv.querySelector('.heart-icon').addEventListener('click', async () => {
                        const r = await fetch(`${url}/api/users/${userID}/favs/${prod._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const newFavs = await r.json();
                        user.favoritos = newFavs;
                        localStorage.setItem('user', JSON.stringify(user));
                        await loadNewProducts();
                        await loadFavoriteProducts();
                    });

                    const cartIcon = cardDiv.querySelector('.cart-icon');
                    cartIcon.addEventListener('click', async () => {    
                        try {
                            const r = await fetch(`${url}/api/users/${userID}/carrito/${prod._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        const updatedCart = await r.json();
                        user.carrito = updatedCart;
                        localStorage.setItem('user', JSON.stringify(user));
                
                        updateCartIconInViews(prod._id);
                        await loadNewProducts();
                        await loadFavoriteProducts(); 
                    
                        } catch (error) {
                            console.error('Error al agregar al carrito', error);
                        }
                    });
                }
                                    
                colDiv.appendChild(cardDiv);
                rowDiv.appendChild(colDiv);
            }
            slideDiv.appendChild(rowDiv);
            carousel.appendChild(slideDiv);
        }
        new bootstrap.Carousel(document.getElementById('carouselId2'));


    }catch(error){
        console.error('Error al cargar Productos Nuevos', error);
    }
};


// Función para el color del carrito en lo mas nueo y favoritos
async function updateCartIconInViews(prodId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const carrito = user.carrito || [];

    const cartIcons = document.querySelectorAll('.cart-icon');

    cartIcons.forEach(icon => {
        const productId = icon.closest('.card').dataset.productId;

        if (productId === prodId) {
            const isInCart = carrito.some(item => item.producto === prodId); //Verificar si el cproducto ya esta en el carrito o no
            if (isInCart) {
                icon.classList.add('in-cart');
            } else {
                icon.classList.remove('in-cart');
            }
        }
    });
}

async function guardarPedido() {
    const user = JSON.parse(localStorage.getItem("user"));
    const userCarrito = user.carrito || [];
    const direccion = localStorage.getItem("direccion") || "Sin dirección registrada";
  
    try {
      const resProd = await fetch('/api/products');
      const prodData = await resProd.json();
      const productos = prodData.data;
  
      const items = userCarrito.map(p => {
        const producto = productos.find(prod => prod._id === p.producto);
        if (!producto) return null;
  
        const precioConDescuento = producto.price * (1 - (producto.discount || 0) / 100);
  
        return {
          nombre: producto.name,
          cantidad: p.cantidad,
          precio: precioConDescuento
        };
      }).filter(Boolean); // Elimina productos nulos
  
      const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items,
          total,
          direccion
        })
      });
  
      if (res.ok) {
        console.log("Pedido guardado correctamente");
        localStorage.removeItem("carrito");
        localStorage.removeItem("direccion");
  
        await fetch(`/api/users/${user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carrito: [] })
        });
        sessionStorage.removeItem("pedidoGuardado");

      } else {
        console.error(" Error al guardar el pedido");
      }
  
    } catch (err) {
      console.error(" Error al conectar con el backend:", err);
    }
  }

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    loadNewProducts();
    loadFavoriteProducts();
  
    const params = new URLSearchParams(window.location.search);
    const alreadySaved = sessionStorage.getItem("pedidoGuardado");
  
    if (params.get("success") === "true" && !alreadySaved) {
      guardarPedido();
      sessionStorage.setItem("pedidoGuardado", "true");
  
      // Mostrar mensaje de agradecimiento
      const mensaje = document.getElementById("mensajeGracias");
      if (mensaje) mensaje.style.display = "block";
  
      // Limpiar ?success=true visualmente
      history.replaceState(null, '', window.location.pathname);
    }
});
  