// JSONから読み込んだすべての問題を入れる配列
let allQuestions = [];
// 選択された条件に合わせて出題する問題を入れる配列
let quizData = [];
// 表示している問題の番号 配列なので初期値は0
let currentQuestionIndex = 0;
// スコアの変数
let score = 0;
// 再挑戦する時に使用する、前回の出題条件
let lastQuizSettings = null;

// indexからidの要素を取得し変数に入れ込む
const statusMessage = document.getElementById("statusMessage");
const menuBox = document.getElementById("menuBox");
const categorySelect = document.getElementById("categorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const questionCountSelect = document.getElementById("questionCountSelect");
const menuMessage = document.getElementById("menuMessage");
const startButton = document.getElementById("startButton");
const randomButton = document.getElementById("randomButton");
const quizBox = document.getElementById("quizBox");
const progressText = document.getElementById("progressText");
const interruptButton = document.getElementById("interruptButton");
const categoryText = document.getElementById("categoryText");
const questionText = document.getElementById("questionText");
const choices = document.getElementById("choices");
const resultText = document.getElementById("resultText");
const explanationText = document.getElementById("explanationText");
const nextButton = document.getElementById("nextButton");
const interruptBox = document.getElementById("interruptBox");
const continueButton = document.getElementById("continueButton");
const confirmInterruptButton = document.getElementById("confirmInterruptButton");
const resultBox = document.getElementById("resultBox");
const finalScoreText = document.getElementById("finalScoreText");
const retryButton = document.getElementById("retryButton");
const menuButton = document.getElementById("menuButton");

// JSONファイルを読み込み、読み込みが終わったらメニューを表示する
async function loadQuestions() {
    try {
        // AJAX。awaitで読み込みが完了するまで待つ
        const response = await fetch("./data/questions.json");

        // response.okがfalseの場合、エラーを投げる
        if (!response.ok) {
            throw new Error("問題データを読み込めませんでした。");
        }

        allQuestions = await response.json();

        // 問題が1問もない場合はエラーを投げる
        if (allQuestions.length === 0) {
            throw new Error("問題データがありません。");
        }

        showMenu();
    } catch (error) {
        statusMessage.textContent = "問題データの読み込みに失敗しました。";
        console.error(error);
    }
}

// メニュー画面を表示する
function showMenu() {
    menuBox.classList.remove("hidden");
    quizBox.classList.add("hidden");
    interruptBox.classList.add("hidden");
    resultBox.classList.add("hidden");
    statusMessage.textContent = "出題条件を選んでクイズを開始してください。";
    validateSelections();
}

// カテゴリと難易度が両方選択されているか確認する
function validateSelections() {
    const categoryIsSelected = categorySelect.value !== "";
    const difficultyIsSelected = difficultySelect.value !== "";

    // 両方選択されるまで通常開始ボタンを押せないようにする
    startButton.disabled = !(categoryIsSelected && difficultyIsSelected);

    if (categoryIsSelected && difficultyIsSelected) {
        menuMessage.textContent = "選択した条件で開始できます。";
    } else {
        menuMessage.textContent = "カテゴリと難易度を選択してください。";
    }
}

// 配列の問題順をランダムに並べ替えた新しい配列を返す
function shuffleQuestions(questions) {
    const shuffledQuestions = questions.slice();

    for (let index = shuffledQuestions.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const temporaryQuestion = shuffledQuestions[index];
        shuffledQuestions[index] = shuffledQuestions[randomIndex];
        shuffledQuestions[randomIndex] = temporaryQuestion;
    }

    return shuffledQuestions;
}

// 指定された条件から出題する問題を決定してクイズを開始する
function startQuiz(settings) {
    let filteredQuestions = allQuestions;

    // 完全ランダムではない場合、カテゴリと難易度で問題を絞り込む
    if (!settings.randomMode) {
        filteredQuestions = allQuestions.filter(function(question) {
            const categoryMatches = settings.category === "all" || question.category === settings.category;
            const difficultyMatches = settings.difficulty === "all" || question.difficulty === settings.difficulty;

            return categoryMatches && difficultyMatches;
        });
    }

    if (filteredQuestions.length === 0) {
        menuMessage.textContent = "選択した条件に一致する問題がありません。";
        return;
    }

    const shuffledQuestions = shuffleQuestions(filteredQuestions);
    const requestedQuestionCount = settings.questionCount === "all"
        ? shuffledQuestions.length
        : Number(settings.questionCount);
    const actualQuestionCount = Math.min(requestedQuestionCount, shuffledQuestions.length);

    quizData = shuffledQuestions.slice(0, actualQuestionCount);
    currentQuestionIndex = 0;
    score = 0;
    lastQuizSettings = settings;

    menuBox.classList.add("hidden");
    interruptBox.classList.add("hidden");
    resultBox.classList.add("hidden");
    quizBox.classList.remove("hidden");

    if (requestedQuestionCount > filteredQuestions.length) {
        statusMessage.textContent = "条件に一致する問題が" + filteredQuestions.length + "問のため、全て出題します。";
    } else if (settings.randomMode) {
        statusMessage.textContent = "全カテゴリ・全難易度からランダムに出題します。";
    } else {
        statusMessage.textContent = "選択した条件からランダムに出題します。";
    }

    showQuestion();
}

// 現在の問題数と正解数を表示する
function updateProgress() {
    progressText.textContent = (currentQuestionIndex + 1) + "問目 / 全" + quizData.length + "問 ｜ 正解 " + score + "問";
}

// 現在の問題を画面に表示する
function showQuestion() {
    const question = quizData[currentQuestionIndex];

    // 現在の問題番号・全問題数・正解数を表示
    updateProgress();
    categoryText.textContent = question.category + " / " + question.difficulty;
    questionText.textContent = question.question;
    // 前の問題の選択肢・結果・解説が残らないように初期化する
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";
    nextButton.classList.add("hidden");

    // JSONのchoicesの数だけ繰り返す
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
        // 回答後に全ボタンを押せなくする
        button.disabled = true;

        // 不正解でも正解がわかるよう、正解のボタンにcorrectクラスを追加する
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

    // 回答直後の正解数に更新する
    updateProgress();
    explanationText.textContent = question.explanation;

    if (currentQuestionIndex === quizData.length - 1) {
        nextButton.textContent = "結果を見る";
    } else {
        nextButton.textContent = "次の問題へ";
    }

    nextButton.classList.remove("hidden");
}

// 次の問題ボタンを押した時の処理
nextButton.addEventListener("click", function() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResult();
    }
});

// 中断ボタンを押した時に確認画面を表示する
interruptButton.addEventListener("click", function() {
    quizBox.classList.add("hidden");
    interruptBox.classList.remove("hidden");
    statusMessage.textContent = "クイズの中断を確認しています。";
});

// クイズを続けるボタンを押した時に回答画面へ戻る
continueButton.addEventListener("click", function() {
    interruptBox.classList.add("hidden");
    quizBox.classList.remove("hidden");
    statusMessage.textContent = "クイズを続けます。";
});

// 中断を確定した時に進行状況を破棄してメニューへ戻る
confirmInterruptButton.addEventListener("click", function() {
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;
    showMenu();
});

// 全問題終了後に結果画面を表示する
function showResult() {
    statusMessage.textContent = "全問終了です。おつかれさまでした！";
    quizBox.classList.add("hidden");
    resultBox.classList.remove("hidden");
    finalScoreText.textContent = quizData.length + "問中 " + score + "問正解！";
}

// カテゴリまたは難易度が変更された時に選択状態を確認する
categorySelect.addEventListener("change", function() {
    validateSelections();
});

difficultySelect.addEventListener("change", function() {
    validateSelections();
});

// 選択した条件で開始するボタンを押した時の処理
startButton.addEventListener("click", function() {
    startQuiz({
        category: categorySelect.value,
        difficulty: difficultySelect.value,
        questionCount: questionCountSelect.value,
        randomMode: false
    });
});

// 完全ランダムで開始するボタンを押した時の処理
randomButton.addEventListener("click", function() {
    startQuiz({
        category: "all",
        difficulty: "all",
        questionCount: questionCountSelect.value,
        randomMode: true
    });
});

// 同じ条件でもう一度挑戦するボタンを押した時の処理
retryButton.addEventListener("click", function() {
    startQuiz(lastQuizSettings);
});

// メニューに戻るボタンを押した時の処理
menuButton.addEventListener("click", function() {
    showMenu();
});

loadQuestions();
