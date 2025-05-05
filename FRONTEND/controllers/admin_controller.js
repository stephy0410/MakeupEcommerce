const AdminController = {
    checkAuth: function() {
        const user = JSON.parse(localStorage.getItem('user'));
        const sessionId = localStorage.getItem('sessionId');
        
        if (!sessionId || !user || user.role !== 'admin') {
            window.location.href = 'Login.html';
            return false;
        }
        return true;
    },

    handleLogout: function() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        window.location.href = 'Login.html';
    },

    loadAdminData: function() {
        fetch('/api/admin/users', {
            headers: {
                'Authorization': localStorage.getItem('sessionId')
            }
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load admin data');
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Admin data loaded:', data);
            // Process and display admin data here
        })
        .catch(function(error) {
            console.error('Admin data error:', error);
            alert('Error loading admin data');
        });
    },

    init: function() {
        if (!this.checkAuth()) return;
        
        this.loadAdminData();
        
        // Set up logout button
        document.querySelector('.logout-btn').addEventListener('click', function() {
            AdminController.handleLogout();
        });
    }
};

// Initialization
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('Admin.html')) {
            AdminController.init();
        }
    });
}