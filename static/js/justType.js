const sentenceDisplay = document.getElementById('sentence-display');
const targetSentenceElement = document.getElementById('target-sentence');
const bookDetails = document.getElementById('book-details');
const bookMenu = document.getElementById('book-menu');  
const bookList = document.getElementById('book-list');  
const backgroundBlur = document.getElementById('background-blur');

let textFileUrl = 'static/assets/don.txt'; // Update this to your file path


let nanking, don, ninety, satre, foucault;



let paragraphs = [];
let sentences = [];
let currentParagraphIndex = 0;
let currentSentenceIndex = 0;
let targetSentence = '';
let currentCharIndex = 0;
let userProgress = [];
let gamePaused = false;


// Event listener for the book logo
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bookModal');
    const closeModalBtn = document.getElementsByClassName('close')[0];
    const content = document.querySelector('.main');
    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer');
    const bookLogoBtn = document.getElementById("book-logo");

    function pauseGame() {
        document.removeEventListener('keydown', handleKeyPress);
        gamePaused = true;
        console.log('Game paused');
    }

    function resumeGame() {
        document.addEventListener('keydown', handleKeyPress);
        gamePaused = false;
    }

    function showModal() {
        pauseGame();
        modal.style.display = 'block';
        modal.classList.add('show');
        content.classList.add('blur-background');
        nav.classList.add('blur-background');
        footer.classList.add('blur-background');
    }

    function hideModal() {
        modal.classList.remove('show');
        modal.style.display = 'none';
        content.classList.remove('blur-background');
        nav.classList.remove('blur-background');
        footer.classList.remove('blur-background');
        resumeGame();
    }

    bookLogoBtn.onclick = showModal;

    bookList.addEventListener('click', (event) => {
        const bookOption = event.target.closest('.book-option');
        if (bookOption) {
            const selectedUrl = bookOption.getAttribute('data-url');
            localStorage.setItem('currentBook', selectedUrl);
            selectBook(selectedUrl);
            hideModal();
        }
    });

    // Close the modal on 'Escape' key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape'){
            hideModal();
        }
    });


    closeModalBtn.onclick = hideModal;
    window.onclick = (event) => {
        if (event.target === modal) hideModal();
    };


    initializeGameData(); // Load the game data when the DOM is ready
});


// Function for selecting the book
function selectBook(url) {
    const title = document.getElementById('title');
    const author = document.getElementById('author');

    textFileUrl = url; // Store URL globally

    // currentCharIndex = 0;


    // Compare using the URL or use specific identifiers
    if (url === don) {
        title.textContent = 'Don Quixote';
        author.textContent = 'by Miguel de Cervantes';
    } else if (url === nanking) {
        title.textContent = 'The Rape of Nanking';
        author.textContent = 'by Iris Chang';
    } else if (url === ninety) {
        title.textContent = '1984';
        author.textContent = 'by George Orwell';
    } else if (url === satre) {
        title.textContent = 'Existentialism Is a Humanism';
        author.textContent = 'by Jean-Paul Sartre';
    } else if (url === foucault) {
        title.textContent = 'Discipline and Punish';
        author.textContent = 'by Michel Foucault';
    } else {
        title.textContent = 'Unknown Book';
        author.textContent = '';
    }

        // Clear current progress data
        currentParagraphIndex = 0;
        currentSentenceIndex = 0;
        currentCharIndex = 0;
        userProgress = [];

        
    loadTextFile().then(() => {
        loadProgress(); // Load progress after the text file is loaded
    });

}




document.addEventListener('DOMContentLoaded', async () => {
    try {
        const nanking = await consolidateParagraphs('static/assets/nanking.txt');
        const don = await consolidateParagraphs('static/assets/don.txt');
        const ninety = await consolidateParagraphs('static/assets/1984.txt');
        const satre = await consolidateParagraphs('static/assets/satre.txt');
        const foucault = await consolidateParagraphs('static/assets/foucault.txt');
        
        // Now that the data is loaded, you can initialize the game or any other functionality
        initializeGame();

    } catch (error) {
        console.error('Error initializing game data:', error);
    }
});



async function consolidateParagraphs(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const singleParagraph = text.replace(/\n\s*\n/g, ' ').trim();
        return singleParagraph;
    } catch (error) {
        console.error('Error fetching or processing text file:', error);
        return '';
    }
}

// Function to initialize game data
async function initializeGameData() {
    try {
        nanking = 'static/assets/nanking.txt'; // Set the URL directly
        don = 'static/assets/don.txt';
        ninety = 'static/assets/1984.txt';
        satre = 'static/assets/satre.txt';
        foucault = 'static/assets/foucault.txt';

        // Ensure the correct book is selected based on stored data or default
        const currentBook = localStorage.getItem('currentBook') || don;
        selectBook(currentBook);

        // initializeGame(); // Initialize game functionality
    } catch (error) {
        console.error('Error initializing game data:', error);
    }
}


// Function to normalize special characters
function normalizeText(text) {
    return text
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/—/g, '-')
    .replace(/  /g, ' ')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
}


// Load the text file content
fetch(textFileUrl)
    .then(response => response.text())
    .then(text => {
        paragraphs = text.split('\n\n');
        loadProgress(textFileUrl); // Load user's progress for this specific book
    })
    .catch(error => {
        console.error('Error loading text file:', error);
        targetSentenceElement.textContent = 'Error loading text file.';
    });


async function loadTextFile() {
    try {
        const response = await fetch(textFileUrl);
        const text = await response.text();
        paragraphs = text.split('\n\n');
        splitIntoSentences(paragraphs[currentParagraphIndex]);
    } catch (error) {
        console.error('Error loading text file:', error);
        targetSentenceElement.textContent = 'Error loading text file.';
    }
}

function splitIntoSentences(paragraph) {
    const sentenceRegex = /[^.!?]*[.!?]/g; // Regex to split by sentences
    sentences = normalizeText(paragraph.trim()).match(sentenceRegex) || [normalizeText(paragraph.trim())];
}

function displaySentence(sentence) {
    targetSentence = sentence.trim();
    targetSentenceElement.textContent = 'Type the sentence below:';
    userProgress = new Array(targetSentence.length).fill(null);
    currentCharIndex = 0; // Reset the character index
    updateDisplay();
}

function initializeGame() {
    document.addEventListener('keydown', handleKeyPress);
    console.log('Game initialized.');
}

function handleKeyPress(event) {
    console.log('Key pressed:', event.key);

    // Only consider printable characters
    if (event.key.length === 1) {
        const key = event.key;
        const targetChar = targetSentence[currentCharIndex];

        console.log('Target character:', targetChar);
        console.log('Current character index:', currentCharIndex);

        if (currentCharIndex < targetSentence.length) {
            if (key === targetChar) {
                userProgress[currentCharIndex] = 'correct';
                currentCharIndex++;
            } else {
                userProgress[currentCharIndex] = 'incorrect';
            }

            saveProgress(); // Save user's progress to local storage
            updateDisplay();

            // Check for sentence completion
            if (currentCharIndex === targetSentence.length && userProgress.every(status => status === 'correct')) {
                currentSentenceIndex++;
                
                if (currentSentenceIndex < sentences.length) {
                    displaySentence(sentences[currentSentenceIndex]);
                } else {
                    alert('Congratulations! You typed the paragraph correctly.');
                    currentParagraphIndex++;
                    
                    if (currentParagraphIndex < paragraphs.length) {
                        currentSentenceIndex = 0;
                        splitIntoSentences(paragraphs[currentParagraphIndex]);
                        displaySentence(sentences[currentSentenceIndex]);
                    } else {
                        targetSentenceElement.textContent = 'You have completed all paragraphs!';
                        sentenceDisplay.innerHTML = '';
                        clearProgress();
                    }
                }
            }
        }
    } else if (event.key === 'Backspace') {
        // Handle backspace key
        if (currentCharIndex > 0) {
            currentCharIndex--;
            userProgress[currentCharIndex] = null; // Clear the status of the character
            saveProgress(); // Save user's progress to local storage
            updateDisplay();
        }
    }
}

function updateDisplay() {
    console.log('Updating display');

    if (!targetSentence || !userProgress) {
        console.error('Target sentence or user progress is undefined.');
        return;
    }

    const displayText = targetSentence.split('').map((char, i) => {
        if (userProgress[i] === 'correct') {
            return `<span class="correct">${char}</span>`;
        } else if (userProgress[i] === 'incorrect' && i === currentCharIndex) {
            return `<span class="incorrect">${char}</span>`;
        } else if (i === currentCharIndex) {
            return `<span class="current">${char}</span>`;
        } else {
            return `<span>${char}</span>`;
        }
    }).join('');

    sentenceDisplay.innerHTML = displayText;
}

function saveProgress() {
    console.log('Saving progress to local storage:', {
        paragraphIndex: currentParagraphIndex,
        sentenceIndex: currentSentenceIndex,
        charIndex: currentCharIndex,
        userProgress: userProgress
    });

    const currentBookUrl = localStorage.getItem('currentBook');
    if (currentBookUrl) {
        const progress = {
            paragraphIndex: currentParagraphIndex,
            sentenceIndex: currentSentenceIndex,
            charIndex: currentCharIndex,
            userProgress: userProgress
        };

        localStorage.setItem(`typingGameProgress_${encodeURIComponent(currentBookUrl)}`, JSON.stringify(progress));
    } else {
        console.error('No current book URL found to save progress.');
    }
}



function loadProgress() {
    console.log('Loading progress from local storage');
    const currentBookUrl = localStorage.getItem('currentBook'); // Get the currently selected book URL
    if (currentBookUrl) {
        const savedProgress = localStorage.getItem(`typingGameProgress_${encodeURIComponent(currentBookUrl)}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            currentParagraphIndex = progress.paragraphIndex || 0;
            currentSentenceIndex = progress.sentenceIndex || 0;
            currentCharIndex = progress.charIndex || 0;
            userProgress = progress.userProgress || [];
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
        } else {
            console.log('No progress data found for the current book.');
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
        }
        initializeGame(); // Initialize game functionality
    } else {
        console.error('No current book URL found.');
        currentParagraphIndex = 0;
        currentSentenceIndex = 0;
        currentCharIndex = 0;
        userProgress = [];
        splitIntoSentences(paragraphs[currentParagraphIndex]);
        displaySentence(sentences[currentSentenceIndex]);
        initializeGame(); // Initialize game functionality
    }
}

// Function to clear progress after completion
function clearProgress() {
    localStorage.removeItem(`typingGameProgress_${url}`);
    console.log('Progress cleared for:', url);
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Initialize the game
function initialize() {
    selectBook(textFileUrl); // Ensure the correct book is selected

    // Fetch the text file
    fetch(textFileUrl)
        .then(response => response.text())
        .then(text => {
            paragraphs = text.split('\n\n');
            loadProgress();
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
        })
        .catch(error => console.error('Error loading text file:', error));
}






//book select modal


