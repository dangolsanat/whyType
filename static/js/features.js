const audio = document.getElementById('lofi-player');
const play = document.getElementById('play_logo');
const pause = document.getElementById('pause_logo');
const volumeControl = document.getElementById('volume-control');
const playPauseContainer = document.getElementById('play-pause');
const scroll = document.getElementById('scrolling-container');
const playtext = document.getElementById('play-text');
const waves = document.getElementById('waves');

waves.addEventListener('click', () => {
    if (canvas.style.display === 'none' || canvas.style.display === '') {
        canvas.style.display = 'block'; // Show the canvas
    } else {
        canvas.style.display = 'none'; // Hide the canvas
    }
});
const ctxs = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(); // Redraw the canvas content after resizing
}

// Call the function to set the initial size of the canvas
resizeCanvas();

// Attach an event listener to handle window resizing
window.addEventListener('resize', resizeCanvas);

function draw() {
    // Your drawing code here
    ctxs.fillStyle = 'black';
    ctxs.fillRect(0, 0, canvas.width, canvas.height);

    // Add your drawing logic here, adjusting for the new canvas size
}




playPauseContainer.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        play.style.display = 'none';  // Hide play button
        pause.style.display = 'flex'; // Show pause button
        scroll.style.visibility = 'visible'; // Show pause button
        playtext.style.display = 'none';

    } else {
        audio.pause();
        play.style.display = 'flex';  // Show play button
        pause.style.display = 'none';  // Hide pause button
        scroll.style.visibility = 'hidden'; // Show pause button
        playtext.style.display = 'flex'; // Show pause button

    }
});

volumeControl.addEventListener('input', () => {
    audio.volume = volumeControl.value;
});



//---------Zen mode functions------------


const zen = document.querySelector('.zen-logo');

function zenModeOn() {
    const nav = document.querySelector('.nav');
    const bd = document.querySelector('#book-details');
    const bf = document.querySelector('#book-info');
    const logo = document.querySelector('#zen');

    logo.style.opacity = '50%';
    
    // Add blur and fade out transition
    [nav, bd, bf].forEach(el => {
        el.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
        el.style.filter = 'blur(5px)';
        el.style.opacity = '0';
    });
}

function zenModeOff() {
    const nav = document.querySelector('.nav');
    const bd = document.querySelector('#book-details');
    const bf = document.querySelector('#book-info');

    // Remove blur and fade in transition
    [nav, bd, bf].forEach(el => {
        el.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
        el.style.filter = 'blur(0px)';
        el.style.opacity = '100%';
    });
}

zen.onclick = () => {
    const nav = document.querySelector('.nav');
    if (nav.style.opacity === '0') {
        zenModeOff();
    } else {
        zenModeOn();
    }
};
