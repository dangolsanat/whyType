document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bookModal');
    const span = document.getElementsByClassName('close')[0];
    const content = document.querySelector('.main');
    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer');
    const btn = document.getElementById("book-logo");
    



    // Function to pause the game by removing the key press listener
    function pauseGame() {
        document.removeEventListener('keydown', handleKeyPress);
        console.log('Game paused');

    }

    // Function to resume the game by adding the key press listener back
    function resumeGame() {
        document.addEventListener('keydown', handleKeyPress);
    }


    // Show the modal
    btn.onclick = () => {
        pauseGame();
        setTimeout(() => {
            modal.style.display = 'block';
            modal.classList.add('show');

            if (content && nav  && footer) {
                content.classList.add('blur-background'); // Apply blur effect
                nav.classList.add('blur-background'); 
                footer.classList.add('blur-background'); 
            }
        }, 60);  // Slight delay to allow CSS transition
    };



    // document.getElementById('book-list').addEventListener('click', (event) => {
    //     const bookOption = event.target.closest('.book-option');
    //     if (bookOption) {
    //         const textFileUrl = bookOption.getAttribute('data-url');
    //         console.log("Clicked book URL:", textFileUrl);
    //         localStorage.setItem('currentBook', textFileUrl); // Save to localStorage
    //         selectBook(textFileUrl);
    //         loadTextFile(); // Ensure sentences are loaded
    //         modal.classList.remove('show'); // Hide the blur effect
    //         console.log('Book selected!');
    //     } else {
    //         console.log('Clicked outside .book-option.');
    //     }
    // });
    

    // Function to handle book selection and display the first sentence
    document.getElementById('book-list').addEventListener('click', (event) => {
        const bookOption = event.target.closest('.book-option');
        if (bookOption) {
            const textFileUrl = bookOption.getAttribute('data-url');
            console.log("Clicked book URL:", textFileUrl);
            localStorage.setItem('currentBook', textFileUrl); // Save to localStorage
            selectBook(textFileUrl); // Update the book selection
            console.log('Book selected!');
        }
        loadTextFile()
    });

function hideBookMenu() {
    content.classList.remove('blur-background');  
    nav.classList.remove('blur-background');  
    footer.classList.remove('blur-background');  
    modal.classList.remove('show');
    modal.style.display = 'none';
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        modal.classList.remove('show');

        if (content && nav && footer) {
            content.classList.remove('blur-background'); // Remove blur effect
            nav.classList.remove('blur-background');
            footer.classList.remove('blur-background');
        }

        resumeGame(); // Re-initialize the game to resume listening for keypresses
    }
});

    // Close the modal
    span.onclick = () => {
        setTimeout(()=> {
            hideBookMenu();

        }, 60
        );
        resumeGame(); 
    };



    // Close the modal if the user clicks outside of it
    window.onclick = (event) => {
        if (event.target === modal) {
            setTimeout(()=>{
                hideBookMenu(); 
            },60);
            resumeGame(); 
        }
    };


    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    resumeGame(); // Initialize the game
});
