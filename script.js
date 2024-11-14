let currentAnswer;
let currentQuestionNumber = 1;
let totalQuestionsPerLevel = 10;
let currentLevel = 1;
let currentUser = '';

function startGame(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();
    
    if (username) {
        currentUser = username;
        let userData = JSON.parse(localStorage.getItem(username));
        
        if (!userData) {
            userData = {
                username: username,
                level: 1,
                currentQuestion: 1,
                completedLevels: []
            };
            localStorage.setItem(username, JSON.stringify(userData));
        }
        
        currentLevel = userData.level;
        currentQuestionNumber = userData.currentQuestion;
        
        document.getElementById("login-section").style.display = "none";
        document.getElementById("level-selection").style.display = "block";
        
        updateLevelVisibility();
       // alert(`Hoş geldin, ${username}!`);
    } else {
        alert("Lütfen bir kullanıcı adı girin.");
    }
}

function updateLevelVisibility() {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    const levelButtons = document.querySelectorAll(".level-button");
    
    levelButtons.forEach((button, index) => {
        const level = index + 1;
        // Her seviye görünür olacak
        button.style.display = "block";
        
        if (level <= userData.level) {
            // Tamamlanan veya mevcut seviye aktif
            button.disabled = false;
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
        } else {
            // Henüz açılmamış seviyeler inaktif
            button.disabled = true;
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
        
        // Seviye durumunu gösteren rozet ekle
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
    // Hide alert section when generating new question
    hideAlert();

    // Save current progress
    const userData = JSON.parse(localStorage.getItem(currentUser));
    userData.currentQuestion = currentQuestionNumber;
    localStorage.setItem(currentUser, JSON.stringify(userData));
}

function hideAlert() {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "none";
    alertSection.innerHTML = '';
}

function showAlert(message) {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "block";
    alertSection.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>`;
}

function startLevel(level) {
    currentLevel = level;
    currentQuestionNumber = 1;
    document.getElementById("level-selection").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    generateQuestion(level);
    
    const answerInput = document.getElementById("answer");
    answerInput.value = "";
    answerInput.focus();
    
    // Remove any existing event listeners
    const newAnswerInput = answerInput.cloneNode(true);
    answerInput.parentNode.replaceChild(newAnswerInput, answerInput);
    
    // Add new event listener
    newAnswerInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            checkAnswer();
        }
    });
}

function checkAnswer() {
    const answerInput = document.getElementById("answer");
    const userAnswer = parseInt(answerInput.value);
    let userData = JSON.parse(localStorage.getItem(currentUser));

    if (!isNaN(userAnswer) && userAnswer === currentAnswer) {
        hideAlert(); // Hide alert if answer is correct
        
        if (currentQuestionNumber < totalQuestionsPerLevel) {
            currentQuestionNumber++;
            answerInput.value = "";
            generateQuestion(currentLevel);
        } else {
            // Level completed
            if (currentLevel < 5) {
                // Update user progress only if completing highest available level
                if (currentLevel === userData.level) {
                    userData.level = currentLevel + 1;
                    userData.currentQuestion = 1;
                    userData.completedLevels.push(currentLevel);
                    localStorage.setItem(currentUser, JSON.stringify(userData));
                }
                
                alert("Tebrikler! Seviyeyi tamamladınız. Bir sonraki seviyeye geçebilirsiniz.");
                exitLevel();
                updateLevelVisibility();
            } else {
                alert("Tebrikler! Tüm seviyeleri tamamladınız!");
                exitLevel();
            }
        }
    } else {
        showAlert("Yanlış cevap! Tekrar deneyin.");
        answerInput.value = "";
        answerInput.focus();
    }
}

function exitLevel() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    document.getElementById("answer").value = "";
    hideAlert();
    
    // Reset current question when exiting level
    currentQuestionNumber = 1;
    const userData = JSON.parse(localStorage.getItem(currentUser));
    userData.currentQuestion = 1;
    localStorage.setItem(currentUser, JSON.stringify(userData));
}