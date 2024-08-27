const audio = document.getElementById('lofi-player');
const play = document.getElementById('play_logo');
const pause = document.getElementById('pause_logo');
const volumeControl = document.getElementById('volume-control');
const playPauseContainer = document.getElementById('play-pause');
const scroll = document.getElementById('scrolling-container');
const playtext = document.getElementById('play-text');
const waves = document.getElementById('waves');
const rain = document.getElementById('rain');
const fire = document.getElementById('fire');
 
canvasA.width = window.innerWidth;
canvasA.height = window.innerHeight;

waves.addEventListener('click', () => {
    // Check if the script has already been added
    if (canvasA.style.display === 'none' || canvasA.style.display === '') {
        canvasA.style.display = 'block';
        canvasA.style.opacity = 0; // Ensure it's invisible before the fade-in
        setTimeout(() => {
            canvasA.style.transition = 'opacity 0.3s'; // Smooth fade-in transition
            canvasA.style.opacity = 1; 
        }, 100); // Set to 0 to trigger transition immediately
    } else {
        canvasA.style.transition = 'opacity 0.3s'; // Smooth fade-out transition
        canvasA.style.opacity = 0; 
        setTimeout(() => {
            canvasA.style.display = 'none'; 
        }, 300); // Match with the fade-out duration
    }
});

rain.addEventListener('click', () => {
    // Check if the script has already been added
    if (canvasB.style.display === 'none' || canvasB.style.display === '') {
        canvasB.style.display = 'block';
        canvasB.style.opacity = 0; // Ensure it's invisible before the fade-in
        setTimeout(() => {
            canvasB.style.transition = 'opacity 0.3s'; // Smooth fade-in transition
            canvasB.style.opacity = 1; 
        }, 100); // Set to 0 to trigger transition immediately
    } else {
        canvasB.style.transition = 'opacity 0.3s'; // Smooth fade-out transition
        canvasB.style.opacity = 0; 
        setTimeout(() => {
            canvasB.style.display = 'none'; 
        }, 300); // Match with the fade-out duration
    }
});


fire.addEventListener('click', () => {
    // Check if the script has already been added
    if (canvasC.style.display === 'none' || canvasC.style.display === '') {
        canvasC.style.display = 'block';
        canvasC.style.opacity = 0; // Ensure it's invisible before the fade-in
        setTimeout(() => {
            canvasC.style.transition = 'opacity 0.3s'; // Smooth fade-in transition
            canvasC.style.opacity = 1; 
        }, 100); // Set to 0 to trigger transition immediately
    } else {
        canvasC.style.transition = 'opacity 0.3s'; // Smooth fade-out transition
        canvasC.style.opacity = 0; 
        setTimeout(() => {
            canvasC.style.display = 'none'; 
        }, 300); // Match with the fade-out duration
    }
});





playPauseContainer.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        play.style.display = 'none';  // Hide play button
        pause.style.display = 'flex'; // Show pause button
        scroll.style.visibility = 'visible'; // Show pause button
        playtext.style.display = 'none';
        canvasA.style.display = 'block';
        setTimeout(() => {
            canvasA.style.opacity = 1; 
        }, 200); // Use 30 milliseconds (no "ms" suffix needed here


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
};

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
};

zen.onclick = () => {
    const nav = document.querySelector('.nav');
    if (nav.style.opacity === '0') {
        zenModeOff();
    } else {
        zenModeOn();
    }
};
