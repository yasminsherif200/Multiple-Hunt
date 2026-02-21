// Game State
let score = 0;
let timeLeft = 20;
let timerInterval;
let currentLevel = 1;

const levels = {
    1: {
        conditionText: "Pick the largest no. multiple of 5",
        targetMultiples: [5],
        goal: "largest",
        cardCount: 6
    },
    2: {
        conditionText: "Pick the smallest no. multiple of 5",
        targetMultiples: [5],
        goal: "smallest",
        cardCount: 6
    },
    3: {
        conditionText: "Pick the largest no. multiple of 5 and 6",
        targetMultiples: [5, 6],
        goal: "largest",
        cardCount: 9
    }
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const playButton = document.getElementById('play-button');
const cardsContainer = document.getElementById('cards-container');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const conditionText = document.getElementById('condition-text');
const popupOverlay = document.getElementById('popup-overlay');
const popupMessage = document.getElementById('popup-message');
const finalScoreContainer = document.getElementById('final-score-container');
const finalScoreDisplay = document.getElementById('final-score');
const correctAnswerDisplay = document.getElementById('correct-answer');
const tryAgainButton = document.getElementById('try-again-button');
const returnHomeButton = document.getElementById('return-home-button');
const nextLevelButton = document.getElementById('next-level-button');

// Event Listeners
playButton.addEventListener('click', startGame);
tryAgainButton.addEventListener('click', resetGame);
returnHomeButton.addEventListener('click', goHome);
nextLevelButton.addEventListener('click', () => {
    popupOverlay.classList.remove('active');
    startLevel(currentLevel + 1);
});

function startGame() {
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    score = 0;
    currentLevel = 1;
    startLevel(currentLevel);
}

function startLevel(level) {
    if (!levels[level]) {
        // End of game or loop back? For now, let's just show a "Game Complete" message
        showPopup('Game Complete!', true);
        nextLevelButton.classList.add('hidden');
        return;
    }
    
    currentLevel = level;
    const config = levels[currentLevel];
    
    levelDisplay.textContent = `Level ${currentLevel}`;
    scoreDisplay.textContent = `Score: ${score}`;
    conditionText.textContent = config.conditionText;
    timeLeft = 20;
    
    updateTimerDisplay();
    generateCards(config);
    startTimer();
}

function updateTimerDisplay() {
    const seconds = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
    timerDisplay.textContent = `00:${seconds}`;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showPopup('Time Up!', false);
        }
    }, 1000);
}

function isMultipleOfAll(num, targets) {
    return targets.every(t => num % t === 0);
}

function generateCards(config) {
    cardsContainer.innerHTML = '';
    let numbers = [];
    const { targetMultiples, goal, cardCount } = config;
    
    // Ensure at least two numbers satisfy the "multiple of" part
    let validMultiples = [];
    while(validMultiples.length < 2) {
        // For level 3 (5 and 6), we need numbers up to 300 to make it interesting
        let maxRange = targetMultiples.length > 1 ? 300 : 100;
        let num = Math.floor(Math.random() * (maxRange - 10)) + 10;
        
        if (isMultipleOfAll(num, targetMultiples) && !validMultiples.includes(num)) {
            validMultiples.push(num);
        }
    }
    
    // Add other random numbers
    let others = [];
    while(others.length < cardCount - validMultiples.length) {
        let maxRange = targetMultiples.length > 1 ? 300 : 100;
        let num = Math.floor(Math.random() * (maxRange - 10)) + 10;
        
        if (!isMultipleOfAll(num, targetMultiples) && !others.includes(num)) {
            others.push(num);
        }
    }
    
    numbers = [...validMultiples, ...others];
    // Shuffle numbers
    numbers.sort(() => Math.random() - 0.5);
    
    // Find the correct answer based on the goal
    const allValid = numbers.filter(n => isMultipleOfAll(n, targetMultiples));
    const correctAnswer = goal === "largest" ? Math.max(...allValid) : Math.min(...allValid);

    numbers.forEach(num => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.textContent = num;
        card.addEventListener('click', () => checkAnswer(num, correctAnswer));
        cardsContainer.appendChild(card);
    });
}

function checkAnswer(selected, correct) {
    clearInterval(timerInterval);
    if (selected === correct) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        showPopup('You won!', true);
    } else {
        showPopup('You lose.', false, correct);
    }
}

function showPopup(message, isWin, correctVal) {
    popupMessage.textContent = message;
    popupOverlay.classList.add('active');
    
    // Reset visibility
    nextLevelButton.classList.add('hidden');
    finalScoreContainer.classList.add('hidden');
    correctAnswerDisplay.classList.add('hidden');
    tryAgainButton.classList.remove('hidden'); // Default to visible

    if (message === 'Game Complete!') {
        finalScoreContainer.classList.remove('hidden');
        finalScoreDisplay.textContent = score;
        tryAgainButton.classList.add('hidden'); // Hide only on completion
    } else if (isWin) {
        nextLevelButton.classList.remove('hidden');
    } else {
        finalScoreContainer.classList.remove('hidden');
        finalScoreDisplay.textContent = score;
        if (correctVal !== undefined) {
            correctAnswerDisplay.textContent = `Correct answer was: ${correctVal}`;
            correctAnswerDisplay.classList.remove('hidden');
        }
    }
}

function resetGame() {
    popupOverlay.classList.remove('active');
    score = 0;
    startLevel(1);
}

function goHome() {
    popupOverlay.classList.remove('active');
    gameScreen.classList.remove('active');
    startScreen.classList.add('active');
}
