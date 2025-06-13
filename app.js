// Données du jeu
const GAME_DATA = {
    quiz_questions: [
        {"question": "Quel est le nom scientifique de Stitch ?", "choices": ["626", "625", "624", "627"], "correct": 0},
        {"question": "Que signifie Ohana ?", "choices": ["Famille", "Fête", "Vacances", "Amitié"], "correct": 0},
        {"question": "Qui a créé Stitch ?", "choices": ["Jumba", "Gantu", "Pleakley", "Nani"], "correct": 0},
        {"question": "Sur quelle île vivent Lilo et Stitch ?", "choices": ["Kauai", "Maui", "Oahu", "Molokai"], "correct": 0},
        {"question": "Comment s'appelle le doudou de Lilo ?", "choices": ["Scrump", "Angel", "Ducky", "Teddy"], "correct": 0},
        {"question": "Comment s'appelle la grande sœur de Lilo ?", "choices": ["Nani", "Angel", "Myrtle", "Victoria"], "correct": 0},
        {"question": "Qui veut capturer Stitch ?", "choices": ["Gantu", "David", "Cobra", "Pleakley"], "correct": 0},
        {"question": "Quelle chanson Lilo aime chanter ?", "choices": ["Hawaiian Roller Coaster Ride", "Aloha Oe", "Blue Hawaii", "Tiny Bubbles"], "correct": 0},
        {"question": "Où Stitch s'écrase-t-il sur Terre ?", "choices": ["Plage de Kauai", "Forêt", "Ville", "Montagne"], "correct": 0},
        {"question": "Que collectionne Lilo ?", "choices": ["Photos d'Elvis", "Coquillages", "Fleurs", "Pierres"], "correct": 0},
        {"question": "Combien de bras a Stitch ?", "choices": ["4", "2", "6", "8"], "correct": 0},
        {"question": "Quel est le nom de l'agent qui surveille Lilo ?", "choices": ["Cobra Bubbles", "David", "Dr. Jumba", "Agent Smith"], "correct": 0},
        {"question": "Dans quelle ville imaginaire vivent Lilo et Stitch ?", "choices": ["Kokaua Town", "Hanapepe", "Hilo", "Honolulu"], "correct": 0},
        {"question": "Que mange Stitch au début du film ?", "choices": ["Sandwich beurre de cacahuète", "Pizza", "Ananas", "Glace"], "correct": 0},
        {"question": "Quel instrument joue souvent dans les musiques du film ?", "choices": ["Ukulélé", "Guitare", "Piano", "Batterie"], "correct": 0}
    ],
    memory_cards: [
        {"name": "Stitch Souriant", "image": "😊"},
        {"name": "Stitch Surpris", "image": "😲"},
        {"name": "Lilo Hula", "image": "🌺"},
        {"name": "Nani", "image": "👩"},
        {"name": "Jumba", "image": "🧬"},
        {"name": "Pleakley", "image": "👽"},
        {"name": "Gantu", "image": "🦈"},
        {"name": "Scrump", "image": "🧸"}
    ],
    hula_sequences: [
        [0, 1, 2, 3, 0],
        [1, 3, 0, 2, 1],
        [2, 0, 3, 1, 2],
        [3, 2, 1, 0, 3],
        [0, 2, 1, 3, 0]
    ],
    scoring: {
        quiz_perfect: 50,
        quiz_slow: 25,
        memory_pair: 20,
        hula_perfect: 30,
        hula_errors: 15,
        gantu_catch: 10
    }
};

// État de l'application
let gameState = {
    participants: [],
    currentScreen: 'welcome',
    currentGame: null,
    currentPlayer: 0,
    totalTime: 30 * 60, // 30 minutes en secondes
    gameResults: {},
    soundEnabled: true,
    timers: {}
};

// Avatars Stitch pour les participants
const STITCH_AVATARS = ['👽', '😊', '😲', '😜', '😴', '🤪', '😎', '🥰', '😋'];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    startGlobalTimer();
    showScreen('welcome');
}

function setupEventListeners() {
    // Boutons navigation
    document.getElementById('start-button').addEventListener('click', () => showScreen('participants'));
    document.getElementById('add-participant-btn').addEventListener('click', addParticipant);
    document.getElementById('start-games-btn').addEventListener('click', startGames);
    document.getElementById('next-game-btn').addEventListener('click', nextGame);
    document.getElementById('new-game-btn').addEventListener('click', newGame);
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);

    // Participant input
    document.getElementById('participant-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });

    // Hula controls
    document.querySelectorAll('.hula-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            handleHulaInput(parseInt(this.dataset.direction));
        });
    });
}

// Gestion du timer global
function startGlobalTimer() {
    gameState.timers.global = setInterval(() => {
        gameState.totalTime--;
        updateGlobalTimer();
        
        if (gameState.totalTime <= 0) {
            endGame();
        }
    }, 1000);
}

function updateGlobalTimer() {
    const minutes = Math.floor(gameState.totalTime / 60);
    const seconds = gameState.totalTime % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Gestion des écrans
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + '-screen').classList.add('active');
    gameState.currentScreen = screenName;
}

// Gestion des participants
function addParticipant() {
    const nameInput = document.getElementById('participant-name');
    const name = nameInput.value.trim();
    
    if (name && gameState.participants.length < 9) {
        const participant = {
            name: name,
            avatar: STITCH_AVATARS[gameState.participants.length],
            scores: {
                quiz: 0,
                memory: 0,
                hula: 0,
                gantu: 0,
                total: 0
            }
        };
        
        gameState.participants.push(participant);
        nameInput.value = '';
        renderParticipants();
        updateStartButton();
        playSound('success');
    }
}

function removeParticipant(index) {
    gameState.participants.splice(index, 1);
    renderParticipants();
    updateStartButton();
}

function renderParticipants() {
    const grid = document.getElementById('participants-grid');
    grid.innerHTML = '';
    
    gameState.participants.forEach((participant, index) => {
        const card = document.createElement('div');
        card.className = 'participant-card fade-in';
        card.innerHTML = `
            <div class="participant-avatar">${participant.avatar}</div>
            <div class="participant-name">${participant.name}</div>
            <div class="participant-score">Score: ${participant.scores.total}</div>
            <button class="remove-participant" onclick="removeParticipant(${index})">×</button>
        `;
        grid.appendChild(card);
    });
}

function updateStartButton() {
    const startBtn = document.getElementById('start-games-btn');
    startBtn.disabled = gameState.participants.length === 0;
}

// Démarrage des jeux
function startGames() {
    gameState.currentGame = 'quiz';
    gameState.currentPlayer = 0;
    initializeGameResults();
    showScreen('quiz');
    startQuizGame();
}

function initializeGameResults() {
    gameState.gameResults = {
        quiz: {},
        memory: {},
        hula: {},
        gantu: {}
    };
    
    gameState.participants.forEach((participant, index) => {
        gameState.gameResults.quiz[index] = { score: 0, completed: false };
        gameState.gameResults.memory[index] = { score: 0, completed: false };
        gameState.gameResults.hula[index] = { score: 0, completed: false };
        gameState.gameResults.gantu[index] = { score: 0, completed: false };
    });
}

// Jeu Quiz
function startQuizGame() {
    const participant = gameState.participants[gameState.currentPlayer];
    document.getElementById('quiz-current-player').textContent = participant.name;
    
    gameState.quizData = {
        questions: shuffleArray([...GAME_DATA.quiz_questions]).slice(0, 10),
        currentQuestion: 0,
        score: 0,
        timeLeft: 15
    };
    
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = gameState.quizData.questions[gameState.quizData.currentQuestion];
    document.getElementById('quiz-question').textContent = question.question;
    
    const choicesContainer = document.getElementById('quiz-choices');
    choicesContainer.innerHTML = '';
    
    question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-choice';
        button.textContent = choice;
        button.addEventListener('click', () => selectQuizAnswer(index));
        choicesContainer.appendChild(button);
    });
    
    startQuizTimer();
}

function startQuizTimer() {
    gameState.quizData.timeLeft = 15;
    document.getElementById('quiz-timer').textContent = gameState.quizData.timeLeft;
    
    const timerBar = document.getElementById('quiz-timer-bar');
    timerBar.style.width = '100%';
    
    gameState.timers.quiz = setInterval(() => {
        gameState.quizData.timeLeft--;
        document.getElementById('quiz-timer').textContent = gameState.quizData.timeLeft;
        timerBar.style.width = `${(gameState.quizData.timeLeft / 15) * 100}%`;
        
        if (gameState.quizData.timeLeft <= 0) {
            clearInterval(gameState.timers.quiz);
            selectQuizAnswer(-1); // Temps écoulé
        }
    }, 1000);
}

function selectQuizAnswer(selectedIndex) {
    clearInterval(gameState.timers.quiz);
    
    const question = gameState.quizData.questions[gameState.quizData.currentQuestion];
    const choices = document.querySelectorAll('.quiz-choice');
    
    choices.forEach((choice, index) => {
        if (index === question.correct) {
            choice.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== question.correct) {
            choice.classList.add('incorrect');
        }
        choice.style.pointerEvents = 'none';
    });
    
    let points = 0;
    if (selectedIndex === question.correct) {
        points = gameState.quizData.timeLeft > 5 ? GAME_DATA.scoring.quiz_perfect : GAME_DATA.scoring.quiz_slow;
        playSound('success');
    } else {
        playSound('error');
    }
    
    gameState.quizData.score += points;
    
    setTimeout(() => {
        gameState.quizData.currentQuestion++;
        if (gameState.quizData.currentQuestion < gameState.quizData.questions.length) {
            showQuizQuestion();
        } else {
            finishQuizForPlayer();
        }
    }, 2000);
}

function finishQuizForPlayer() {
    const playerIndex = gameState.currentPlayer;
    gameState.gameResults.quiz[playerIndex].score = gameState.quizData.score;
    gameState.gameResults.quiz[playerIndex].completed = true;
    gameState.participants[playerIndex].scores.quiz = gameState.quizData.score;
    gameState.participants[playerIndex].scores.total += gameState.quizData.score;
    
    gameState.currentPlayer++;
    if (gameState.currentPlayer < gameState.participants.length) {
        startQuizGame();
    } else {
        showScores();
    }
}

// Jeu Mémoire
function startMemoryGame() {
    const participant = gameState.participants[gameState.currentPlayer];
    document.getElementById('memory-current-player').textContent = participant.name;
    
    gameState.memoryData = {
        cards: createMemoryCards(),
        flippedCards: [],
        matchedPairs: 0,
        score: 0,
        timeLeft: 180,
        moves: 0
    };
    
    renderMemoryGrid();
    startMemoryTimer();
}

function createMemoryCards() {
    const cards = [...GAME_DATA.memory_cards, ...GAME_DATA.memory_cards];
    return shuffleArray(cards).map((card, index) => ({
        ...card,
        id: index,
        flipped: false,
        matched: false
    }));
}

function renderMemoryGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    gameState.memoryData.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.cardId = index;
        cardElement.innerHTML = card.flipped || card.matched ? card.image : '?';
        cardElement.addEventListener('click', () => flipMemoryCard(index));
        
        if (card.matched) {
            cardElement.classList.add('matched');
        } else if (card.flipped) {
            cardElement.classList.add('flipped');
        }
        
        grid.appendChild(cardElement);
    });
}

function flipMemoryCard(cardIndex) {
    const card = gameState.memoryData.cards[cardIndex];
    
    if (card.flipped || card.matched || gameState.memoryData.flippedCards.length >= 2) {
        return;
    }
    
    card.flipped = true;
    gameState.memoryData.flippedCards.push(cardIndex);
    gameState.memoryData.moves++;
    
    renderMemoryGrid();
    
    if (gameState.memoryData.flippedCards.length === 2) {
        setTimeout(() => checkMemoryMatch(), 1000);
    }
}

function checkMemoryMatch() {
    const [firstIndex, secondIndex] = gameState.memoryData.flippedCards;
    const firstCard = gameState.memoryData.cards[firstIndex];
    const secondCard = gameState.memoryData.cards[secondIndex];
    
    if (firstCard.name === secondCard.name) {
        firstCard.matched = true;
        secondCard.matched = true;
        gameState.memoryData.matchedPairs++;
        gameState.memoryData.score += GAME_DATA.scoring.memory_pair;
        playSound('success');
    } else {
        firstCard.flipped = false;
        secondCard.flipped = false;
        playSound('error');
    }
    
    gameState.memoryData.flippedCards = [];
    renderMemoryGrid();
    
    if (gameState.memoryData.matchedPairs === 8) {
        finishMemoryForPlayer();
    }
}

function startMemoryTimer() {
    gameState.timers.memory = setInterval(() => {
        gameState.memoryData.timeLeft--;
        document.getElementById('memory-timer').textContent = gameState.memoryData.timeLeft;
        
        if (gameState.memoryData.timeLeft <= 0) {
            clearInterval(gameState.timers.memory);
            finishMemoryForPlayer();
        }
    }, 1000);
}

function finishMemoryForPlayer() {
    clearInterval(gameState.timers.memory);
    
    const playerIndex = gameState.currentPlayer;
    const timeBonus = Math.max(0, gameState.memoryData.timeLeft);
    const totalScore = gameState.memoryData.score + Math.floor(timeBonus / 10);
    
    gameState.gameResults.memory[playerIndex].score = totalScore;
    gameState.gameResults.memory[playerIndex].completed = true;
    gameState.participants[playerIndex].scores.memory = totalScore;
    gameState.participants[playerIndex].scores.total += totalScore;
    
    gameState.currentPlayer++;
    if (gameState.currentPlayer < gameState.participants.length) {
        startMemoryGame();
    } else {
        showScores();
    }
}

// Jeu Hula
function startHulaGame() {
    const participant = gameState.participants[gameState.currentPlayer];
    document.getElementById('hula-current-player').textContent = participant.name;
    
    gameState.hulaData = {
        sequences: [...GAME_DATA.hula_sequences].slice(0, 3),
        currentSequence: 0,
        playerSequence: [],
        score: 0,
        showingSequence: false,
        sequenceStep: 0
    };
    
    document.getElementById('hula-sequence-num').textContent = '1';
    showHulaSequence();
}

function showHulaSequence() {
    gameState.hulaData.showingSequence = true;
    gameState.hulaData.sequenceStep = 0;
    
    const sequence = gameState.hulaData.sequences[gameState.hulaData.currentSequence];
    document.getElementById('hula-instruction').textContent = 'Regardez bien la séquence !';
    
    const interval = setInterval(() => {
        if (gameState.hulaData.sequenceStep < sequence.length) {
            highlightHulaButton(sequence[gameState.hulaData.sequenceStep]);
            gameState.hulaData.sequenceStep++;
        } else {
            clearInterval(interval);
            gameState.hulaData.showingSequence = false;
            document.getElementById('hula-instruction').textContent = 'Répétez la séquence !';
            gameState.hulaData.playerSequence = [];
        }
    }, 1000);
}

function highlightHulaButton(direction) {
    const buttons = document.querySelectorAll('.hula-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const button = document.querySelector(`[data-direction="${direction}"]`);
    if (button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 500);
    }
}

function handleHulaInput(direction) {
    if (gameState.hulaData.showingSequence) return;
    
    gameState.hulaData.playerSequence.push(direction);
    highlightHulaButton(direction);
    
    const sequence = gameState.hulaData.sequences[gameState.hulaData.currentSequence];
    const currentIndex = gameState.hulaData.playerSequence.length - 1;
    
    if (gameState.hulaData.playerSequence[currentIndex] !== sequence[currentIndex]) {
        // Erreur
        playSound('error');
        gameState.hulaData.score += GAME_DATA.scoring.hula_errors;
        nextHulaSequence();
    } else if (gameState.hulaData.playerSequence.length === sequence.length) {
        // Séquence complète et correcte
        playSound('success');
        gameState.hulaData.score += GAME_DATA.scoring.hula_perfect;
        nextHulaSequence();
    }
}

function nextHulaSequence() {
    gameState.hulaData.currentSequence++;
    
    if (gameState.hulaData.currentSequence < gameState.hulaData.sequences.length) {
        document.getElementById('hula-sequence-num').textContent = (gameState.hulaData.currentSequence + 1).toString();
        setTimeout(() => showHulaSequence(), 1500);
    } else {
        finishHulaForPlayer();
    }
}

function finishHulaForPlayer() {
    const playerIndex = gameState.currentPlayer;
    
    gameState.gameResults.hula[playerIndex].score = gameState.hulaData.score;
    gameState.gameResults.hula[playerIndex].completed = true;
    gameState.participants[playerIndex].scores.hula = gameState.hulaData.score;
    gameState.participants[playerIndex].scores.total += gameState.hulaData.score;
    
    gameState.currentPlayer++;
    if (gameState.currentPlayer < gameState.participants.length) {
        startHulaGame();
    } else {
        showScores();
    }
}

// Jeu Gantu
function startGantuGame() {
    const participant = gameState.participants[gameState.currentPlayer];
    document.getElementById('gantu-current-player').textContent = participant.name;
    
    gameState.gantuData = {
        score: 0,
        timeLeft: 60,
        targetsCreated: 0,
        maxTargets: 15
    };
    
    document.getElementById('gantu-score').textContent = '0';
    document.getElementById('gantu-timer').textContent = '60';
    
    const gameArea = document.getElementById('gantu-game-area');
    gameArea.innerHTML = '<div class="gantu-instruction">Clique sur Gantu pour le capturer !</div>';
    
    startGantuTimer();
    createGantuTargets();
}

function startGantuTimer() {
    gameState.timers.gantu = setInterval(() => {
        gameState.gantuData.timeLeft--;
        document.getElementById('gantu-timer').textContent = gameState.gantuData.timeLeft;
        
        if (gameState.gantuData.timeLeft <= 0) {
            clearInterval(gameState.timers.gantu);
            finishGantuForPlayer();
        }
    }, 1000);
}

function createGantuTargets() {
    const createTarget = () => {
        if (gameState.gantuData.targetsCreated >= gameState.gantuData.maxTargets || gameState.gantuData.timeLeft <= 0) {
            return;
        }
        
        const gameArea = document.getElementById('gantu-game-area');
        const target = document.createElement('div');
        target.className = 'gantu-target';
        target.textContent = '👾';
        
        const maxX = gameArea.clientWidth - 60;
        const maxY = gameArea.clientHeight - 60;
        target.style.left = Math.random() * maxX + 'px';
        target.style.top = Math.random() * maxY + 'px';
        
        target.addEventListener('click', () => catchGantu(target));
        gameArea.appendChild(target);
        
        gameState.gantuData.targetsCreated++;
        
        setTimeout(() => {
            if (target.parentNode) {
                target.parentNode.removeChild(target);
            }
        }, 2000);
        
        setTimeout(createTarget, 1000);
    };
    
    createTarget();
}

function catchGantu(target) {
    gameState.gantuData.score += GAME_DATA.scoring.gantu_catch;
    document.getElementById('gantu-score').textContent = gameState.gantuData.score;
    
    target.style.background = '#32CD32';
    target.textContent = '💥';
    playSound('success');
    
    setTimeout(() => {
        if (target.parentNode) {
            target.parentNode.removeChild(target);
        }
    }, 300);
}

function finishGantuForPlayer() {
    clearInterval(gameState.timers.gantu);
    
    const playerIndex = gameState.currentPlayer;
    
    gameState.gameResults.gantu[playerIndex].score = gameState.gantuData.score;
    gameState.gameResults.gantu[playerIndex].completed = true;
    gameState.participants[playerIndex].scores.gantu = gameState.gantuData.score;
    gameState.participants[playerIndex].scores.total += gameState.gantuData.score;
    
    gameState.currentPlayer++;
    if (gameState.currentPlayer < gameState.participants.length) {
        startGantuGame();
    } else {
        showFinalResults();
    }
}

// Affichage des scores
function showScores() {
    const podium = document.getElementById('scores-podium');
    podium.innerHTML = '';
    
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.scores.total - a.scores.total);
    
    sortedParticipants.forEach((participant, index) => {
        const card = document.createElement('div');
        card.className = 'podium-place';
        
        if (index === 0) card.classList.add('first');
        else if (index === 1) card.classList.add('second');
        else if (index === 2) card.classList.add('third');
        
        card.innerHTML = `
            <div class="podium-avatar">${participant.avatar}</div>
            <div class="podium-name">${participant.name}</div>
            <div class="podium-score">${participant.scores.total} pts</div>
        `;
        
        podium.appendChild(card);
    });
    
    gameState.currentPlayer = 0;
    showScreen('scores');
}

// Navigation entre les jeux
function nextGame() {
    const games = ['quiz', 'memory', 'hula', 'gantu'];
    const currentIndex = games.indexOf(gameState.currentGame);
    
    if (currentIndex < games.length - 1) {
        gameState.currentGame = games[currentIndex + 1];
        gameState.currentPlayer = 0;
        
        switch (gameState.currentGame) {
            case 'memory':
                showScreen('memory');
                startMemoryGame();
                break;
            case 'hula':
                showScreen('hula');
                startHulaGame();
                break;
            case 'gantu':
                showScreen('gantu');
                startGantuGame();
                break;
        }
    }
}

// Résultats finaux
function showFinalResults() {
    createConfetti();
    
    const podium = document.getElementById('final-podium');
    podium.innerHTML = '';
    
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.scores.total - a.scores.total);
    
    sortedParticipants.forEach((participant, index) => {
        const card = document.createElement('div');
        card.className = 'podium-place';
        
        if (index === 0) card.classList.add('first');
        else if (index === 1) card.classList.add('second');
        else if (index === 2) card.classList.add('third');
        
        card.innerHTML = `
            <div class="podium-avatar">${participant.avatar}</div>
            <div class="podium-name">${participant.name}</div>
            <div class="podium-score">${participant.scores.total} pts</div>
            <div style="font-size: 12px; margin-top: 8px;">
                Quiz: ${participant.scores.quiz} | Mémoire: ${participant.scores.memory}<br>
                Hula: ${participant.scores.hula} | Gantu: ${participant.scores.gantu}
            </div>
        `;
        
        podium.appendChild(card);
    });
    
    showScreen('final');
}

function createConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
}

// Nouvelle partie
function newGame() {
    // Réinitialiser l'état
    gameState = {
        participants: [],
        currentScreen: 'welcome',
        currentGame: null,
        currentPlayer: 0,
        totalTime: 30 * 60,
        gameResults: {},
        soundEnabled: gameState.soundEnabled,
        timers: {}
    };
    
    // Nettoyer les timers
    Object.values(gameState.timers).forEach(timer => clearInterval(timer));
    gameState.timers = {};
    
    // Redémarrer
    startGlobalTimer();
    showScreen('welcome');
}

function endGame() {
    clearInterval(gameState.timers.global);
    showFinalResults();
}

// Gestion du son
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const button = document.getElementById('sound-toggle');
    button.textContent = gameState.soundEnabled ? '🔊' : '🔇';
}

function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    const audio = document.getElementById(type + '-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

// Utilitaires
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Exposition des fonctions globales pour les event handlers inline
window.removeParticipant = removeParticipant;