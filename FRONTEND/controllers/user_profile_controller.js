// controllers/user_profile_controller.js
// Verificación de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const user = AuthController.getCurrentUser();
    if (!user) {
        window.location.href = 'Login.html';
        return;
    }

    // Si estamos en una página protegida, asegurar el token en la URL
    const currentPage = window.location.pathname.split('/').pop();
    if (['Profile.html', 'Home.html', 'Admin.html'].includes(currentPage)) {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('auth')) {
            window.location.href = `${currentPage}?auth=${user.id}`;
        }
    }
});


window.updateUser = function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const username = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;

    const authId = user.id;
    const updates = {};

    if (username && username !== user.username) updates.username = username;
    if (email && email !== user.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
        alert('No hiciste cambios');
        return;
    }

    fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authId
        },
        body: JSON.stringify(updates)
    })
    .then(res => res.json())
    .then(data => {
        alert('Usuario actualizado');
        sessionStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('user', JSON.stringify(data));
        location.reload();
    })
    .catch(err => alert('Error al actualizar usuario'));
};

window.confirmDelete = function () {
    const authId = JSON.parse(localStorage.getItem('user')).id;

    if (confirm('¿Estás seguro de eliminar tu cuenta?')) {
        fetch('/api/users/me', {
            method: 'DELETE',
            headers: { 'Authorization': authId }
        })
        .then(res => res.json())
        .then(() => {
            alert('Cuenta eliminada');
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'Login.html';
        })
        .catch(err => alert('Error al eliminar usuario'));
    }
};

window.populateUserModal = function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const nameInput = document.getElementById('editName');
    const emailInput = document.getElementById('editEmail');
    const passwordInput = document.getElementById('editPassword');

    if (nameInput) {
        nameInput.value = user.username || '';
        nameInput.style.color = '#6c757d';
    }
    if (emailInput) {
        emailInput.value = user.email || '';
        emailInput.style.color = '#6c757d';
    }
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.placeholder = '••••••••';
        passwordInput.style.color = '#6c757d';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.addEventListener('show.bs.modal', populateUserModal);
    }
});
