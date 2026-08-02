/* ============================================================
   HERO SNAKE CANVAS ANIMATION - Smooth Real-Time Cyber Serpent
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('heroSnakeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Diamond / Kite Trajectory Waypoints (x, y in canvas coords)
    const padding = 55;
    const waypoints = [
        { x: width / 2, y: padding },             // Top
        { x: width - padding, y: height / 2 },    // Right
        { x: width / 2, y: height - padding },    // Bottom
        { x: padding, y: height / 2 }             // Left
    ];

    // Total distance along perimeter
    function dist(p1, p2) {
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    const segmentLens = [];
    let totalLength = 0;
    for (let i = 0; i < waypoints.length; i++) {
        const nextP = waypoints[(i + 1) % waypoints.length];
        const len = dist(waypoints[i], nextP);
        segmentLens.push(len);
        totalLength += len;
    }

    // Get point on waypoints path at distance d
    function getPointAtPath(distance) {
        let d = ((distance % totalLength) + totalLength) % totalLength;
        for (let i = 0; i < waypoints.length; i++) {
            const segLen = segmentLens[i];
            if (d <= segLen) {
                const p1 = waypoints[i];
                const p2 = waypoints[(i + 1) % waypoints.length];
                const t = d / segLen;
                return {
                    x: p1.x + (p2.x - p1.x) * t,
                    y: p1.y + (p2.y - p1.y) * t,
                    angle: Math.atan2(p2.y - p1.y, p2.x - p1.x)
                };
            }
            d -= segLen;
        }
        return waypoints[0];
    }

    // Snake parameters
    const totalSegments = 16;
    const segmentSpacing = 11;
    let headDistance = 0;
    const speed = 2.2; // pixels per frame

    function renderHeroSnake() {
        ctx.clearRect(0, 0, width, height);

        // 1. Sleek Deep Space Radial Background Floor
        const bgGrad = ctx.createRadialGradient(
            width / 2, height / 2, 20,
            width / 2, height / 2, width * 0.72
        );
        bgGrad.addColorStop(0, '#0a102d');
        bgGrad.addColorStop(0.65, '#05091a');
        bgGrad.addColorStop(1, '#02040d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Double-Layered Neon Cyber Frame Border
        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 22;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4.5;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(7, 7, width - 14, height - 14);
        ctx.restore();

        // Advance head
        headDistance += speed;

        // Calculate positions of all segments
        const snakePoints = [];
        for (let i = 0; i < totalSegments; i++) {
            const pointD = headDistance - (i * segmentSpacing);
            const pt = getPointAtPath(pointD);
            snakePoints.push(pt);
        }

        // PASS A: Ambient Floor Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = '#000000';
        snakePoints.forEach((pt, i) => {
            const r = (15 - i * 0.4);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(4, r), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // PASS B: Render Body Segments (Tail to Neck)
        for (let i = totalSegments - 1; i >= 1; i--) {
            const pt = snakePoints[i];
            const prevPt = snakePoints[i - 1];
            const progress = i / totalSegments;
            const radius = Math.max(5, 14.5 * (1 - Math.pow(progress, 1.8) * 0.48));

            ctx.save();
            const isViolet = (i % 2 === 0);
            ctx.shadowColor = isViolet ? '#a855f7' : '#06b6d4';
            ctx.shadowBlur = 12;

            const bodyGrad = ctx.createRadialGradient(
                pt.x - radius * 0.35, pt.y - radius * 0.35, radius * 0.1,
                pt.x, pt.y, radius * 1.15
            );

            if (i === 1) {
                bodyGrad.addColorStop(0, '#f5d0fe');
                bodyGrad.addColorStop(0.45, '#c084fc');
                bodyGrad.addColorStop(1, '#7e22ce');
            } else if (isViolet) {
                bodyGrad.addColorStop(0, '#e9d5ff');
                bodyGrad.addColorStop(0.5, '#a855f7');
                bodyGrad.addColorStop(1, '#581c87');
            } else {
                bodyGrad.addColorStop(0, '#cff4fc');
                bodyGrad.addColorStop(0.5, '#06b6d4');
                bodyGrad.addColorStop(1, '#0e7490');
            }

            ctx.fillStyle = bodyGrad;

            // Main Orb
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Connector Capsule to next segment
            const angle = Math.atan2(prevPt.y - pt.y, prevPt.x - pt.x);
            ctx.beginPath();
            ctx.arc(pt.x + Math.cos(angle) * (radius * 0.55), pt.y + Math.sin(angle) * (radius * 0.55), radius * 0.88, 0, Math.PI * 2);
            ctx.fill();

            // Specular Glass Highlight Arc
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(pt.x - radius * 0.15, pt.y - radius * 0.15, radius * 0.65, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

            ctx.restore();
        }

        // PASS C: Render Cyber Crown Head
        const headPt = snakePoints[0];
        const headR = 15;

        ctx.save();
        ctx.translate(headPt.x, headPt.y);
        ctx.rotate(headPt.angle);

        // 1. Flickering Red Snake Tongue
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(headR - 1, 0);
        ctx.lineTo(headR + 9, 0);
        ctx.lineTo(headR + 14, -3.5);
        ctx.moveTo(headR + 9, 0);
        ctx.lineTo(headR + 14, 3.5);
        ctx.stroke();
        ctx.restore();

        // 2. Radiant Cyber Crown Head Orb
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
        ctx.roundRect(-headR + 1, -headR + 1, headR * 2 - 2, headR * 2 - 2, 9);
        ctx.fill();

        // White Head Outline
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

        // 4. Expressive 3D Eyes
        const eyeX = headR * 0.35;
        const eyeY = headR * 0.45;
        const eyeR = 4.8;

        [-eyeY, eyeY].forEach(yPos => {
            // White Eye Base
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX, yPos, eyeR, 0, Math.PI * 2);
            ctx.fill();

            // Sapphire Pupil
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(eyeX + 1.2, yPos, eyeR * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Specular White Catchlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX - 0.8, yPos - 1.4, 1.6, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();

        requestAnimationFrame(renderHeroSnake);
    }

    renderHeroSnake();
});
