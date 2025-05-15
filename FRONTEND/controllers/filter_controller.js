const url = 'http://localhost:3000';

function getTagFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tag');
}

async function loadFilteredProducts() {
    const tag = getTagFromUrl();

    const headerImg = document.querySelector('main img');
    const tagImages = {
        Primer: '../Imagenes/Primers.png',
        Blush: '../Imagenes/Blush.png',
        Rimel: '../Imagenes/Rimel.png',
        Labial: '../Imagenes/LabialB.webp'
    };
    if (tagImages[tag]) {
        headerImg.src = tagImages[tag];
    }

    const textProduct = document.getElementById('tag');
    const tagDisplay = (tag === 'Primer') ? `${tag}s` : `${tag}es`;

    textProduct.innerHTML = `<h1>${tag}</h1>
                    <p>Los mejores ${tagDisplay} del mercado.</p>`

    const container = document.getElementById('productContainer');
    container.innerHTML = "";

    const user = JSON.parse(localStorage.getItem('user'));
    const userID = user?.id;
    const favorites = user?.favoritos || [];
    const carrito = user?.carrito || [];

    try {
        const response = await fetch(`${url}/api/products/filter?tag=${tag}`);
        const products = await response.json();
        if (products.length === 0) {
            container.innerHTML = '<p style="color: white; display: flex; justify-content: center;">No hay productos con esta etiqueta :(</p>';
            return;
        }

        products.forEach(prod => {
            const col = document.createElement('div');
            col.className = "col-md-4";

            const card = document.createElement('div');
            card.className = "card cardW";

            const isFav = favorites.includes(prod._id);
            const heartClass = isFav ? 'fa-solid' : 'fa-regular';

            const isInCart = carrito.some(item => item.producto === prod._id);
            const cartClass = isInCart ? 'in-cart' : '';


            card.innerHTML = `
                            <i class="fa-heart heart-icon ${heartClass}"></i>
                            <i class="fa-solid fa-cart-shopping cart-icon ${cartClass}"></i>
                            <img src="${prod.image}" class="card-img-top" alt="${prod.name}" />
                            <div class="card-body">
                                <h5 class="product-title">${prod.name}</h5>
                                <p class="product-desc">${prod.description}</p>
                                <div class="product-price">
                                ${prod.discount > 0
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

            if (user) {
                const heartIcon = card.querySelector('.heart-icon');
                heartIcon.addEventListener('click', async () => {
                    const r = await fetch(`${url}/api/users/${userID}/favs/${prod._id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    const newFavs = await r.json();
                    user.favoritos = newFavs;
                    localStorage.setItem('user', JSON.stringify(user));
                    updateCartCount();

                    // Toggle visual del ícono
                    heartIcon.classList.toggle('fa-regular');
                    heartIcon.classList.toggle('fa-solid');
                });

                const cartIcon = card.querySelector('.cart-icon');
                cartIcon.addEventListener('click', async () => {
                    try {
                        const r = await fetch(`${url}/api/users/${userID}/carrito/${prod._id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        const updatedCart = await r.json();
                        user.carrito = updatedCart;
                        localStorage.setItem('user', JSON.stringify(user));
                        updateCartCount();

                        if (updatedCart.some(item => item.producto === prod._id)) {
                            cartIcon.classList.add('in-cart');
                        } else {
                            cartIcon.classList.remove('in-cart');
                        }

                    } catch (error) {
                        console.error('Error al agregar al carrito', error);
                    }
                });

            } else {
                const heartIcon = card.querySelector('.heart-icon');
                const cartIcon = card.querySelector('.cart-icon');

                heartIcon.addEventListener('click', () => {
                    alert('Favor de iniciar sesión para agregar a favoritos');
                });

                cartIcon.addEventListener('click', () => {
                    alert('Favor de iniciar sesión para agregar al carrito');
                });
            }

            col.appendChild(card);
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error al cargar productos', error);
    }

}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    loadFilteredProducts();
});