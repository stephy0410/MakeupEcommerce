// admin_controller.js - Controlador para la página de administración

// Configuración de la API
const API_BASE_URL = '/api/products';
let currentProductId = null;

// Verificación de sesión y permisos
function verifyAdminSession() {
    const user = AuthController.getCurrentUser();

    if (!user) {
        alert('Por favor inicia sesión primero');
        window.location.href = 'Login.html';
        return false;
    }

    if (user.role !== 'admin') {
        alert('No tienes permisos de administrador');
        window.location.href = 'Home.html';
        return false;
    }

    return true;
}
function setupEventListeners() {
    document.getElementById('saveProductButton')?.addEventListener('click', createProduct);
    document.getElementById('updateProductButton')?.addEventListener('click', updateProduct);
    document.getElementById('deleteProductButton')?.addEventListener('click', deleteProduct);
    document.getElementById('productSearch')?.addEventListener('input', filterProducts);
    document.getElementById('productImageFile')?.addEventListener('change', function () {
        mostrarVistaPrevia(this, 'productImagePreview');
    });

    document.getElementById('editProductImageFile')?.addEventListener('change', function () {
        mostrarVistaPrevia(this, 'editProductImagePreview');
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('editProductImage').value = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

let allProducts = [];
// Cargar todos los productos
function loadAllProducts() {
    if (!verifyAdminSession()) return;

    const user = AuthController.getCurrentUser();

    fetch(API_BASE_URL, {
        headers: {
            'authorization': user._id,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        allProducts = data.data || []; 
        renderProducts(allProducts); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message || 'Error al cargar productos');
    });
}
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value;
    const user = AuthController.getCurrentUser();

    fetch(`${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
            'authorization': user._id,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => renderProducts(data.data || []))
    .catch(error => {
        console.error('Error:', error);
        alert('Error al buscar productos');
    });
}


function renderProducts(products) {
    const container = document.querySelector('.row.g-3');
    if (!container) return;

    container.innerHTML = '';

    if (!products.length) {
        container.innerHTML = '<div class="col-12 text-center py-5"><h5>No se encontraron productos</h5></div>';
        return;
    }

    products.forEach(product => {
        const finalPrice = product.discount > 0 
            ? (product.price * (1 - product.discount / 100)).toFixed(2)
            : product.price.toFixed(2);

        const div = document.createElement('div');
        div.className = 'col-md-4';
        div.innerHTML = `
            <div class="card cardW position-relative">
                <div class="admin-action-icons">
                    <i class="fa-solid fa-pen-to-square mx-1 cart-icon" onclick="editProductPrompt('${product._id}')" title="Editar"></i>
                    <i class="fa-solid fa-trash mx-1 cart-icon" onclick="deleteProductPrompt('${product._id}')" title="Eliminar"></i>
                </div>
                <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='../Imagenes/default-product.jpg'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description || ''}</p>
                    <p class="card-text">
                        ${product.discount > 0
                            ? `
                                <span class="text-decoration-line-through me-2">$${product.price.toFixed(2)}</span>
                                <span class="text-danger"><b>$${(product.price * (1 - product.discount / 100)).toFixed(2)}</b></span>
                                <span class="badge bg-danger ms-2">-${product.discount}%</span>
                            `
                            : `<b>$${product.price.toFixed(2)}</b>`}
                    </p>
                </div>
            </div>
        `;

        container.appendChild(div);
    });
}


function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

function createProduct() {
    if (!verifyAdminSession()) return;

    const user = AuthController.getCurrentUser();
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const tag = document.getElementById('productCategory').value;
    const discount = parseFloat(document.getElementById('productDiscount').value) || 0;
    const imageFile = document.getElementById('productImageFile').files[0];
    const description = document.getElementById('productDescription')?.value.trim() || '';

    if (!name || !price || !tag || !imageFile) {
        alert("Completa todos los campos obligatorios.");
        return;
    }

    getBase64(imageFile).then(image => {
        const newProduct = { name, price, tag, discount, image, description };

        fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': user._id
            },
            body: JSON.stringify(newProduct)
        })
        .then(res => res.json())
        .then(() => {
            alert("Producto creado exitosamente.");
            document.getElementById('addProductForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            loadAllProducts();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error al crear producto");
        });
    });
}

window.editProductPrompt = function(id) {
    if (!verifyAdminSession()) return;

    currentProductId = id;
    const user = AuthController.getCurrentUser();

    fetch(`${API_BASE_URL}/${id}`, {
        headers: { 'authorization': user._id }
    })
    .then(res => res.json())
    .then(({ data }) => {
        document.getElementById('editProductName').value = data.name;
        document.getElementById('editProductPrice').value = data.price;
        document.getElementById('editProductCategory').value = data.tag;
        document.getElementById('editProductDiscount').value = data.discount;
        document.getElementById('editProductImage').value = data.image;
        document.getElementById('editProductDescription').value = data.description || '';

        const preview = document.getElementById('editProductImagePreview');
        if (data.image) {
            preview.src = data.image;
            preview.classList.remove('d-none');
        } else {
            preview.classList.add('d-none');
        }

        new bootstrap.Modal(document.getElementById('editProductModal')).show();
    });
};

window.deleteProductPrompt = function(id) {
    if (!verifyAdminSession()) return;
    currentProductId = id;
    new bootstrap.Modal(document.getElementById('deleteConfirmModal')).show();
};

function updateProduct() {
    if (!verifyAdminSession()) return;

    const user = AuthController.getCurrentUser();
    const name = document.getElementById('editProductName').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const tag = document.getElementById('editProductCategory').value;
    const discount = parseFloat(document.getElementById('editProductDiscount').value) || 0;
    const image = document.getElementById('editProductImage').value.trim();
    const description = document.getElementById('editProductDescription')?.value.trim() || '';

    const updatedProduct = { name, price, tag, discount, image, description };

    fetch(`${API_BASE_URL}/${currentProductId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'authorization': user._id
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(res => res.json())
    .then(() => {
        alert("Producto actualizado exitosamente.");
        bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
        loadAllProducts();
    });
}

function deleteProduct() {
    if (!verifyAdminSession()) return;
    const user = AuthController.getCurrentUser();

    fetch(`${API_BASE_URL}/${currentProductId}`, {
        method: 'DELETE',
        headers: { 'authorization': user._id }
    })
    .then(res => res.json())
    .then(() => {
        alert("Producto eliminado exitosamente.");
        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
        loadAllProducts();
    });
}

function mostrarVistaPrevia(inputFile, previewId) {
    const file = inputFile.files[0];
    const preview = document.getElementById(previewId);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = "#";
        preview.classList.add('d-none');
    }
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    if (!verifyAdminSession()) return;
    loadAllProducts();
    setupEventListeners();
});