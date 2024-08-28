// Select elements
const sentenceDisplay = document.getElementById('sentence-display');
const targetSentenceElement = document.getElementById('target-sentence');
const bookDetails = document.getElementById('book-details');
const bookMenu = document.getElementById('book-menu');  
const bookList = document.getElementById('book-list');  
const backgroundBlur = document.getElementById('background-blur');




// Book URLs
const nanking = consolidateParagraphs('static/assets/nanking.txt');
const don = consolidateParagraphs('static/assets/don.txt');
const ninety = consolidateParagraphs('static/assets/1984.txt');
const satre = consolidateParagraphs('static/assets/satre.txt');
const foucault = consolidateParagraphs('static/assets/foucault.txt');


let textFileUrl = localStorage.getItem('currentBook') || don;

let paragraphs = [];
let sentences = [];
let currentParagraphIndex = 0;
let currentSentenceIndex = 0;
let targetSentence = '';
let currentCharIndex = 0;
let userProgress = [];
let gamePaused = false;

// Function for selecting the book
function selectBook(url) {
    const title = document.getElementById('title');
    const author = document.getElementById('author');

    console.log("Text file URL:", url);
    console.log("Available books:", don, nanking, ninety, satre, foucault);

    switch (url) {
        case don:
            title.textContent = 'Don Quixote';
            author.textContent = 'by Miguel de Cervantes';
            break;
        case nanking:
            title.textContent = 'The Rape of Nanking';
            author.textContent = 'by Iris Chang';
            break;
        case ninety:
            title.textContent = '1984';
            author.textContent = 'by George Orwell';
            break;
        case satre:
            title.textContent = 'Existentialism Is a Humanism';
            author.textContent = 'by Jean-Paul Sartre';
            break;
        case foucault:
            title.textContent = ' Discipline and Punush ';
            author.textContent = 'by Michel Foucault ';
            break;
        default:
            title.textContent = 'Unknown Book';
            author.textContent = '';
            break;
    }

    textFileUrl = url; // Store URL globally
    
    console.log("Selected title:", title.textContent);
    console.log("Selected author:", author.textContent);
    currentCharIndex = 0;
    loadTextFile().then(() => {
        loadProgress(); // Load progress after the text file is loaded
    });}


// Function to convert multiple paragraphs into a single large paragraph
async function consolidateParagraphs(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();

        // Replace paragraph breaks with a single space to merge into one paragraph
        const singleParagraph = text.replace(/\n\s*\n/g, ' ').trim();

        console.log('Consolidated text:', singleParagraph);
        return singleParagraph;
    } catch (error) {
        console.error('Error fetching or processing text file:', error);
        return '';
    }
}




// Function to normalize text
function normalizeText(text) {
    return text
        .replace(/’/g, "'")
        .replace(/“/g, '"')
        .replace(/—/g, '-')
        .replace(/  /g, ' ')
        .replace(/”/g, '"')
        .replace(/‘/g, "'")
}

// Function to load the text file
async function loadTextFile() {
    console.log('Loading text file from:', textFileUrl);
    
    try {
        const response = await fetch(textFileUrl);
        const text = await response.text();
        paragraphs = text.split('\n\n');
        console.log('Paragraphs loaded:', paragraphs);
        await loadProgress(); // Ensure progress is loaded after paragraphs are loaded
        splitIntoSentences(paragraphs[currentParagraphIndex]); // Split sentences for the current paragraph
        displaySentence(sentences[currentSentenceIndex]); // Display the current sentence
        console.log("loadtextfile-------->",sentences[currentSentenceIndex]); 
    } catch (error) {
        console.error('Error loading text file:', error);
        targetSentenceElement.textContent = 'Error loading text file.';
    }
}

// Function to split paragraph into sentences
function splitIntoSentences(paragraph) {
    const sentenceRegex = /[^.!?]*[.!?]/g; // Regex to split by sentences
    sentences = normalizeText(paragraph.trim()).match(sentenceRegex) || [normalizeText(paragraph.trim())];
    console.log('Sentences:', sentences); // Log sentences to verify
}

// Function to initialize the game
function initializeGame() {
    document.addEventListener('keydown', handleKeyPress);
    console.log('Game initialized.');
}

// Function to handle key press events
function handleKeyPress(event) {
    if (gamePaused) return; // Skip key press handling if the game is paused

    console.log('Key pressed:', event.key);

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

            saveProgress(); // Save user's progress
            updateDisplay();

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
        if (currentCharIndex > 0) {
            currentCharIndex--;
            userProgress[currentCharIndex] = null; // Clear the status of the character
            saveProgress(); // Save user's progress
            updateDisplay();
        }
    }
}

// Function to update the display

function updateDisplay() {
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
    
    console.log('Updating display');
    console.log('Target sentence:', targetSentence);
    console.log('User progress:', userProgress);
    sentenceDisplay.innerHTML = displayText;
}

// Function to save user's progress
function saveProgress() {
    console.log('Saving progress:', {
        paragraphIndex: currentParagraphIndex,
        sentenceIndex: currentSentenceIndex,
        charIndex: currentCharIndex,
        userProgress: userProgress,
        book: textFileUrl
    });

    fetch('/save_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token') // Ensure CSRF protection if required
        },
        body: JSON.stringify({
            user_id: userId,
            book: textFileUrl, // Make sure this matches the backend field name
            paragraphIndex: currentParagraphIndex,
            sentenceIndex: currentSentenceIndex,
            charIndex: currentCharIndex,
            userProgress: userProgress
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Server returned an error:', data.error);
        } else {
            console.log('Progress saved:', data);
        }
    })
    .catch(error => {
        console.error('Error saving progress:', error);
    });
}

// Function to load user's progress
async function loadProgress() {
    console.log('Loading progress for book:', textFileUrl);

    try {
        const response = await fetch(`/load_progress?book=${encodeURIComponent(textFileUrl)}`);

        // Check if the response is not JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server returned an error:', errorText);
            throw new Error('Error loading progress');
        }

        const data = await response.json();
        console.log('Progress data received:', data);

        if (data && data.length > 0) {
            const latestProgress = data
                .filter(p => p.paragraphIndex === currentParagraphIndex)
                .sort((a, b) => b.sentenceIndex - a.sentenceIndex)[0];

            if (latestProgress) {
                currentParagraphIndex = latestProgress.paragraphIndex || 0;
                currentSentenceIndex = latestProgress?.sentenceIndex ?? 0;
                currentCharIndex = latestProgress.charIndex || 0;
                userProgress = latestProgress.userProgress || [];
            }
        } else {
            console.log('No progress data found');
            currentParagraphIndex = 0;
            currentSentenceIndex = 0;
            currentCharIndex = 0;
            userProgress=[];
        }

        // No need to call splitIntoSentences again if it's done in loadTextFile
        displaySentence(sentences[currentSentenceIndex]);
        console.log("from load progress ---------->", sentences[currentSentenceIndex])
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Function to display the sentence
function displaySentence(sentence) {
    console.log('Displaying sentence:', sentence);
    if (!sentence) {
        console.error('No sentence provided to display.');
        targetSentenceElement.textContent = 'No sentence available.';
        return;
    }
    targetSentence = sentence.trim();
    userProgress = new Array(targetSentence.length).fill(null);
    currentCharIndex = 0; // Reset the character index
    updateDisplay();
}

// Function to clear progress (if needed)
function clearProgress() {
    // Implement functionality if needed
}

// Function to get a cookie value
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
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
        })
        .catch(error => console.error('Error loading text file:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bookModal');
    const closeModalBtn = document.getElementsByClassName('close')[0];
    const content = document.querySelector('.main');
    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer');
    const bookLogoBtn = document.getElementById("book-logo");

    // Pause the game
    function pauseGame() {
        document.removeEventListener('keydown', handleKeyPress);
        gamePaused = true;
        console.log('Game paused');
    }

    // Resume the game
    function resumeGame() {
        document.addEventListener('keydown', handleKeyPress);
        gamePaused = false;
    }

    // Show the modal
    bookLogoBtn.onclick = () => {
        pauseGame();
        setTimeout(() => {
            modal.style.display = 'block';
            modal.classList.add('show');

            if (content && nav && footer) {
                content.classList.add('blur-background'); // Apply blur effect
                nav.classList.add('blur-background'); 
                footer.classList.add('blur-background'); 
            }
        }, 60);  // Slight delay to allow CSS transition
    };

    // Handle book selection
    bookList.addEventListener('click', (event) => {
        const bookOption = event.target.closest('.book-option');
        if (bookOption) {
            const selectedUrl = bookOption.getAttribute('data-url');
            console.log("Clicked book URL:", selectedUrl);
            localStorage.setItem('currentBook', selectedUrl); // Save to localStorage
            selectBook(selectedUrl); // Update the book selection
            console.log('Book selected:', selectedUrl);
            hideBookMenu();
        }
        resumeGame();
    });

    // Hide the book menu
    function hideBookMenu() {
        content.classList.remove('blur-background');  
        nav.classList.remove('blur-background');  
        footer.classList.remove('blur-background');  
        modal.classList.remove('show');
        modal.style.display = 'none';
    }

    // Close the modal on 'Escape' key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            hideBookMenu();
            resumeGame(); // Re-initialize the game to resume listening for keypresses
        }
    });

    // Close the modal on close button click
    closeModalBtn.onclick = () => {
        setTimeout(() => {
            hideBookMenu();
        }, 60);
        resumeGame(); 
    };

    // Close the modal if clicking outside of it
    window.onclick = (event) => {
        if (event.target === modal) {
            setTimeout(() => {
                hideBookMenu(); 
            }, 60);
            resumeGame(); 
        }
    };

    resumeGame(); // Initialize the game
    initialize(); // Ensure the game initializes with the correct book
});


