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
    
    // 9. Enable keyboard & touch swipe controls
    enableKeyboard();
    enableTouchSwipeControls();
    console.log('9. Keyboard & touch swipe controls enabled ✅');
    
    console.log('%c========== GAME INIT COMPLETE ==========', 'color: lime; font-size: 12px; font-weight: bold');
    return true;
}

// Place food options A, B, C, D at completely random non-overlapping positions on the grid
function placeFood() {
    food = [];
    
    const optionsData = [
        { label: 'A', color: '#ef4444', textColor: '#ffffff' }, // Vibrant Red
        { label: 'B', color: '#38bdf8', textColor: '#ffffff' }, // Electric Cyan
        { label: 'C', color: '#facc15', textColor: '#ffffff' }, // Gold Yellow
        { label: 'D', color: '#c084fc', textColor: '#ffffff' }  // Neon Purple
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

    // 3. Draw Food Options (A, B, C, D) - ULTRA HIGH-CONTRAST SCI-FI BADGES
    if (Array.isArray(food) && food.length > 0) {
        food.forEach(item => {
            const px = item.x * GRID_SIZE;
            const py = item.y * GRID_SIZE;
            const cx = px + GRID_SIZE / 2;
            const cy = py + GRID_SIZE / 2;
            const radius = (GRID_SIZE / 2) + 1.5;

            ctx.save();

            // 1. Intense Outer Neon Glow Aura
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 22;

            // 2. High-Contrast Dark Sci-Fi Badge Core (#080e1e)
            ctx.fillStyle = '#080e1e';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // 3. Thick Vivid Neon Border
            ctx.shadowBlur = 12;
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 3.5;
            ctx.stroke();

            // 4. Inner White Accent Ring for Sharp Separation
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
            ctx.stroke();

            // 5. Large Bold Crystal-Clear White Letter (A, B, C, D)
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 19px Inter, system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Drop Shadow on Text for 100% Readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.fillText(item.label, cx, cy + 1);

            ctx.restore();
        });
    }

    // 4. DRAW CLEAN, CRISP, SOLID SNAKE GRAPHICS (NO LIGHTING BLUR / NO SHADOW EFFECTS)
    if (Array.isArray(snake) && snake.length > 0) {
        const total = snake.length;

        // Calculate smooth sub-pixel positions for 60 FPS silky smooth movement
        const renderPoints = snake.map((seg) => {
            const targetX = seg.x * GRID_SIZE + GRID_SIZE / 2;
            const targetY = seg.y * GRID_SIZE + GRID_SIZE / 2;
            if (seg.renderX === undefined) seg.renderX = targetX;
            if (seg.renderY === undefined) seg.renderY = targetY;

            seg.renderX += (targetX - seg.renderX) * 0.45;
            seg.renderY += (targetY - seg.renderY) * 0.45;

            return { x: seg.renderX, y: seg.renderY };
        });

        // DISABLE ALL LIGHTING & SHADOW BLUR EFFECTS
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // -------------------------------------------------------------
        // PASS A: Render Clean Body Segments (Tail to Neck)
        // -------------------------------------------------------------
        for (let i = total - 1; i >= 1; i--) {
            const current = renderPoints[i];
            const next = renderPoints[i - 1]; // segment closer to head
            const progress = i / total;

            const radius = Math.max(6.5, (GRID_SIZE / 2 + 1) * (1 - Math.pow(progress, 1.5) * 0.45));
            const nextRadius = Math.max(6.5, (GRID_SIZE / 2 + 1) * (1 - Math.pow((i - 1) / total, 1.5) * 0.45));

            const dist = Math.hypot(next.x - current.x, next.y - current.y);
            const mainColor = '#38bdf8'; // Solid Light Blue

            // Draw continuous solid segment capsule fill
            ctx.fillStyle = mainColor;
            const steps = Math.max(3, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
                const interpX = current.x + (next.x - current.x) * (s / steps);
                const interpY = current.y + (next.y - current.y) * (s / steps);
                const interpR = radius + (nextRadius - radius) * (s / steps);

                ctx.beginPath();
                ctx.arc(interpX, interpY, interpR, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw seamless gapless crosshatch scale lines at close sub-step intervals
            const angle = Math.atan2(next.y - current.y, next.x - current.x);
            const a1 = angle + Math.PI / 4;
            const a2 = angle - Math.PI / 4;

            ctx.strokeStyle = 'rgba(15, 23, 42, 0.42)'; // Dark navy/cyan crosshatch line
            ctx.lineWidth = 1.4;

            const crossSteps = Math.max(2, Math.floor(dist / 6)); // Draw every ~6px with zero gaps
            for (let cs = 0; cs < crossSteps; cs++) {
                const cx = current.x + (next.x - current.x) * (cs / crossSteps);
                const cy = current.y + (next.y - current.y) * (cs / crossSteps);
                const cRadius = (radius + (nextRadius - radius) * (cs / crossSteps)) * 0.9;

                // Diagonal Cross Line 1 (+45°)
                ctx.beginPath();
                ctx.moveTo(cx - Math.cos(a1) * cRadius, cy - Math.sin(a1) * cRadius);
                ctx.lineTo(cx + Math.cos(a1) * cRadius, cy + Math.sin(a1) * cRadius);
                ctx.stroke();

                // Diagonal Cross Line 2 (-45°)
                ctx.beginPath();
                ctx.moveTo(cx - Math.cos(a2) * cRadius, cy - Math.sin(a2) * cRadius);
                ctx.lineTo(cx + Math.cos(a2) * cRadius, cy + Math.sin(a2) * cRadius);
                ctx.stroke();
            }
        }

        // -------------------------------------------------------------
        // PASS B: Render Clean Snake Head
        // -------------------------------------------------------------
        const head = renderPoints[0];
        const headR = (GRID_SIZE / 2) + 2.5;

        ctx.save();
        ctx.translate(head.x, head.y);

        // Rotation angle
        let angle = 0;
        if (renderPoints.length > 1) {
            angle = Math.atan2(head.y - renderPoints[1].y, head.x - renderPoints[1].x);
        } else {
            if (direction.x === 1) angle = 0;
            else if (direction.x === -1) angle = Math.PI;
            else if (direction.y === 1) angle = Math.PI / 2;
            else if (direction.y === -1) angle = -Math.PI / 2;
        }
        ctx.rotate(angle);

        // 1. Clean Animated Forked Red Tongue
        const time = Date.now() * 0.01;
        const flick = Math.sin(time) * 3;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(headR * 0.8, 0);
        ctx.lineTo(headR + 11, flick);
        ctx.lineTo(headR + 17, flick - 4);
        ctx.moveTo(headR + 11, flick);
        ctx.lineTo(headR + 17, flick + 4);
        ctx.stroke();

        // 2. Clean Solid Head Fill in Yellow Color
        ctx.fillStyle = '#facc15'; // Vibrant Yellow Head
        ctx.beginPath();
        ctx.arc(0, 0, headR, 0, Math.PI * 2);
        ctx.fill();

        // Clean Solid White Head Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // 3. Clean Pink Cheek Accents
        ctx.fillStyle = 'rgba(244, 114, 182, 0.9)';
        ctx.beginPath();
        ctx.arc(headR * 0.1, -headR * 0.65, 3.2, 0, Math.PI * 2);
        ctx.arc(headR * 0.1, headR * 0.65, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // 4. Clean Crisp Arcade Eyes
        const eyeX = headR * 0.4;
        const eyeY = headR * 0.5;
        const eyeR = 5.2;

        [-eyeY, eyeY].forEach(y => {
            // White Outer Sclera
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX, y, eyeR, 0, Math.PI * 2);
            ctx.fill();

            // Sapphire Iris
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(eyeX + 1.2, y, eyeR * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Deep Pupil
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.arc(eyeX + 1.6, y, eyeR * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // White Eye Shine Dot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX - 0.6, y - 1.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. Nostrils
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(headR * 1.05, -2.5, 1.2, 0, Math.PI * 2);
        ctx.arc(headR * 1.05, 2.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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

// Game loop - Progressive speed increase for Questions 16 to 20
function startLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    // Q1 - Q15: Base comfortable speed (250ms per tick)
    // Q16: 220ms, Q17: 190ms, Q18: 160ms, Q19: 130ms, Q20: 130ms (same as Q19)
    let speed = BASE_SPEED;
    const qNum = (typeof currentQuestion !== 'undefined' && currentQuestion) ? currentQuestion : (window.currentQuestion || 1);

    if (qNum >= 16) {
        const step = Math.min(qNum, 19) - 15; // 1 for Q16 (220ms), 2 for Q17 (190ms), 3 for Q18 (160ms), 4 for Q19 & Q20 (130ms)
        speed = BASE_SPEED - (step * 30);
    }

    console.log(`⚡ Game speed for Question ${qNum}: ${speed}ms per update`);
    
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

// Mobile Touch Swipe Gesture Controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchListenersInitialized = false;

function enableTouchSwipeControls() {
    if (touchListenersInitialized) return;

    const targets = [
        document.getElementById('gameCanvas'),
        document.getElementById('gameScreen'),
        document.querySelector('.game-container')
    ].filter(Boolean);

    targets.forEach(target => {
        target.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        target.addEventListener('touchmove', (e) => {
            if (gameActive && document.getElementById('gameScreen')?.classList.contains('active')) {
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        target.addEventListener('touchend', (e) => {
            if (!gameActive) return;
            if (e.changedTouches && e.changedTouches[0]) {
                touchEndX = e.changedTouches[0].clientX;
                touchEndY = e.changedTouches[0].clientY;
                handleTouchSwipe();
            }
        }, { passive: true });
    });

    touchListenersInitialized = true;
    console.log('📱 Touch swipe gesture controls initialized ✅');
}

function handleTouchSwipe() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const minSwipeDistance = 20;

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            moveSnakeByButton('RIGHT');
        } else {
            moveSnakeByButton('LEFT');
        }
    } else {
        if (dy > 0) {
            moveSnakeByButton('DOWN');
        } else {
            moveSnakeByButton('UP');
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
