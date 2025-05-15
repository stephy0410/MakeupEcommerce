const url = 'http://localhost:3000';

// Muestra los productos de la bd en la carta de Carrito de Compra
async function showProducts() {
    const user = JSON.parse(localStorage.getItem('user'));
    const user_carrito = user.carrito || []
    if (!user_carrito || user_carrito.length === 0) {
        const product_cart = document.getElementById("AddShopProducts");
        product_cart.innerHTML = `
            <div class="text-center text-muted mt-4" >
                <h5 style="color:#ccc">No hay productos en el carrito.</h5>
            </div>
        `;
        return;
    }

    // Lugar donde se muestren los productos en html
    const product_cart = document.getElementById("AddShopProducts");

    // Parametros del carrito dentro de productos
    const response = await fetch(url + '/api/products');
    const results = await response.json();
    const productos = results.data;

    for(let i = 0; i < user_carrito.length; i++) {
        const prod = user_carrito[i];
        const prod_id = productos.find(p => p._id == prod.producto);

        // Si no hay productos, no hace nada
        if(!prod_id) continue;

        // Creacion de la carta
        const card_div = document.createElement('div');
        card_div.className = "card d-flex flex-column mb-3"
        card_div.style.backgroundColor = "#f3f3f3";
        card_div.style.height = "150px";
        card_div.style.overflowY = "auto";
        card_div.style.position = "relative";

        // Boton de eliminar producto
        const x = document.createElement('button');
        x.innerHTML = '&times;';
        x.style.position = 'absolute';
        x.style.top = '5px';
        x.style.right = '10px';
        x.style.background = 'none';
        x.style.border = 'none';
        x.style.cursor = 'pointer';
        x.style.fontSize = '20px';
        // Borrar el producto
        x.addEventListener('click', async function () {
            try {
                const res = await fetch(`/api/users/${user.id}/carrito/${prod.producto}`, {
                    method: 'DELETE'
                });
        
                if (!res.ok) throw new Error("Error al eliminar en la base de datos");
        
                // Actualizar localStorage y vista
                user.carrito = user.carrito.filter(p => p.producto !== prod.producto);
                localStorage.setItem('user', JSON.stringify(user));
                updateCartCount();

                card_div.remove();
                priceProducts();
                if (user.carrito.length === 0) {
                    const product_cart = document.getElementById("AddShopProducts");
                    product_cart.innerHTML = `
                            <div class="text-center text-muted mt-4">
                                <h5 style="color:#ccc;">No hay productos en el carrito.</h5>
                            </div>
                        `;

                }
            } catch (err) {
                console.error("Error eliminando producto del carrito:", err);
                alert("No se pudo eliminar el producto del carrito.");
            }
        });
        

        // Cuerpo de la carta
        const cartBody_div = document.createElement('div');
        cartBody_div.className = "card-body";
        cartBody_div.style.padding = "10px";

        // Div para que el texto aparezca a un lado de la carta
        const flex_div = document.createElement('div');
        flex_div.className = "d-flex";

        // Imagen a colocar
        const image = document.createElement('img');
        image.src = prod_id.image;
        image.className = "product-image";
        image.style.marginRight = "10px";
        image.style.width = "125px";
        image.style.height = "125px";
        image.borderRadius = "10px";

        // Div para que el texto se acomode en la carta
        const ms_div = document.createElement('div');
        ms_div.className = "ms-3 flex-grow-1";

        // Titulo del producto
        const title_b = document.createElement('b');
        title_b.innerHTML = prod_id.name;
        title_b.style.marginTop = "10px";
        title_b.style.display = "flex";
        
        // Descripcion del producto
        const desc_p = document.createElement('p');
        desc_p.innerHTML = prod_id.description;
        desc_p.style.marginTop = "10px";
        desc_p.style.display = "block";

        // Div para que esten acomodados los precios
        const precio_div = document.createElement('div');
        precio_div.className = "d-flex justify-content-between align-items-center mt-3";

        // Precio del producto con o sin descuento
        const precio_prod = document.createElement('div');
        precio_prod.className = "product-price";

        // Si el producto tiene algun descuento...
        if(prod_id.discount > 0) {
            // Tacha el precio original
            const orginal_price = document.createElement('span');
            orginal_price.className = "text-decoration-line-through me-2";
            orginal_price.innerText = `$${prod_id.price.toFixed(2)}`;

            // Precio ya con el descuento
            const discount_price = document.createElement('span');
            discount_price.className = "text-danger fw-bold";
            discount_price.innerText = `$${(prod_id.price * (1 - prod_id.discount / 100)).toFixed(2)}`;

            // Descuento en rojo
            const discount_por = document.createElement('div');
            discount_por.innerHTML = `<span class="discount-badge">-${prod_id.discount}%</span>`;
            discount_por.style.backgroundColor = "#dc3545";
            discount_por.style.color = "white";
            discount_por.style.borderRadius = "10px";
            discount_por.style.padding = "3px 8px";
            discount_por.style.display = "inline-block";
            discount_por.style.marginTop = "5px";

            // Juntamos todo
            const final_price = document.createElement('div');
            final_price.appendChild(orginal_price);
            final_price.appendChild(discount_price);

            precio_prod.appendChild(final_price);
            precio_prod.appendChild(discount_por);
        }

        // Si no se tiene descuento
        else {
            const no_discount_price = document.createElement('b');
            no_discount_price.innerText = `$${prod_id.price.toFixed(2)}`;
            precio_prod.appendChild(no_discount_price);
        }

        // Cantidad del producto
        const prod_div = document.createElement('div'); 
        prod_div.style.marginRight = "10px";

        const min = document.createElement('i');
        min.className = "fa-solid fa-minus";
        min.style.cursor = "pointer";
        min.style.color = "#6D2D2F";
        min.style.margin = "5px";
        // Boton para quitar cantidad de productos
        min.addEventListener('click', function() {
            let cant = parseInt(cant_span.textContent);
            if(cant > 1) {
                cant --;
                cant_span.innerText = cant;

                // Actualizar el array del carrito
                const act_prod = user_carrito.find(p => p.producto == prod.producto);
                if(act_prod) act_prod.cantidad = cant;

                // Actualizar en localStore y MongoDB
                user.carrito = user_carrito;
                localStorage.setItem('user', JSON.stringify(user));
                updateCartCount();
                updateCarrito(user.id, user.carrito);
                priceProducts();
            }
        });

        const text_cant = document.createElement('span');
        text_cant.textContent = "Cantidad: ";

        const cant_span = document.createElement('span');
        cant_span.innerText= prod.cantidad;

        const max = document.createElement('i');
        max.className = "fa-solid fa-plus";
        max.style.cursor = "pointer";
        max.style.color = "#6D2D2F";
        max.style.margin = "5px";
        // Boton para agregar la cantidad de productos
        max.addEventListener('click', function() {
            let cant = parseInt(cant_span.textContent);
            cant ++;
            cant_span.innerText = cant;

            // Actualizar el array del carrito
            const act_prod = user_carrito.find(p => p.producto == prod.producto);
            if(act_prod) act_prod.cantidad = cant;

            // Actualizar en localStore y MongoDB
            user.carrito = user_carrito;
            localStorage.setItem('user', JSON.stringify(user));
            updateCartCount();
            updateCarrito(user.id, user.carrito);
            priceProducts();
        });

        // Se juntan todos los elementos
        const inputCounter = document.createElement('div');
        inputCounter.className = 'input-counter';

        inputCounter.appendChild(min);
        inputCounter.appendChild(cant_span);
        inputCounter.appendChild(max);

        prod_div.appendChild(inputCounter);


        precio_div.appendChild(precio_prod);
        precio_div.appendChild(prod_div);

        ms_div.appendChild(title_b);
        ms_div.appendChild(desc_p);
        ms_div.appendChild(precio_div);

        flex_div.appendChild(image);
        flex_div.appendChild(ms_div);

        cartBody_div.appendChild(flex_div);
        card_div.appendChild(x);
        card_div.appendChild(cartBody_div);

        product_cart.appendChild(card_div);
    }

}

// Hace las sumas correspondientes para el/los precios
async function priceProducts() {
    // Variables de html
    let subtotal = document.getElementById("subtotal");
    let descuento = document.getElementById("descuento");
    let total = document.getElementById("total");

    // Variables que contienen la informacion (users)
    const user = JSON.parse(localStorage.getItem('user'));
    const user_carrito = user.carrito || []

    // Variables que contienen la informacion (products)
    const response = await fetch(url + '/api/products');
    const results = await response.json();
    const productos = results.data;

    // Contadores
    let cont_original_price = 0;
    let cont_desc = 0;

    for(let i = 0; i < user_carrito.length; i++) {
        const prod = user_carrito[i];
        const prod_id = productos.find(p => p._id == prod.producto);

        // Si no hay productos...
        if(!prod_id) continue;

        // Variables para las sumas
        const prod_precio = prod_id.price;
        const prod_cant = prod.cantidad;
        const porc_desc = prod_id.discount || 0;

        // Parte de Subtotal (precio x cantidad)
        cont_original_price += prod_precio * prod_cant;

        // Parte de Descuentos
        if(porc_desc > 0) {
            const item_desc = (prod_precio * (porc_desc / 100) * prod_cant);
            cont_desc += item_desc;
        }
    }
    // Parte de Total
    const total_price = cont_original_price - cont_desc;

    // Unimos los totales a su html
    subtotal.textContent = `$${cont_original_price.toFixed(2)}`;
    descuento.textContent = `-$${cont_desc.toFixed(2)}`;
    total.textContent = `$${total_price.toFixed(2)}`;
}

// Actualizar el array de carrito dentro de usuarios
function updateCarrito(userId, carrito) {
    fetch(`/api/users/${userId}/carrito`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ carrito: carrito })
    })


    // Si la respuesta no es correcta, se manda el error
    .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
    })

    .then(data => console.log("Carrito actualizado: ", data))

    .catch(err => console.error("Error al actualizar la base de datos: ", err));
}

// Cargar Stripe
async function html_stripe() {
    // Clave pública dada por Stripe
    const stripe = Stripe('pk_test_51RNh6aPRHOOjlVmAeKQ8hQ3pbJvSOzNfWtb8VHdc3UCfGREYheYAgTErCck2cG9Pe6SYev0FD3qf0e6xfPdZ5T4z00yXOdeV8J');

    const subtotal = document.getElementById("subtotal");
    const descuento = document.getElementById("descuento");
    const total = document.getElementById("total");

    const user = JSON.parse(localStorage.getItem('user'));
    const user_carrito = user.carrito || [];

    const response = await fetch(url + '/api/products');
    const results = await response.json();
    const productos = results.data;

    let cont_original_price = 0;
    let cont_desc = 0;

    for (let i = 0; i < user_carrito.length; i++) {
        const prod = user_carrito[i];
        const prod_id = productos.find(p => p._id === prod.producto);
        if (!prod_id) continue;

        const prod_precio = prod_id.price;
        const prod_cant = prod.cantidad;
        const porc_desc = prod_id.discount || 0;

        cont_original_price += prod_precio * prod_cant;

        if (porc_desc > 0) {
            const item_desc = prod_precio * (porc_desc / 100) * prod_cant;
            cont_desc += item_desc;
        }
    }

    const total_price = cont_original_price - cont_desc;

    const pay_button = document.getElementById("pay_button");

    pay_button.addEventListener('click', async (event) => {
        event.preventDefault();

        const updatedUser = JSON.parse(localStorage.getItem("user"));
        const updatedCart = updatedUser.carrito || [];

        if (updatedCart.length === 0) {
            alert("No hay productos en el carrito para pagar.");
            return;
        }

        const direccion = document.getElementById("location").value;
        localStorage.setItem("direccion", direccion);

        try {
            const total = total_price;
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            const updatedCarrito = updatedUser.carrito || [];

            const items = updatedCarrito.map(p => {

                const producto = productos.find(prod => prod._id === p.producto);
                return {
                    id: producto._id,
                    nombre: producto.name,
                    imagen: producto.image,
                    price: producto.price * (1 - (producto.discount || 0) / 100),
                    cantidad: p.cantidad
                };
            });

            const server = await fetch('/create_stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total: total,
                    items: items
                })
            });

            if (!server.ok) {
                return alert("Error al crear la sesión de pago");
            }

            const session = await server.json();

            const stripe_server = await stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (stripe_server.error) {
                console.error(stripe_server.error.message);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error al procesar el pago!");
        }
    });
}


// Se carga la pag
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        alert("Por favor inicia sesión primero.");
        window.location.href = "Login.html";
        return;
    }

    showProducts();
    priceProducts();
    html_stripe();
});