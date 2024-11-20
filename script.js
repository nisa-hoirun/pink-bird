const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let birdY = canvas.height / 2;
let birdVelocity = 0;
let gravity = 0.6;
let lift = -8;
let birdWidth = 30;
let birdHeight = 30;
let birdX = 50;

let pipes = [];
let pipeWidth = 50;
let pipeGap = 150;
let pipeVelocity = 2;

let score = 0;  // Variabel skor
let passedPipes = 0;  // Variabel untuk melacak pipa yang sudah dilewati burung
let gameOver = false;

// Memuat gambar burung
const birdImage = new Image();
birdImage.src = "images/bird.png"; // Pastikan path gambar sesuai dengan folder dan nama file

// Mendapatkan elemen audio dari HTML
const backgroundMusic = document.getElementById("backgroundMusic");

// Pastikan gambar burung sudah dimuat sebelum menggambar
birdImage.onload = function() {
    // Mulai game loop setelah gambar dimuat
    gameLoop();  
    startMusic();  // Memulai musik setelah game dimulai
};

// Fungsi untuk memulai musik
function startMusic() {
    backgroundMusic.play();  // Memutar musik
}

// Fungsi untuk menggambar burung
function drawBird() {
    ctx.drawImage(birdImage, birdX, birdY, birdWidth, birdHeight);
}

// Pipes class
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = "pink";  // Mengubah warna pipa menjadi pink
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight); // Top pipe
        ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap); // Bottom pipe
    });
}

// Generate pipes
function generatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let topHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
        pipes.push({ x: canvas.width, topHeight: topHeight, passed: false });
    }
}

// Update pipe position
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeVelocity;

        // Mengecek jika burung berhasil melewati pipa
        if (pipe.x + pipeWidth < birdX && !pipe.passed) {
            score++; // Tambah skor setiap kali burung melewati pipa
            pipe.passed = true;  // Tandai pipa ini sudah dilewati
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// Detect collision with pipes
function checkCollision() {
    pipes.forEach(pipe => {
        if (
            birdX + birdWidth > pipe.x &&
            birdX < pipe.x + pipeWidth &&
            (birdY < pipe.topHeight || birdY + birdHeight > pipe.topHeight + pipeGap)
        ) {
            gameOver = true;
        }
    });
}

// Reset the game
function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    passedPipes = 0;  // Resetkan pipa yang dilewati
    pipeVelocity = 2; // Reset kecepatan pipa
    gameOver = false;
    startMusic();  // Mulai ulang musik setelah reset
}

// Update game state
function update() {
    if (gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", 120, 250);
        ctx.fillText("Click OK to Restart", 90, 300);

        // Ask for confirmation to restart
        if (confirm("Game Over! Press OK to restart.")) {
            resetGame(); // Restart the game
        }
        return;
    }

    birdVelocity += gravity;
    birdY += birdVelocity;

    if (birdY + birdHeight > canvas.height || birdY < 0) {
        gameOver = true;
    }

    generatePipes();
    updatePipes();
    checkCollision();

    // Setiap 5 skor, tambahkan kecepatan pipa
    if (score % 5 === 0 && score > 0) {
        pipeVelocity += 0.1;  // Meningkatkan kecepatan pipa setiap 5 skor
        score++;  // Menghindari peningkatan kecepatan berulang pada skor yang sama
    }

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color to light blue
    ctx.fillStyle = "#87CEEB";  // Light blue color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill canvas with light blue

    drawBird();
    drawPipes();

    // Draw score slightly above the center
    drawScoreAboveCenter();
}

// Control bird with space key
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !gameOver) {
        birdVelocity = lift;
    }
});

// Function to draw score slightly above the center of the screen
function drawScoreAboveCenter() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";

    // Get the width of the score text
    const scoreText = "Score: " + score;
    const textWidth = ctx.measureText(scoreText).width;

    // Calculate the position to center the text horizontally and move it up vertically
    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height / 2 - 20; // 20 pixels above the center

    // Draw the score text in the adjusted position
    ctx.fillText(scoreText, x, y);
}

// Game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}
