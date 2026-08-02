// Snake MCQ Challenge - Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    console.log('Snake MCQ Challenge - App Loaded');
    
    // Initialize app
    initializeApp();
});

function initializeApp() {
    // Check if user is logged in
    if (isUserLoggedIn() && window.location.pathname !== '/game.html' && window.location.pathname !== '/question.html') {
        // User is logged in, they can proceed
        console.log('User is logged in');
    }
    
    // Load statistics on home page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadHomePageStats();
    }
}

function loadHomePageStats() {
    // This will load stats from the leaderboard API
    console.log('Loading home page statistics...');
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Log app version
console.log('🐍 Snake MCQ Challenge App Loaded');
