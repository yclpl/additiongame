let currentAnswer;
let currentQuestionNumber = 1;
let totalQuestionsPerLevel = 10;
let currentLevel = 1;
let currentUser = '';
let currentScore = 0;
let correctCount = 0;
let wrongCount = 0;
let questionHistory = []; // Soru geçmişini tutacak array

function startGame(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();
    
    if (username) {
        currentUser = username;
        let userData = JSON.parse(localStorage.getItem(username)) || {
            username: username,
            level: 1,
            currentQuestion: 1,
            completedLevels: [],
            highScore: 0
        };
        
        localStorage.setItem(username, JSON.stringify(userData));
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("game-selection").style.display = "block";
    } else {
        alert("Lütfen bir kullanıcı adı girin.");
    }
}

function startMathGame() {
    document.getElementById("game-selection").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    updateLevelVisibility();
}

function startEliminationGame() {
    alert("Fazla Sayıyı Eleme oyunu yakında eklenecek!");
}

function startLevel(level) {
    currentLevel = level;
    currentQuestionNumber = 1;
    currentScore = 0;
    correctCount = 0;
    wrongCount = 0;
    questionHistory = []; // Soru geçmişini sıfırla
    
    document.getElementById("level-selection").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    document.getElementById("summary-section").style.display = "none";
    generateQuestion(level);
    
    const answerInput = document.getElementById("answer");
    answerInput.value = "";
    answerInput.focus();
    
    const newAnswerInput = answerInput.cloneNode(true);
    answerInput.parentNode.replaceChild(newAnswerInput, answerInput);
    
    newAnswerInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer();
        }
    });
    
    updateScoreDisplay();
}

function generateQuestion(level) {
    let num1, num2;
    const progressText = document.getElementById("progress-text");
    progressText.textContent = `Soru ${currentQuestionNumber}/${totalQuestionsPerLevel}`;

    switch (level) {
        case 1:
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 2:
            num1 = Math.floor(Math.random() * 10) + 10;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 3:
            num1 = Math.floor(Math.random() * 10) + 10;
            num2 = Math.floor(Math.random() * 10) + 10;
            break;
        case 4:
            num1 = Math.floor(Math.random() * 10) + 20;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 5:
            num1 = Math.floor(Math.random() * 10) + 20;
            num2 = Math.floor(Math.random() * 10) + 10;
            break;
    }

    currentAnswer = num1 + num2;
    const questionText = `${num1} + ${num2} = ?`;
    document.getElementById("question").textContent = questionText;
    
    // Soru bilgilerini kaydet
    questionHistory.push({
        questionNumber: currentQuestionNumber,
        question: questionText,
        correctAnswer: currentAnswer,
        userAnswer: null,
        isCorrect: null
    });

    hideAlert();
    updateScoreDisplay();
}

// ... [Önceki kodlar aynı kalacak]

function checkAnswer() {
    const answerInput = document.getElementById("answer");
    const userAnswer = parseInt(answerInput.value);
    const userData = JSON.parse(localStorage.getItem(currentUser));
    
    if (!isNaN(userAnswer)) {
        // Cevabı kaydet
        const currentQuestion = questionHistory[currentQuestionNumber - 1];
        currentQuestion.userAnswer = userAnswer;
        currentQuestion.isCorrect = userAnswer === currentAnswer;

        if (userAnswer === currentAnswer) {
            currentScore += 10;
            correctCount++;
            showAlert("Doğru cevap! (+10 puan)", true);
        } else {
            currentScore -= 5;
            wrongCount++;
            showAlert(`Yanlış cevap! (-5 puan) Doğru cevap: ${currentAnswer}`, false);
        }
        
        updateScoreDisplay();
        answerInput.value = "";
        
        if (currentQuestionNumber < totalQuestionsPerLevel) {
            setTimeout(() => {
                currentQuestionNumber++;
                generateQuestion(currentLevel);
                hideAlert();
            }, 1500);
        } else {
            // Seviye tamamlandı
            setTimeout(() => {
                showSummary();
                const requiredScore = totalQuestionsPerLevel * 10;
                const passingScore = requiredScore * 0.7;
                
                if (currentScore >= passingScore) {
                    if (currentLevel === userData.level) {
                        userData.level = Math.min(currentLevel + 1, 5);
                        if (!userData.completedLevels.includes(currentLevel)) {
                            userData.completedLevels.push(currentLevel);
                        }
                    }
                    
                    if (currentScore > (userData.highScore || 0)) {
                        userData.highScore = currentScore;
                    }
                    
                    localStorage.setItem(currentUser, JSON.stringify(userData));
                }
            }, 1500);
        }
    } else {
        showAlert("Lütfen bir sayı girin!", false);
    }
}

function showSummary() {
    // Oyun bölümünü gizle ve özet bölümünü göster
    document.getElementById("game-section").style.display = "none";
    document.getElementById("summary-section").style.display = "block";
    
    // Final skorunu güncelle
    document.getElementById("final-total-score").textContent = currentScore;
    
    // Özet tablosunu oluştur
    const tableBody = document.getElementById("summary-table-body");
    tableBody.innerHTML = ''; // Tabloyu temizle
    
    questionHistory.forEach(record => {
        const row = document.createElement("tr");
        const resultIcon = record.isCorrect ? 
            '<div class="result-icon correct"><i class="fas fa-check"></i></div>' : 
            '<div class="result-icon wrong"><i class="fas fa-times"></i></div>';
            
        row.innerHTML = `
            <td class="question-history">Soru ${record.questionNumber}</td>
            <td>${record.question}</td>
            <td class="user-answer ${record.isCorrect ? 'correct' : 'wrong'}">${record.userAnswer}</td>
            <td>${resultIcon}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateScoreDisplay() {
    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("wrong-count").textContent = wrongCount;
}

function hideAlert() {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "none";
    alertSection.innerHTML = '';
}

function showAlert(message, isSuccess = false) {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "block";
    alertSection.innerHTML = `
        <div class="alert ${isSuccess ? 'alert-success' : 'alert-danger'}" role="alert">
            ${message}
        </div>`;
}

function exitToLevelSelection() {
    document.getElementById("summary-section").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    updateLevelVisibility();
}

function updateLevelVisibility() {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    const levelButtons = document.querySelectorAll(".level-button");
    
    levelButtons.forEach((button, index) => {
        const level = index + 1;
        button.style.display = "block";
        
        if (level <= userData.level) {
            button.disabled = false;
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
        } else {
            button.disabled = true;
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
        
        if (userData.completedLevels.includes(level)) {
            button.innerHTML = `Seviye ${level} <span class="badge bg-success ms-2">Tamamlandı</span>`;
        } else if (level === userData.level) {
            button.innerHTML = `Seviye ${level} <span class="badge bg-warning ms-2">Mevcut</span>`;
        } else {
            button.innerHTML = `Seviye ${level}`;
        }
    });
}

function exitLevel() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    document.getElementById("answer").value = "";
    hideAlert();
    
    currentQuestionNumber = 1;
    const userData = JSON.parse(localStorage.getItem(currentUser));
    userData.currentQuestion = 1;
    localStorage.setItem(currentUser, JSON.stringify(userData));
}