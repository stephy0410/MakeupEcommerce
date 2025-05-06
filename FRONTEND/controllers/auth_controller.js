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
                <a href="./Carrito.html" class="nav-link">
                    <i class="fa-solid fa-cart-shopping" style="background-color: black; color: white; padding: 4px;"></i>
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

            AuthController.register(username, email, password, confirmPassword)
                .then(function() {
                    alert('Registro exitoso! Por favor inicia sesión.');
                    toggleForms();
                })
                .catch(function(error) {
                    alert(error.message);
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
