
// Array to hold raindrop objects
const raindrops = [];
const numRaindrops = 100; // Number of raindrops
const canvasB = document.getElementById('canvasB');

const ctxRain = canvasB.getContext('2d');
canvasB.width = window.innerWidth;
canvasB.height = window.innerHeight;
// Initialize raindrops
function initRaindrops() {
    for (let i = 0; i < numRaindrops; i++) {
        raindrops.push({
            x: Math.random() * canvasB.width,
            y: Math.random() * canvasB.height,
            length: Math.random() * 20 + 10, // Raindrop length
            speed: Math.random() * 3 + 2, // Raindrop speed
            opacity: Math.random() * 0.5 + 0.5 // Raindrop opacity
        });
    }
}

// Function to draw raindrops
function drawRaindrops() {
    ctxRain.clearRect(0, 0, canvasB.width, canvasB.height); // Clear the canvasB
    
    ctxRain.fillStyle = `hsl(${Math.random() * 20 + 220}, 40%, 40%)`; // Light blue color for raindrops

    raindrops.forEach(raindrop => {
        ctxRain.globalAlpha = raindrop.opacity; // Set raindrop opacity
        ctxRain.fillRect(raindrop.x, raindrop.y, 2, raindrop.length); // Draw raindrop
        raindrop.y += raindrop.speed; // Move raindrop down

        // Reset raindrop position when it reaches the bottom
        if (raindrop.y > canvasB.height) {
            raindrop.y = 0;
            raindrop.x = Math.random() * canvasB.width;
        }
    });
}

// Animation function
function animateRain() {
    drawRaindrops();
    requestAnimationFrame(animateRain); // Keep animating
}

// Initialize and start animation
initRaindrops();
animateRain();

