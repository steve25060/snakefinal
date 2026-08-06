/* API Configuration and Helper Functions */

// API Base URL - dynamic origin for Firefox and cross-browser compatibility
const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('file://')) {
        return `${window.location.origin}/api`;
    }
    return 'https://snakemcq.onrender.com/api';
};

const API_BASE = getApiBase();

// Storage Keys
const STORAGE_KEYS = {
    USER_TOKEN: 'snakemcq_user_token',
    ADMIN_TOKEN: 'snakemcq_admin_token',
    SESSION_TOKEN: 'snakemcq_session_token',
    USER_ID: 'snakemcq_user_id',
    ROLL_NUMBER: 'snakemcq_roll_number',
    USER_NAME: 'snakemcq_user_name',
    SESSION_ID: 'snakemcq_session_id',
};

/**
 * API Request Helper
 */
async function apiRequest(endpoint, options = {}) {
    const {
        method = 'GET',
        headers = {},
        body = null,
        includeToken = true,
        includeSessionToken = false
    } = options;

    // Get tokens from localStorage
    let sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || localStorage.getItem('sessionToken');

    // Build headers
    const requestHeaders = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...headers
    };

    if (sessionToken) {
        requestHeaders['X-Session-Token'] = sessionToken;
    }

    // Add cache-busting query parameter for GET requests
    let finalEndpoint = endpoint;
    if (method === 'GET' && !endpoint.includes('?')) {
        finalEndpoint = `${endpoint}?t=${Date.now()}`;
    } else if (method === 'GET') {
        finalEndpoint = `${endpoint}&t=${Date.now()}`;
    }

    // Build request
    const request = {
        method,
        headers: requestHeaders,
        credentials: 'include'
    };

    if (body) {
        request.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${finalEndpoint}`, request);
        
        console.log(`API ${method} ${endpoint}: ${response.status}`);
        
        const data = await response.json();
        
        // Check if response is successful
        if (!response.ok) {
            const errorMsg = data.error || `HTTP ${response.status}`;
            console.error(`API Error: ${errorMsg}`, data);
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        console.error(`API Request Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Authentication API Calls
 */
const Auth = {
    /**
     * Register new player
     */
    registerPlayer: async (name, playerClass, rollNumber) => {
        try {
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: { name, class: playerClass, rollNumber },
                includeToken: false
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Login player - tries register first, then login if already registered
     */
    loginPlayer: async (name, playerClass, rollNumber) => {
        try {
            console.log('🔐 Attempting to register/login...');
            
            // Try to register first, fallback to login if needed
            let response = await apiRequest('/auth/register', {
                method: 'POST',
                body: { name, class: playerClass, rollNumber },
                includeToken: false
            }).catch(async (err) => {
                console.log('Register attempt failed, trying login fallback...', err.message);
                return await apiRequest('/auth/login', {
                    method: 'POST',
                    body: { name, class: playerClass, rollNumber },
                    includeToken: false
                });
            });

            if (response.success) {
                console.log('✅ Auth successful, storing tokens...');
                
                const sessionToken = response.sessionToken || (response.data && response.data.sessionToken);
                const sessionId = response.sessionId || (response.data && response.data.sessionId);
                const userId = response.userId || (response.data && response.data.userId);

                // Store session info in STORAGE_KEYS namespace
                if (sessionToken) localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
                if (sessionId) localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
                if (userId) localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
                if (name) localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
                if (rollNumber) localStorage.setItem(STORAGE_KEYS.ROLL_NUMBER, rollNumber);
                if (playerClass) localStorage.setItem('snakemcq_user_class', playerClass);

                // Also store in standard simple keys
                if (sessionToken) localStorage.setItem('sessionToken', sessionToken);
                if (sessionId) localStorage.setItem('sessionId', sessionId);
                if (userId) localStorage.setItem('userId', userId);
                if (name) localStorage.setItem('playerName', name);
                if (rollNumber) localStorage.setItem('rollNumber', rollNumber);

                // Return formatted response
                return {
                    success: true,
                    sessionToken: sessionToken,
                    sessionId: sessionId,
                    userId: userId,
                    data: {
                        userId: userId,
                        sessionToken: sessionToken,
                        sessionId: sessionId,
                        name: name,
                        rollNumber: rollNumber,
                        class: playerClass,
                        activeSession: {
                            sessionToken: sessionToken,
                            sessionId: sessionId
                        }
                    }
                };
            }

            return response;
        } catch (error) {
            console.error('Auth error:', error);
            throw error;
        }
    },

    /**
     * Logout
     */
    logout: async () => {
        try {
            await apiRequest('/auth/logout', {
                method: 'POST',
                includeSessionToken: true
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all stored tokens
            localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_ID);
            localStorage.removeItem(STORAGE_KEYS.ROLL_NUMBER);
            localStorage.removeItem(STORAGE_KEYS.USER_NAME);
            localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
        }
    }
};

/**
 * Game API Calls
 */
const Game = {
    /**
     * Get question
     */
    getQuestion: async (questionNumber, language = 'python') => {
        try {
            const response = await apiRequest(`/quiz/question/${questionNumber}?language=${language}`, {
                method: 'GET',
                includeSessionToken: true
            });
            return response;
        } catch (error) {
            console.error('Get question error:', error);
            throw error;
        }
    },

    /**
     * Submit answer
     */
    submitAnswer: async (sessionId, questionId, selectedOption, resultType, timeTaken) => {
        try {
            const response = await apiRequest('/quiz/answer', {
                method: 'POST',
                body: {
                    questionId,
                    selectedOption,
                    resultType,
                    timeTaken
                },
                includeSessionToken: true
            });
            return response;
        } catch (error) {
            console.error('Submit answer error:', error);
            throw error;
        }
    },

    /**
     * Skip question
     */
    skipQuestion: async (questionId) => {
        try {
            const response = await apiRequest('/quiz/skip', {
                method: 'POST',
                body: { questionId },
                includeSessionToken: true
            });
            return response;
        } catch (error) {
            console.error('Skip question error:', error);
            throw error;
        }
    },

    /**
     * Get game stats
     */
    getStats: async () => {
        try {
            const response = await apiRequest('/quiz/stats', {
                method: 'GET',
                includeSessionToken: true
            });
            return response;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    },

    /**
     * Complete game
     */
    completeGame: async (totalTimeSeconds) => {
        try {
            const response = await apiRequest('/quiz/complete', {
                method: 'POST',
                body: { totalTimeSeconds },
                includeSessionToken: true
            });
            return response;
        } catch (error) {
            console.error('Complete game error:', error);
            throw error;
        }
    }
};

/**
 * Global API Call helper for admin panel & inline scripts
 */
async function apiCall(endpoint, method = 'GET', body = null, headers = {}) {
    let url = endpoint;
    if (!url.startsWith('http')) {
        if (!url.startsWith('/api') && !url.startsWith('api')) {
            url = `/api${url.startsWith('/') ? '' : '/'}${url}`;
        } else if (!url.startsWith('/')) {
            url = `/${url}`;
        }
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('file://'))
            ? window.location.origin
            : 'https://snakemcq.onrender.com';
        url = `${origin}${url}`;
    }

    const requestHeaders = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...headers
    };

    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (sessionToken) {
        requestHeaders['X-Session-Token'] = sessionToken;
    }

    const options = {
        method,
        headers: requestHeaders,
        credentials: 'include'
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
    } catch (error) {
        console.error(`apiCall Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Authentication check helpers
 */
function isUserLoggedIn() {
    return !!(
        localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || 
        localStorage.getItem('sessionToken') || 
        localStorage.getItem(STORAGE_KEYS.USER_ID) || 
        localStorage.getItem('userId')
    );
}

function requireLogin() {
    if (!isUserLoggedIn()) {
        console.warn('⚠️ User not logged in, redirecting to login.html');
        window.location.href = 'login.html';
    }
}

// Add startGame method to Game object
Game.startGame = async () => {
    try {
        const response = await apiRequest('/quiz/start', {
            method: 'POST',
            includeSessionToken: true
        });
        if (response && response.success) {
            const token = response.sessionToken || (response.data && response.data.sessionToken);
            const id = response.sessionId || (response.data && response.data.sessionId);
            if (token) localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
            if (id) localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
        }
        return response;
    } catch (e) {
        console.warn('Fallback to local storage tokens:', e);
        const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        if (sessionToken) {
            return {
                success: true,
                data: { sessionToken, sessionId }
            };
        }
        throw e;
    }
};

/**
 * Leaderboard API Calls
 */
const Leaderboard = {
    getTop: async (limit = 10) => {
        try {
            return await apiRequest(limit ? `/leaderboard/top/${limit}` : '/leaderboard', { method: 'GET' });
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    },
    getStats: async () => {
        try {
            return await apiRequest('/leaderboard/stats', { method: 'GET' });
        } catch (error) {
            console.error('Get leaderboard stats error:', error);
            throw error;
        }
    },
    getPlayerRank: async (userId) => {
        try {
            return await apiRequest(`/leaderboard/player/${userId}`, { method: 'GET' });
        } catch (error) {
            console.error('Get player rank error:', error);
            throw error;
        }
    }
};

// Export all to window object for global availability
window.API_BASE = API_BASE;
window.STORAGE_KEYS = STORAGE_KEYS;
window.apiRequest = apiRequest;
window.apiCall = apiCall;
window.isUserLoggedIn = isUserLoggedIn;
window.requireLogin = requireLogin;
window.Auth = Auth;
window.Game = Game;
window.Leaderboard = Leaderboard;

console.log('✅ API Module Loaded with Global Helpers');
