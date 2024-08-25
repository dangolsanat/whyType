
/**
 * Fetches the text file and calculates the total number of characters.
 * @returns {Promise<number>} The total number of characters in the text file.
 */
function getTotalCharacters() {
    return fetch(textFileUrl)
        .then(response => response.text())
        .then(text => {
            const totalCharacters = text.length;
            console.log(`Total number of characters: ${totalCharacters}`);
            return totalCharacters;
        })
        .catch(error => {
            console.error('Error fetching the text file:', error);
            return 0; // Return 0 if there's an error
        });
}

// Example usage
getTotalCharacters().then(totalChars => {
    console.log(`Total characters in don.txt: ${totalChars}`);
});


