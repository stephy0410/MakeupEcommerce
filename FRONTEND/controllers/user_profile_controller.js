// controllers/user_profile_controller.js
document.addEventListener('DOMContentLoaded', function () {
    const user = AuthController.getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();

    // Solo proteger Admin.html
    if (currentPage === 'Admin.html' && !user) {
        window.location.href = 'Login.html';
        return;
    }

    // Si hay sesión iniciada y falta el auth param, agrégalo en Admin.html
    if (user && currentPage === 'Admin.html') {
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
    console.log('authId:', authId);

    if (username && username !== user.username) updates.username = username;
    if (email && email !== user.email) updates.email = email;
    if (password) {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            alert("La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
            return;
        }
        updates.password = password;
    }
    

    if (Object.keys(updates).length === 0) {
        alert('No hiciste cambios');
        return;
    }
    console.log(updates);
    fetch(`/api/users/${authId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
    })
    .then(async res => {
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Error al actualizar usuario');
        }
        return res.json();
    })
    .then(data => {
        alert('Usuario actualizado');
    
        const currentSessionUser = JSON.parse(sessionStorage.getItem('user'));
        const currentLocalUser = JSON.parse(localStorage.getItem('user'));
    
        const mergedSessionUser = { ...currentSessionUser, ...data };
        const mergedLocalUser = { ...currentLocalUser, ...data };
    
        sessionStorage.setItem('user', JSON.stringify(mergedSessionUser));
        localStorage.setItem('user', JSON.stringify(mergedLocalUser));
    
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        if (modal) modal.hide();
    
        AuthController.handleNavigation();
    })
    .catch(err => {
        alert(err.message || 'Error al actualizar usuario');
    });    
    
}
    
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
