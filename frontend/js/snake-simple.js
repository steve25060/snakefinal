// ============================================
// ULTRA-SIMPLE SNAKE GAME - NO DEPENDENCIES
// ============================================

console.log('🎮 Loading Ultra-Simple Snake Game');

// Game variables
let canvas = null;
let ctx = null;
let snake = [];
let food = [];
let gameActive = false;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameLoopInterval = null;
// Note: currentQuestion is managed by game.html global state

const GRID_SIZE = 25;
const CANVAS_SIZE = 600;
const CELLS = CANVAS_SIZE / GRID_SIZE; // 24x24 grid
const BASE_SPEED = 250; // ms between updates for Question 1 (comfortable starting speed)

// Initialize everything
function initGame() {
    console.log('%c========== GAME INIT START ==========', 'color: cyan; font-size: 12px; font-weight: bold');
    
    // Get current question number safely from DOM or global state
    const questionElem = document.getElementById('questionNum');
    const questionText = questionElem ? questionElem.textContent : '1/10'; // "1/10"
    const parsedQ = parseInt(questionText.split('/')[0]);
    currentQuestion = (!isNaN(parsedQ) && parsedQ > 0) ? parsedQ : (window.currentQuestion || 1);
    console.log(`📋 Current Question: ${currentQuestion}`);
    
    // 1. Get canvas
    canvas = document.getElementById('gameCanvas');
    console.log('1. Canvas element:', canvas ? '✅ FOUND' : '❌ NOT FOUND');
    
    if (!canvas) {
        console.error('❌ FATAL: Cannot find canvas!');
        return false;
    }
    
    // 2. Get context
    ctx = canvas.getContext('2d');
    console.log('2. Canvas context:', ctx ? '✅ FOUND' : '❌ NOT FOUND');
    
    if (!ctx) {
        console.error('❌ FATAL: Cannot get 2D context!');
        return false;
    }
    
    // 3. Set canvas dimensions explicitly
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    console.log(`3. Canvas size set to: ${canvas.width}x${canvas.height} ✅`);
    
    // 4. Initialize snake centered on grid (moving right) - Grows continuously with each question
    const snakeLength = 3 + (currentQuestion - 1); // Length grows from 3 (Q1) to 22 (Q20)
    snake = [];
    for (let i = 0; i < snakeLength; i++) {
        snake.push({ x: Math.max(1, 8 - i), y: 12 });
    }
    console.log(`4. Snake initialized: ${snake.length} segments (Question ${currentQuestion}) ✅`);
    
    // 5. Place food (answer options)
    food = [];
    placeFood();
    console.log(`5. Food placed: ${food.length} items ✅`);
    
    // 6. Reset state & direction
    gameActive = true;
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    console.log('6. Game state reset ✅');
    
    // 7. Draw initial frame immediately
    draw();
    console.log('7. Initial draw complete ✅');
    
    // 8. Start game loop
    startLoop();
    console.log('8. Game loop started ✅');
    
    // 9. Enable keyboard controls
    enableKeyboard();
    console.log('9. Keyboard controls enabled ✅');
    
    console.log('%c========== GAME INIT COMPLETE ==========', 'color: lime; font-size: 12px; font-weight: bold');
    return true;
}

// Place food options A, B, C, D at completely random non-overlapping positions on the grid
function placeFood() {
    food = [];
    
    const optionsData = [
        { label: 'A', color: '#ef4444', textColor: '#ffffff' }, // Crimson Red
        { label: 'B', color: '#38bdf8', textColor: '#ffffff' }, // Electric Blue
        { label: 'C', color: '#facc15', textColor: '#000000' }, // Vibrant Gold Yellow
        { label: 'D', color: '#ec4899', textColor: '#ffffff' }  // Neon Magenta
    ];

    // Track occupied grid cells to prevent overlaps
    const occupied = new Set();

    // Reserve current snake positions
    if (Array.isArray(snake)) {
        snake.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
    }

    // Place each option at a unique, random grid location
    optionsData.forEach(opt => {
        let rx, ry, key;
        let attempts = 0;

        do {
            // Pick random coordinates within grid (margin 2..21 to keep away from exact outer border)
            rx = Math.floor(Math.random() * (CELLS - 4)) + 2;
            ry = Math.floor(Math.random() * (CELLS - 4)) + 2;
            key = `${rx},${ry}`;
            attempts++;
        } while (occupied.has(key) && attempts < 200);

        occupied.add(key);

        food.push({
            x: rx,
            y: ry,
            label: opt.label,
            color: opt.color,
            textColor: opt.textColor
        });
    });

    console.log('🎲 Food options placed at random positions:', food.map(f => `${f.label}:(${f.x},${f.y})`).join(' '));
}

// Main draw function - Ultra-Premium Glowing Cyber Serpent Snake (No Grid Lines)
function draw() {
    if (!ctx || !canvas) return;

    // 1. Sleek Sci-Fi Arena Floor (Deep Space Radial Gradient, NO GRID LINES)
    const bgGrad = ctx.createRadialGradient(
        CANVAS_SIZE / 2, CANVAS_SIZE / 2, 40,
        CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.72
    );
    bgGrad.addColorStop(0, '#0a102d');
    bgGrad.addColorStop(0.65, '#05091a');
    bgGrad.addColorStop(1, '#02040d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 2. Double-Layered Neon Cyber Frame Border
    ctx.save();
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, CANVAS_SIZE - 6, CANVAS_SIZE - 6);
    
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(7, 7, CANVAS_SIZE - 14, CANVAS_SIZE - 14);
    ctx.restore();

    // 3. Draw Food Options (A, B, C, D) - ULTRA HIGH-CONTRAST BADGES
    if (Array.isArray(food) && food.length > 0) {
        food.forEach(item => {
            const px = item.x * GRID_SIZE;
            const py = item.y * GRID_SIZE;
            const cx = px + GRID_SIZE / 2;
            const cy = py + GRID_SIZE / 2;

            ctx.save();

            // Intense Neon Glow Aura around Badge
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 22;

            // Vibrant Solid Food Badge Background
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.roundRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2, 8);
            ctx.fill();

            // Thick Solid White Border for Extreme Sharp Contrast
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Large Bold Letter (A, B, C, D)
            ctx.fillStyle = item.textColor;
            ctx.font = '900 22px Orbitron, Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Text Shadow for crystal clear readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 5;
            ctx.fillText(item.label, cx, cy + 1);

            ctx.restore();
        });
    }

    // 4. Draw Ultra-Premium Glowing Cyber Serpent Snake
    if (Array.isArray(snake) && snake.length > 0) {
        const total = snake.length;

        // PASS A: Soft Ambient Occlusion Floor Shadow under the snake
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = '#000000';

        snake.forEach((seg) => {
            const cx = seg.x * GRID_SIZE + GRID_SIZE / 2;
            const cy = seg.y * GRID_SIZE + GRID_SIZE / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, (GRID_SIZE / 2) - 1, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // PASS B: Render Continuous Organic Body Segments from Tail to Neck (Theme Matched Violet + Cyan)
        for (let i = total - 1; i >= 1; i--) {
            const seg = snake[i];
            const prevSeg = snake[i - 1];
            const cx = seg.x * GRID_SIZE + GRID_SIZE / 2;
            const cy = seg.y * GRID_SIZE + GRID_SIZE / 2;

            // Tail Taper Ratio: smoothly tapers tail end
            const progress = i / total;
            const taperRatio = Math.max(0.52, 1 - Math.pow(progress, 2.2) * 0.48);
            const radius = (GRID_SIZE / 2 + 1.5) * taperRatio;

            ctx.save();

            // Outer Neon Glow (Alternating Violet & Cyan Theme Colors)
            const isViolet = (i % 2 === 0);
            ctx.shadowColor = isViolet ? '#a855f7' : '#06b6d4';
            ctx.shadowBlur = 14;

            // 3D Spherical Scale Shading Gradient
            const bodyGrad = ctx.createRadialGradient(
                cx - radius * 0.35, cy - radius * 0.35, radius * 0.1,
                cx, cy, radius * 1.15
            );

            if (i === 1) { // Neck near head (Bright Magenta/Violet Highlight)
                bodyGrad.addColorStop(0, '#f5d0fe');
                bodyGrad.addColorStop(0.45, '#c084fc');
                bodyGrad.addColorStop(1, '#7e22ce');
            } else if (isViolet) { // Vibrant Neon Violet Scale
                bodyGrad.addColorStop(0, '#e9d5ff');
                bodyGrad.addColorStop(0.5, '#a855f7');
                bodyGrad.addColorStop(1, '#581c87');
            } else { // Electric Cyan Scale
                bodyGrad.addColorStop(0, '#cff4fc');
                bodyGrad.addColorStop(0.5, '#06b6d4');
                bodyGrad.addColorStop(1, '#0e7490');
            }

            ctx.fillStyle = bodyGrad;

            // Connect segment to previous segment for a seamless smooth body
            const pcx = prevSeg.x * GRID_SIZE + GRID_SIZE / 2;
            const pcy = prevSeg.y * GRID_SIZE + GRID_SIZE / 2;
            const angle = Math.atan2(pcy - cy, pcx - cx);

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Segment joint connector capsule (completely bridges body gaps)
            const connX = cx + Math.cos(angle) * (GRID_SIZE * 0.5);
            const connY = cy + Math.sin(angle) * (GRID_SIZE * 0.5);
            ctx.beginPath();
            ctx.arc(connX, connY, radius * 0.95, 0, Math.PI * 2);
            ctx.fill();

            // Scale Specular Top Highlight Curve (High Contrast 3D Glass/Crystal Effect)
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx - radius * 0.15, cy - radius * 0.15, radius * 0.65, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

            ctx.restore();
        }

        // PASS C: Render Radiant Expressive Snake Head (Theme Matched Cyber Gold & Violet)
        const head = snake[0];
        const hcx = head.x * GRID_SIZE + GRID_SIZE / 2;
        const hcy = head.y * GRID_SIZE + GRID_SIZE / 2;
        const headR = (GRID_SIZE / 2) - 0.5;

        ctx.save();
        ctx.translate(hcx, hcy);

        // Rotation angle based on movement direction
        let headAngle = 0;
        if (direction.x === 1) headAngle = 0;                  // Right
        else if (direction.x === -1) headAngle = Math.PI;       // Left
        else if (direction.y === 1) headAngle = Math.PI / 2;   // Down
        else if (direction.y === -1) headAngle = -Math.PI / 2; // Up
        ctx.rotate(headAngle);

        // 1. Animated Flickering Forked Red Snake Tongue
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(headR - 1, 0);
        ctx.lineTo(headR + 10, 0);
        ctx.lineTo(headR + 15, -3.5);
        ctx.moveTo(headR + 10, 0);
        ctx.lineTo(headR + 15, 3.5);
        ctx.stroke();
        ctx.restore();

        // 2. Head Base Shape - Radiant Cyber Gold & Violet Crown
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 24;

        const headGrad = ctx.createRadialGradient(
            -headR * 0.35, -headR * 0.35, headR * 0.15,
            0, 0, headR * 1.25
        );
        headGrad.addColorStop(0, '#fef08a');
        headGrad.addColorStop(0.4, '#f59e0b');
        headGrad.addColorStop(0.8, '#a855f7');
        headGrad.addColorStop(1, '#581c87');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(0, 0, headR, 0, Math.PI * 2);
        ctx.fill();

        // Crisp White Head Outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3. Cute Pink Cheek Accents
        ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
        ctx.beginPath();
        ctx.arc(headR * 0.1, -headR * 0.65, 3, 0, Math.PI * 2);
        ctx.arc(headR * 0.1, headR * 0.65, 3, 0, Math.PI * 2);
        ctx.fill();

        // 4. Large Expressive 3D Eyes with Specular Catchlight
        const eyeX = headR * 0.35;
        const eyeY = headR * 0.45;
        const eyeR = 4.8;

        [-eyeY, eyeY].forEach(yPos => {
            // White Eye Base
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX, yPos, eyeR, 0, Math.PI * 2);
            ctx.fill();

            // Sapphire Blue Pupil
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(eyeX + 1.2, yPos, eyeR * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // White Specular Catchlight Highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX - 0.8, yPos - 1.4, 1.6, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }
}

// Update game state
function update() {
    if (!gameActive) return;
    
    // Update direction
    direction = nextDirection;
    
    // Calculate new head
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= CELLS || newHead.y < 0 || newHead.y >= CELLS) {
        console.log('💥 WALL COLLISION');
        endGame('border_collision');
        return;
    }
    
    // Check self collision
    if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        console.log('💥 SELF COLLISION');
        endGame('self_collision');
        return;
    }
    
    // Check food collision
    for (let i = 0; i < food.length; i++) {
        if (newHead.x === food[i].x && newHead.y === food[i].y) {
            const answer = food[i].label;
            console.log(`🎯 ANSWER SELECTED: ${answer}`);
            submitAnswer(answer);
            return;
        }
    }
    
    // Move snake
    snake.unshift(newHead);
    snake.pop();
}

// Game loop - Speed increases gradually with each question
function startLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    // Smooth continuous speed progression across all 20 questions
    const initialSpeed = 250; // Q1 comfortable speed
    const speedDecrease = 9;  // Reduces by 9ms per question
    const speed = Math.max(initialSpeed - (currentQuestion - 1) * speedDecrease, 65); // Continuous speed boost
    
    console.log(`⚡ Game speed: ${speed}ms per update (Question ${currentQuestion}/20)`);
    
    gameLoopInterval = setInterval(() => {
        update();
        draw();
    }, speed);
    
    console.log('✅ Game loop started, interval ID:', gameLoopInterval);
}

// Handle keyboard input - ONLY WHEN GAME IS ACTIVE
let keyboardActive = false;

function enableKeyboard() {
    keyboardActive = true;
    console.log('⌨️ Keyboard controls ENABLED');
}

function disableKeyboard() {
    keyboardActive = false;
    console.log('⌨️ Keyboard controls DISABLED');
}

// FIXED: Proper arrow key handling with case-sensitive key names
document.addEventListener('keydown', (e) => {
    if (!keyboardActive || !gameActive) return;
    
    const key = e.key;
    console.log(`🔑 Key pressed: "${key}"`);
    
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (direction.y === 0) {
            nextDirection = { x: 0, y: -1 };
            console.log('⬆️ UP MOVE');
        }
        e.preventDefault();
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (direction.y === 0) {
            nextDirection = { x: 0, y: 1 };
            console.log('⬇️ DOWN MOVE');
        }
        e.preventDefault();
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        if (direction.x === 0) {
            nextDirection = { x: -1, y: 0 };
            console.log('⬅️ LEFT MOVE');
        }
        e.preventDefault();
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (direction.x === 0) {
            nextDirection = { x: 1, y: 0 };
            console.log('➡️ RIGHT MOVE');
        }
        e.preventDefault();
    }
});

// Handle button clicks & on-screen controls
function moveSnakeByButton(dir) {
    if (!gameActive) return;
    
    console.log(`🔘 Direction requested: ${dir}`);
    const d = String(dir).toUpperCase();
    
    if (d === 'UP' || d === 'ARROWUP' || d === 'W') {
        if (direction.y === 0) {
            nextDirection = { x: 0, y: -1 };
            console.log('⬆️ UP MOVE');
        }
    } else if (d === 'DOWN' || d === 'ARROWDOWN' || d === 'S') {
        if (direction.y === 0) {
            nextDirection = { x: 0, y: 1 };
            console.log('⬇️ DOWN MOVE');
        }
    } else if (d === 'LEFT' || d === 'ARROWLEFT' || d === 'A') {
        if (direction.x === 0) {
            nextDirection = { x: -1, y: 0 };
            console.log('⬅️ LEFT MOVE');
        }
    } else if (d === 'RIGHT' || d === 'ARROWRIGHT' || d === 'D') {
        if (direction.x === 0) {
            nextDirection = { x: 1, y: 0 };
            console.log('➡️ RIGHT MOVE');
        }
    }
}

// End game
async function endGame(reason) {
    gameActive = false;
    disableKeyboard();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    console.log(`❌ Game ended: ${reason}`);
    
    if (reason === 'border_collision' || reason === 'self_collision') {
        const questionId = (window.currentGameData && window.currentGameData.id) || currentQuestion;
        try {
            await Game.skipQuestion(questionId);
        } catch (error) {
            console.error('Error skipping question on collision:', error);
        }
        showResult(false, 0);
    }
}

// Submit answer
async function submitAnswer(option) {
    gameActive = false;
    disableKeyboard();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    console.log(`📤 Submitting answer: ${option}`);
    
    try {
        const sessionId = localStorage.getItem('snakemcq_session_id');
        const questionId = (window.currentGameData && window.currentGameData.id) || currentQuestion;
        const response = await Game.submitAnswer(sessionId, questionId, option, 'answered', 20);
        
        if (response && response.success) {
            const isCorrect = response.isCorrect !== undefined ? response.isCorrect : (response.data && response.data.isCorrect);
            const pointsAwarded = response.pointsAwarded !== undefined ? response.pointsAwarded : (response.data ? response.data.pointsAwarded : 0);
            showResult(isCorrect, pointsAwarded || 0);
        } else {
            showResult(false, 0);
        }
    } catch (error) {
        console.error('Answer submission error:', error);
        showResult(false, 0);
    }
}

// Show result
function showResult(isCorrect, points) {
    const gameScreen = document.getElementById('gameScreen');
    const resultScreen = document.getElementById('resultScreen');
    
    if (gameScreen) gameScreen.classList.remove('active');
    if (resultScreen) resultScreen.classList.add('active');
    
    const msgEl = document.getElementById('resultMessage');
    const ptEl = document.getElementById('resultPoints');
    
    if (msgEl && ptEl) {
        msgEl.textContent = isCorrect ? '✓ CORRECT!' : '✗ WRONG';
        msgEl.style.color = isCorrect ? '#00FF00' : '#FF0000';
        ptEl.textContent = isCorrect ? `+${points} Points` : '+0 Points';
    }
}

// Export for HTML
window.initSnakeGame = initGame;
window.moveSnake = moveSnakeByButton;

console.log('✅ Snake Game Module Loaded');
