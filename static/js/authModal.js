document.addEventListener('DOMContentLoaded', () => {
    const modal_a = document.getElementById('authModal');
    const btn = document.getElementById('login-signup-btn');
    const span = document.getElementsByClassName('close')[0];
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const content = document.querySelector('.main');



    // Function to pause the game by removing the key press listener
    function pauseGame() {
        document.removeEventListener('keydown', handleKeyPress);
    }

    // Function to resume the game by adding the key press listener back
    function resumeGame() {
        document.addEventListener('keydown', handleKeyPress);
    }

    // Initialize the game and add the key press listener
    function initializeGame() {
        document.addEventListener('keydown', handleKeyPress);
    }

    // Show the modal
    btn.onclick = () => {
        modal_a.style.display = 'block';
        setTimeout(() => {
            modal_a.classList.add('show');
            if (content) {
                
                content.classList.add('blur-background'); // Apply blur effect
            }
        }, 10);  // Slight delay to allow CSS transition
        pauseGame(); 
    };

    // Close the modal
    span.onclick = () => {
        modal_a.classList.remove('show');
        setTimeout(() => {
            modal_a.style.display = 'none';
            if (content) {
                content.classList.remove('blur-background');  
            }
        }, 300); // Adjust timing to match the CSS transition duration
        resumeGame(); 
    };

    // Close the modal if the user clicks outside of it
    window.onclick = (event) => {
        if (event.target === modal_a) {
            modal_a.classList.remove('show');
            setTimeout(() => {
                modal_a.style.display = 'none';
                if (content) {
                    content.classList.remove('blur-background'); // Remove blur effect
                }
            }, 300); // Adjust timing to match the CSS transition duration
            resumeGame(); 
        }
    };

    // Switch to Signup form
    switchToSignup.onclick = () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        loginError.textContent = '';
        signupError.textContent = '';
    };

    // Switch to Login form
    switchToLogin.onclick = () => {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        loginError.textContent = '';
        signupError.textContent = '';
    };

    // Handle Login form submission
    document.getElementById('login').onsubmit = (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrf_token') // Ensure CSRF protection if required
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/dashboard'; // Redirect to dashboard after login
            } else {
                loginError.textContent = data.error;
            }
        })
        .catch(error => console.error('Error:', error));
    };

    // Handle Signup form submission
    document.getElementById('signup').onsubmit = (event) => {
        event.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrf_token') // Ensure CSRF protection if required
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/dashboard'; // Redirect to dashboard after signup
            } else {
                signupError.textContent = data.error;
            }
        })
        .catch(error => console.error('Error:', error));
    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal_a.style.display === 'block') {
            modal_a.style.display = 'none';
            modal_a.classList.remove('show');
            content.classList.remove('blur-background');           
    
            resumeGame(); // Re-initialize the game to resume listening for keypresses
        }
    });

    initializeGame(); // Initialize the game
});
