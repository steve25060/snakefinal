/* Snake Game Engine for MCQ Challenge - DEBUG VERSION */

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 30;
const INITIAL_SPEED = 5;

// Game state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = [];
let gameRunning = true;
let gameSpeed = INITIAL_SPEED;
let gameLoopId = null;

console.log('🎮 Game.js loaded - v2.2 DEBUG');

/**
 * Initialize the snake game
 */
function initializeSnakeGame() {
    console.log('🎮 [DEBUG] initializeSnakeGame() called');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ [ERROR] Canvas element not found!');
        return;
    }
    
    console.log('✓ Canvas element found');
    
    // Get context first
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ [ERROR] Cannot get 2D context!');
        return;
    }
    console.log('✓ 2D context obtained');
    
    // Set explicit canvas dimensions
    canvas.width = 600;
    canvas.height = 600;
    
    console.log(`📐 Canvas dimensions set to ${canvas.width}x${canvas.height}`);
    
    // Clear canvas with background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log('✓ Canvas cleared');
    
    // Reset game state
    const startX = Math.floor(canvas.width / CELL_SIZE / 2);
    const startY = Math.floor(canvas.height / CELL_SIZE / 2);
    
    snake = [{ x: startX, y: startY }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    gameRunning = true;
    gameSpeed = INITIAL_SPEED;
    
    console.log(`🐍 Snake initialized at (${startX}, ${startY})`);
    console.log(`🐍 Snake array:`, snake);
    
    // Generate answer options
    generateAnswerOptions();
    console.log(`🍎 Food/Options generated:`, food);
    
    // Draw initial state
    drawGame();
    console.log('✓ Initial draw complete');
    
    // Start game loop
    startGameLoop();
    console.log('✓ Game loop started');
    
    // Setup keyboard
    setupKeyboardControls();
    console.log('✓ Keyboard controls ready');
    
    console.log('🎮 [SUCCESS] Game initialized!');
}

/**
 * Generate 4 answer options
 */
function generateAnswerOptions() {
    food = [];
    const options = ['A', 'B', 'C', 'D'];
    const canvas = document.getElementById('gameCanvas');
    
    const maxX = Math.floor(canvas.width / CELL_SIZE);
    const maxY = Math.floor(canvas.height / CELL_SIZE);
    
    const usedPositions = new Set();
    
    options.forEach(option => {
        let x, y;
        do {
            x = Math.floor(Math.random() * maxX);
            y = Math.floor(Math.random() * maxY);
        } while (usedPositions.has(`${x},${y}`));
        
        usedPositions.add(`${x},${y}`);
        food.push({ x, y, option });
        console.log(`  ${option} placed at (${x}, ${y})`);
    });
}

/**
 * Start the game loop
 */
function startGameLoop() {
    let frameCount = 0;
    
    gameLoopId = setInterval(() => {
        frameCount++;
        
        if (frameCount % (10 / gameSpeed) === 0) {
            updateGame();
            drawGame();
        }
    }, 100);
    
    console.log('🔄 Game loop interval ID:', gameLoopId);
}

/**
 * Update game state
 */
function updateGame() {
    if (!gameRunning) return;
    
    direction = nextDirection;
    
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    const canvas = document.getElementById('gameCanvas');
    const maxX = Math.floor(canvas.width / CELL_SIZE);
    const maxY = Math.floor(canvas.height / CELL_SIZE);
    
    // Check borders
    if (newHead.x < 0 || newHead.x >= maxX || newHead.y < 0 || newHead.y >= maxY) {
        console.log('💥 Border collision');
        endGame('Border collision');
        return;
    }
    
    // Check food collision
    for (let i = 0; i < food.length; i++) {
        if (newHead.x === food[i].x && newHead.y === food[i].y) {
            console.log(`🎯 Ate ${food[i].option}!`);
            submitAnswer(food[i].option);
            return;
        }
    }
    
    // Move snake
    snake.unshift(newHead);
    snake.pop();
}

/**
 * Draw the game
 */
function drawGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas missing in drawGame');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('❌ 2D context missing in drawGame');
        return;
    }
    
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= Math.floor(canvas.width / CELL_SIZE); i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= Math.floor(canvas.height / CELL_SIZE); i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    if (snake.length === 0) {
        console.warn('⚠️ Snake array is empty!');
    } else {
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = '#06b6d4'; // Cyan head
            } else {
                ctx.fillStyle = '#10b981'; // Green body
            }
            
            ctx.fillRect(
                segment.x * CELL_SIZE + 2,
                segment.y * CELL_SIZE + 2,
                CELL_SIZE - 4,
                CELL_SIZE - 4
            );
        });
    }
    
    // Draw answer options
    const optionColors = {
        'A': '#ff6b6b',  // Red
        'B': '#4ecdc4',  // Cyan
        'C': '#ffe66d',  // Yellow
        'D': '#a78bfa'   // Purple
    };
    
    if (food.length === 0) {
        console.warn('⚠️ Food array is empty!');
    } else {
        food.forEach(item => {
            ctx.fillStyle = optionColors[item.option];
            ctx.strokeStyle = optionColors[item.option];
            ctx.lineWidth = 2;
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(
                item.x * CELL_SIZE + CELL_SIZE / 2,
                item.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2 - 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
            
            // Draw letter
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                item.option,
                item.x * CELL_SIZE + CELL_SIZE / 2,
                item.y * CELL_SIZE + CELL_SIZE / 2
            );
        });
    }
}

/**
 * Setup keyboard controls
 */
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction.y === 0) nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction.y === 0) nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction.x === 0) nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction.x === 0) nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
        }
    });
}

/**
 * Button controls
 */
function moveSnake(dir) {
    handleKeyPress(dir);
}

function handleKeyPress(dir) {
    console.log('⌨️ Key pressed:', dir);
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
    console.log(`📤 Submitting answer: ${option}`);
    gameRunning = false;
    clearInterval(gameLoopId);
    
    try {
        const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        const response = await Game.submitAnswer(sessionId, 1, option, 'answered', 20);
        
        if (response.success) {
            console.log('✓ Answer submitted successfully');
            showResult(response.data.isCorrect, response.data.pointsAwarded);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        showResult(false, 0);
    }
}

/**
 * Show result
 */
function showResult(isCorrect, points) {
    console.log(`📊 Showing result: ${isCorrect ? 'CORRECT' : 'WRONG'} (${points} points)`);
    
    const gameScreen = document.getElementById('gameScreen');
    const resultScreen = document.getElementById('resultScreen');
    
    if (gameScreen) gameScreen.classList.remove('active');
    if (resultScreen) resultScreen.classList.add('active');
    
    const messageEl = document.getElementById('resultMessage');
    const pointsEl = document.getElementById('resultPoints');
    
    if (messageEl && pointsEl) {
        if (isCorrect) {
            messageEl.textContent = '✓ CORRECT!';
            messageEl.style.color = '#10b981';
            pointsEl.textContent = `+${points} Points`;
        } else {
            messageEl.textContent = '✗ WRONG';
            messageEl.style.color = '#ef4444';
            pointsEl.textContent = '+0 Points';
        }
    }
}

/**
 * End game
 */
function endGame(reason) {
    console.log('🏁 Game ended:', reason);
    gameRunning = false;
    if (gameLoopId) clearInterval(gameLoopId);
    showResult(false, 0);
}

console.log('🎮 Game.js loaded and ready');
