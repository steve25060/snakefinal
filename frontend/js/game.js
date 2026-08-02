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
        // Get canvas - CRITICAL CHECK
        gameCanvas = document.getElementById('gameCanvas');
        console.log('Step 1: Canvas element:', gameCanvas);
        
        if (!gameCanvas) {
            console.error('%c❌ CRITICAL: Canvas element not found!', 'color: red; font-weight: bold');
            console.error('Looking for element with id="gameCanvas"');
            console.error('DOM check:', document.body.innerHTML.includes('gameCanvas'));
            return;
        }
        console.log('%c✓ Canvas element found', 'color: green');
        
        // Get 2D context - CRITICAL CHECK
        gameCtx = gameCanvas.getContext('2d');
        console.log('Step 2: Canvas context:', gameCtx);
        
        if (!gameCtx) {
            console.error('%c❌ CRITICAL: Cannot get 2D context!', 'color: red; font-weight: bold');
            return;
        }
        console.log('%c✓ 2D context obtained', 'color: green');
        
        // Set canvas dimensions EXPLICITLY
        gameCanvas.width = 600;
        gameCanvas.height = 600;
        console.log(`%c📐 Canvas dimensions set to: ${gameCanvas.width}x${gameCanvas.height}`, 'color: yellow');
        console.log(`%c📐 Canvas element style: width=${gameCanvas.style.width}, height=${gameCanvas.style.height}`, 'color: yellow');
        
        // Verify dimensions were set
        if (gameCanvas.width !== 600 || gameCanvas.height !== 600) {
            console.error('%c❌ Canvas dimensions NOT set correctly!', 'color: red; font-weight: bold');
            console.error(`Attempted: 600x600, Got: ${gameCanvas.width}x${gameCanvas.height}`);
        }
        
        // Initialize snake
        snake = [
            { x: 15, y: 15 },
            { x: 14, y: 15 },
            { x: 13, y: 15 }
        ];
        console.log('%c🐍 Snake initialized at center:', 'color: cyan', snake);
        
        // Initialize food (answer options)
        food = [];
        createAnswerOptions();
        console.log('%c🍎 Answer options created:', 'color: yellow', food);
        
        // Reset state
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        gameRunning = true;
        frameCount = 0;
        
        // Clear any existing game loop before starting new one
        if (gameLoopId) {
            clearInterval(gameLoopId);
            console.log('%c🧹 Cleared old game loop', 'color: orange');
        }
        
        // Draw initial state
        console.log('%c Step 3: Drawing initial game state', 'color: yellow');
        drawGame();
        console.log('%c✓ Initial draw complete', 'color: green');
        
        // Start game loop
        console.log('%c Step 4: Starting game loop', 'color: yellow');
        startGameLoop();
        console.log('%c✓ Game loop started with ID: ' + gameLoopId, 'color: green');
        
        // Setup controls
        setupControls();
        console.log('%c✓ Controls ready', 'color: green');
        
        console.log('%c🎉 GAME INITIALIZED SUCCESSFULLY!', 'color: lime; font-size: 16px; font-weight: bold');
        
    } catch (error) {
        console.error('%c❌ ERROR initializing game:', 'color: red; font-weight: bold', error);
        console.error('Stack trace:', error.stack);
    }
}

/**
 * Create answer options at random positions with randomized positions
 */
function createAnswerOptions() {
    food = [];
    
    // Get the correct answer and shuffle the options
    const correctAnswer = currentGameData.correctOption;
    const options = ['A', 'B', 'C', 'D'];
    
    // Shuffle options to randomize positions
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const colors = {
        'A': '#ff6b6b',
        'B': '#4ecdc4',
        'C': '#ffe66d',
        'D': '#a78bfa'
    };
    
    const usedPos = new Set();
    
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
    // CRITICAL: Verify canvas and context exist
    if (!gameCtx) {
        console.error('%c❌ FATAL: gameCtx is NULL', 'color: red; font-weight: bold');
        return;
    }
    if (!gameCanvas) {
        console.error('%c❌ FATAL: gameCanvas is NULL', 'color: red; font-weight: bold');
        return;
    }
    
    try {
        // Verify canvas dimensions
        if (!gameCanvas.width || !gameCanvas.height) {
            console.error('%c❌ Canvas has no dimensions!', 'color: red; font-weight: bold');
            console.error(`Canvas: ${gameCanvas.width}x${gameCanvas.height}`);
            return;
        }
        
        // 1. Clear canvas with dark background - MOST IMPORTANT
        gameCtx.fillStyle = '#0a0e27';
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        console.log('%c✓ Canvas cleared and background drawn', 'color: green');
        console.log('%c✓ Grid drawn', 'color: green');
        
        // 3. Draw snake - BRIGHT COLORS FOR VISIBILITY
        snake.forEach((segment, index) => {
            const x = segment.x * CELL_SIZE + 1;
            const y = segment.y * CELL_SIZE + 1;
            const size = CELL_SIZE - 2;
            
            if (index === 0) {
                // Head - bright cyan
                gameCtx.fillStyle = '#00FFFF';
            } else {
                // Body - bright green
                gameCtx.fillStyle = '#00FF00';
            }
            
            gameCtx.fillRect(x, y, size, size);
        });
        console.log(`%c✓ Snake drawn: ${snake.length} segments`, 'color: green');
        
        // 4. Draw answer options - MAKE THEM VERY VISIBLE
        if (!food || food.length === 0) {
            console.warn('%c⚠️ WARNING: No food/options to draw!', 'color: orange');
        }
        
        food.forEach((item, idx) => {
            const centerX = item.x * CELL_SIZE + CELL_SIZE / 2;
            const centerY = item.y * CELL_SIZE + CELL_SIZE / 2;
            const radius = CELL_SIZE / 2 - 2;
            
            // Draw filled circle with bright color
            gameCtx.fillStyle = item.color;
            gameCtx.beginPath();
            gameCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            gameCtx.fill();
            
            // Draw white border for visibility
            gameCtx.strokeStyle = '#FFFFFF';
            gameCtx.lineWidth = 2;
            gameCtx.stroke();
            
            // Draw letter in black
            gameCtx.fillStyle = '#000000';
            gameCtx.font = 'bold 16px Arial';
            gameCtx.textAlign = 'center';
            gameCtx.textBaseline = 'middle';
            gameCtx.fillText(item.label, centerX, centerY);
            
            console.log(`%c✓ Option ${item.label} at (${item.x}, ${item.y})`, 'color: green');
        });
        
        console.log('%c✓ ALL DRAWING COMPLETE', 'color: lime; font-weight: bold');
        
    } catch (error) {
        console.error('%c❌ FATAL ERROR in drawGame:', 'color: red; font-weight: bold', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
    }
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
    console.log('%c🏁 Ending game...', 'color: red; font-weight: bold');
    gameRunning = false;
    
    // Clear game loop
    if (gameLoopId) {
        clearInterval(gameLoopId);
        gameLoopId = null;
        console.log('%c✓ Game loop cleared', 'color: green');
    }
    
    // Clear canvas reference if needed
    gameCtx = null;
    gameCanvas = null;
    
    console.log('%c✓ Game ended', 'color: green');
}

console.log('%c✅ Simple Game.js ready', 'color: lime; font-weight: bold');
