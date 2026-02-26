const translations = {
    en: {
        title1: "MULTIPLE",
        title2: "HUNT",
        howToPlay: "HOW TO PLAY",
        rule1: "Click or tap the numbers that satisfies the condition",
        rule2: "Score before time runs out!",
        playBtn: "PLAY NOW",
        langBtn: "العربية",
        dir: "ltr",
        level: "Level ",
        score: "Score: ",
        conditions: {
            1: "Pick the Greatest multiple of 5",
            2: "Pick the Smallest multiple of 5",
            3: "Pick the Greatest multiple of 5 and 6",
            4: "Pick the Greatest multiple of 7"
        },
        won: "You won",
        gameFinished: "Congratulations! You finished the game",
        lost: "You lost",
        timeUp: "Time up!",
        nextLevel: "Next Level",
        tryAgain: "Try Again",
        returnHome: "Return Home",
        finalScore: "Final Score: ",
        correctAnswer: "Correct answer was: "
    },
    ar: {
        title1: "صيد",
        title2: "المضاعفات",
        howToPlay: "كيفية اللعب",
        rule1: "انقر أو اضغط على الأرقام التي تستوفي الشرط",
        rule2: "سجل النقاط قبل نفاد الوقت!",
        playBtn: "العب الآن",
        langBtn: "English",
        dir: "rtl",
        level: "المستوى: ",
        score: "النتيجة: ",
        conditions: {
            1: "اختر أكبر مضاعف للعدد 5",
            2: "اختر أصغر مضاعف للعدد 5",
            3: "اختر أكبر مضاعف للعددين 5 و 6",
            4: "اختر أكبر مضاعف للعدد 7"
        },
        won: "لقد فزت",
        gameFinished: "تهانينا! لقد أنهيت اللعبة",
        lost: "لقد خسرت",
        timeUp: "انتهى الوقت!",
        nextLevel: "المستوى التالي",
        tryAgain: "حاول مرة أخرى",
        returnHome: "العودة للرئيسية",
        finalScore: "النتيجة النهائية: ",
        correctAnswer: "الإجابة الصحيحة كانت: "
    }
};

let currentLang = 'en';
let level = 1;
let score = 0;
let timeLeft = 20;
let timerInterval = null;
let flipInterval = null;
let currentNumbers = [];
let correctAnswer = null;

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const modalOverlay = document.getElementById('modal-overlay');
const numbersGrid = document.getElementById('numbers-grid');

function updateUI() {
    const t = translations[currentLang];
    
    // Home Screen
    const titlePart1 = document.querySelector('.title-part-1');
    const titlePart2 = document.querySelector('.title-part-2');
    if (titlePart1) titlePart1.textContent = t.title1;
    if (titlePart2) titlePart2.textContent = t.title2;
    
    const howToPlayTitle = document.getElementById('how-to-play-title');
    if (howToPlayTitle) howToPlayTitle.textContent = t.howToPlay;
    
    const rule1 = document.getElementById('rule-1');
    if (rule1) rule1.textContent = t.rule1;
    
    const rule2 = document.getElementById('rule-2');
    if (rule2) rule2.textContent = t.rule2;
    
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.textContent = t.playBtn;
    
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.textContent = t.langBtn;
    
    // Game Screen
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) levelDisplay.textContent = `${t.level}${level}`;
    
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.textContent = `${t.score}${score}`;
    
    const conditionText = document.getElementById('condition-text');
    if (conditionText) {
        // Fallback to level 1 condition if level > 4
        const cond = t.conditions[level] || t.conditions[1];
        conditionText.textContent = cond;
    }
    
    // Modal
    const nextLevelBtn = document.getElementById('next-level-btn');
    if (nextLevelBtn) nextLevelBtn.textContent = t.nextLevel;
    
    const tryAgainBtn = document.getElementById('try-again-btn');
    if (tryAgainBtn) tryAgainBtn.textContent = t.tryAgain;
    
    const returnHomeBtn = document.getElementById('return-home-btn');
    if (returnHomeBtn) returnHomeBtn.textContent = t.returnHome;
    
    document.documentElement.dir = t.dir;
    document.documentElement.lang = currentLang;
}

function startGame() {
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    level = 1;
    score = 0;
    startLevel();
}

function startLevel() {
    timeLeft = 20;
    updateTimerDisplay();
    generateNumbers();
    updateUI();
    
    clearInterval(timerInterval);
    clearInterval(flipInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(flipInterval);
            showModal('timeUp');
        }
    }, 1000);

    if (level === 4) {
        flipInterval = setInterval(() => {
            flipRandomCard();
        }, 5000);
    }
}

function flipRandomCard() {
    const cards = document.querySelectorAll('.number-card');
    if (cards.length === 0) return;

    const randomIndex = Math.floor(Math.random() * cards.length);
    const card = cards[randomIndex];

    // Add flip animation class
    card.classList.add('flipping');

    setTimeout(() => {
        // Generate a new number for this card that is not already on the board
        let newNum;
        let attempts = 0;
        do {
            if (Math.random() > 0.3) {
                // 70% chance to be a multiple of 7
                newNum = (Math.floor(Math.random() * 20) + 1) * 7;
            } else {
                newNum = Math.floor(Math.random() * 140) + 1;
            }
            attempts++;
            // Safety break to avoid infinite loop, though unlikely with this range
            if (attempts > 100) break;
        } while (currentNumbers.includes(newNum));

        // Update the number in our array and on the card
        currentNumbers[randomIndex] = newNum;
        card.textContent = newNum;

        // Re-calculate correct answer
        const multiplesOf7 = currentNumbers.filter(n => n % 7 === 0);
        if (multiplesOf7.length > 0) {
            correctAnswer = Math.max(...multiplesOf7);
        } else {
            // Fallback if no multiples of 7 exist (unlikely but safe)
            newNum = 7;
            currentNumbers[randomIndex] = newNum;
            card.textContent = newNum;
            correctAnswer = 7;
        }

        // Remove animation class
        card.classList.remove('flipping');
    }, 300);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function generateNumbers() {
    numbersGrid.innerHTML = '';
    currentNumbers = [];
    let cardCount = level === 3 ? 9 : 6;
    
    if (level === 1) {
        // Pick the largest no. multiple of 5
        let multiples = [];
        while (multiples.length < 2) {
            let num = (Math.floor(Math.random() * 20) + 1) * 5;
            if (!multiples.includes(num)) multiples.push(num);
        }
        currentNumbers.push(...multiples);
        while (currentNumbers.length < cardCount) {
            let num = Math.floor(Math.random() * 100) + 1;
            if (!currentNumbers.includes(num)) currentNumbers.push(num);
        }
        correctAnswer = Math.max(...currentNumbers.filter(n => n % 5 === 0));
    } else if (level === 2) {
        // Pick the Smallest multiple of 5
        let multiples = [];
        while (multiples.length < 2) {
            let num = (Math.floor(Math.random() * 20) + 1) * 5;
            if (!multiples.includes(num)) multiples.push(num);
        }
        currentNumbers.push(...multiples);
        while (currentNumbers.length < cardCount) {
            let num = Math.floor(Math.random() * 100) + 1;
            if (!currentNumbers.includes(num)) currentNumbers.push(num);
        }
        correctAnswer = Math.min(...currentNumbers.filter(n => n % 5 === 0));
    } else if (level === 3) {
        // Pick the Greatest multiple of 5 and 6 (multiple of 30)
        let multiples = [];
        while (multiples.length < 2) {
            let num = (Math.floor(Math.random() * 10) + 1) * 30; // 30, 60, 90, ...
            if (!multiples.includes(num)) multiples.push(num);
        }
        currentNumbers.push(...multiples);
        while (currentNumbers.length < cardCount) {
            let num = Math.floor(Math.random() * 300) + 1;
            if (!currentNumbers.includes(num)) currentNumbers.push(num);
        }
        correctAnswer = Math.max(...currentNumbers.filter(n => n % 30 === 0));
    } else if (level === 4) {
        // Pick the Greatest multiple of 7
        let multiples = [];
        while (multiples.length < 2) {
            let num = (Math.floor(Math.random() * 20) + 1) * 7;
            if (!multiples.includes(num)) multiples.push(num);
        }
        currentNumbers.push(...multiples);
        while (currentNumbers.length < 6) {
            let num = Math.floor(Math.random() * 140) + 1;
            if (!currentNumbers.includes(num)) currentNumbers.push(num);
        }
        correctAnswer = Math.max(...currentNumbers.filter(n => n % 7 === 0));
    } else {
        // Default logic for levels > 4
        let multiples = [];
        while (multiples.length < 2) {
            let num = (Math.floor(Math.random() * 20) + 1) * 5;
            if (!multiples.includes(num)) multiples.push(num);
        }
        currentNumbers.push(...multiples);
        while (currentNumbers.length < 6) {
            let num = Math.floor(Math.random() * 100) + 1;
            if (!currentNumbers.includes(num)) currentNumbers.push(num);
        }
        correctAnswer = Math.max(...currentNumbers.filter(n => n % 5 === 0));
    }
    
    // Shuffle
    currentNumbers.sort(() => Math.random() - 0.5);
    
    currentNumbers.forEach((num, index) => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.textContent = num;
        card.addEventListener('click', () => handleCardClick(num));
        numbersGrid.appendChild(card);
    });
}

function handleCardClick(num) {
    clearInterval(timerInterval);
    clearInterval(flipInterval);
    if (num === correctAnswer) {
        score += 10;
        showModal('won');
    } else {
        showModal('lost');
    }
}

function showModal(type) {
    const t = translations[currentLang];
    modalOverlay.classList.remove('hidden');
    
    const title = document.getElementById('modal-title');
    const finalScore = document.getElementById('final-score-text');
    const correctAns = document.getElementById('correct-answer-text');
    const nextBtn = document.getElementById('next-level-btn');
    const tryBtn = document.getElementById('try-again-btn');
    const homeBtn = document.getElementById('return-home-btn');
    
    // Reset visibility
    [finalScore, correctAns, nextBtn, tryBtn, homeBtn].forEach(el => el.classList.add('hidden'));
    title.classList.remove('finished');
    
    if (type === 'won') {
        if (level === 4) {
            title.textContent = t.gameFinished;
            title.classList.add('finished');
            finalScore.textContent = `${t.finalScore}${score}`;
            finalScore.classList.remove('hidden');
            homeBtn.classList.remove('hidden');
        } else {
            title.textContent = t.won;
            nextBtn.classList.remove('hidden');
        }
    } else if (type === 'lost') {
        title.textContent = t.lost;
        finalScore.textContent = `${t.finalScore}${score}`;
        correctAns.textContent = `${t.correctAnswer}${correctAnswer}`;
        finalScore.classList.remove('hidden');
        correctAns.classList.remove('hidden');
        tryBtn.classList.remove('hidden');
        homeBtn.classList.remove('hidden');
    } else if (type === 'timeUp') {
        title.textContent = t.timeUp;
        tryBtn.classList.remove('hidden');
        homeBtn.classList.remove('hidden');
    }
}

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    updateUI();
});

document.getElementById('play-btn').addEventListener('click', startGame);

document.getElementById('next-level-btn').addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    level++;
    startLevel();
});

document.getElementById('try-again-btn').addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    startGame();
});

document.getElementById('return-home-btn').addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    gameScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

// Initialize UI
updateUI();
