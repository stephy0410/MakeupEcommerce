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
            // Almacena en ambos storages por compatibilidad
            sessionStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.sessionId);
            
            // Redirige con el token en la URL
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
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        window.location.href = 'Login.html';
    },
    redirectWithAuth: function(path) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'Login.html';
            return;
        }
        window.location.href = `${path}?auth=${user.id}`;
    },

    handleNavigation: function() {
        const currentPage = window.location.pathname.split('/').pop();
        const user = this.getCurrentUser();
        
        if (['Home.html', 'Admin.html'].includes(currentPage)) {
            if (!user) {
                window.location.href = 'Login.html';
                return;
            }

            // Verificar si la URL ya tiene el token
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has('auth')) {
                window.location.href = `${currentPage}?auth=${user.id}`;
            }
        }
    }
};



// Función global para alternar formularios
window.toggleForms = function() {
    const formLogin = document.getElementById('formLogin');
    const formRegister = document.getElementById('formRegister');
    const title = document.getElementById('currentFormTitle');
    
    if (formRegister.classList.contains('d-none')) {
        formLogin.classList.add('d-none');
        formRegister.classList.remove('d-none');
        title.textContent = 'CREAR CUENTA';
    } else {
        formLogin.classList.remove('d-none');
        formRegister.classList.add('d-none');
        title.textContent = 'INICIAR SESIÓN';
    }
};

// Inicialización 
document.addEventListener('DOMContentLoaded', function() {
    AuthController.handleNavigation();
    // Manejo de formularios
    const loginForm = document.getElementById('formLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            AuthController.login(username, password)
                .then(function(user) {
                    const redirectTo = user.role === 'admin' ? 'Admin.html' : 'Home.html';
                    console.log(`Redirigiendo a: ${redirectTo}`);
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

    // Configurar botones de toggle
    document.querySelectorAll('.btn-toggle-form').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            toggleForms();
        });
    });

    // Control de acceso basado en roles (RBAC)
    const currentPage = window.location.pathname.split('/').pop();
    
    // Solo aplicar redirecciones si no estamos en login/register
    if (!['Login.html', 'Register.html'].includes(currentPage)) {
        if (!AuthController.isAuthenticated()) {
            console.log('Usuario no autenticado, redirigiendo a login');
            window.location.href = 'Login.html';
            return;
        }

        // Verificación especial para página de admin
        if (currentPage === 'Admin.html' && !AuthController.isAdmin()) {
            console.log('Acceso no autorizado a Admin.html');
            alert('No tienes permisos de administrador');
            window.location.href = 'Home.html';
            return;
        }

        // Agregar elemento de menú para admin
        if (AuthController.isAdmin() && currentPage !== 'Admin.html') {
            const nav = document.querySelector(".navbar-nav");
            if (nav) {
                const existingLink = document.querySelector('a[href="Admin.html"]');
                if (!existingLink) {
                    const li = document.createElement("li");
                    li.classList.add("nav-item");
        
                    const a = document.createElement("a");
                    a.classList.add("nav-link");
                    a.href = "#";
                    a.textContent = "Gestión de Productos";
                    a.onclick = function(e) {
                        e.preventDefault();
                        AuthController.redirectWithAuth('Admin.html');
                    };
        
                    li.appendChild(a);
                    nav.appendChild(li);
                }
            }
        }
    }

    // Botón de logout
    document.querySelectorAll('.logout-btn').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            AuthController.logout();
        });
    });
});