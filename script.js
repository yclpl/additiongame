let currentAnswer;
let currentQuestionNumber = 1;
let totalQuestionsPerLevel = 10;
let currentLevel = 1;
let currentUser = '';
let currentScore = 0;
let correctCount = 0;
let wrongCount = 0;

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
    document.getElementById("question").textContent = `${num1} + ${num2} = ?`;
    hideAlert();

    updateScoreDisplay();
}

function startLevel(level) {
    currentLevel = level;
    currentQuestionNumber = 1;
    currentScore = 0;
    correctCount = 0;
    wrongCount = 0;
    
    document.getElementById("level-selection").style.display = "none";
    document.getElementById("game-section").style.display = "block";
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

function checkAnswer() {
    const answerInput = document.getElementById("answer");
    const userAnswer = parseInt(answerInput.value);
    const userData = JSON.parse(localStorage.getItem(currentUser));
    
    if (!isNaN(userAnswer)) {
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
        
        // Her durumda bir sonraki soruya geç
        if (currentQuestionNumber < totalQuestionsPerLevel) {
            setTimeout(() => {
                currentQuestionNumber++;
                generateQuestion(currentLevel);
                hideAlert();
            }, 1500);
        } else {
            // Seviye tamamlandı
            const requiredScore = totalQuestionsPerLevel * 10; // Maksimum puan
            const passingScore = requiredScore * 0.7; // Geçme puanı (%70)
            
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
                
                setTimeout(() => {
                    showAlert(`Tebrikler! Seviyeyi ${currentScore} puan ile tamamladınız! 🎉`, true);
                    setTimeout(() => {
                        exitLevel();
                        updateLevelVisibility();
                    }, 2000);
                }, 1000);
            } else {
                setTimeout(() => {
                    showAlert(`Seviyeyi geçmek için en az ${passingScore} puan gerekli. Tekrar deneyin!`, false);
                    setTimeout(() => {
                        exitLevel();
                    }, 2000);
                }, 1000);
            }
        }
    } else {
        showAlert("Lütfen bir sayı girin!", false);
    }
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