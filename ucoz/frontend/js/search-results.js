// JavaScript for search results page

// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let searchResults = [];
let filteredResults = [];

// API base URL - change this to your uCoz domain
const API_BASE_URL = 'https://your-domain.ucoz.net/backend/api';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    
    // Check if user is already logged in
    if (authToken) {
        verifyToken();
    }
    
    // Load search results
    loadSearchResults();
});

function initializePage() {
    // Set up filter event listeners
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('stopsFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
}

function setupEventListeners() {
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
}

function loadSearchResults() {
    // Get search results from localStorage
    const storedResults = localStorage.getItem('searchResults');
    const storedParams = localStorage.getItem('searchParams');
    
    if (!storedResults || !storedParams) {
        showNoResults();
        return;
    }
    
    try {
        searchResults = JSON.parse(storedResults);
        const searchParams = JSON.parse(storedParams);
        
        // Display search summary
        displaySearchSummary(searchParams);
        
        // Display results
        filteredResults = [...searchResults.results];
        displayResults(filteredResults);
        
    } catch (error) {
        console.error('Error loading search results:', error);
        showNoResults();
    }
}

function displaySearchSummary(params) {
    const summaryDiv = document.getElementById('searchSummary');
    
    const summaryHTML = `
        <div class="text-center">
            <div class="font-medium text-gray-900">${params.from_location}</div>
            <div class="text-xs text-gray-500">Откуда</div>
        </div>
        <div class="text-center">
            <svg class="w-4 h-4 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
        </div>
        <div class="text-center">
            <div class="font-medium text-gray-900">${params.to_location}</div>
            <div class="text-xs text-gray-500">Куда</div>
        </div>
        <div class="text-center">
            <div class="font-medium text-gray-900">${formatDate(params.departure_date)}</div>
            <div class="text-xs text-gray-500">Дата выезда</div>
        </div>
        ${params.return_date ? `
        <div class="text-center">
            <div class="font-medium text-gray-900">${formatDate(params.return_date)}</div>
            <div class="text-xs text-gray-500">Дата возврата</div>
        </div>
        ` : ''}
        <div class="text-center">
            <div class="font-medium text-gray-900">${params.passengers_count}</div>
            <div class="text-xs text-gray-500">Пассажиров</div>
        </div>
        <div class="text-center">
            <div class="font-medium text-gray-900">${getTransportTypeName(params.transport_type)}</div>
            <div class="text-xs text-gray-500">Транспорт</div>
        </div>
    `;
    
    summaryDiv.innerHTML = summaryHTML;
}

function displayResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    const noResultsDiv = document.getElementById('noResults');
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '';
        noResultsDiv.classList.remove('hidden');
        return;
    }
    
    noResultsDiv.classList.add('hidden');
    
    const resultsHTML = results.map(ticket => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <!-- Provider Info -->
                <div class="flex items-center space-x-4 mb-4 lg:mb-0">
                    <img src="${ticket.provider_logo}" alt="${ticket.provider_name}" class="w-16 h-8 object-contain">
                    <div>
                        <h3 class="font-semibold text-gray-900">${ticket.provider_name}</h3>
                        <p class="text-sm text-gray-500">${ticket.transport_type === 'airplane' ? 'Самолет' : ticket.transport_type === 'train' ? 'Поезд' : 'Автобус'}</p>
                    </div>
                </div>
                
                <!-- Flight Details -->
                <div class="flex-1 lg:mx-8">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-lg font-semibold text-gray-900">${ticket.departure_time}</div>
                            <div class="text-sm text-gray-500">${formatDate(ticket.departure_date)}</div>
                            <div class="text-sm font-medium text-gray-700">${ticket.from_location}</div>
                        </div>
                        
                        <div class="flex flex-col items-center">
                            <div class="text-sm text-gray-500 mb-1">${ticket.duration}</div>
                            <div class="w-full h-px bg-gray-300 relative">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-gray-400 bg-white px-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                    </svg>
                                </div>
                            </div>
                            ${ticket.stops_count > 0 ? `
                                <div class="text-xs text-gray-500 mt-1">
                                    ${ticket.stops_count === 1 ? '1 пересадка' : `${ticket.stops_count} пересадки`}
                                </div>
                            ` : '<div class="text-xs text-green-600 mt-1">Прямой</div>'}
                        </div>
                        
                        <div>
                            <div class="text-lg font-semibold text-gray-900">${ticket.arrival_time}</div>
                            <div class="text-sm text-gray-500">${formatDate(ticket.departure_date)}</div>
                            <div class="text-sm font-medium text-gray-700">${ticket.to_location}</div>
                        </div>
                    </div>
                    
                    ${ticket.stops && ticket.stops.length > 0 ? `
                        <div class="mt-3 text-center">
                            <div class="text-xs text-gray-500">
                                Через: ${ticket.stops.join(', ')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Price and Actions -->
                <div class="flex flex-col items-end space-y-3 mt-4 lg:mt-0">
                    <div class="text-right">
                        ${ticket.original_price && ticket.original_price > ticket.price ? `
                            <div class="text-sm text-gray-500 line-through">${formatPrice(ticket.original_price)}</div>
                        ` : ''}
                        <div class="text-2xl font-bold text-gray-900">${formatPrice(ticket.price)}</div>
                        ${ticket.discount_percentage ? `
                            <div class="text-sm text-green-600">-${ticket.discount_percentage}%</div>
                        ` : ''}
                    </div>
                    
                    <div class="flex space-x-2">
                        <button onclick="showTicketDetails('${ticket.id}')" class="btn-secondary text-sm px-3 py-2">
                            Детали
                        </button>
                        <button onclick="bookTicket('${ticket.id}')" class="btn-primary text-sm px-3 py-2">
                            Забронировать
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Amenities -->
            ${ticket.amenities && ticket.amenities.length > 0 ? `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex flex-wrap gap-2">
                        ${ticket.amenities.map(amenity => `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ${amenity}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    resultsContainer.innerHTML = resultsHTML;
}

function applyFilters() {
    const priceFilter = document.getElementById('priceFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const stopsFilter = document.getElementById('stopsFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = [...searchResults.results];
    
    // Apply price filter
    if (priceFilter) {
        const [min, max] = priceFilter.split('-').map(p => p === '+' ? Infinity : parseInt(p));
        filtered = filtered.filter(ticket => {
            if (max === Infinity) {
                return ticket.price >= min;
            }
            return ticket.price >= min && ticket.price <= max;
        });
    }
    
    // Apply time filter
    if (timeFilter) {
        const [start, end] = timeFilter.split('-').map(t => parseInt(t.split(':')[0]));
        filtered = filtered.filter(ticket => {
            const hour = parseInt(ticket.departure_time.split(':')[0]);
            if (end === 0) { // Night (00:00-06:00)
                return hour >= start || hour < 6;
            }
            return hour >= start && hour < end;
        });
    }
    
    // Apply stops filter
    if (stopsFilter) {
        if (stopsFilter === '0') {
            filtered = filtered.filter(ticket => ticket.stops_count === 0);
        } else if (stopsFilter === '1') {
            filtered = filtered.filter(ticket => ticket.stops_count === 1);
        } else if (stopsFilter === '2+') {
            filtered = filtered.filter(ticket => ticket.stops_count >= 2);
        }
    }
    
    // Apply sorting
    if (sortFilter === 'price') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortFilter === 'duration') {
        filtered.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    } else if (sortFilter === 'departure') {
        filtered.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }
    
    filteredResults = filtered;
    displayResults(filteredResults);
}

function parseDuration(duration) {
    const match = duration.match(/(\d+)h\s*(\d+)?m?/);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        return hours * 60 + minutes;
    }
    return 0;
}

function showTicketDetails(ticketId) {
    // Find ticket
    const ticket = searchResults.results.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Show modal with ticket details
    alert(`Детали билета ${ticketId}\nПоставщик: ${ticket.provider_name}\nЦена: ${formatPrice(ticket.price)}`);
}

function bookTicket(ticketId) {
    if (!authToken) {
        showLoginModal();
        return;
    }
    
    // Find ticket
    const ticket = searchResults.results.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Redirect to booking page or show booking modal
    alert(`Бронирование билета ${ticketId}\nПоставщик: ${ticket.provider_name}\nЦена: ${formatPrice(ticket.price)}`);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function getTransportTypeName(type) {
    const types = {
        'airplane': 'Самолет',
        'train': 'Поезд',
        'bus': 'Автобус'
    };
    return types[type] || type;
}

function showNoResults() {
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('noResults').classList.remove('hidden');
}

// Authentication functions (same as in app.js)
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
    const authButtons = document.getElementById('authButtons');
    
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