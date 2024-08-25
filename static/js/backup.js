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
        loadProgress(); // Load user's progress
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
    if (!sentence) {
        console.error('No sentence provided to display.');
        return;
    }
    
    targetSentence = sentence.trim();
    targetSentenceElement.textContent = 'Type the sentence below:';
    userProgress = new Array(targetSentence.length).fill(null);
    currentCharIndex = 0; // Reset current character index
    updateDisplay();
}

function initializeGame() {
    document.addEventListener('keydown', handleKeyPress);
    console.log('Game initialized.');
}

function handleKeyPress(event) {
    console.log('Key pressed:', event.key);

    if (event.key.length === 1) {
        const key = event.key;
        const targetChar = targetSentence[currentCharIndex];

        if (targetChar === undefined) {
            console.error('No target character found for current index.');
            return;
        }

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

            // Check for sentence completion
            if (currentCharIndex === targetSentence.length) {
                if (userProgress.every(status => status === 'correct')) {
                    currentSentenceIndex++;
                    
                    if (currentSentenceIndex < sentences.length) {
                        displaySentence(sentences[currentSentenceIndex]);
                    } else {
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

function updateDisplay() {
    console.log('Updating display');

    if (!targetSentence || !userProgress) {
        console.error('Target sentence or user progress is not defined.');
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
    console.log('Saving progress:', {
        paragraphIndex: currentParagraphIndex,
        sentenceIndex: currentSentenceIndex,
        charIndex: currentCharIndex,
        userProgress: userProgress
    });

    fetch('/save_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token') // Ensure CSRF protection if required
        },
        body: JSON.stringify({
            paragraphIndex: currentParagraphIndex,
            sentenceIndex: currentSentenceIndex,
            charIndex: currentCharIndex,
            userProgress: userProgress
        })
    })
    .then(response => response.json())
    .then(data => console.log('Progress saved:', data))
    .catch(error => console.error('Error saving progress:', error));
}

function loadProgress() {
    console.log('Loading progress');
    fetch('/load_progress')
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data) && data.length > 0) {
            const latestProgress = data.find(p => p.paragraphIndex === currentParagraphIndex && p.sentenceIndex === currentSentenceIndex);
            if (latestProgress) {
                currentCharIndex = latestProgress.charIndex || 0;
                userProgress = latestProgress.userProgress || [];
                splitIntoSentences(paragraphs[currentParagraphIndex]);
                displaySentence(sentences[currentSentenceIndex]);
                initializeGame();
            } else {
                splitIntoSentences(paragraphs[currentParagraphIndex]);
                displaySentence(sentences[currentSentenceIndex]);
                initializeGame();
            }
        } else {
            splitIntoSentences(paragraphs[currentParagraphIndex]);
            displaySentence(sentences[currentSentenceIndex]);
            initializeGame();
        }
    })
    .catch(error => console.error('Error loading progress:', error));
}

// Function to clear progress after completion
function clearProgress() {
    // Function to clear progress from the server if needed
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
