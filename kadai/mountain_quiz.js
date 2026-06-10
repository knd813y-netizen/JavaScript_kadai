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
        // Promise.allを使い、問題と山のJSONファイルを同時に読み込む
        const responses = await Promise.all([
            fetch("./data/questions.json"),
            fetch("./data/mountains.json")
        ]);

        // Promise.allの結果は配列で返るため、それぞれ分かりやすい名前の変数に入れる
        const questionResponse = responses[0];
        const mountainResponse = responses[1];

        // どちらかの読み込みに失敗した場合はエラーを投げる
        if (!questionResponse.ok || !mountainResponse.ok) {
            throw new Error("アプリで使用するデータを読み込めませんでした。");
        }

        // 読み込んだJSONをJavaScriptで扱える配列に変換する
        allQuestions = await questionResponse.json();
        allMountains = await mountainResponse.json();

        // 必要なデータがない場合はエラーを投げる
        if (allQuestions.length === 0 || allMountains.length === 0) {
            throw new Error("アプリで使用するデータがありません。");
        }

        // データの準備ができたらメニュー画面を表示する
        showMenu();
    } catch (error) {
        // 読み込み中に起きたエラーを画面とコンソールに表示する
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
    // valueが空文字でなければ、その項目は選択済み
    const categoryIsSelected = categorySelect.value !== "";
    const difficultyIsSelected = difficultySelect.value !== "";

    // カテゴリと難易度が両方選択されている時だけ開始ボタンを押せるようにする
    startButton.disabled = !(categoryIsSelected && difficultyIsSelected);

    // 現在の選択状態に合わせて、メニュー画面の案内を変更する
    if (categoryIsSelected && difficultyIsSelected) {
        menuMessage.textContent = "選択した条件で開始できます。";
    } else {
        menuMessage.textContent = "カテゴリと難易度を選択してください。";
    }
}

// 配列の問題順をランダムに並べ替えた新しい配列を返す
function shuffleQuestions(questions) {
    // 元の配列を直接変更しないよう、sliceメソッドでコピーを作る
    const shuffledQuestions = questions.slice();

    // 配列の後ろから順番に、ランダムな場所の問題と入れ替える
    for (let index = shuffledQuestions.length - 1; index > 0; index--) {
        // 0から現在のindexまでの中から、入れ替える場所をランダムに決める
        const randomIndex = Math.floor(Math.random() * (index + 1));

        // 現在の問題を一時保存して、ランダムに選んだ問題と入れ替える
        const temporaryQuestion = shuffledQuestions[index];
        shuffledQuestions[index] = shuffledQuestions[randomIndex];
        shuffledQuestions[randomIndex] = temporaryQuestion;
    }

    // ランダムに並べ替えた新しい配列を呼び出し元へ返す
    return shuffledQuestions;
}

// 問題の難易度に応じた得点を返す
function getDifficultyPoint(difficulty) {
    // 初級問題は1点として返す
    if (difficulty === "初級") {
        return 1;
    }

    // 中級問題は2点として返す
    if (difficulty === "中級") {
        return 2;
    }

    // 初級・中級以外の上級問題は3点として返す
    return 3;
}

// 指定された条件から出題する問題を決定してクイズを開始する
function startQuiz(settings) {
    // まずは、すべての問題を出題候補として用意する
    let filteredQuestions = allQuestions;

    // 完全ランダムではない場合、カテゴリと難易度で問題を絞り込む
    if (!settings.randomMode) {
        // filterメソッドで、すべての問題を1問ずつquestionに渡して確認する
        filteredQuestions = allQuestions.filter(function(question) {
            // 選択したカテゴリと難易度が、現在確認している問題と一致するか判定する
            // "all"が選択されている項目は、どの問題でも一致した扱いにする
            const categoryMatches = settings.category === "all" || question.category === settings.category;
            const difficultyMatches = settings.difficulty === "all" || question.difficulty === settings.difficulty;

            // カテゴリと難易度の両方が一致した問題だけ、新しい配列に残す
            return categoryMatches && difficultyMatches;
        });
    }

    // 条件に一致する問題がなければ、案内を表示してクイズを開始しない
    if (filteredQuestions.length === 0) {
        menuMessage.textContent = "選択した条件に一致する問題がありません。";
        return;
    }

    // 絞り込んだ問題の順番をランダムに並べ替える
    const shuffledQuestions = shuffleQuestions(filteredQuestions);

    // 「すべて」が選ばれていれば全問題数、それ以外なら選択された文字列を数値に変換する
    const requestedQuestionCount = settings.questionCount === "all"
        ? shuffledQuestions.length
        : Number(settings.questionCount);

    // 希望した問題数と実際に存在する問題数を比べ、小さい方を本当の出題数にする
    const actualQuestionCount = Math.min(requestedQuestionCount, shuffledQuestions.length);

    // 並べ替えた問題の先頭から、実際に出題する数だけを今回のクイズに使用する
    quizData = shuffledQuestions.slice(0, actualQuestionCount);

    // 新しいクイズを始めるため、問題番号や得点を初期状態に戻す
    currentQuestionIndex = 0;
    score = 0;
    weightedScore = 0;
    weightedMaxScore = 0;

    // 再挑戦ボタンで使えるように、今回の出題条件を保存する
    lastQuizSettings = settings;

    // 出題される全問題の、難易度別得点の合計を計算する
    quizData.forEach(function(question) {
        weightedMaxScore += getDifficultyPoint(question.difficulty);
    });

    // メニュー・中断確認・結果画面を隠し、クイズ回答画面を表示する
    menuBox.classList.add("hidden");
    interruptBox.classList.add("hidden");
    resultBox.classList.add("hidden");
    quizBox.classList.remove("hidden");

    // 出題条件に合わせて、画面上部に表示する案内を変更する
    if (requestedQuestionCount > filteredQuestions.length) {
        statusMessage.textContent = "条件に一致する問題が" + filteredQuestions.length + "問のため、全て出題します。";
    } else if (settings.randomMode) {
        statusMessage.textContent = "全カテゴリ・全難易度からランダムに出題します。";
    } else {
        statusMessage.textContent = "選択した条件からランダムに出題します。";
    }

    // 今回のクイズで使用する最初の問題を画面に表示する
    showQuestion();
}

// 現在の問題数と正解数を表示する
function updateProgress() {
    // 配列の番号は0から始まるため、表示する問題番号には1を足す
    progressText.textContent = (currentQuestionIndex + 1) + "問目 / 全" + quizData.length + "問 ｜ 正解 " + score + "問";
}

// 現在の問題を画面に表示する
function showQuestion() {
    // quizDataから、現在の問題番号に対応する1問を取り出す
    const question = quizData[currentQuestionIndex];

    // 現在の問題数と正解数を更新する
    updateProgress();

    // 取り出した問題のカテゴリ・難易度・問題文を画面に表示する
    categoryText.textContent = question.category + " / " + question.difficulty;
    questionText.textContent = question.question;

    // 前の問題で表示した選択肢・判定結果・解説を空にし、次へ進むボタンを隠す
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";
    nextButton.classList.add("hidden");

    // forEachメソッドで、現在の問題にある4つの選択肢を1つずつchoiceに渡す
    question.choices.forEach(function(choice) {
        // 選択肢として使用するbutton要素をJavaScriptで作る
        const button = document.createElement("button");
        button.className = "choice-button";
        button.textContent = choice;

        // 選択肢が押されたら、その選択肢の文章とボタンをcheckAnswerへ渡す
        button.addEventListener("click", function() {
            checkAnswer(choice, button);
        });

        // 完成した選択肢ボタンを、選択肢を表示する場所に追加する
        choices.appendChild(button);
    });
}

// 選んだ答えが正解かどうかを判定する
function checkAnswer(selectedChoice, selectedButton) {
    // 現在表示している問題と、画面に作られたすべての選択肢ボタンを取得する
    const question = quizData[currentQuestionIndex];
    const buttons = document.querySelectorAll(".choice-button");

    // 回答後にもう一度選べないよう、すべての選択肢ボタンを押せなくする
    buttons.forEach(function(button) {
        button.disabled = true;

        // 不正解でも正解がわかるよう、正解のボタンにcorrectクラスを追加する
        if (button.textContent === question.answer) {
            button.classList.add("correct");
        }
    });

    // 選んだ回答とJSONにある正解が一致した場合、正解数と難易度別得点を増やす
    if (selectedChoice === question.answer) {
        score++;
        weightedScore += getDifficultyPoint(question.difficulty);
        resultText.textContent = "正解です！";
    } else {
        // 不正解の場合は、押したボタンにincorrectクラスを追加して見た目を変える
        selectedButton.classList.add("incorrect");
        resultText.textContent = "不正解です。";
    }

    // 回答後の正解数を表示し、JSONにある問題の解説を表示する
    updateProgress();
    explanationText.textContent = question.explanation;

    // 最後の問題なら「結果を見る」、途中なら「次の問題へ」と表示する
    if (currentQuestionIndex === quizData.length - 1) {
        nextButton.textContent = "結果を見る";
    } else {
        nextButton.textContent = "次の問題へ";
    }

    // 回答が終わったため、次へ進むボタンを表示する
    nextButton.classList.remove("hidden");
}

// 難易度が混ざる出題かどうかを確認する
function usesWeightedScore() {
    // 完全ランダム、または難易度が「すべて」ならtrueを返す
    return lastQuizSettings.randomMode || lastQuizSettings.difficulty === "all";
}

// おすすめする山の難易度を決める
function getRecommendationDifficulty() {
    // 難易度を固定して出題した場合は、選択された難易度をそのまま返す
    if (!usesWeightedScore()) {
        return lastQuizSettings.difficulty;
    }

    // 難易度が混ざる場合は、獲得した難易度別得点の割合を計算する
    const weightedRatio = weightedScore / weightedMaxScore;

    // 難易度別得点が60%未満なら、初級の山をおすすめする
    if (weightedRatio < 0.6) {
        return "初級";
    }

    // 難易度別得点が60%以上90%未満なら、中級の山をおすすめする
    if (weightedRatio < 0.9) {
        return "中級";
    }

    // 難易度別得点が90%以上なら、上級の山をおすすめする
    return "上級";
}

// おすすめする山のグループを決める
function getScoreGroup() {
    // 難易度を指定した場合は、通常の正解数で判定する
    if (!usesWeightedScore()) {
        // 正解数が全問題数の半分以上なら「半分以上」を返す
        if (score >= quizData.length / 2) {
            return "半分以上";
        }

        // 半分に届かなかった場合は「半分未満」を返す
        return "半分未満";
    }

    // 難易度が混ざる場合は、難易度別得点の割合を6段階に分ける
    const weightedRatio = weightedScore / weightedMaxScore;

    // 下の判定は上から順番に確認され、条件に一致した時点で結果を返す
    // 40%未満の場合は、初級・半分未満の山を表示するため「半分未満」を返す
    if (weightedRatio < 0.4) {
        return "半分未満";
    }

    // 40%以上60%未満の場合は、初級・半分以上の山を表示する
    if (weightedRatio < 0.6) {
        return "半分以上";
    }

    // 60%以上75%未満の場合は、中級・半分未満の山を表示する
    if (weightedRatio < 0.75) {
        return "半分未満";
    }

    // 75%以上90%未満の場合は、中級・半分以上の山を表示する
    if (weightedRatio < 0.9) {
        return "半分以上";
    }

    // 90%以上100%未満の場合は、上級・半分未満の山を表示する
    if (weightedRatio < 1) {
        return "半分未満";
    }

    // 100%の場合は、上級・半分以上の山を表示する
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
    // 1つの山を表示するために必要なHTML要素をJavaScriptで作る
    const card = document.createElement("article");
    const name = document.createElement("h3");
    const meta = document.createElement("p");
    const description = document.createElement("p");

    // 作った要素にCSS用のクラスと、山データの文章を設定する
    card.className = "mountain-card";
    name.textContent = mountain.name;
    meta.className = "mountain-meta";
    meta.textContent = mountain.prefecture + " ｜ 標高 " + mountain.elevation + "m";
    description.className = "mountain-description";
    description.textContent = mountain.description;

    // 山名・都道府県と標高・説明文を、山カードの中へ順番に追加する
    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(description);

    // 完成した山カードを呼び出し元へ返す
    return card;
}

// 結果に合ったおすすめの山を表示する
function showRecommendedMountains() {
    // クイズ結果から、おすすめする山の難易度と得点グループを決める
    const recommendationDifficulty = getRecommendationDifficulty();
    const scoreGroup = getScoreGroup();

    // filterメソッドで、判定結果と一致する山だけをおすすめ候補として残す
    const recommendedMountains = allMountains.filter(function(mountain) {
        return mountain.difficulty === recommendationDifficulty && mountain.scoreGroup === scoreGroup;
    });

    // おすすめ判定の結果を画面に表示する
    recommendationText.textContent = recommendationDifficulty + "・" + scoreGroup + "のあなたにおすすめの山";

    // 難易度が混ざった出題の場合は、判定に使用した難易度別得点も追加で表示する
    if (usesWeightedScore()) {
        recommendationText.textContent += "（難易度別得点 " + weightedScore + " / " + weightedMaxScore + "点で判定）";
    }

    // 前回表示した山カードが残らないよう、カードを並べる場所を空にする
    mountainTrack.innerHTML = "";

    // 同じ山カードを2周分追加し、途切れないスクロールにする
    recommendedMountains.concat(recommendedMountains).forEach(function(mountain) {
        // 山データからカードを作り、おすすめの山を並べる場所に追加する
        mountainTrack.appendChild(createMountainCard(mountain));
    });
}

// 全問題終了後に結果画面を表示する
function showResult() {
    // 画面上部の案内を、クイズ終了のメッセージに変更する
    statusMessage.textContent = "全問終了です。おつかれさまでした！";

    // クイズ回答画面を隠し、結果画面を表示する
    quizBox.classList.add("hidden");
    resultBox.classList.remove("hidden");

    // 全問題数と正解数を結果画面に表示する
    finalScoreText.textContent = quizData.length + "問中 " + score + "問正解！";

    // クイズ結果に合ったおすすめの山を表示する
    showRecommendedMountains();
}

// カテゴリまたは難易度が変更された時に選択状態を確認する
categorySelect.addEventListener("change", function() {
    // カテゴリが変更されるたびに、開始できる状態か確認する
    validateSelections();
});

difficultySelect.addEventListener("change", function() {
    // 難易度が変更されるたびに、開始できる状態か確認する
    validateSelections();
});

// 選択した条件で開始するボタンを押した時の処理
startButton.addEventListener("click", function() {
    // 画面で選択された条件を1つのオブジェクトにまとめ、startQuizへ渡す
    startQuiz({
        category: categorySelect.value,
        difficulty: difficultySelect.value,
        questionCount: questionCountSelect.value,
        randomMode: false
    });
});

// 完全ランダムで開始するボタンを押した時の処理
randomButton.addEventListener("click", function() {
    // カテゴリと難易度を「すべて」にし、完全ランダムモードとしてstartQuizへ渡す
    startQuiz({
        category: "all",
        difficulty: "all",
        questionCount: questionCountSelect.value,
        randomMode: true
    });
});

// 同じ条件でもう一度挑戦するボタンを押した時の処理
retryButton.addEventListener("click", function() {
    // 保存しておいた前回の出題条件を使い、もう一度クイズを開始する
    startQuiz(lastQuizSettings);
});

// メニューに戻るボタンを押した時の処理
menuButton.addEventListener("click", function() {
    // 結果画面を閉じ、出題条件を選ぶメニュー画面を表示する
    showMenu();
});

// 次の問題ボタンを押した時の処理
nextButton.addEventListener("click", function() {
    // まだ次の問題がある場合は、現在の問題番号を1つ増やして表示する
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // 最後の問題まで回答済みなら、結果画面を表示する
        showResult();
    }
});

// 中断ボタンを押した時に確認画面を表示する
interruptButton.addEventListener("click", function() {
    // クイズ回答画面を隠し、中断してよいか確認する画面を表示する
    quizBox.classList.add("hidden");
    interruptBox.classList.remove("hidden");
    statusMessage.textContent = "クイズの中断を確認しています。";
});

// クイズを続けるボタンを押した時に回答画面へ戻る
continueButton.addEventListener("click", function() {
    // 中断確認画面を隠し、回答途中のクイズ画面を再び表示する
    interruptBox.classList.add("hidden");
    quizBox.classList.remove("hidden");
    statusMessage.textContent = "クイズを続けます。";
});

// 中断を確定した時に進行状況を破棄してメニューへ戻る
confirmInterruptButton.addEventListener("click", function() {
    // 回答途中の問題や得点を初期状態に戻す
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;
    weightedScore = 0;
    weightedMaxScore = 0;
    // 中断処理が終わったらメニュー画面へ戻る
    showMenu();
});

// ページを開いた時に、最初にJSONデータの読み込みを開始する
loadData();
