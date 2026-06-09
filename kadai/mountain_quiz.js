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
const categoryText = document.getElementById("categoryText");
const questionText = document.getElementById("questionText");
const choices = document.getElementById("choices");
const resultText = document.getElementById("resultText");
const explanationText = document.getElementById("explanationText");
const nextButton = document.getElementById("nextButton");
const resultBox = document.getElementById("resultBox");
const finalScoreText = document.getElementById("finalScoreText");
const retryButton = document.getElementById("retryButton");
const menuButton = document.getElementById("menuButton");

// JSONファイルを読み込み、読み込みが終わったらメニューを表示する
async function loadQuestions() {
    try {
        // AJAX
        // awaitで読み込みが完了するまで待つ
        const response = await fetch("./data/questions.json");

        // response.okがfalseの場合、エラーを投げる
        if (!response.ok) {
            throw new Error("問題データを読み込めませんでした。");
        }

        // JSONファイルで読み込んだ問題をallQuestionsに代入
        allQuestions = await response.json();

        // 問題が1問もない場合はエラーを投げる
        if (allQuestions.length === 0) {
            throw new Error("問題データがありません。");
        }

        // 問題の読み込み後にメニュー画面を表示する
        showMenu();

    // 例外処理
    } catch (error) {
        // 画面にエラーメッセージを表示
        statusMessage.textContent = "問題データの読み込みに失敗しました。";
        // コンソールにエラーメッセージを表示
        console.error(error);
    }
}

// メニュー画面を表示する
function showMenu() {
    menuBox.classList.remove("hidden");
    quizBox.classList.add("hidden");
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

    // 条件に一致する問題がない場合はメニューに案内を表示する
    if (filteredQuestions.length === 0) {
        menuMessage.textContent = "選択した条件に一致する問題がありません。";
        return;
    }

    const shuffledQuestions = shuffleQuestions(filteredQuestions);
    const requestedQuestionCount = settings.questionCount === "all"
        ? shuffledQuestions.length
        : Number(settings.questionCount);
    const actualQuestionCount = Math.min(requestedQuestionCount, shuffledQuestions.length);

    // ランダムに並べた問題から、実際に出題する問題数だけ取り出す
    quizData = shuffledQuestions.slice(0, actualQuestionCount);
    currentQuestionIndex = 0;
    score = 0;
    lastQuizSettings = settings;

    menuBox.classList.add("hidden");
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

// 現在の問題を画面に表示する
function showQuestion() {
    // quizDataの[currentQuestionIndex]番の問題をセット
    const question = quizData[currentQuestionIndex];

    // 現在の問題番号と全問題数を表示
    progressText.textContent = (currentQuestionIndex + 1) + "問目 / 全" + quizData.length + "問";
    // 問題のカテゴリとレベルの表示
    categoryText.textContent = question.category + " / " + question.difficulty;
    // 問題文の表示
    questionText.textContent = question.question;
    // 前の問題の選択肢・結果・解説が残らないように初期化する
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";
    // 回答するまでは次の問題ボタンを非表示にする
    nextButton.classList.add("hidden");

    // JSONのchoicesの数だけ繰り返し
    question.choices.forEach(function(choice) {
        // 選択肢ごとに新しいbutton要素を作成する
        const button = document.createElement("button");

        button.className = "choice-button";
        button.textContent = choice;

        // 無名関数を使って、クリックされた選択肢を判定する
        button.addEventListener("click", function() {
            checkAnswer(choice, button);
        });

        // choices要素の子要素としてbutton要素を追加する
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

    explanationText.textContent = question.explanation + " 現在の得点：" + score + "点";

    // 最後の問題ではボタンの文字を「結果を見る」に変更する
    if (currentQuestionIndex === quizData.length - 1) {
        nextButton.textContent = "結果を見る";
    } else {
        nextButton.textContent = "次の問題へ";
    }

    // 回答後に次の問題ボタンを表示する
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
