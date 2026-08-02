/* Simple Snake Game - Minimal Working Version */

console.log('🎮 Simple Game.js loaded');

// Constants
const CELL_SIZE = 20;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;

// Game State
let gameCanvas = null;
let gameCtx = null;
let snake = [];
let food = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameRunning = false;
let gameLoopId = null;
let frameCount = 0;

/**
 * Initialize the snake game - SIMPLE VERSION
 */
function initializeSnakeGame() {
    console.log('%c🎮 Initializing Snake Game', 'color: cyan; font-size: 14px; font-weight: bold');
    
    try {
        // Get canvas
        gameCanvas = document.getElementById('gameCanvas');
        if (!gameCanvas) {
            console.error('%c❌ Canvas not found!', 'color: red; font-weight: bold');
            return;
        }
        console.log('%c✓ Canvas found', 'color: green');
        
        // Get 2D context
        gameCtx = gameCanvas.getContext('2d');
        if (!gameCtx) {
            console.error('%c❌ Cannot get 2D context!', 'color: red; font-weight: bold');
            return;
        }
        console.log('%c✓ 2D context obtained', 'color: green');
        
        // Set canvas dimensions
        gameCanvas.width = GRID_WIDTH * CELL_SIZE;
        gameCanvas.height = GRID_HEIGHT * CELL_SIZE;
        console.log(`%c📐 Canvas: ${gameCanvas.width}x${gameCanvas.height}`, 'color: yellow');
        
        // Initialize snake
        snake = [
            { x: 15, y: 15 },
            { x: 14, y: 15 },
            { x: 13, y: 15 }
        ];
        console.log('%c🐍 Snake initialized:', 'color: cyan', snake);
        
        // Initialize food (answer options)
        food = [];
        createAnswerOptions();
        console.log('%c🍎 Answer options created:', 'color: yellow', food);
        
        // Reset state
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        gameRunning = true;
        frameCount = 0;
        
        // Draw initial state
        drawGame();
        console.log('%c✓ Initial draw complete', 'color: green');
        
        // Start game loop
        startGameLoop();
        console.log('%c✓ Game loop started', 'color: green');
        
        // Setup controls
        setupControls();
        console.log('%c✓ Controls ready', 'color: green');
        
        console.log('%c🎉 GAME INITIALIZED SUCCESSFULLY!', 'color: lime; font-size: 16px; font-weight: bold');
        
    } catch (error) {
        console.error('%c❌ ERROR initializing game:', 'color: red; font-weight: bold', error);
    }
}

/**
 * Create answer options at random positions
 */
function createAnswerOptions() {
    food = [];
    const options = ['A', 'B', 'C', 'D'];
    const usedPos = new Set();
    
    const colors = {
        'A': '#ff6b6b',
        'B': '#4ecdc4',
        'C': '#ffe66d',
        'D': '#a78bfa'
    };
    
    options.forEach(opt => {
        let x, y;
        do {
            x = Math.floor(Math.random() * GRID_WIDTH);
            y = Math.floor(Math.random() * GRID_HEIGHT);
        } while (usedPos.has(`${x},${y}`) || isSnakePosition(x, y));
        
        usedPos.add(`${x},${y}`);
        food.push({ x, y, label: opt, color: colors[opt] });
        console.log(`  📍 ${opt} at (${x}, ${y})`);
    });
}

/**
 * Check if position has snake
 */
function isSnakePosition(x, y) {
    return snake.some(seg => seg.x === x && seg.y === y);
}

/**
 * Draw the game
 */
function drawGame() {
    if (!gameCtx || !gameCanvas) {
        console.error('No context or canvas');
        return;
    }
    
    // Clear canvas with dark background
    gameCtx.fillStyle = '#0a0e27';
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - cyan with glow
            gameCtx.fillStyle = '#06b6d4';
            gameCtx.shadowColor = 'rgba(6, 182, 212, 0.8)';
            gameCtx.shadowBlur = 10;
        } else {
            // Body - green
            gameCtx.fillStyle = '#10b981';
            gameCtx.shadowColor = 'rgba(16, 185, 129, 0.5)';
            gameCtx.shadowBlur = 5;
        }
        
        gameCtx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
    
    gameCtx.shadowColor = 'transparent';
    gameCtx.shadowBlur = 0;
    
    // Draw answer options
    food.forEach(item => {
        // Draw circle background
        gameCtx.fillStyle = item.color;
        gameCtx.beginPath();
        gameCtx.arc(
            item.x * CELL_SIZE + CELL_SIZE / 2,
            item.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        gameCtx.fill();
        
        // Draw border
        gameCtx.strokeStyle = item.color;
        gameCtx.lineWidth = 2;
        gameCtx.stroke();
        
        // Draw letter
        gameCtx.fillStyle = '#ffffff';
        gameCtx.font = 'bold 14px Arial';
        gameCtx.textAlign = 'center';
        gameCtx.textBaseline = 'middle';
        gameCtx.fillText(
            item.label,
            item.x * CELL_SIZE + CELL_SIZE / 2,
            item.y * CELL_SIZE + CELL_SIZE / 2
        );
    });
}

/**
 * Start game loop
 */
function startGameLoop() {
    gameLoopId = setInterval(() => {
        frameCount++;
        
        // Update every 5 frames (slower movement)
        if (frameCount % 5 === 0) {
            updateGame();
            drawGame();
        }
    }, 50);
    
    console.log('Loop ID:', gameLoopId);
}

/**
 * Update game state
 */
function updateGame() {
    if (!gameRunning) return;
    
    // Update direction
    direction = { ...nextDirection };
    
    // Calculate new head
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= GRID_WIDTH || 
        newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
        console.log('💥 Wall collision');
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        console.log('💥 Self collision');
        endGame();
        return;
    }
    
    // Check food collision
    for (let i = 0; i < food.length; i++) {
        if (newHead.x === food[i].x && newHead.y === food[i].y) {
            console.log(`🎯 Ate ${food[i].label}!`);
            submitAnswer(food[i].label);
            return;
        }
    }
    
    // Move snake
    snake.unshift(newHead);
    snake.pop();
}

/**
 * Setup keyboard and button controls
 */
function setupControls() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') {
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            e.preventDefault();
        } else if (key === 'arrowdown' || key === 's') {
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            e.preventDefault();
        } else if (key === 'arrowleft' || key === 'a') {
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            e.preventDefault();
        } else if (key === 'arrowright' || key === 'd') {
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            e.preventDefault();
        }
    });
}

/**
 * Move snake from button click
 */
function moveSnake(dir) {
    console.log('Button clicked:', dir);
    switch(dir) {
        case 'UP':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'DOWN':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'LEFT':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'RIGHT':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
}

/**
 * Submit answer
 */
async function submitAnswer(option) {
    console.log(`📤 Answer submitted: ${option}`);
    endGame();
    
    try {
        const sessionId = localStorage.getItem('snakemcq_session_id');
        const response = await Game.submitAnswer(sessionId, 1, option, 'answered', 20);
        
        if (response && response.success) {
            showResult(response.data.isCorrect, response.data.pointsAwarded);
        } else {
            showResult(false, 0);
        }
    } catch (error) {
        console.error('Answer error:', error);
        showResult(false, 0);
    }
}

/**
 * Show result screen
 */
function showResult(isCorrect, points) {
    const gameScreen = document.getElementById('gameScreen');
    const resultScreen = document.getElementById('resultScreen');
    
    if (gameScreen) gameScreen.classList.remove('active');
    if (resultScreen) resultScreen.classList.add('active');
    
    const msgEl = document.getElementById('resultMessage');
    const ptEl = document.getElementById('resultPoints');
    
    if (msgEl && ptEl) {
        msgEl.textContent = isCorrect ? '✓ CORRECT!' : '✗ WRONG';
        msgEl.style.color = isCorrect ? '#10b981' : '#ef4444';
        ptEl.textContent = isCorrect ? `+${points} Points` : '+0 Points';
    }
}

/**
 * End game
 */
function endGame() {
    gameRunning = false;
    if (gameLoopId) clearInterval(gameLoopId);
    console.log('Game ended');
}

console.log('%c✅ Simple Game.js ready', 'color: lime; font-weight: bold');
