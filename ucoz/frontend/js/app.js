// Main JavaScript file for Ticket Aggregator uCoz

// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// API base URL - change this to your uCoz domain
const API_BASE_URL = 'https://your-domain.ucoz.net/backend/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    // Check if user is already logged in
    if (authToken) {
        verifyToken();
    }
});

function initializeApp() {
    // Set minimum date for departure (today)
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="departure_date"]').min = today;
    
    // Set minimum date for return (same as departure)
    const returnDateInput = document.querySelector('input[name="return_date"]');
    if (returnDateInput) {
        returnDateInput.min = today;
    }
}

function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Trip type buttons
    setTripType('one_way'); // Default to one way
}

// Trip type handling
function setTripType(type) {
    const returnDateField = document.getElementById('returnDateField');
    const oneWayBtn = document.getElementById('oneWayBtn');
    const roundTripBtn = document.getElementById('roundTripBtn');
    const returnDateInput = document.querySelector('input[name="return_date"]');
    
    if (type === 'one_way') {
        returnDateField.style.display = 'none';
        returnDateInput.removeAttribute('required');
        oneWayBtn.className = 'flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
        roundTripBtn.className = 'flex-1 py-2 px-3 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900';
    } else {
        returnDateField.style.display = 'block';
        returnDateInput.setAttribute('required', 'required');
        oneWayBtn.className = 'flex-1 py-2 px-3 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900';
        roundTripBtn.className = 'flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
    }
    
    // Update return date min value
    const departureDate = document.querySelector('input[name="departure_date"]').value;
    if (departureDate) {
        returnDateInput.min = departureDate;
    }
}

// Search handling
async function handleSearch(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const searchData = {
        from_location: formData.get('from_location'),
        to_location: formData.get('to_location'),
        departure_date: formData.get('departure_date'),
        return_date: formData.get('return_date') || null,
        passengers_count: parseInt(formData.get('passengers_count')),
        transport_type: getTransportType(),
        trip_type: getTripType()
    };
    
    try {
        showLoading('Поиск билетов...');
        
        const response = await fetch(`${API_BASE_URL}/search/search.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify(searchData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store search results and redirect to results page
            localStorage.setItem('searchResults', JSON.stringify(result.data));
            localStorage.setItem('searchParams', JSON.stringify(searchData));
            window.location.href = 'search-results.html';
        } else {
            showError(result.error?.message || 'Ошибка поиска');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
}

function getTransportType() {
    // This would be determined by user selection or form logic
    return 'airplane'; // Default to airplane
}

function getTripType() {
    const returnDateField = document.getElementById('returnDateField');
    return returnDateField.style.display === 'none' ? 'one_way' : 'round_trip';
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading('Вход в систему...');
        
        const response = await fetch(`${API_BASE_URL}/user/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data.user;
            authToken = result.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            hideLoginModal();
            updateAuthUI();
            showSuccess('Вход выполнен успешно!');
        } else {
            showError(result.error?.message || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        showLoading('Регистрация...');
        
        const response = await fetch(`${API_BASE_URL}/user/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data.user;
            authToken = result.data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            hideRegisterModal();
            updateAuthUI();
            showSuccess('Регистрация выполнена успешно!');
        } else {
            showError(result.error?.message || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError('Ошибка соединения с сервером');
    } finally {
        hideLoading();
    }
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/user/verify-token.php`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data.user;
            updateAuthUI();
        } else {
            // Token is invalid, clear it
            logout();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        logout();
    }
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    updateAuthUI();
    showSuccess('Вы вышли из системы');
}

function updateAuthUI() {
    const authButtons = document.querySelector('.hidden.md\\:flex.items-center.space-x-4');
    
    if (currentUser && authToken) {
        authButtons.innerHTML = `
            <span class="text-gray-700">Привет, ${currentUser.first_name || currentUser.email}</span>
            <button onclick="logout()" class="btn-secondary">Выйти</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button onclick="showLoginModal()" class="btn-secondary">Войти</button>
            <button onclick="showRegisterModal()" class="btn-primary">Регистрация</button>
        `;
    }
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function hideRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
}

// Utility functions
function showLoading(message = 'Загрузка...') {
    // Create loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    loadingDiv.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="text-gray-700">${message}</span>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.id === 'loginModal') {
        hideLoginModal();
    }
    if (e.target.id === 'registerModal') {
        hideRegisterModal();
    }
});

// Handle return date minimum value
document.querySelector('input[name="departure_date"]').addEventListener('change', function() {
    const returnDateInput = document.querySelector('input[name="return_date"]');
    if (returnDateInput) {
        returnDateInput.min = this.value;
        if (returnDateInput.value && returnDateInput.value < this.value) {
            returnDateInput.value = this.value;
        }
    }
});