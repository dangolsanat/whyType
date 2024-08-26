// Select elements
const sentenceDisplay = document.getElementById('sentence-display');
const targetSentenceElement = document.getElementById('target-sentence');
const bookDetails = document.getElementById('book-details');
const bookMenu = document.getElementById('book-menu'); // Modal or dropdown
const bookList = document.getElementById('book-list'); // List within the modal or dropdown
const backgroundBlur = document.getElementById('background-blur');

// Book URLs - to be fetched dynamically
let books = [];
let textFileUrl = localStorage.getItem('currentBook') || '';
let paragraphs = [];
let sentences = [];
let currentParagraphIndex = 0;
let currentSentenceIndex = 0;
let targetSentence = '';
let currentCharIndex = 0;
let userProgress = [];
let gamePaused = false;
let bookId = null; // Initialize bookId to null

// Function to fetch the list of books
async function fetchBooks() {
    console.log('Fetching list of books...');
    try {
        const response = await fetch('/books');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        books = await response.json();
        console.log('Books fetched successfully:', books);
        populateBookList();
    } catch (error) {
        console.error('Error fetching book list:', error);
    }
}

// Function to populate book list
function populateBookList() {
    console.log('Populating book list...');
    if (!bookList) {
        console.error('Book list element not found.');
        return;
    }
    bookList.innerHTML = books.map(book => `
        <li class="book-option" data-url="${book.text_url}" data-id="${book.id}">
            <img src="${book.image_url}" alt="${book.title}">
        </li>
    `).join('');
    console.log('Book list populated.');
}

// Function for selecting the book
function selectBook(url) {
    console.log(`Selecting book with URL: ${url}`);
    const title = document.getElementById('title');
    const author = document.getElementById('author');
    const selectedBook = books.find(book => book.text_url === url);
    bookId = selectedBook ? selectedBook.id : null; // Ensure bookId is set
    console.log(bookId);
    if (selectedBook) {
        title.textContent = selectedBook.title;
        author.textContent = `by ${selectedBook.author}`;
        textFileUrl = url;
        localStorage.setItem('currentBook', url); // Save book URL to localStorage
        userProgress = [];
        currentCharIndex = 0;
        loadTextFile(); // Load the text file
    } else {
        console.warn('Selected book not found.');
        title.textContent = 'Unknown Book';
        author.textContent = '';
    }
}

// Function to convert multiple paragraphs into a single large paragraph
async function consolidateParagraphs(url) {
    console.log(`Consolidating paragraphs from URL: ${url}`);
    try {
        const response = await fetch(url);
        const text = await response.text();
        return text.replace(/\n\s*\n/g, ' ').trim();
    } catch (error) {
        console.error('Error fetching or processing text file:', error);
        return '';
    }
}

// Function to normalize text
function normalizeText(text) {
    console.log('Normalizing text...');
    return text
        .replace(/’/g, "'")
        .replace(/“/g, '"')
        .replace(/—/g, '-')
        .replace(/  /g, ' ')
        .replace(/”/g, '"')
        .replace(/‘/g, "'");
}

// Function to load the text file
async function loadTextFile() {
    console.log(`Loading text file from URL: ${textFileUrl}`);
    try {
        const response = await fetch(textFileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        paragraphs = text.split('\n\n').filter(paragraph => paragraph.trim() !== '');
        console.log('Text file loaded and paragraphs split:', paragraphs);

        if (paragraphs.length > 0) {
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
        }

        await loadProgress();
    } catch (error) {
        console.error('Error loading text file:', error);
        targetSentenceElement.textContent = 'Error loading text file.';
    }
}

// Function to split paragraph into sentences
function splitIntoSentences(paragraph) {
    console.log('Splitting paragraph into sentences...');
    const sentenceRegex = /[^.!?]*[.!?]/g;
    sentences = normalizeText(paragraph.trim()).match(sentenceRegex) || [normalizeText(paragraph.trim())];
    console.log('Sentences split:', sentences);
}

// Function to initialize the game
function initializeGame() {
    console.log('Initializing game...');
    document.addEventListener('keydown', handleKeyPress);
}

// Function to handle key press events
function handleKeyPress(event) {
    if (gamePaused) return;

    console.log(`Handling key press: ${event.key}`);
    if (event.key.length === 1) {
        const key = event.key;
        const targetChar = targetSentence[currentCharIndex];

        if (currentCharIndex < targetSentence.length) {
            if (key === targetChar) {
                userProgress[currentCharIndex] = 'correct';
                currentCharIndex++;
            } else {
                userProgress[currentCharIndex] = 'incorrect';
            }

            saveProgress();
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
            userProgress[currentCharIndex] = null;
            saveProgress();
            updateDisplay();
        }
    }
}

// Function to update the display
function updateDisplay() {
    console.log('Updating display...');
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

// Function to save user's progress
async function saveProgress() {
    if (!bookId) {
        console.warn('Book ID is not set. Cannot save progress.');
        return;
    }

    const progressData = {
        user_id: userId, // Assuming userId is available in the global scope or needs to be set
        book_id: bookId,
        paragraph_index: currentParagraphIndex,
        sentence_index: currentSentenceIndex,
        char_index: currentCharIndex,
        user_progress: userProgress // Ensure this is serialized
    };

    console.log('Saving progress:', progressData);

    try {
        const response = await fetch('/save_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(progressData),
        });

        if (!response.ok) {
            throw new Error('Failed to save progress.');
        }

        console.log('Progress saved successfully.');
    } catch (error) {
        console.error('Server returned an error:', error.message);
    }
}





// Function to load user's progress
async function loadProgress() {
    if (!bookId) {
        console.warn('Book ID is not set. Cannot load progress.');
        return;
    }

    console.log('Loading progress for book ID:', bookId);

    try {
        const url = `/load_progress?book_id=${encodeURIComponent(bookId)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Loaded progress data:', data);

        if (data.length > 0) {
            const latestProgress = data
                .filter(p => p.paragraph_index === currentParagraphIndex)
                .sort((a, b) => b.sentence_index - a.sentence_index)[0];

            if (latestProgress) {
                currentParagraphIndex = latestProgress.paragraph_index || 0;
                currentSentenceIndex = latestProgress.sentence_index || 0;
                currentCharIndex = latestProgress.char_index || 0;

                try {
                    userProgress = latestProgress.user_progress ? latestProgress.user_progress : [];
                } catch (e) {
                    console.error('Error parsing user_progress:', e);
                    userProgress = [];
                }
            }
        }

        splitIntoSentences(paragraphs[currentParagraphIndex]);
        displaySentence(sentences[currentSentenceIndex]);
        initializeGame();

    } catch (error) {
        console.error('Error loading progress:', error);
    }
}





// Function to get the book ID from URL
function getBookIdFromUrl(url) {
    console.log(`Extracting book ID from URL: ${url}`);
    const book = books.find(b => b.text_url === url);
    return book ? book.id : null;
}

// Function to display the current sentence
function displaySentence(sentence) {
    console.log(`Displaying sentence: ${sentence}`);
    targetSentence = sentence || '';
    currentCharIndex = 0;
    updateDisplay();
}

// Function to clear progress
function clearProgress() {
    console.log('Clearing progress...');
    userProgress = [];
    currentParagraphIndex = 0;
    currentSentenceIndex = 0;
    currentCharIndex = 0;
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing...');
    const modal = document.getElementById('bookModal');
    const closeModalBtn = document.getElementsByClassName('close')[0];
    const content = document.querySelector('.main');
    const nav = document.querySelector('.nav');
    const footer = document.querySelector('.footer');
    const bookLogoBtn = document.getElementById("book-logo");

    function pauseGame() {
        console.log('Pausing game...');
        document.removeEventListener('keydown', handleKeyPress);
        gamePaused = true;
    }

    function resumeGame() {
        console.log('Resuming game...');
        document.addEventListener('keydown', handleKeyPress);
        gamePaused = false;
    }

    bookLogoBtn.onclick = () => {
        pauseGame();
        setTimeout(() => {
            modal.style.display = 'block';
            modal.classList.add('show');
            if (content && nav && footer) {
                content.classList.add('blur-background');
                nav.classList.add('blur-background');
                footer.classList.add('blur-background');
            }
        }, 300);
    };

    closeModalBtn.onclick = () => {
        console.log('Closing modal...');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (content && nav && footer) {
                content.classList.remove('blur-background');
                nav.classList.remove('blur-background');
                footer.classList.remove('blur-background');
            }
            resumeGame();
        }, 300);
    };

    bookList.addEventListener('click', event => {
        if (event.target.closest('.book-option')) {
            const url = event.target.closest('.book-option').dataset.url;
            console.log('Book option clicked, URL:', url);
            selectBook(url);
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                if (content && nav && footer) {
                    content.classList.remove('blur-background');
                    nav.classList.remove('blur-background');
                    footer.classList.remove('blur-background');
                }
                resumeGame();
            }, 300);
        }
    });

    fetchBooks(); // Fetch the list of books
    initializeGame(); // Initialize the game mechanics
});
