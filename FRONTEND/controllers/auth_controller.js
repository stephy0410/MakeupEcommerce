const AuthController = {
    login: function(username, password) {
        return fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(err) {
                    throw new Error(err.message || 'Credenciales incorrectas');
                });
            }
            return response.json();
        })
        .then(function(data) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.sessionId);

            const redirectTo = data.user.role === 'admin' ? 'Admin.html' : 'Home.html';
            window.location.href = `${redirectTo}?auth=${data.user.id}`;
            return data.user;
        })
        .catch(function(error) {
            console.error('Login error:', error);
            throw error;
        });
    },

    register: function(username, email, password, confirmPassword) {
        if (password !== confirmPassword) {
            return Promise.reject(new Error('Las contraseñas no coinciden'));
        }

        return fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(err) {
                    throw new Error(err.message || 'Error en el registro');
                });
            }
            return response.json();
        })
        .catch(function(error) {
            console.error('Registration error:', error);
            throw error;
        });
    },

    isAuthenticated: function() {
        return !!this.getCurrentUser();
    },

    isAdmin: function() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    getCurrentUser: function() {
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout: function() {
        sessionStorage.clear();
        localStorage.clear();
        // Redirigir a Home.html y evitar cache
        location.href = 'Home.html?_=' + new Date().getTime();
    },

    redirectWithAuth: function(path) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'Login.html';
            return;
        }
        window.location.href = `${path}?auth=${user.id}`;
    },

    handleNavigation: function () {
        const currentPage = window.location.pathname.split('/').pop();
        const user = this.getCurrentUser();

        const authIcons = document.getElementById('authIcons');
        const nav = document.querySelector('.navbar-nav');

        if (authIcons) authIcons.innerHTML = '';
        if (nav) {
            nav.querySelectorAll('[data-admin]').forEach(el => el.parentElement.remove());
        }

        // Si no hay sesión válida
        if (!user || !user.id || !user.username) {
            sessionStorage.clear();
            localStorage.clear();
            if (authIcons) {
                authIcons.innerHTML = `
                    <a class="nav-link" href="Login.html" title="Iniciar sesión">
                        <i class="fas fa-user-circle fa-lg"></i>
                    </a>
                `;
            }
            return;
        }

        // En Admin.html, si no hay auth param, agregarlo
        if (user && currentPage === 'Admin.html') {
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has('auth')) {
                window.location.href = `${currentPage}?auth=${user.id}`;
            }
        }

        // Mostrar íconos de usuario
        if (authIcons) {
            authIcons.innerHTML = `
                <a href="./Pedidos.html" class="nav-link" title="Mis pedidos">
                    <i class="fas fa-receipt" style="color: black; padding: 4px;"></i>
                </a>
                <a href="./Carrito.html" class="nav-link position-relative">
                    <i class="fa-solid fa-cart-shopping" style="color: black; padding: 4px;"></i>
                    <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        0
                    </span>
                </a>

                <i class="fa-solid fa-gear nav-link" style="padding: 5px;" data-bs-toggle="modal" data-bs-target="#editUserModal"></i>
                <a class="nav-link" href="#" title="Cerrar sesión" data-bs-toggle="modal" data-bs-target="#logoutModal">
                    <i class="fas fa-sign-out-alt"></i>
                </a>

            `;
        }

        // Agregar menú admin si aplica
        if (user.role === 'admin' && nav) {
            const li = document.createElement("li");
            li.classList.add("nav-item");

            const a = document.createElement("a");
            a.classList.add("nav-link");
            a.setAttribute("data-admin", "true");
            a.href = "#";
            a.textContent = "Gestión de Productos";
            a.onclick = function (e) {
                e.preventDefault();
                AuthController.redirectWithAuth('Admin.html');
            };

            li.appendChild(a);
            nav.appendChild(li);
        }

        // Reasignar eventos de logout
        document.querySelectorAll('.logout-btn').forEach(function (button) {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                AuthController.logout();
            });
        });
    }
};


function toggleForms() {
    let form_login = document.getElementById('formLogin');
    let form_register = document.getElementById('formRegister');
    let title = document.getElementById('currentFormTitle');
    
    if (form_register.style.display === 'none') {
        form_login.style.display = 'none';
        form_register.style.display = 'block';
        title.textContent = 'CREAR CUENTA';
    } else {
        form_login.style.display = 'block';
        form_register.style.display = 'none';
        title.textContent = 'INICIAR SESIÓN';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    AuthController.handleNavigation();

    const loginForm = document.getElementById('formLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            AuthController.login(username, password)
                .then(function(user) {
                    const redirectTo = user.role === 'admin' ? 'Admin.html' : 'Home.html';
                    window.location.href = `${redirectTo}?auth=${user.id}`;
                })
                .catch(function(error) {
                    alert(error.message);
                });
        });
    }
 
    const registerForm = document.getElementById('formRegister');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUser').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!strongPasswordRegex.test(password)) {
                alert("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
                return;
            }
            AuthController.register(username, email, password, confirmPassword)
                .then(function() {
                    alert('Registro exitoso! Por favor inicia sesión.');
                    toggleForms();
                })
                .catch(function(error) {
                    if (error.message === 'El usuario ya existe') {
                        alert(`El usuario "${username}" ya existe. Por favor elige otro nombre.`);
                    } else {
                        alert(error.message);
                    }
                });
        });
    }
    
    document.querySelectorAll('.btn-toggle-form').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            toggleForms();
        });
    });
});
window.updateCartCount = function () {
    const user = JSON.parse(localStorage.getItem('user')); // ✅ siempre lee el actual
    const cartCountEl = document.getElementById('cart-count');

    if (!cartCountEl || !user || !user.carrito) {
        if (cartCountEl) cartCountEl.style.display = 'none';
        return;
    }

    const total = user.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCountEl.textContent = total;
    cartCountEl.style.display = total > 0 ? 'inline-block' : 'none';
};
