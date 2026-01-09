/**
 * Token Management System - Frontend Logic
 * Handles UI interactions and API communication
 * With Role-Based Access Control
 */

// Configuration
const API_BASE_URL = window.location.origin;

// ============================================
// AUTHENTICATION STATE
// ============================================
let currentUser = null;
let authToken = null;

// Check authentication on page load
function checkAuth() {
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        window.location.href = '/login';
        return false;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        updateUIForRole();
        return true;
    } catch (e) {
        logout();
        return false;
    }
}

// Get auth headers for API calls
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Logout function
function logout() {
    // Call logout API
    fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
    }).catch(() => {});
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
}

// Update UI based on user role
function updateUIForRole() {
    if (!currentUser) return;
    
    const isSuperAdmin = currentUser.role === 'super_admin';
    const isAdmin = currentUser.role === 'admin';
    
    // Update header with user info
    const headerDiv = document.querySelector('header .container');
    if (headerDiv) {
        // Add user info and logout button to header
        const existingUserInfo = document.getElementById('userInfoSection');
        if (!existingUserInfo) {
            const userInfoHTML = `
                <div id="userInfoSection" class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                        <i class="fas ${isSuperAdmin ? 'fa-crown text-yellow-500' : 'fa-user-shield text-green-600'}"></i>
                        <span class="text-sm font-medium text-gray-700">${currentUser.name}</span>
                        <span class="text-xs px-2 py-1 rounded ${isSuperAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}">
                            ${isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                    </div>
                    <button 
                        onclick="logout()"
                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center space-x-2"
                    >
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            `;
            const rightSection = headerDiv.querySelector('.flex.items-center.space-x-4');
            if (rightSection) {
                rightSection.insertAdjacentHTML('afterend', userInfoHTML);
            }
        }
    }
    
    // Hide/disable elements for Admin role
    if (isAdmin) {
        // Hide tag input field in add token form
        const tagInputContainer = tagInput?.parentElement;
        if (tagInputContainer) {
            tagInputContainer.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-tag mr-1"></i>Tag (Auto-assigned)
                </label>
                <div class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                    <i class="fas fa-lock mr-2"></i>🔴 Banti (Auto-assigned)
                </div>
                <input type="hidden" id="tagInput" value="banti">
            `;
        }
        
        // Hide delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.style.display = 'none';
        });
        
        // Hide bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) bulkDeleteBtn.style.display = 'none';
        
        // Hide delete selected button
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) deleteSelectedBtn.style.display = 'none';
        
        // Hide bulk tag update button (Admin can't change tags)
        const bulkUpdateTagBtn = document.getElementById('bulkUpdateTagBtn');
        if (bulkUpdateTagBtn) bulkUpdateTagBtn.style.display = 'none';
        
        // Hide edit tag in edit modal
        const editTagContainer = editTagInput?.parentElement;
        if (editTagContainer) {
            editTagContainer.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-tag mr-1"></i>Tag
                </label>
                <div class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                    <i class="fas fa-lock mr-2"></i>🔴 Banti (Cannot be changed)
                </div>
                <input type="hidden" id="editTagInput" value="banti">
            `;
        }
        
        // Hide WhatsApp tag input
        const whatsappTagContainer = whatsappTagInput?.parentElement;
        if (whatsappTagContainer) {
            whatsappTagContainer.innerHTML = `
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-tag mr-1"></i>Tag for All (Auto-assigned)
                </label>
                <div class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600">
                    <i class="fas fa-lock mr-2"></i>🔴 Banti (Auto-assigned)
                </div>
                <input type="hidden" id="whatsappTagInput" value="banti">
            `;
        }
    }
}

// DOM Elements
const addTokenForm = document.getElementById('addTokenForm');
const nameInput = document.getElementById('nameInput');
const tokenInput = document.getElementById('tokenInput');
const tagInput = document.getElementById('tagInput');
const dateInput = document.getElementById('dateInput');
const addTokenBtn = document.getElementById('addTokenBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tokensList = document.getElementById('tokensList');
const tokensTableBody = document.getElementById('tokensTableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const statusBanner = document.getElementById('statusBanner');
const statusMessage = document.getElementById('statusMessage');
const tokenCount = document.getElementById('tokenCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const dateRangeFilter = document.getElementById('dateRangeFilter');
const sortFilter = document.getElementById('sortFilter');
const tagFilter = document.getElementById('tagFilter');
const expiryFilter = document.getElementById('expiryFilter');
const filterStats = document.getElementById('filterStats');
const filteredCount = document.getElementById('filteredCount');
const totalCount = document.getElementById('totalCount');
const expiryStats = document.getElementById('expiryStats');
const expiredCount = document.getElementById('expiredCount');
const expiringCount = document.getElementById('expiringCount');
const darkModeToggle = document.getElementById('darkModeToggle');
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const bulkActions = document.getElementById('bulkActions');
const selectedCount = document.getElementById('selectedCount');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');

// WhatsApp Import Elements
const whatsappImportBtn = document.getElementById('whatsappImportBtn');
const whatsappImportSection = document.getElementById('whatsappImportSection');
const closeWhatsappImport = document.getElementById('closeWhatsappImport');
const whatsappTextarea = document.getElementById('whatsappTextarea');
const whatsappTagInput = document.getElementById('whatsappTagInput');
const parseWhatsappBtn = document.getElementById('parseWhatsappBtn');
const importWhatsappBtn = document.getElementById('importWhatsappBtn');
const whatsappPreview = document.getElementById('whatsappPreview');
const previewCount = document.getElementById('previewCount');
const previewList = document.getElementById('previewList');

// Bulk Delete Elements
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const bulkDeleteSection = document.getElementById('bulkDeleteSection');
const closeBulkDelete = document.getElementById('closeBulkDelete');
const bulkDeleteTextarea = document.getElementById('bulkDeleteTextarea');
const searchDeleteBtn = document.getElementById('searchDeleteBtn');
const confirmBulkDeleteBtn = document.getElementById('confirmBulkDeleteBtn');
const bulkDeletePreview = document.getElementById('bulkDeletePreview');
const deletePreviewCount = document.getElementById('deletePreviewCount');
const deletePreviewList = document.getElementById('deletePreviewList');

// Edit Modal Elements
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editTokenForm = document.getElementById('editTokenForm');
const editNameInput = document.getElementById('editNameInput');
const editTokenInput = document.getElementById('editTokenInput');
const editTagInput = document.getElementById('editTagInput');
const editDateInput = document.getElementById('editDateInput');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Bulk Tag Update Elements
const bulkUpdateTagBtn = document.getElementById('bulkUpdateTagBtn');
const bulkTagModal = document.getElementById('bulkTagModal');
const closeBulkTagModal = document.getElementById('closeBulkTagModal');
const cancelBulkTagBtn = document.getElementById('cancelBulkTagBtn');
const confirmBulkTagBtn = document.getElementById('confirmBulkTagBtn');
const bulkTagSelect = document.getElementById('bulkTagSelect');
const bulkTagCount = document.getElementById('bulkTagCount');

// Bulk Date Update Elements
const bulkUpdateDateBtn = document.getElementById('bulkUpdateDateBtn');
const bulkDateModal = document.getElementById('bulkDateModal');
const closeBulkDateModal = document.getElementById('closeBulkDateModal');
const cancelBulkDateBtn = document.getElementById('cancelBulkDateBtn');
const confirmBulkDateBtn = document.getElementById('confirmBulkDateBtn');
const bulkDateInput = document.getElementById('bulkDateInput');
const bulkDateCount = document.getElementById('bulkDateCount');

// State
let tokens = [];
let filteredTokens = [];
let tokensToDelete = [];
let isLoading = false;
let currentSearchTerm = '';
let currentSortOrder = 'newest';
let currentDateRange = 'all';
let parsedWhatsappTokens = [];
let currentTagFilter = '';
let currentExpiryFilter = '';
let selectedTokens = new Set();
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentEditingTokenId = null;

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Token Management System initialized');
    
    // Check authentication first
    if (!checkAuth()) {
        return; // Will redirect to login
    }
    
    initDarkMode();
    loadTokens();
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    addTokenForm.addEventListener('submit', handleAddToken);
    refreshBtn.addEventListener('click', handleRefresh);
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    dateRangeFilter.addEventListener('change', handleDateRangeFilter);
    sortFilter.addEventListener('change', handleSort);
    tagFilter.addEventListener('change', handleTagFilter);
    expiryFilter.addEventListener('change', handleExpiryFilter);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    exportBtn.addEventListener('click', toggleExportMenu);
    importBtn.addEventListener('click', () => importFileInput.click());
    
    // Close export menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
            exportMenu.classList.add('hidden');
        }
    });
    importFileInput.addEventListener('change', importTokens);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    deleteSelectedBtn.addEventListener('click', deleteSelectedTokens);
    deselectAllBtn.addEventListener('click', deselectAll);
    
    // WhatsApp Import event listeners
    whatsappImportBtn.addEventListener('click', showWhatsappImport);
    closeWhatsappImport.addEventListener('click', hideWhatsappImport);
    parseWhatsappBtn.addEventListener('click', parseWhatsappMessages);
    importWhatsappBtn.addEventListener('click', importParsedTokens);
    
    // Bulk Delete event listeners
    bulkDeleteBtn.addEventListener('click', showBulkDelete);
    closeBulkDelete.addEventListener('click', hideBulkDelete);
    searchDeleteBtn.addEventListener('click', searchTokensToDelete);
    confirmBulkDeleteBtn.addEventListener('click', confirmBulkDelete);
    
    // Edit modal event listeners
    closeEditModal.addEventListener('click', closeEditModalHandler);
    cancelEditBtn.addEventListener('click', closeEditModalHandler);
    editTokenForm.addEventListener('submit', handleEditToken);
    
    // Bulk Tag Update event listeners
    bulkUpdateTagBtn.addEventListener('click', showBulkTagModal);
    closeBulkTagModal.addEventListener('click', closeBulkTagModalHandler);
    cancelBulkTagBtn.addEventListener('click', closeBulkTagModalHandler);
    confirmBulkTagBtn.addEventListener('click', confirmBulkTagUpdate);
    
    // Bulk Date Update event listeners
    bulkUpdateDateBtn.addEventListener('click', showBulkDateModal);
    closeBulkDateModal.addEventListener('click', closeBulkDateModalHandler);
    cancelBulkDateBtn.addEventListener('click', closeBulkDateModalHandler);
    confirmBulkDateBtn.addEventListener('click', confirmBulkDateUpdate);
    
    // Close edit modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModalHandler();
        }
    });
    
    // Close bulk tag modal when clicking outside
    bulkTagModal.addEventListener('click', (e) => {
        if (e.target === bulkTagModal) {
            closeBulkTagModalHandler();
        }
    });
    
    // Close bulk date modal when clicking outside
    bulkDateModal.addEventListener('click', (e) => {
        if (e.target === bulkDateModal) {
            closeBulkDateModalHandler();
        }
    });
}

/**
 * Show status message
 * @param {String} message - Message to display
 * @param {String} type - Type of message (success, error, info)
 */
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusBanner.className = `mb-6 p-4 rounded-lg shadow-md status-${type}`;
    statusBanner.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusBanner.classList.add('hidden');
    }, 5000);
}

/**
 * Update UI state
 * @param {Boolean} loading - Loading state
 */
function updateUIState(loading) {
    isLoading = loading;
    
    if (loading) {
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        tokensList.classList.add('hidden');
        addTokenBtn.disabled = true;
        addTokenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
    } else {
        loadingState.classList.add('hidden');
        addTokenBtn.disabled = false;
        addTokenBtn.innerHTML = '<i class="fas fa-plus"></i><span>Add Token</span>';
        
        if (tokens.length === 0) {
            emptyState.classList.remove('hidden');
            tokensList.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            tokensList.classList.remove('hidden');
        }
    }
    
    // Update token count
    tokenCount.textContent = tokens.length;
}

/**
 * Load tokens from API
 */
async function loadTokens() {
    try {
        updateUIState(true);
        
        const response = await fetch(`${API_BASE_URL}/api/tokens`, {
            headers: getAuthHeaders()
        });
        
        // Check for authentication errors
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            tokens = data.tokens;
            console.log(`✅ Loaded ${tokens.length} tokens`);
            console.log('Token details:', tokens); // Debug: Show all token data
            renderTokens();
            
            // Update UI for role after loading
            updateUIForRole();
        } else {
            throw new Error(data.message);
        }
        
        updateUIState(false);
    } catch (error) {
        console.error('Error loading tokens:', error);
        showStatus(`Failed to load tokens: ${error.message}`, 'error');
        updateUIState(false);
    }
}

/**
 * Render tokens list
 */
function renderTokens() {
    tokensTableBody.innerHTML = '';
    
    // Apply filters and sorting
    filteredTokens = filterAndSortTokens(tokens, currentSearchTerm, currentSortOrder);
    
    // Update stats
    updateFilterStats();
    
    // Render filtered tokens
    filteredTokens.forEach((token, index) => {
        const tokenRow = createTokenRow(token, index);
        tokensTableBody.appendChild(tokenRow);
    });
    
    // Show "no results" message if filtered list is empty but main list has items
    if (filteredTokens.length === 0 && tokens.length > 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = `
            <td colspan="4" class="px-4 py-8 text-center">
                <i class="fas fa-search text-gray-300 text-4xl mb-3"></i>
                <p class="text-gray-600">No tokens found matching your search</p>
                <button onclick="clearSearch()" class="mt-3 text-indigo-600 hover:text-indigo-800">
                    Clear search
                </button>
            </td>
        `;
        tokensTableBody.appendChild(noResultsRow);
    }
}

/**
 * Filter and sort tokens
 * @param {Array} tokenList - List of tokens
 * @param {String} searchTerm - Search term
 * @param {String} sortOrder - Sort order
 * @returns {Array} Filtered and sorted tokens
 */
function filterAndSortTokens(tokenList, searchTerm, sortOrder) {
    let result = [...tokenList];
    
    // Apply date range filter
    if (currentDateRange && currentDateRange !== 'all') {
        result = result.filter(token => {
            const now = new Date();
            const tokenDate = new Date(token.createdAt);
            const daysDiff = Math.floor((now - tokenDate) / (1000 * 60 * 60 * 24));
            
            switch (currentDateRange) {
                case 'today':
                    return daysDiff === 0;
                case '7days':
                    return daysDiff <= 7;
                case '30days':
                    return daysDiff <= 30;
                case '90days':
                    return daysDiff <= 90;
                default:
                    return true;
            }
        });
    }
    
    // Apply tag filter
    if (currentTagFilter) {
        result = result.filter(token => token.tag === currentTagFilter);
    }
    
    // Apply expiry filter
    if (currentExpiryFilter) {
        result = result.filter(token => {
            const now = new Date();
            const tokenDate = new Date(token.createdAt);
            const tokenAge = Math.floor((now - tokenDate) / (1000 * 60 * 60 * 24));
            
            switch (currentExpiryFilter) {
                case 'expired':
                    return tokenAge >= 30;
                case 'expiring':
                    return tokenAge >= 25 && tokenAge < 30;
                case 'active':
                    return tokenAge < 25;
                default:
                    return true;
            }
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(token => {
            const name = (token.name || '').toLowerCase();
            const value = (token.value || '').toLowerCase();
            return name.includes(term) || value.includes(term);
        });
    }
    
    // Apply sorting
    switch (sortOrder) {
        case 'newest':
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'name-asc':
            result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
    }
    
    return result;
}

/**
 * Update filter statistics
 */
function updateFilterStats() {
    totalCount.textContent = tokens.length;
    filteredCount.textContent = filteredTokens.length;
    
    // Calculate expiry statistics
    const now = new Date();
    let expired = 0;
    let expiring = 0;
    
    tokens.forEach(token => {
        const tokenDate = new Date(token.createdAt);
        const tokenAge = Math.floor((now - tokenDate) / (1000 * 60 * 60 * 24));
        
        if (tokenAge >= 30) {
            expired++;
        } else if (tokenAge >= 25) {
            expiring++;
        }
    });
    
    expiredCount.textContent = expired;
    expiringCount.textContent = expiring;
    
    // Show expiry stats if there are expired or expiring tokens
    if (expired > 0 || expiring > 0) {
        expiryStats.classList.remove('hidden');
    } else {
        expiryStats.classList.add('hidden');
    }
    
    // Show filter stats only when filtering is active
    if (currentSearchTerm || filteredTokens.length !== tokens.length) {
        filterStats.classList.remove('hidden');
    } else {
        filterStats.classList.add('hidden');
    }
}

/**
 * Handle search input
 * @param {Event} e - Input event
 */
function handleSearch(e) {
    currentSearchTerm = e.target.value.trim();
    
    // Show/hide clear button
    if (currentSearchTerm) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
    
    renderTokens();
}

/**
 * Clear search
 */
function clearSearch() {
    searchInput.value = '';
    currentSearchTerm = '';
    clearSearchBtn.classList.add('hidden');
    renderTokens();
    searchInput.focus();
}

/**
 * Handle sort change
 * @param {Event} e - Change event
 */
function handleSort(e) {
    currentSortOrder = e.target.value;
    renderTokens();
}

/**
 * Create token row element
 * @param {Object} token - Token object
 * @param {Number} index - Token index
 * @returns {HTMLElement} Token row element
 */
function createTokenRow(token, index) {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-200 hover:bg-gray-50 transition token-card';
    row.style.animationDelay = `${index * 0.05}s`;
    
    // Check if user is Admin (for hiding delete button)
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
    
    // Format date as DD-MM-YYYY
    const date = new Date(token.createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // Also create readable format like "02 Nov 2025"
    const readableDate = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric'
    });
    
    // Check if token is older than 1 month (30 days)
    const now = new Date();
    const tokenAge = Math.floor((now - date) / (1000 * 60 * 60 * 24)); // Days
    const isExpired = tokenAge >= 30;
    const daysLeft = 30 - tokenAge;
    
    // Set row background color based on age
    if (isExpired) {
        row.className += ' bg-red-50 border-red-200';
    } else if (tokenAge >= 25) {
        row.className += ' bg-yellow-50 border-yellow-200'; // Warning: expiring soon
    }
    
    // Mask the token (show only first 4 and last 4 characters)
    const tokenValue = token.value || '';
    let maskedToken = '••••••••••••••';
    if (tokenValue.length > 8) {
        maskedToken = tokenValue.substring(0, 4) + '••••••••' + tokenValue.substring(tokenValue.length - 4);
    } else if (tokenValue.length > 0) {
        maskedToken = '••••••••••••••';
    }
    
    // Get name from token object
    const tokenName = escapeHtml(token.name || 'Unknown');
    
    // Get tag badge
    const tagBadges = {
        'banti': '<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">🔴 Banti</span>',
        'development': '<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">🟢 Development</span>',
        'testing': '<span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">🟡 Testing</span>',
        'staging': '<span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">🟠 Staging</span>',
        'personal': '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">🔵 Personal</span>'
    };
    const tagBadge = token.tag ? tagBadges[token.tag] || '' : '<span class="text-gray-400 text-xs">-</span>';
    
    const isChecked = selectedTokens.has(token.id) ? 'checked' : '';
    
    row.innerHTML = `
        <td class="px-4 py-4 text-center">
            <input 
                type="checkbox" 
                class="token-checkbox w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                data-token-id="${token.id}"
                ${isChecked}
                onchange="toggleTokenSelection('${token.id}')"
            >
        </td>
        <td class="px-4 py-4">
            <div class="flex items-center">
                <i class="fas fa-user-circle text-indigo-500 mr-2 text-lg"></i>
                <span class="font-medium text-gray-800">${tokenName}</span>
            </div>
        </td>
        <td class="px-4 py-4">
            <div class="flex items-center space-x-2">
                <span class="font-mono text-gray-600" id="token-${token.id}">${maskedToken}</span>
                <button 
                    onclick="toggleTokenVisibility('${token.id}', '${escapeHtml(tokenValue)}')"
                    class="text-gray-400 hover:text-indigo-600 transition"
                    title="Show/Hide token"
                >
                    <i class="fas fa-eye" id="eye-${token.id}"></i>
                </button>
            </div>
        </td>
        <td class="px-4 py-4">
            ${tagBadge}
        </td>
        <td class="px-4 py-4">
            <div class="flex flex-col">
                <span class="${isExpired ? 'text-red-700 font-semibold' : 'text-gray-700'}" title="${readableDate}">
                    ${formattedDate}
                </span>
                ${isExpired ? 
                    `<span class="text-xs text-red-600 mt-1">
                        <i class="fas fa-exclamation-triangle mr-1"></i>Expired (${tokenAge} days old)
                    </span>` : 
                    tokenAge >= 25 ? 
                    `<span class="text-xs text-yellow-600 mt-1">
                        <i class="fas fa-clock mr-1"></i>Expires in ${daysLeft} days
                    </span>` :
                    `<span class="text-xs text-gray-500 mt-1">${tokenAge} days old</span>`
                }
            </div>
        </td>
        <td class="px-4 py-4">
            <div class="flex items-center justify-center space-x-2">
                <button 
                    onclick="copyToClipboard('${escapeHtml(tokenValue)}', this)"
                    class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center space-x-1"
                    title="Copy to clipboard"
                >
                    <i class="fas fa-copy"></i>
                    <span class="hidden lg:inline">Copy</span>
                </button>
                <button 
                    onclick="openEditModal('${token.id}')"
                    class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm flex items-center space-x-1"
                    title="Edit token"
                >
                    <i class="fas fa-edit"></i>
                    <span class="hidden lg:inline">Edit</span>
                </button>
                ${isSuperAdmin ? `
                <button 
                    onclick="deleteToken('${token.id}')"
                    class="btn-delete px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm flex items-center space-x-1"
                    title="Delete token"
                >
                    <i class="fas fa-trash"></i>
                    <span class="hidden lg:inline">Delete</span>
                </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return row;
}

/**
 * Toggle token visibility
 * @param {String} tokenId - Token ID
 * @param {String} fullToken - Full token value
 */
function toggleTokenVisibility(tokenId, fullToken) {
    const tokenElement = document.getElementById(`token-${tokenId}`);
    const eyeIcon = document.getElementById(`eye-${tokenId}`);
    
    if (tokenElement.dataset.visible === 'true') {
        // Hide token
        let maskedToken = '••••••••••••••';
        if (fullToken.length > 8) {
            maskedToken = fullToken.substring(0, 4) + '••••••••' + fullToken.substring(fullToken.length - 4);
        }
        tokenElement.textContent = maskedToken;
        tokenElement.dataset.visible = 'false';
        eyeIcon.className = 'fas fa-eye';
    } else {
        // Show token
        tokenElement.textContent = fullToken;
        tokenElement.dataset.visible = 'true';
        eyeIcon.className = 'fas fa-eye-slash';
    }
}

/**
 * Handle add token form submission
 * @param {Event} e - Form submit event
 */
async function handleAddToken(e) {
    e.preventDefault();
    
    const nameValue = nameInput.value.trim();
    const tokenValue = tokenInput.value.trim();
    const tagInputEl = document.getElementById('tagInput');
    const tagValue = tagInputEl ? tagInputEl.value : '';
    const dateValue = dateInput.value;
    
    if (!nameValue) {
        showStatus('Please enter a name', 'error');
        nameInput.focus();
        return;
    }
    
    if (!tokenValue) {
        showStatus('Please enter a token', 'error');
        tokenInput.focus();
        return;
    }
    
    try {
        updateUIState(true);
        
        // Prepare request body
        const requestBody = { 
            name: nameValue,
            token: tokenValue,
            tag: tagValue
        };
        
        // Add createdAt if date is selected
        if (dateValue) {
            requestBody.createdAt = new Date(dateValue).toISOString();
        }
        
        const response = await fetch(`${API_BASE_URL}/api/tokens`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });
        
        // Check for authentication errors
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Add token to local state
            tokens.push(data.token);
            renderTokens();
            
            // Clear inputs
            nameInput.value = '';
            tokenInput.value = '';
            if (tagInputEl && tagInputEl.tagName === 'SELECT') {
                tagInputEl.value = '';
            }
            dateInput.value = '';
            nameInput.focus();
            
            showStatus('Token added successfully!', 'success');
            console.log('✅ Token added:', data.token.id);
        } else {
            throw new Error(data.message);
        }
        
        updateUIState(false);
    } catch (error) {
        console.error('Error adding token:', error);
        showStatus(`Failed to add token: ${error.message}`, 'error');
        updateUIState(false);
    }
}

/**
 * Delete token
 * @param {String} tokenId - Token ID to delete
 */
async function deleteToken(tokenId) {
    // Check if user is Admin (not Super Admin)
    if (currentUser && currentUser.role === 'admin') {
        showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this token?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/tokens/${tokenId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        // Check for authentication errors
        if (response.status === 401) {
            logout();
            return;
        }
        
        // Check for authorization errors
        if (response.status === 403) {
            showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Remove token from local state
            tokens = tokens.filter(t => t.id !== tokenId);
            renderTokens();
            updateUIState(false);
            
            showStatus('Token deleted successfully!', 'success');
            console.log('✅ Token deleted:', tokenId);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error deleting token:', error);
        showStatus(`Failed to delete token: ${error.message}`, 'error');
    }
}

/**
 * Copy token to clipboard
 * @param {String} text - Text to copy
 * @param {HTMLElement} button - Button element
 */
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i><span class="hidden sm:inline">Copied!</span>';
        button.classList.add('copy-feedback', 'bg-green-500');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copy-feedback', 'bg-green-500');
        }, 2000);
        
        showStatus('Token copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showStatus('Failed to copy to clipboard', 'error');
    }
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
    console.log('🔄 Refreshing tokens...');
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Refreshing...</span>';
    refreshBtn.disabled = true;
    
    await loadTokens();
    
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Refresh</span>';
    refreshBtn.disabled = false;
    showStatus('Tokens refreshed!', 'success');
}

/**
 * Escape HTML to prevent XSS
 * @param {String} text - Text to escape
 * @returns {String} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

/**
 * Dark Mode Functions
 */
function initDarkMode() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400 text-xl"></i>';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun text-yellow-400 text-xl"></i>';
        showStatus('Dark mode enabled', 'success');
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon text-gray-600 text-xl"></i>';
        showStatus('Light mode enabled', 'success');
    }
}

/**
 * Date Range Filter
 */
function handleDateRangeFilter(e) {
    currentDateRange = e.target.value;
    renderTokens();
}

/**
 * Tag Filter
 */
function handleTagFilter(e) {
    currentTagFilter = e.target.value;
    renderTokens();
}

/**
 * Expiry Filter
 */
function handleExpiryFilter(e) {
    currentExpiryFilter = e.target.value;
    renderTokens();
}

/**
 * Toggle Export Menu
 */
function toggleExportMenu(e) {
    e.stopPropagation();
    exportMenu.classList.toggle('hidden');
}

/**
 * Export Tokens to CSV (Excel compatible)
 */
function exportToCSV() {
    try {
        exportMenu.classList.add('hidden');
        
        // CSV Header with UTF-8 BOM for Excel compatibility
        let csv = '\uFEFF'; // UTF-8 BOM
        csv += 'Name,Token,Tag,Added On\r\n';
        
        // CSV Data
        tokens.forEach(token => {
            const date = new Date(token.createdAt);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            
            // Escape double quotes and wrap in quotes
            const name = `"${(token.name || '').replace(/"/g, '""')}"`;
            const value = `"${(token.value || '').replace(/"/g, '""')}"`;
            const tag = `"${token.tag || 'None'}"`;
            const dateStr = `"${formattedDate}"`;
            
            csv += `${name},${value},${tag},${dateStr}\r\n`;
        });
        
        // Create and download file with proper CSV MIME type
        const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `tokens-backup-${new Date().toISOString().split('T')[0]}.csv`);
        
        // Force download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        showStatus(`Exported ${tokens.length} tokens to CSV successfully!`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showStatus('Failed to export tokens to CSV', 'error');
    }
}

/**
 * Export Tokens to JSON
 */
function exportToJSON() {
    try {
        exportMenu.classList.add('hidden');
        
        const dataStr = JSON.stringify(tokens, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tokens-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showStatus(`Exported ${tokens.length} tokens to JSON successfully!`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showStatus('Failed to export tokens to JSON', 'error');
    }
}

/**
 * Import Tokens from JSON
 */
async function importTokens(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const importedTokens = JSON.parse(text);
        
        if (!Array.isArray(importedTokens)) {
            throw new Error('Invalid file format');
        }
        
        const confirmed = confirm(`Import ${importedTokens.length} tokens? This will add them to your existing tokens.`);
        if (!confirmed) {
            importFileInput.value = '';
            return;
        }
        
        // Add imported tokens
        for (const token of importedTokens) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/tokens`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: token.name || 'Imported Token',
                        token: token.value || token.token,
                        tag: token.tag || ''
                    })
                });
                
                if (response.status === 401) {
                    logout();
                    return;
                }
                
                const data = await response.json();
                if (data.success) {
                    tokens.push(data.token);
                }
            } catch (err) {
                console.error('Failed to import token:', err);
            }
        }
        
        renderTokens();
        updateUIState(false);
        showStatus(`Imported ${importedTokens.length} tokens successfully!`, 'success');
        importFileInput.value = '';
        
    } catch (error) {
        console.error('Import error:', error);
        showStatus('Failed to import tokens. Please check file format.', 'error');
        importFileInput.value = '';
    }
}

/**
 * Bulk Selection Functions
 */
function toggleSelectAll(e) {
    if (e.target.checked) {
        filteredTokens.forEach(token => selectedTokens.add(token.id));
    } else {
        selectedTokens.clear();
    }
    renderTokens();
    updateBulkActions();
}

function toggleTokenSelection(tokenId) {
    if (selectedTokens.has(tokenId)) {
        selectedTokens.delete(tokenId);
    } else {
        selectedTokens.add(tokenId);
    }
    updateBulkActions();
    updateSelectAllCheckbox();
}

function updateBulkActions() {
    selectedCount.textContent = selectedTokens.size;
    if (selectedTokens.size > 0) {
        bulkActions.classList.remove('hidden');
    } else {
        bulkActions.classList.add('hidden');
    }
}

function updateSelectAllCheckbox() {
    const allSelected = filteredTokens.length > 0 && 
                       filteredTokens.every(token => selectedTokens.has(token.id));
    selectAllCheckbox.checked = allSelected;
}

function deselectAll() {
    selectedTokens.clear();
    selectAllCheckbox.checked = false;
    renderTokens();
    updateBulkActions();
}

async function deleteSelectedTokens() {
    if (selectedTokens.size === 0) return;
    
    // Check if user is Admin
    if (currentUser && currentUser.role === 'admin') {
        showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedTokens.size} selected tokens?`);
    if (!confirmed) return;
    
    const idsToDelete = Array.from(selectedTokens);
    let deleted = 0;
    
    for (const id of idsToDelete) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tokens/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.status === 401) {
                logout();
                return;
            }
            
            if (response.status === 403) {
                showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
                return;
            }
            
            const data = await response.json();
            if (data.success) {
                tokens = tokens.filter(t => t.id !== id);
                deleted++;
            }
        } catch (error) {
            console.error('Failed to delete token:', id, error);
        }
    }
    
    selectedTokens.clear();
    renderTokens();
    updateUIState(false);
    updateBulkActions();
    showStatus(`Deleted ${deleted} tokens successfully!`, 'success');
}

/**
 * WhatsApp Import Functions
 */

/**
 * Show WhatsApp import section
 */
function showWhatsappImport() {
    whatsappImportSection.classList.remove('hidden');
    whatsappTextarea.focus();
    // Scroll to the section
    whatsappImportSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Hide WhatsApp import section
 */
function hideWhatsappImport() {
    whatsappImportSection.classList.add('hidden');
    whatsappTextarea.value = '';
    whatsappPreview.classList.add('hidden');
    parsedWhatsappTokens = [];
    importWhatsappBtn.disabled = true;
}

/**
 * Parse WhatsApp messages
 * Format: [MM/DD/YYYY HH:MM AM/PM] Name: token_value
 */
function parseWhatsappMessages() {
    const text = whatsappTextarea.value.trim();
    
    if (!text) {
        showStatus('Please paste WhatsApp messages first!', 'error');
        return;
    }
    
    parsedWhatsappTokens = [];
    const lines = text.split('\n');
    
    // WhatsApp format regex: [MM/DD/YYYY HH:MM AM/PM] Name: token
    const whatsappRegex = /\[(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)\]\s*([^:]+):\s*(.+)/i;
    
    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;
        
        const match = line.match(whatsappRegex);
        
        if (match) {
            const [, dateStr, timeStr, name, token] = match;
            
            try {
                // Parse date: MM/DD/YYYY
                const [month, day, year] = dateStr.split('/').map(Number);
                
                // Parse time: HH:MM AM/PM
                let [time, period] = timeStr.split(/\s+/);
                let [hours, minutes] = time.split(':').map(Number);
                
                // Convert to 24-hour format
                if (period) {
                    if (period.toUpperCase() === 'PM' && hours !== 12) {
                        hours += 12;
                    } else if (period.toUpperCase() === 'AM' && hours === 12) {
                        hours = 0;
                    }
                }
                
                // Create ISO date string
                const date = new Date(year, month - 1, day, hours, minutes || 0);
                const createdAt = date.toISOString();
                
                parsedWhatsappTokens.push({
                    name: name.trim(),
                    value: token.trim(),
                    createdAt: createdAt,
                    originalLine: line
                });
            } catch (error) {
                console.error('Failed to parse line:', line, error);
            }
        }
    });
    
    if (parsedWhatsappTokens.length === 0) {
        showStatus('No valid WhatsApp messages found! Check the format.', 'error');
        whatsappPreview.classList.add('hidden');
        importWhatsappBtn.disabled = true;
        return;
    }
    
    // Show preview
    previewCount.textContent = parsedWhatsappTokens.length;
    previewList.innerHTML = '';
    
    parsedWhatsappTokens.forEach((token, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'p-3 bg-white border border-gray-200 rounded-lg text-sm';
        previewItem.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="font-medium text-gray-800">
                        <i class="fas fa-user text-indigo-600 mr-1"></i>
                        ${escapeHtml(token.name)}
                    </p>
                    <p class="text-gray-600 font-mono text-xs mt-1 truncate">
                        <i class="fas fa-key text-gray-400 mr-1"></i>
                        ${escapeHtml(token.value.substring(0, 40))}...
                    </p>
                    <p class="text-gray-500 text-xs mt-1">
                        <i class="fas fa-calendar text-gray-400 mr-1"></i>
                        ${new Date(token.createdAt).toLocaleString()}
                    </p>
                </div>
                <span class="text-green-600 ml-2">
                    <i class="fas fa-check-circle"></i>
                </span>
            </div>
        `;
        previewList.appendChild(previewItem);
    });
    
    whatsappPreview.classList.remove('hidden');
    importWhatsappBtn.disabled = false;
    
    showStatus(`Found ${parsedWhatsappTokens.length} tokens! Review and click "Import Tokens"`, 'success');
}

/**
 * Import parsed WhatsApp tokens
 */
async function importParsedTokens() {
    if (parsedWhatsappTokens.length === 0) {
        showStatus('No tokens to import!', 'error');
        return;
    }
    
    const whatsappTagInputEl = document.getElementById('whatsappTagInput');
    const tag = whatsappTagInputEl ? whatsappTagInputEl.value : '';
    let imported = 0;
    let failed = 0;
    let duplicates = 0;
    
    importWhatsappBtn.disabled = true;
    importWhatsappBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Importing...';
    
    for (const token of parsedWhatsappTokens) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tokens`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: token.name,
                    token: token.value,
                    tag: tag,
                    createdAt: token.createdAt  // Pass the WhatsApp message date
                })
            });
            
            if (response.status === 401) {
                logout();
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                imported++;
            } else if (data.message && data.message.includes('already exists')) {
                duplicates++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('Failed to import token:', token, error);
            failed++;
        }
    }
    
    // Reset button
    importWhatsappBtn.disabled = false;
    importWhatsappBtn.innerHTML = '<i class="fas fa-file-import"></i><span>Import Tokens</span>';
    
    // Show results
    let message = `Import complete! ✅ ${imported} imported`;
    if (duplicates > 0) message += `, ⚠️ ${duplicates} duplicates skipped`;
    if (failed > 0) message += `, ❌ ${failed} failed`;
    
    showStatus(message, imported > 0 ? 'success' : 'error');
    
    // Reload tokens and close import section
    await loadTokens();
    hideWhatsappImport();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Bulk Delete Functions
 */

/**
 * Show bulk delete section
 */
function showBulkDelete() {
    bulkDeleteSection.classList.remove('hidden');
    bulkDeleteTextarea.focus();
    bulkDeleteSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Hide bulk delete section
 */
function hideBulkDelete() {
    bulkDeleteSection.classList.add('hidden');
    bulkDeleteTextarea.value = '';
    bulkDeletePreview.classList.add('hidden');
    tokensToDelete = [];
    confirmBulkDeleteBtn.disabled = true;
}

/**
 * Search for tokens to delete
 */
function searchTokensToDelete() {
    const text = bulkDeleteTextarea.value.trim();
    
    if (!text) {
        showStatus('Please paste token values first!', 'error');
        return;
    }
    
    // Parse token values - support multiple formats:
    // 1. Plain tokens (newline, space, comma separated)
    // 2. WhatsApp format: [21/11, 10:04 am] Name: token
    const inputTokens = [];
    
    // Split by newlines first
    const lines = text.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Check if it's WhatsApp format with brackets
        const whatsappMatch = line.match(/\[.*?\].*?:\s*(.+)/);
        if (whatsappMatch) {
            // Extract token after the colon
            const tokenValue = whatsappMatch[1].trim();
            if (tokenValue) {
                inputTokens.push(tokenValue);
            }
        } else {
            // Not WhatsApp format, split by space/comma
            const plainTokens = line
                .split(/[\s,]+/)
                .map(t => t.trim())
                .filter(t => t.length > 0);
            inputTokens.push(...plainTokens);
        }
    });
    
    if (inputTokens.length === 0) {
        showStatus('No valid token values found!', 'error');
        bulkDeletePreview.classList.add('hidden');
        confirmBulkDeleteBtn.disabled = true;
        return;
    }
    
    // Find matching tokens
    tokensToDelete = [];
    
    inputTokens.forEach(inputToken => {
        const matchedToken = tokens.find(t => {
            // Case-insensitive partial match or exact match
            return t.value.toLowerCase().includes(inputToken.toLowerCase()) ||
                   inputToken.toLowerCase().includes(t.value.toLowerCase());
        });
        
        if (matchedToken && !tokensToDelete.find(t => t.id === matchedToken.id)) {
            tokensToDelete.push(matchedToken);
        }
    });
    
    if (tokensToDelete.length === 0) {
        showStatus('No matching tokens found!', 'error');
        bulkDeletePreview.classList.add('hidden');
        confirmBulkDeleteBtn.disabled = true;
        return;
    }
    
    // Show preview
    deletePreviewCount.textContent = tokensToDelete.length;
    deletePreviewList.innerHTML = '';
    
    tokensToDelete.forEach((token, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'p-3 bg-white border border-red-200 rounded-lg text-sm';
        previewItem.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <p class="font-medium text-gray-800">
                        <i class="fas fa-user text-indigo-600 mr-1"></i>
                        ${escapeHtml(token.name)}
                    </p>
                    <p class="text-gray-600 font-mono text-xs mt-1 break-all">
                        <i class="fas fa-key text-gray-400 mr-1"></i>
                        ${escapeHtml(token.value)}
                    </p>
                    ${token.tag ? `<p class="text-xs mt-1"><span class="px-2 py-1 bg-gray-100 rounded">${escapeHtml(token.tag)}</span></p>` : ''}
                    <p class="text-gray-500 text-xs mt-1">
                        <i class="fas fa-calendar text-gray-400 mr-1"></i>
                        ${new Date(token.createdAt).toLocaleString()}
                    </p>
                </div>
                <span class="text-red-600 ml-2">
                    <i class="fas fa-trash-alt"></i>
                </span>
            </div>
        `;
        deletePreviewList.appendChild(previewItem);
    });
    
    bulkDeletePreview.classList.remove('hidden');
    confirmBulkDeleteBtn.disabled = false;
    
    showStatus(`Found ${tokensToDelete.length} matching tokens! Review and confirm deletion`, 'info');
}

/**
 * Confirm and delete matched tokens
 */
async function confirmBulkDelete() {
    if (tokensToDelete.length === 0) {
        showStatus('No tokens to delete!', 'error');
        return;
    }
    
    // Check if user is Admin
    if (currentUser && currentUser.role === 'admin') {
        showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
        return;
    }
    
    const confirmed = confirm(`⚠️ Are you sure you want to delete ${tokensToDelete.length} tokens?\n\nThis action cannot be undone!`);
    
    if (!confirmed) {
        return;
    }
    
    let deleted = 0;
    let failed = 0;
    
    confirmBulkDeleteBtn.disabled = true;
    confirmBulkDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Deleting...';
    
    for (const token of tokensToDelete) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tokens/${token.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.status === 401) {
                logout();
                return;
            }
            
            if (response.status === 403) {
                showStatus('Access denied. Only Super Admin can delete tokens.', 'error');
                break;
            }
            
            const data = await response.json();
            
            if (data.success) {
                deleted++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('Failed to delete token:', token, error);
            failed++;
        }
    }
    
    // Reset button
    confirmBulkDeleteBtn.disabled = false;
    confirmBulkDeleteBtn.innerHTML = '<i class="fas fa-trash"></i><span>Delete Matched Tokens</span>';
    
    // Show results
    let message = `Bulk delete complete! `;
    if (deleted > 0) message += `✅ ${deleted} deleted`;
    if (failed > 0) message += `, ❌ ${failed} failed`;
    
    showStatus(message, deleted > 0 ? 'success' : 'error');
    
    // Reload tokens and close delete section
    await loadTokens();
    hideBulkDelete();
}

/**
 * Open Edit Modal
 * @param {String} tokenId - Token ID to edit
 */
function openEditModal(tokenId) {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) {
        showStatus('Token not found', 'error');
        return;
    }
    
    currentEditingTokenId = tokenId;
    
    // Populate form fields
    editNameInput.value = token.name;
    editTokenInput.value = token.value;
    editTagInput.value = token.tag || '';
    
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
    const date = new Date(token.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    editDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Show modal
    editModal.classList.remove('hidden');
    editNameInput.focus();
}

/**
 * Close Edit Modal
 */
function closeEditModalHandler() {
    editModal.classList.add('hidden');
    currentEditingTokenId = null;
    editTokenForm.reset();
}

/**
 * Handle edit token form submission
 * @param {Event} e - Form submit event
 */
async function handleEditToken(e) {
    e.preventDefault();
    
    if (!currentEditingTokenId) {
        showStatus('No token selected for editing', 'error');
        return;
    }
    
    const nameValue = editNameInput.value.trim();
    const tokenValue = editTokenInput.value.trim();
    const editTagInputEl = document.getElementById('editTagInput');
    const tagValue = editTagInputEl ? editTagInputEl.value : '';
    const dateValue = editDateInput.value;
    
    if (!nameValue || !tokenValue || !dateValue) {
        showStatus('Please fill all required fields', 'error');
        return;
    }
    
    try {
        saveEditBtn.disabled = true;
        saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
        
        // Convert datetime-local value to ISO string
        const createdAt = new Date(dateValue).toISOString();
        
        const response = await fetch(`${API_BASE_URL}/api/tokens/${currentEditingTokenId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                name: nameValue,
                token: tokenValue,
                tag: tagValue,
                createdAt: createdAt
            })
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            showStatus('Token updated successfully!', 'success');
            await loadTokens();
            closeEditModalHandler();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error updating token:', error);
        showStatus(`Failed to update token: ${error.message}`, 'error');
    } finally {
        saveEditBtn.disabled = false;
        saveEditBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
    }
}

/**
 * Show Bulk Tag Update Modal
 */
function showBulkTagModal() {
    if (selectedTokens.size === 0) {
        showStatus('Please select tokens first!', 'error');
        return;
    }
    
    bulkTagCount.textContent = selectedTokens.size;
    bulkTagSelect.value = '';
    bulkTagModal.classList.remove('hidden');
}

/**
 * Close Bulk Tag Update Modal
 */
function closeBulkTagModalHandler() {
    bulkTagModal.classList.add('hidden');
    bulkTagSelect.value = '';
}

/**
 * Confirm Bulk Tag Update
 */
async function confirmBulkTagUpdate() {
    // Check if user is Admin
    if (currentUser && currentUser.role === 'admin') {
        showStatus('Access denied. Only Super Admin can modify tags.', 'error');
        closeBulkTagModalHandler();
        return;
    }
    
    const newTag = bulkTagSelect.value;
    const selectedIds = Array.from(selectedTokens);
    
    if (selectedIds.length === 0) {
        showStatus('No tokens selected!', 'error');
        return;
    }
    
    const confirmation = confirm(
        `Are you sure you want to update tags for ${selectedIds.length} token(s)?\n` +
        `New tag: ${newTag || 'No Tag'}`
    );
    
    if (!confirmation) {
        return;
    }
    
    try {
        confirmBulkTagBtn.disabled = true;
        confirmBulkTagBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
        
        let updated = 0;
        let failed = 0;
        
        for (const tokenId of selectedIds) {
            try {
                const token = tokens.find(t => t.id === tokenId);
                if (!token) {
                    failed++;
                    continue;
                }
                
                const response = await fetch(`${API_BASE_URL}/api/tokens/${tokenId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ 
                        name: token.name,
                        token: token.value,
                        tag: newTag,
                        createdAt: token.createdAt
                    })
                });
                
                if (response.status === 401) {
                    logout();
                    return;
                }
                
                const data = await response.json();
                
                if (data.success) {
                    updated++;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error('Failed to update token:', tokenId, error);
                failed++;
            }
        }
        
        // Show results
        let message = `Bulk tag update complete! `;
        if (updated > 0) message += `✅ ${updated} updated`;
        if (failed > 0) message += `, ❌ ${failed} failed`;
        
        showStatus(message, updated > 0 ? 'success' : 'error');
        
        // Reload tokens and close modal
        await loadTokens();
        closeBulkTagModalHandler();
        deselectAll();
        
    } catch (error) {
        console.error('Error in bulk tag update:', error);
        showStatus(`Failed to update tags: ${error.message}`, 'error');
    } finally {
        confirmBulkTagBtn.disabled = false;
        confirmBulkTagBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Update Tags';
    }
}

/**
 * Show Bulk Date Update Modal
 */
function showBulkDateModal() {
    if (selectedTokens.size === 0) {
        showStatus('Please select tokens first!', 'error');
        return;
    }
    
    bulkDateCount.textContent = selectedTokens.size;
    
    // Set current date/time as default
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    bulkDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    bulkDateModal.classList.remove('hidden');
}

/**
 * Close Bulk Date Update Modal
 */
function closeBulkDateModalHandler() {
    bulkDateModal.classList.add('hidden');
    bulkDateInput.value = '';
}

/**
 * Confirm Bulk Date Update
 */
async function confirmBulkDateUpdate() {
    const newDate = bulkDateInput.value;
    const selectedIds = Array.from(selectedTokens);
    
    if (selectedIds.length === 0) {
        showStatus('No tokens selected!', 'error');
        return;
    }
    
    if (!newDate) {
        showStatus('Please select a date and time!', 'error');
        bulkDateInput.focus();
        return;
    }
    
    const formattedDate = new Date(newDate).toLocaleString();
    const confirmation = confirm(
        `Are you sure you want to update dates for ${selectedIds.length} token(s)?\n` +
        `New date: ${formattedDate}`
    );
    
    if (!confirmation) {
        return;
    }
    
    try {
        confirmBulkDateBtn.disabled = true;
        confirmBulkDateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
        
        let updated = 0;
        let failed = 0;
        
        // Convert to ISO string
        const createdAt = new Date(newDate).toISOString();
        
        for (const tokenId of selectedIds) {
            try {
                const token = tokens.find(t => t.id === tokenId);
                if (!token) {
                    failed++;
                    continue;
                }
                
                const response = await fetch(`${API_BASE_URL}/api/tokens/${tokenId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ 
                        name: token.name,
                        token: token.value,
                        tag: token.tag || '',
                        createdAt: createdAt
                    })
                });
                
                if (response.status === 401) {
                    logout();
                    return;
                }
                
                const data = await response.json();
                
                if (data.success) {
                    updated++;
                } else {
                    failed++;
                }
            } catch (error) {
                console.error('Failed to update token:', tokenId, error);
                failed++;
            }
        }
        
        // Show results
        let message = `Bulk date update complete! `;
        if (updated > 0) message += `✅ ${updated} updated`;
        if (failed > 0) message += `, ❌ ${failed} failed`;
        
        showStatus(message, updated > 0 ? 'success' : 'error');
        
        // Reload tokens and close modal
        await loadTokens();
        closeBulkDateModalHandler();
        deselectAll();
        
    } catch (error) {
        console.error('Error in bulk date update:', error);
        showStatus(`Failed to update dates: ${error.message}`, 'error');
    } finally {
        confirmBulkDateBtn.disabled = false;
        confirmBulkDateBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Update Dates';
    }
}

// Make functions available globally
window.deleteToken = deleteToken;
window.copyToClipboard = copyToClipboard;
window.toggleTokenVisibility = toggleTokenVisibility;
window.clearSearch = clearSearch;
window.toggleTokenSelection = toggleTokenSelection;
window.exportToCSV = exportToCSV;
window.exportToJSON = exportToJSON;
window.openEditModal = openEditModal;
window.logout = logout;
