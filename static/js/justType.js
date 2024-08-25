const sentenceDisplay = document.getElementById('sentence-display');
const targetSentenceElement = document.getElementById('target-sentence');
const textFileUrl = 'static/assets/don.txt'; // Update this to your file path

let paragraphs = [];
let sentences = [];
let currentParagraphIndex = 0;
let currentSentenceIndex = 0;
let targetSentence = '';
let currentCharIndex = 0;
let userProgress = [];

// Function to normalize special characters
function normalizeText(text) {
    return text
        .replace(/’/g, "'")
        .replace(/“/g, '"')
        .replace(/”/g, '"');
}

// Load the text file content
fetch(textFileUrl)
    .then(response => response.text())
    .then(text => {
        paragraphs = text.split('\n\n');
        loadProgress(); // Load user's progress from local storage
    })
    .catch(error => {
        console.error('Error loading text file:', error);
        targetSentenceElement.textContent = 'Error loading text file.';
    });

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

    const progress = {
        paragraphIndex: currentParagraphIndex,
        sentenceIndex: currentSentenceIndex,
        charIndex: currentCharIndex,
        userProgress: userProgress
    };

    localStorage.setItem('typingGameProgress', JSON.stringify(progress));
}

function loadProgress() {
    console.log('Loading progress from local storage');
    const savedProgress = localStorage.getItem('typingGameProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        currentParagraphIndex = progress.paragraphIndex || 0;
        currentSentenceIndex = progress.sentenceIndex || 0;
        currentCharIndex = progress.charIndex || 0;
        userProgress = progress.userProgress || [];
        splitIntoSentences(paragraphs[currentParagraphIndex]);
        displaySentence(sentences[currentSentenceIndex]);
        initializeGame();
    } else {
        console.log('No progress data found in local storage');
        splitIntoSentences(paragraphs[currentParagraphIndex]);
        displaySentence(sentences[currentSentenceIndex]);
        initializeGame();
    }
}

// Function to clear progress after completion
function clearProgress() {
    localStorage.removeItem('typingGameProgress');
}

