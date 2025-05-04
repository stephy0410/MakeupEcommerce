const url = 'http://localhost:3000/maquillaje/nuevo';

document.addEventListener('DOMContentLoaded', async () => {
    const carousel = document.getElementById('carouselLoMasNuevo');

    try{
        const response = await fetch(url);
        const productos = await response.json();
       
        carousel.innerHTML = "";

        const productosSlide = 3;
      
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
                cardDiv.innerHTML += `<i class="fa-regular fa-heart heart-icon"></i>
                                    <i class="fa-solid fa-cart-shopping cart-icon"></i>`;
                
                //Imagen
                cardDiv.innerHTML += `<img
                                        src="${prod.imagen}"
                                        class="card-img-top"
                                        alt="Product 1 Image"
                                    />`;
                //Producto
                cardDiv.innerHTML += `<div class="card-body d-flex flex-column">
                                        <h5 class="card-title">${prod.nombre}</h5>
                                        <p class="card-text">${prod.descripcion}</p>
                                        <p class="card-text"><b>${prod.precio}</b></p>
                                    </div>`;
                colDiv.appendChild(cardDiv);
                rowDiv.appendChild(colDiv);
            }
            slideDiv.appendChild(rowDiv);
            carousel.appendChild(slideDiv);
        }
        new bootstrap.Carousel(document.getElementById('carouselId'));

    }catch(error){
        console.error('Error al cargar Productos Nuevos', err);
    }
});

window.onload = cargarProductosNuevos;
