document.addEventListener('DOMContentLoaded', function() {
    const wordContainer = document.getElementById('word-container');
    const chaptersSelect = document.getElementById('chapters-select');
    const versesSelect = document.getElementById('verses-select');
    const checkButton = document.getElementById('check-btn');
    const nextButton = document.getElementById('next-btn');
    const remainingQuestionsDisplay = document.getElementById('remaining-questions');
    const correctQuestionsDisplay = document.getElementById('correct-questions');
    const incorrectQuestionsDisplay = document.getElementById('incorrect-questions');
    const chapterVerses = {
        '16': 21,
        '17': 18,
        '18': 24,
        '19': 21,
        '20': 15,
        '21': 27,
        '22': 21,
    };

    let randomIndex = 0;
    let words = [];
    let correctQuestions = [];
    let incorrectQuestions = [];
    let chapterInput = '';
    let verseInput = '';

    // Function to set a session cookie
    function setCookie(name, value) {
        document.cookie = `${name}=${value}; path=/`;
    }

    // Function to read a session cookie
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (let i of cookies.length) {
            const cookie = cookies[i].split('=');
            if (cookie[0] === name) {
                return cookie[1];
            }
        }
        return null;
    }
    

    function populateChaptersDropdown() {
        for (let i = 16; i <= 22; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Chapter ${i}`;
            chaptersSelect.appendChild(option);
        }
    }

    function populateVersesDropdown(selectedChapter) {
        const numVerses = getNumberOfVerses(selectedChapter);
        versesSelect.innerHTML = '';
        for (let i = 1; i <= numVerses; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Verse ${i}`;
            versesSelect.appendChild(option);
        }
    }

    function getNumberOfVerses(selectedChapter) {
        return chapterVerses[selectedChapter] || 0;
    }

    function displayWord() {
        if (correctQuestions.length === words.length) {
            // All words have been correctly answered
            wordContainer.innerHTML = `<div>Congratulations! You have answered all of the words.</div>`;
        } else {
            // There are still words left to display
            let remainingWords = words.filter(word => !correctQuestions.includes(word));
            randomIndex = Math.floor(Math.random() * remainingWords.length);
            const word = remainingWords[randomIndex];
            const capitalizedWord = capitalizeFirstLetter(word.word.toLowerCase());
            wordContainer.innerHTML = `
                <div id="word">Word: ${capitalizedWord}</div>
            `;
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateScoreboard() {
        const totalQuestions = words.length;
        const unansweredQuestions = totalQuestions - correctQuestions.length - incorrectQuestions.length;
        correctQuestionsDisplay.textContent = correctQuestions.length;
        incorrectQuestionsDisplay.textContent = incorrectQuestions.length;
        remainingQuestionsDisplay.textContent = unansweredQuestions;
    }

    function selectChapter(chapter) {
        const selectedOption = chaptersSelect.querySelector(`option[value="${chapter}"]`);
        if (selectedOption) {
            chaptersSelect.value = chapter;
            populateVersesDropdown(chapter);
            versesSelect.focus();
        }
    }

    chaptersSelect.addEventListener('change', function() {
        populateVersesDropdown(chaptersSelect.value);
    });

    checkButton.addEventListener('click', function() {
        // Disable the check button to prevent multiple clicks
        checkButton.disabled = true;
    
        const correctReference = words[randomIndex].reference;
        const selectedChapter = chaptersSelect.value;
        const selectedVerse = versesSelect.value;
        const [chapter, verse] = correctReference.match(/\d+/g).map(Number);
    
        let resultHTML = '';
    
        if (selectedChapter == chapter && selectedVerse == verse) {
            resultHTML = '<span style="color: green;">Correct!</span>';
            correctQuestions.push(randomIndex);
    
            // Remove index from incorrectQuestions if it exists
            const indexToRemove = incorrectQuestions.indexOf(randomIndex);
            if (indexToRemove !== -1) {
                incorrectQuestions.splice(indexToRemove, 1);
            }
        } else {
            resultHTML = `
                <span style="color: red;">Incorrect. Correct reference is: ${correctReference}</span><br>
                <span>Quote: ${words[randomIndex].quote}</span>
            `;
            incorrectQuestions.push(randomIndex);
        }
    
        // Display result below the word
        updateScoreboard();
        wordContainer.innerHTML += `<div>${resultHTML}</div>`;
        nextButton.focus(); // Shift focus to Next button after checking

        // Store progress in session cookie
        setCookie('progress', JSON.stringify({
            correct: correctQuestions,
            incorrect: incorrectQuestions
        }));
    });
    
    nextButton.addEventListener('click', function() {
        // Re-enable the check button when moving to the next word
        checkButton.disabled = false;
    
        if (correctQuestions.length === words.length) {
            alert('All words have been answered correctly!');
            return;
        }
        displayWord();
        chaptersSelect.focus(); // Shift focus to Chapters dropdown after clicking Next

        // Store progress in session cookie
        setCookie('progress', JSON.stringify({
            correct: correctQuestions,
            incorrect: incorrectQuestions
        }));
    });

    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Fetched data:', data);
        if (Array.isArray(data.words)) {
            words = data.words;
            console.log('Words:', words);
            displayWord();
            updateScoreboard(); // Call updateScoreboard after the words array is populated

            // Check if progress is stored in session cookie
            const storedProgress = getCookie('progress');
            if (storedProgress) {
                const { correct, incorrect } = JSON.parse(storedProgress);
                correctQuestions = correct;
                incorrectQuestions = incorrect;
                updateScoreboard();
            }
        } else {
            console.error('Invalid data format: "words" is not an array');
        }
    })
    .catch(error => console.error('Error fetching data:', error));

    // Keyboard navigation
    chaptersSelect.addEventListener('keydown', function(event) {
        if (KeyboardEvent.code === 9) { // Tab key
            versesSelect.focus();
            event.preventDefault();
        }
    });

    versesSelect.addEventListener('keydown', function(event) {
        if (KeyboardEvent.code === 9) { // Tab key
            checkButton.focus();
            event.preventDefault();
        }
    });

    checkButton.addEventListener('keydown', function(event) {
        if (KeyboardEvent.code === 9) { // Tab key
            nextButton.focus();
            event.preventDefault();
        }
    });

    nextButton.addEventListener('keydown', function(event) {
        if (KeyboardEvent.code === 13 || KeyboardEvent.code === 32) { // Enter or Spacebar key
            nextButton.click();
            event.preventDefault();
        }
    });

    chaptersSelect.addEventListener('keyup', function(event) {
        const key = event.key;
        if (!isNaN(key) && chapterInput.length < 2) { // Check if the key is a number and maximum two digits
            chapterInput += key;
            if (chapterInput.length === 2) { // Automatically select chapter after typing two digits
                selectChapter(chapterInput);
                chapterInput = '';
                event.preventDefault();
            }
        } else if (KeyboardEvent.code === 13) { // Enter key
            if (chapterInput !== '') {
                selectChapter(chapterInput);
                chapterInput = '';
                event.preventDefault();
            }
        } else { // Clear input if invalid key pressed
            chapterInput = '';
        }
    });

    versesSelect.addEventListener('keydown', function(event) {
        const key = event.key;
        if (!isNaN(key) && verseInput.length < 2) { // Check if the key is a number and maximum two digits
            verseInput += key;
            if (verseInput.length === 2) { // Automatically select verse after typing two digits
                const selectedOption = versesSelect.querySelector(`option[value="${verseInput}"]`);
                if (selectedOption) {
                    versesSelect.value = verseInput;
                    verseInput = '';
                    event.preventDefault();
                }
            }
        } else if (key === 'Tab' && verseInput.length === 1) { // Tab pressed after single digit
            const selectedOption = versesSelect.querySelector(`option[value="${verseInput}"]`);
            if (selectedOption) {
                versesSelect.value = verseInput;
                verseInput = '';
                event.preventDefault();
            }
        } else { // Clear input if invalid key pressed
            verseInput = '';
        }
    });

    populateChaptersDropdown();
    populateVersesDropdown('16');
});
