const url = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    const carousel = document.getElementById('carouselLoMasNuevo');
    const indicatorsContainer = document.getElementById('indicatorC1');

    try{
        const response = await fetch(url + '/producto/nuevo');
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

        // Generar indicadores
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('li');
            indicator.setAttribute('data-bs-target', '#carouselId1');
            indicator.setAttribute('data-bs-slide-to', i);
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            
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

document.addEventListener('DOMContentLoaded', async () => {
    const carousel = document.getElementById('carouselFavoritos');
    const indicatorsContainer = document.getElementById('indicatorC2');

    const clienteID = '681833e74152c2dcba0a01df';
    try{
        const response = await fetch(url + `/cliente/favoritos/${clienteID}`);
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

        // Generar indicadores
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('li');
            indicator.setAttribute('data-bs-target', '#carouselId2');
            indicator.setAttribute('data-bs-slide-to', i);
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            
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
                cardDiv.innerHTML += `<i class="fa-solid fa-heart heart-icon"></i>
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
        new bootstrap.Carousel(document.getElementById('carouselId2'));

    }catch(error){
        console.error('Error al cargar Productos Favoritos', err);
    }
});

