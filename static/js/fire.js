const canvasC = document.getElementById('canvasC');

const ctxFire = canvasC.getContext('2d');

canvasC.width = window.innerWidth;
canvasC.height = window.innerHeight;

// Fireflies
const numFireflies = 70;
const fireflies = [];

function createFirefly() {
    return {
        x: Math.random() * canvasC.width,
        y: Math.random() * canvasC.height,
        radius: Math.random() * 3 + 1,
        speedX: Math.random() * 1.2 - 1,
        speedY: Math.random() * 1.7 - 1,
        alpha: Math.random() * 0.5 + 0.5,
        flickerSpeed: Math.random() * 0.05 + 0.02
    };
}

function drawFireflies() {
    fireflies.forEach(firefly => {
        firefly.x += firefly.speedX;
        firefly.y += firefly.speedY;

        if (firefly.x > canvasC.width || firefly.x < 0) firefly.speedX *= -1;
        if (firefly.y > canvasC.height || firefly.y < 0) firefly.speedY *= -1;

        ctxFire.beginPath();
        ctxFire.arc(firefly.x, firefly.y, firefly.radius, 0, 2 * Math.PI);
        ctxFire.fillStyle = `hsl(${Math.random() * 20 + 220}, 40%, 40%)`;
      
        ctxFire.fill();

        firefly.alpha += (Math.random() - 0.5) * firefly.flickerSpeed;
        firefly.alpha = Math.max(0, Math.min(1, firefly.alpha));
    });
}


let g = 0;

function animate() {
    ctxFire.clearRect(0, 0, canvasC.width, canvasC.height); // Clear the canvasC

    drawFireflies();

    g += 0.1;
    requestAnimationFrame(animate);
}

function resizecanvasC() {
    canvasC.width = window.innerWidth;
    canvasC.height = window.innerHeight;
}


window.addEventListener('resize', resizecanvasC);

// Initialize fireflies
for (let i = 0; i < numFireflies; i++) {
    fireflies.push(createFirefly());
}

animate(); // Start animation