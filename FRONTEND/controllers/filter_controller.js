const url = 'http://localhost:3000'; 

function getTagFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get('tag');
}

async function loadFilteredProducts(){
    const tag = getTagFromUrl();
    console.log('Tag extraído del URL:', tag);

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
    const userID = user.id;
    const favorites = user.favoritos || [];
    const carrito = user.carrito || [];

   
    try{
        const response = await fetch(`${url}/api/products/filter?tag=${tag}`);
        const products = await response.json();
        console.log('Productos recibidos:', products);  
        if(products.length === 0){
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


            card.innerHTML = `<i class="fa-heart heart-icon ${heartClass}"></i>
                                    <i class="fa-solid fa-cart-shopping cart-icon ${cartClass}"></i>
                                                            
                                    <img
                                        src="${prod.image}"
                                        class="card-img-top"
                                        alt="${prod.name}"
                                    />
    
                                    <div class="card-body d-flex flex-column">
                                        <h5 class="card-title">${prod.name}</h5>
                                        <p class="card-text">${prod.description}</p>
                                        <p class="card-text"><b>${prod.price}</b></p>
                                    </div>`;
            
            const heartIcon = card.querySelector('.heart-icon');
            heartIcon.addEventListener('click', async () => {
                const r = await fetch(`${url}/api/users/${userID}/favs/${prod._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const newFavs = await r.json();
                user.favoritos = newFavs;
                localStorage.setItem('user', JSON.stringify(user));

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
                
                if (updatedCart.some(item => item.producto === prod._id)) {
                    cartIcon.classList.add('in-cart');
                } else {
                    cartIcon.classList.remove('in-cart');
                }

                } catch (error) {
                    console.error('Error al agregar al carrito', error);
                }
            });

            col.appendChild(card);
            container.appendChild(col);
        });
    }catch(error){
        console.error('Error al cargar productos', error);
    }
    
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    loadFilteredProducts();
});