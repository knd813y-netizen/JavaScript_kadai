// JSONから読み込んだすべての問題を入れる配列
let allQuestions = [];
// JSONから読み込んだおすすめの山を入れる配列
let allMountains = [];
// 選択された条件に合わせて出題する問題を入れる配列
let quizData = [];
// 表示している問題の番号 配列なので初期値は0
let currentQuestionIndex = 0;
// スコアの変数
let score = 0;
// 難易度が混ざる場合のおすすめ判定に使う得点
let weightedScore = 0;
let weightedMaxScore = 0;
// 再挑戦する時に使用する、前回の出題条件
let lastQuizSettings = null;

// indexからidの要素を取得し変数に入れ込む
// 画面上部に現在の状態や案内を表示する文章
const statusMessage = document.getElementById("statusMessage");
// カテゴリ・難易度・出題数を選択するメニュー画面
const menuBox = document.getElementById("menuBox");
// 出題するカテゴリを選択する欄
const categorySelect = document.getElementById("categorySelect");
// 出題する難易度を選択する欄
const difficultySelect = document.getElementById("difficultySelect");
// 出題する問題数を選択する欄
const questionCountSelect = document.getElementById("questionCountSelect");
// 選択状態などをメニュー画面に表示する文章
const menuMessage = document.getElementById("menuMessage");
// 選択した条件でクイズを開始するボタン
const startButton = document.getElementById("startButton");
// 全カテゴリ・全難易度からクイズを開始するボタン
const randomButton = document.getElementById("randomButton");
// 問題文や選択肢を表示するクイズ回答画面
const quizBox = document.getElementById("quizBox");
// 現在の問題数と正解数を表示する文章
const progressText = document.getElementById("progressText");
// クイズの中断確認画面を表示するボタン
const interruptButton = document.getElementById("interruptButton");
// 現在の問題のカテゴリと難易度を表示する文章
const categoryText = document.getElementById("categoryText");
// 現在の問題文を表示する文章
const questionText = document.getElementById("questionText");
// 4つの回答選択肢を表示する場所
const choices = document.getElementById("choices");
// 回答後に正解・不正解を表示する文章
const resultText = document.getElementById("resultText");
// 回答後に問題の解説を表示する文章
const explanationText = document.getElementById("explanationText");
// 次の問題または結果画面へ進むボタン
const nextButton = document.getElementById("nextButton");
// クイズを続けるか中断するか確認する画面
const interruptBox = document.getElementById("interruptBox");
// 中断せずクイズ回答画面へ戻るボタン
const continueButton = document.getElementById("continueButton");
// クイズの中断を確定してメニューへ戻るボタン
const confirmInterruptButton = document.getElementById("confirmInterruptButton");
// 正解数やおすすめの山を表示する結果画面
const resultBox = document.getElementById("resultBox");
// 最終的な正解数を表示する文章
const finalScoreText = document.getElementById("finalScoreText");
// おすすめ判定の結果を表示する文章
const recommendationText = document.getElementById("recommendationText");
// おすすめの山カードを並べる場所
const mountainTrack = document.getElementById("mountainTrack");
// 前回と同じ条件でもう一度クイズを開始するボタン
const retryButton = document.getElementById("retryButton");
// 結果画面からメニュー画面へ戻るボタン
const menuButton = document.getElementById("menuButton");

// 問題データとおすすめの山データを読み込み、メニューを表示する
async function loadData() {
    try {
        // 2つのJSONファイルを同時に読み込む
        const responses = await Promise.all([
            fetch("./data/questions.json"),
            fetch("./data/mountains.json")
        ]);
        const questionResponse = responses[0];
        const mountainResponse = responses[1];

        // どちらかの読み込みに失敗した場合はエラーを投げる
        if (!questionResponse.ok || !mountainResponse.ok) {
            throw new Error("アプリで使用するデータを読み込めませんでした。");
        }

        allQuestions = await questionResponse.json();
        allMountains = await mountainResponse.json();

        // 必要なデータがない場合はエラーを投げる
        if (allQuestions.length === 0 || allMountains.length === 0) {
            throw new Error("アプリで使用するデータがありません。");
        }

        showMenu();
    } catch (error) {
        statusMessage.textContent = "データの読み込みに失敗しました。";
        console.error(error);
    }
}

// メニュー画面を表示する
function showMenu() {
    // カテゴリ・難易度・出題数を選ぶメニュー画面を表示する
    menuBox.classList.remove("hidden");

    // 問題文や選択肢を表示するクイズ回答画面を非表示にする
    quizBox.classList.add("hidden");

    // クイズを続けるか中断するか確認する画面を非表示にする
    interruptBox.classList.add("hidden");

    // 正解数やおすすめの山を表示する結果画面を非表示にする
    resultBox.classList.add("hidden");

    // メニュー画面上部の案内メッセージを設定する
    statusMessage.textContent = "出題条件を選んでクイズを開始してください。";

    // 現在の選択状態を確認し、開始ボタンを押せるか判定する
    validateSelections();
}

// カテゴリと難易度が両方選択されているか確認する
function validateSelections() {
    // 選択しているvalueが空じゃないかどうか判定
    const categoryIsSelected = categorySelect.value !== "";
    const difficultyIsSelected = difficultySelect.value !== "";

    // カテゴリと難易度が選択されていれば開始ボタンを押せるようになる
    startButton.disabled = !(categoryIsSelected && difficultyIsSelected);

    // もし両方選択されていればifの文をテキストに表示
    // elseの場合、選択を促すテキストを表示
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

// 問題の難易度に応じた得点を返す
function getDifficultyPoint(difficulty) {
    if (difficulty === "初級") {
        return 1;
    }

    if (difficulty === "中級") {
        return 2;
    }

    return 3;
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
    weightedScore = 0;
    weightedMaxScore = 0;
    lastQuizSettings = settings;

    // 出題される全問題の、難易度別得点の合計を計算する
    quizData.forEach(function(question) {
        weightedMaxScore += getDifficultyPoint(question.difficulty);
    });

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

    updateProgress();
    categoryText.textContent = question.category + " / " + question.difficulty;
    questionText.textContent = question.question;
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";
    nextButton.classList.add("hidden");

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

        // 不正解でも正解がわかるよう、正解のボタンにcorrectクラスを追加する
        if (button.textContent === question.answer) {
            button.classList.add("correct");
        }
    });

    if (selectedChoice === question.answer) {
        score++;
        weightedScore += getDifficultyPoint(question.difficulty);
        resultText.textContent = "正解です！";
    } else {
        selectedButton.classList.add("incorrect");
        resultText.textContent = "不正解です。";
    }

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
    weightedScore = 0;
    weightedMaxScore = 0;
    showMenu();
});

// 難易度が混ざる出題かどうかを確認する
function usesWeightedScore() {
    return lastQuizSettings.randomMode || lastQuizSettings.difficulty === "all";
}

// おすすめする山の難易度を決める
function getRecommendationDifficulty() {
    if (!usesWeightedScore()) {
        return lastQuizSettings.difficulty;
    }

    const weightedRatio = weightedScore / weightedMaxScore;

    if (weightedRatio < 0.6) {
        return "初級";
    }

    if (weightedRatio < 0.9) {
        return "中級";
    }

    return "上級";
}

// おすすめする山のグループを決める
function getScoreGroup() {
    // 難易度を指定した場合は、通常の正解数で判定する
    if (!usesWeightedScore()) {
        if (score >= quizData.length / 2) {
            return "半分以上";
        }

        return "半分未満";
    }

    // 難易度が混ざる場合は、難易度別得点の割合を6段階に分ける
    const weightedRatio = weightedScore / weightedMaxScore;

    if (weightedRatio < 0.4) {
        return "半分未満";
    }

    if (weightedRatio < 0.6) {
        return "半分以上";
    }

    if (weightedRatio < 0.75) {
        return "半分未満";
    }

    if (weightedRatio < 0.9) {
        return "半分以上";
    }

    if (weightedRatio < 1) {
        return "半分未満";
    }

    return "半分以上";
}

/*
難易度が混ざる場合のおすすめ判定
  0%～39%  : 初級・半分未満
 40%～59%  : 初級・半分以上
 60%～74%  : 中級・半分未満
 75%～89%  : 中級・半分以上
 90%～99%  : 上級・半分未満
100%       : 上級・半分以上
*/

// おすすめの山カードを作成する
function createMountainCard(mountain) {
    const card = document.createElement("article");
    const name = document.createElement("h3");
    const meta = document.createElement("p");
    const description = document.createElement("p");

    card.className = "mountain-card";
    name.textContent = mountain.name;
    meta.className = "mountain-meta";
    meta.textContent = mountain.prefecture + " ｜ 標高 " + mountain.elevation + "m";
    description.className = "mountain-description";
    description.textContent = mountain.description;

    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(description);

    return card;
}

// 結果に合ったおすすめの山を表示する
function showRecommendedMountains() {
    const recommendationDifficulty = getRecommendationDifficulty();
    const scoreGroup = getScoreGroup();
    const recommendedMountains = allMountains.filter(function(mountain) {
        return mountain.difficulty === recommendationDifficulty && mountain.scoreGroup === scoreGroup;
    });

    recommendationText.textContent = recommendationDifficulty + "・" + scoreGroup + "のあなたにおすすめの山";

    if (usesWeightedScore()) {
        recommendationText.textContent += "（難易度別得点 " + weightedScore + " / " + weightedMaxScore + "点で判定）";
    }
    mountainTrack.innerHTML = "";

    // 同じ山カードを2周分追加し、途切れないスクロールにする
    recommendedMountains.concat(recommendedMountains).forEach(function(mountain) {
        mountainTrack.appendChild(createMountainCard(mountain));
    });
}

// 全問題終了後に結果画面を表示する
function showResult() {
    statusMessage.textContent = "全問終了です。おつかれさまでした！";
    quizBox.classList.add("hidden");
    resultBox.classList.remove("hidden");
    finalScoreText.textContent = quizData.length + "問中 " + score + "問正解！";
    showRecommendedMountains();
}

// カテゴリまたは難易度が変更された時に選択状態を確認する
// カテゴリ
categorySelect.addEventListener("change", function() {
    validateSelections();
});
// 難易度
difficultySelect.addEventListener("change", function() {
    validateSelections();
});

// 選択した条件で開始するボタンを押した時の処理
startButton.addEventListener("click", function() {
    // startQuizメソッドに
    // 回答者が選択したカテゴリ、難易度、問題数を引数にして渡す
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

loadData();
