

const canvasA = document.getElementById('canvasA');

        const ctxStars = canvasA.getContext('2d');
 

        const numStars = 2000;
        const stars = [];
        let t = 0;

        function initStars() {
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvasA.width,
                    y: Math.random() * canvasA.height,
                    radius: Math.random() * 2.0,
                    color: `hsl(${Math.random() * 20 + 220}, 40%, 40%)`,
                    speed: Math.random() * 0.08 + 0.04
                });
            }
        }

        function drawStars() {
            ctxStars.fillStyle = 'black';
            ctxStars.fillRect(0, 0, canvasA.width, canvasA.height);

            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > canvasA.height) {
                    star.y = 0;
                    star.x = Math.random() * canvasA.width;
                }

                ctxStars.beginPath();
                ctxStars.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
                ctxStars.fillStyle = star.color;
                ctxStars.fill();
            });
        }

        function animateStars() {

            drawStars();

            requestAnimationFrame(animateStars);
        }

        initStars();
        animateStars();





