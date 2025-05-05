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
            localStorage.setItem('sessionId', data.sessionId);
            localStorage.setItem('user', JSON.stringify(data.user));
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
            body: JSON.stringify({ username, email, password })
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
        return !!localStorage.getItem('sessionId');
    },

    isAdmin: function() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    getCurrentUser: function() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout: function() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        window.location.href = 'Login.html';
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
    // Formulario de Login
    const loginForm = document.getElementById('formLogin');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            AuthController.login(username, password)
                .then(function(user) {
                    window.location.href = user.role === 'admin' ? 'Admin.html' : 'Home.html';
                })
                .catch(function(error) {
                    alert(error.message);
                });
        });
    }

    // Formulario de Registro
    const registerForm = document.getElementById('formRegister');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('registerUser').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

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
    document.querySelectorAll('.btn-toggle-form, .btn-outline-secondary').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            toggleForms();
        });
    });

    // Role-based access control
    if (!AuthController.isAuthenticated()) {
        // Redirect unauthenticated users to the login page
        window.location.href = 'Login.html';
    } else {
        // Add 'Gestión de Productos' link for admin users
        if (AuthController.isAdmin()) {
            const nav = document.querySelector(".navbar-nav");
            if (nav) {
                const li = document.createElement("li");
                li.classList.add("nav-item");

                const a = document.createElement("a");
                a.classList.add("nav-link");
                a.href = "Admin.html";
                a.textContent = "Gestión de Productos";

                li.appendChild(a);
                nav.appendChild(li);
            }
        } else {
            // Remove the 'Gestión de Productos' link for non-admin users
            const gestionLink = document.querySelector('a[href="Admin.html"]');
            if (gestionLink) gestionLink.remove();
        }
    }

    // Handle logout button click
    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            AuthController.logout();
        });
    }
});