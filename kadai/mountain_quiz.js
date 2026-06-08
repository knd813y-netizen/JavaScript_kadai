let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

const statusMessage = document.getElementById("statusMessage");
const quizBox = document.getElementById("quizBox");
const categoryText = document.getElementById("categoryText");
const questionText = document.getElementById("questionText");
const choices = document.getElementById("choices");
const resultText = document.getElementById("resultText");
const explanationText = document.getElementById("explanationText");

// JSONファイルを読み込み、読み込みが終わったらクイズを表示する
async function loadQuestions() {
    try {
        const response = await fetch("./data/questions.json");

        if (!response.ok) {
            throw new Error("問題データを読み込めませんでした。");
        }

        quizData = await response.json();
        showQuestion();
    } catch (error) {
        statusMessage.textContent = "問題データの読み込みに失敗しました。";
        console.error(error);
    }
}

// 現在の問題を画面に表示する
function showQuestion() {
    const question = quizData[currentQuestionIndex];

    statusMessage.textContent = "答えを1つ選んでください。";
    quizBox.classList.remove("hidden");
    categoryText.textContent = question.category + " / " + question.difficulty;
    questionText.textContent = question.question;
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";

    question.choices.forEach(function(choice) {
        const button = document.createElement("button");

        button.className = "choice-button";
        button.textContent = choice;

        // 無名関数を使って、クリックされた選択肢を判定する
        button.addEventListener("click", function() {
            checkAnswer(choice, button);
        });

        choices.appendChild(button);
    });
}

// 選んだ答えが正解かどうかを判定する
function checkAnswer(selectedChoice, selectedButton) {
    const question = quizData[currentQuestionIndex];
    const buttons = document.querySelectorAll(".choice-button");

    buttons.forEach(function(button) {
        button.disabled = true;

        if (button.textContent === question.answer) {
            button.classList.add("correct");
        }
    });

    if (selectedChoice === question.answer) {
        score++;
        resultText.textContent = "正解です！";
    } else {
        selectedButton.classList.add("incorrect");
        resultText.textContent = "不正解です。";
    }

    explanationText.textContent = question.explanation + " 現在の得点：" + score + "点";
}

loadQuestions();
