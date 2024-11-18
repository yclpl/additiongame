// Ortak Değişkenler
let currentAnswer;
let currentQuestionNumber = 1;
let totalQuestionsPerLevel = 10;
let currentLevel = 1;
let currentUser = '';
let currentScore = 0;
let correctCount = 0;
let wrongCount = 0;
let questionHistory = [];
let selectedNumber = null;


// Timer değişkeni
let timer;
let timeLeft = 20;

// Oyun Başlangıç Fonksiyonları
function startGame(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();
    
    if (username) {
        currentUser = username;
        let userData = JSON.parse(localStorage.getItem(username)) || {
            username: username,
            addition: {
                level: 1,
                completedLevels: [],
                highScore: 0
            },
            elimination: {
                level: 1,
                completedLevels: [],
                highScore: 0
            }
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
    document.getElementById("game-mode").value = "addition";
    
    document.getElementById("addition-input").style.display = "block";
    document.getElementById("options").style.display = "none";
    
    updateLevelVisibility();
}

function startEliminationGame() {
    document.getElementById("game-selection").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    document.getElementById("game-mode").value = "elimination";
    
    document.getElementById("addition-input").style.display = "none";
    document.getElementById("options").style.display = "block";
    
    updateLevelVisibility();
}

// Seviye Yönetimi
function startLevel(level) {
    currentLevel = level;
    currentQuestionNumber = 1;
    currentScore = 0;
    correctCount = 0;
    wrongCount = 0;
    questionHistory = [];
    selectedNumber = null;
    
    const gameMode = document.getElementById("game-mode").value;
    const userData = JSON.parse(localStorage.getItem(currentUser));

    if (level > userData[gameMode].level) {
        alert("Bu seviye henüz kilitli!");
        return;
    }


    
    document.getElementById("level-selection").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    document.getElementById("summary-section").style.display = "none";
    
    if (gameMode === "elimination") {
        document.getElementById("addition-input").style.display = "none";
        document.getElementById("options").style.display = "block";
        generateEliminationQuestion(level);
    } else {
        document.getElementById("addition-input").style.display = "block";
        document.getElementById("options").style.display = "none";
        generateQuestion(level);
        
        // Enter tuşu ile cevap kontrolü için input eventini ekle
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
    }
    
    updateScoreDisplay();
}


// Nesnelerin tanımları
const items = {
    book: { 
        icon: '<i class="fas fa-book"></i>', 
        name: 'kitap',
        color: '#3b82f6' // blue-500
    },
    car: { 
        icon: '<i class="fas fa-car"></i>', 
        name: 'araba',
        color: '#ef4444' // red-500
    },
    apple: { 
        icon: '<i class="fas fa-apple-alt"></i>', 
        name: 'elma',
        color: '#22c55e' // green-500
    },
    pencil: { 
        icon: '<i class="fas fa-pencil-alt"></i>', 
        name: 'kalem',
        color: '#eab308' // yellow-500
    },
    ball: { 
        icon: '<i class="fas fa-baseball-ball"></i>', 
        name: 'top',
        color: '#ec4899' // pink-500
    },
    star: { 
        icon: '<i class="fas fa-star"></i>', 
        name: 'yıldız',
        color: '#f97316' // orange-500
    }
};

const itemTypes = Object.keys(items);

// Toplama Oyunu Fonksiyonları
function generateQuestion(level) {
    let num1, num2;
    const progressText = document.getElementById("progress-text");
    progressText.textContent = `Soru ${currentQuestionNumber}/${totalQuestionsPerLevel}`;

    // Seviye 1 için görsel toplama soruları
    if (level === 1) {
        num1 = Math.floor(Math.random() * 10) + 1; // 1-5 arası
        num2 = Math.floor(Math.random() * 10) + 1; // 1-5 arası
        
        const item1Index = Math.floor(Math.random() * itemTypes.length);
        let item2Index;
        do {
            item2Index = Math.floor(Math.random() * itemTypes.length);
        } while (item2Index === item1Index);

        const item1 = items[itemTypes[item1Index]];
        const item2 = items[itemTypes[item2Index]];

        // Daha kompakt HTML yapısı
        const visualQuestion = `
            <div class="visual-question">
                <div class="item-group">
                    <div class="items-container" style="background-color: ${item1.color}15;">
                        ${Array(num1).fill(item1.icon).map(icon => `<span class="item-icon">${icon}</span>`).join('')}
                    </div>
                    <span class="item-label">${num1} tane ${item1.name}</span>
                </div>
                
                <div class="operator">+</div>
                
                <div class="item-group">
                    <div class="items-container" style="background-color: ${item2.color}15;">
                        ${Array(num2).fill(item2.icon).map(icon => `<span class="item-icon">${icon}</span>`).join('')}
                    </div>
                    <span class="item-label">${num2} tane ${item2.name}</span>
                </div>
                
                <div class="operator">=</div>
                
                
            </div>
        `;

        document.getElementById("question").innerHTML = visualQuestion;
    } else {
        // Diğer seviyeler için normal sayısal sorular
        switch (level) {
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
        
        const questionText = `${num1} + ${num2} = ?`;
        document.getElementById("question").textContent = questionText;
    }

    currentAnswer = num1 + num2;
    
    const answerInput = document.getElementById("answer");
    if (answerInput) {
        answerInput.value = "";
        answerInput.disabled = false;
        answerInput.focus();
    }
    
    questionHistory.push({
        questionNumber: currentQuestionNumber,
        question: level === 1 ? "Görsel toplama sorusu" : `${num1} + ${num2} = ?`,
        correctAnswer: currentAnswer,
        userAnswer: null,
        isCorrect: null
    });

    hideAlert();
    updateScoreDisplay();
    startTimer();
}

function checkAnswer() {

    stopTimer(); // Timer'ı durdu

    const answerInput = document.getElementById("answer");
    const userAnswer = parseInt(answerInput.value);
    const userData = JSON.parse(localStorage.getItem(currentUser));
    const gameMode = document.getElementById("game-mode").value;

    
    
    if (!isNaN(userAnswer)) {
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
            setTimeout(() => {
                showSummary();
            }, 1500);
        }
    } else {
        showAlert("Lütfen bir sayı girin!", false);
    }
}

// Eleme Oyunu Fonksiyonları
function generateEliminationQuestion(level) {
    let numbers = [];
    let max = 9;
    let min = 1;
    
    switch(level) {
        case 2: 
            max = 12; min = 3; 
            break;
        case 3: 
            max = 15; min = 5; 
            break;
        case 4: 
            max = 18; min = 8; 
            break;
        case 5: 
            max = 20; min = 10; 
            break;
    }
    
    while(numbers.length < 3) {
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        if(!numbers.includes(num)) {
            numbers.push(num);
        }
    }

    let index1 = Math.floor(Math.random() * 3);
    let index2;
    do {
        index2 = Math.floor(Math.random() * 3);
    } while(index2 === index1);

    let sum = numbers[index1] + numbers[index2];
    
    document.getElementById("progress-text").textContent = 
        `Soru ${currentQuestionNumber}/${totalQuestionsPerLevel}`;

    const questionText = `${numbers[0]} + ${numbers[1]} + ${numbers[2]} = ${sum}`;
    document.getElementById("question").textContent = questionText;

    const optionsContainer = document.getElementById("options");
    optionsContainer.style.display = "block";
    optionsContainer.innerHTML = `
        <div class="d-grid gap-2">
            <button type="button" class="option-button" onclick="selectOption(${numbers[0]})">${numbers[0]}</button>
            <button type="button" class="option-button" onclick="selectOption(${numbers[1]})">${numbers[1]}</button>
            <button type="button" class="option-button" onclick="selectOption(${numbers[2]})">${numbers[2]}</button>
        </div>
    `;

    currentAnswer = numbers.find(num => 
        num !== numbers[index1] && num !== numbers[index2]
    );

    questionHistory.push({
        questionNumber: currentQuestionNumber,
        question: questionText,
        correctAnswer: currentAnswer,
        userAnswer: null,
        isCorrect: null
    });

    selectedNumber = null;
    hideAlert();
    updateScoreDisplay();
    startTimer();  // Timer'ı başlat
}

function selectOption(number) {
    selectedNumber = number;
    
    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach(button => {
        button.classList.remove('selected');
        button.disabled = true; // Tüm butonları devre dışı bırak
        if (parseInt(button.textContent) === number) {
            button.classList.add('selected');
        }
    });

    // Seçim yapılır yapılmaz kontrolü başlat
    checkEliminationAnswer(number);
}

function checkEliminationAnswer(selectedNumber) {

    stopTimer(); // Timer'ı durdur

    const currentQuestion = questionHistory[currentQuestionNumber - 1];
    currentQuestion.userAnswer = selectedNumber;
    currentQuestion.isCorrect = selectedNumber === currentAnswer;
    
    const buttons = document.querySelectorAll('.option-button');
    
    if (selectedNumber === currentAnswer) {
        currentScore += 10;
        correctCount++;
        showAlert("Doğru cevap! (+10 puan)", true);
        buttons.forEach(button => {
            if (parseInt(button.textContent) === selectedNumber) {
                button.classList.add('correct');
            }
        });
    } else {
        currentScore -= 5;
        wrongCount++;
        showAlert(`Yanlış cevap! (-5 puan) Doğru cevap: ${currentAnswer}`, false);
        buttons.forEach(button => {
            if (parseInt(button.textContent) === selectedNumber) {
                button.classList.add('wrong');
            }
            if (parseInt(button.textContent) === currentAnswer) {
                button.classList.add('correct');
            }
        });
    }
    
    updateScoreDisplay();
    
    if (currentQuestionNumber < totalQuestionsPerLevel) {
        setTimeout(() => {
            currentQuestionNumber++;
            generateEliminationQuestion(currentLevel);
        }, 1500);
    } else {
        setTimeout(() => {
            showSummary();
        }, 1500);
    }
}

// Ortak Yardımcı Fonksiyonlar
function showSummary() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("summary-section").style.display = "block";
    
    document.getElementById("final-total-score").textContent = currentScore;
    
    const tableBody = document.getElementById("summary-table-body");
    tableBody.innerHTML = '';
    
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

    // Oyun modunu al
    const gameMode = document.getElementById("game-mode").value;

    // Kullanıcı verilerini al
    let userData = JSON.parse(localStorage.getItem(currentUser));

    // Minimum geçme puanını hesapla
    const requiredScore = totalQuestionsPerLevel * 10;
    const passingScore = requiredScore * 0.7;
    
    // Seviye atlama kontrolü
    if (currentScore >= passingScore) {
        // Mevcut seviyedeyse ve başarılıysa seviye atlat
        if (currentLevel === userData[gameMode].level) {
            userData[gameMode].level = Math.min(currentLevel + 1, 5);
            
            // Tamamlanan seviyelere ekle
            if (!userData[gameMode].completedLevels.includes(currentLevel)) {
                userData[gameMode].completedLevels.push(currentLevel);
            }
        }

        // Yüksek skor kontrolü
        if (currentScore > (userData[gameMode].highScore || 0)) {
            userData[gameMode].highScore = currentScore;
        }

        // Değişiklikleri kaydet
        localStorage.setItem(currentUser, JSON.stringify(userData));

        // Başarı mesajı göster
        if (currentLevel < 5) {
            showAlert("Tebrikler! Bir sonraki seviye açıldı!", true);
        } else {
            showAlert("Tebrikler! Son seviyeyi tamamladınız!", true);
        }
    } else {
        showAlert("Seviyeyi geçmek için daha yüksek puan almalısınız.", false);
    }

    // Seviye görünürlüğünü güncelle
    setTimeout(() => {
        updateLevelVisibility();
    }, 500);
}

function updateLevelVisibility() {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    const gameMode = document.getElementById("game-mode").value;
    const currentGameData = userData[gameMode];
    
    const levelButtons = document.querySelectorAll(".level-button");
    
    levelButtons.forEach((button, index) => {
        const level = index + 1;
        button.style.display = "block";
        
        if (level <= currentGameData.level) {
            button.disabled = false;
            button.classList.remove('btn-secondary');
            button.classList.add('btn-primary');
        } else {
            button.disabled = true;
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
        
        if (currentGameData.completedLevels.includes(level)) {
            button.innerHTML = `Seviye ${level} <span class="badge bg-success ms-2">Tamamlandı</span>`;
        } else if (level === currentGameData.level) {
            button.innerHTML = `Seviye ${level} <span class="badge bg-warning ms-2">Mevcut</span>`;
        } else {
            button.innerHTML = `Seviye ${level}`;
        }
    });
}

function updateScoreDisplay() {
    document.getElementById("current-score").textContent = currentScore;
    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("wrong-count").textContent = wrongCount;
}

function showAlert(message, isSuccess = false) {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "block";
    alertSection.innerHTML = `
        <div class="alert ${isSuccess ? 'alert-success' : 'alert-danger'}" role="alert">
            ${message}
        </div>`;
}

function hideAlert() {
    const alertSection = document.getElementById("alert-section");
    alertSection.style.display = "none";
    alertSection.innerHTML = '';
}

function exitToLevelSelection() {
    document.getElementById("summary-section").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    updateLevelVisibility();
}

function exitLevel() {

    clearInterval(timer); // Timer'ı temizle

    document.getElementById("game-section").style.display = "none";
    document.getElementById("level-selection").style.display = "block";
    
    // Her iki oyun modu için input ve seçenekleri sıfırla
    document.getElementById("answer").value = "";
    document.getElementById("options").style.display = "none";
    document.getElementById("addition-input").style.display = "none";
    
    hideAlert();
    
    currentQuestionNumber = 1;
    selectedNumber = null;
    
    const userData = JSON.parse(localStorage.getItem(currentUser));
    localStorage.setItem(currentUser, JSON.stringify(userData));
    updateLevelVisibility();
}


function exitToGameSelection() {

    clearInterval(timer); // Timer'ı temizle

    // Oyun bölümünü gizle, oyun seçim ekranını göster
    document.getElementById("game-section").style.display = "none";
    document.getElementById("summary-section").style.display = "none";
    document.getElementById("game-selection").style.display = "block";
    
    // Oyun verilerini sıfırla
    currentQuestionNumber = 1;
    currentScore = 0;
    correctCount = 0;
    wrongCount = 0;
    questionHistory = [];
    selectedNumber = null;
    
    // Input ve seçenekleri temizle
    if (document.getElementById("answer")) {
        document.getElementById("answer").value = "";
    }
    document.getElementById("options").style.display = "none";
    document.getElementById("addition-input").style.display = "none";
    
    // Uyarıları temizle
    hideAlert();
}




// Timer başlatma fonksiyonu
function startTimer() {
    timeLeft = 20;
    updateTimerDisplay();
    
    clearInterval(timer); // Önceki timer'ı temizle
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Son 5 saniye için uyarı efekti
        if (timeLeft <= 5) {
            document.querySelector('.timer').classList.add('warning');
        }
        
        // Süre dolduğunda
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeOut();
        }
    }, 1000);
}

// Timer göstergesini güncelleme
function updateTimerDisplay() {
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.textContent = timeLeft;
    }
}

// Süre dolunca
function timeOut() {
    const gameMode = document.getElementById("game-mode").value;
    
    if (gameMode === "elimination") {
        // Eleme oyunu için
        const buttons = document.querySelectorAll('.option-button');
        buttons.forEach(button => button.disabled = true);
    } else {
        // Toplama oyunu için
        const answerInput = document.getElementById("answer");
        if (answerInput) {
            answerInput.disabled = true;
        }
    }
    
    showAlert("Süre doldu! (-5 puan)", false);
    currentScore -= 5;
    wrongCount++;
    updateScoreDisplay();
    
    setTimeout(() => {
        if (currentQuestionNumber < totalQuestionsPerLevel) {
            currentQuestionNumber++;
            const gameMode = document.getElementById("game-mode").value;
            if (gameMode === "elimination") {
                generateEliminationQuestion(currentLevel);
            } else {
                generateQuestion(currentLevel);
            }
        } else {
            showSummary();
        }
    }, 1500);
}

// Timer'ı durdur
function stopTimer() {
    clearInterval(timer);
    document.querySelector('.timer').classList.remove('warning');
}