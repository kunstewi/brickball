const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('gameOver');

let lives = 2;

const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 20,
    width: 100,
    height: 10,
    color: '#0095DD',
    dx: 8
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: -4,
    color: '#0095DD'
};

const brickInfo = {
    width: 75,
    height: 20,
    padding: 10,
    offsetX: 45,
    offsetY: 60,
    rows: 5,
    cols: 8
};

const bricks = [];
for (let c = 0; c < brickInfo.cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickInfo.rows; r++) {
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        bricks[c][r] = { x: 0, y: 0, status: 1, color: color };
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickInfo.cols; c++) {
        for (let r = 0; r < brickInfo.rows; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickInfo.width + brickInfo.padding) + brickInfo.offsetX;
                const brickY = r * (brickInfo.height + brickInfo.padding) + brickInfo.offsetY;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickInfo.width, brickInfo.height);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickInfo.cols; c++) {
        for (let r = 0; r < brickInfo.rows; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + brickInfo.width &&
                    ball.y > b.y &&
                    ball.y < b.y + brickInfo.height
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                }
            }
        }
    }
}

function update() {
    movePaddle();

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy = -ball.dy;
    }

    // Bottom wall collision (lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        livesElement.textContent = `Lives: ${lives}`;
        if (lives === 0) {
            gameOverElement.style.display = 'block';
            cancelAnimationFrame(animationFrameId);
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 30;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = canvas.width / 2 - 50;
        }
    }

    collisionDetection();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
}

let animationFrameId;

function gameLoop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

gameLoop();