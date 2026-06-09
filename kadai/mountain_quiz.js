// JSONから読み込んだ問題を入れる配列
let quizData = [];
// 表示している問題の番号 配列なので初期値は0
let currentQuestionIndex = 0;
// スコアの変数
let score = 0;

// indexからidの要素を取得し変数に入れ込む
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
        // AJAX
        // awaitで読み込みが完了するまで待つ
        const response = await fetch("./data/questions.json");

        // response.okがfalseの場合、エラーを投げる
        if (!response.ok) {
            throw new Error("問題データを読み込めませんでした。");
        }

        // JSONファイルで読み込んだものをquizDataに代入
        quizData = await response.json();
        // 問題を表示する関数の実行
        showQuestion();

    // 例外処理
    } catch (error) {
        // 画面にエラーメッセージを表示
        statusMessage.textContent = "問題データの読み込みに失敗しました。";
        // コンソールにエラーメッセージを表示
        console.error(error);
    }
}

// 現在の問題を画面に表示する
function showQuestion() {
    // quizDataの[currentQuestionIndex]番の問題をセット
    const question = quizData[currentQuestionIndex];

    // 問題表示後に回答の案内をするメッセージ
    statusMessage.textContent = "答えを1つ選んでください。";
    // removeでhiddenを外して問題を表示
    quizBox.classList.remove("hidden");
    // 問題のカテゴリとレベルの表示
    categoryText.textContent = question.category + " / " + question.difficulty;
    // 問題文の表示
    questionText.textContent = question.question;
    // 前の問題の選択肢・結果・解説が残らないように初期化する
    choices.innerHTML = "";
    resultText.textContent = "";
    explanationText.textContent = "";

    // JSONのchoicesの数だけ繰り返し
    // JSONのchoicesの中身をchoiceという変数で処理
    question.choices.forEach(function(choice) {
        // createElementで、選択肢ごとに新しいbutton要素を作成する
        // buttonには再代入しないためconstを使用する
        const button = document.createElement("button");

        // button要素にクラスの名前を付ける
        button.className = "choice-button";
        // button要素に選択肢のテキストを設定する
        button.textContent = choice;

        // 無名関数を使って、クリックされた選択肢を判定する
        button.addEventListener("click", function() {
            // checkAnswerを実行する
            // 引数として、選択肢の文字とbutton要素を渡す
            checkAnswer(choice, button);
        });

        // choices要素の子要素としてbutton要素を追加する
        choices.appendChild(button);
    });
}

// 選んだ答えが正解かどうかを判定する
// selectedChoiceには選択した答えの文字が渡される
// selectedButtonには選択したボタンの要素が渡される
function checkAnswer(selectedChoice, selectedButton) {
    // questionに現在表示している問題のデータを入れる
    const question = quizData[currentQuestionIndex];
    // choice-buttonクラスの要素をすべて取得する
    const buttons = document.querySelectorAll(".choice-button");

    // buttonsの中身をbuttonに繰り返し入れる
    buttons.forEach(function(button) {
        // 回答後に全ボタンを押せなくする
        button.disabled = true;

        // 正解のbuttonにcorrectクラスを追加して、正解用の色にする
        // 不正解でも正解がわかるようにしている
        if (button.textContent === question.answer) {
            button.classList.add("correct");
        }
    });

    // 回答者が選んだものとJSONのanswerが一致しているかどうか判定
    // 正解の場合
    if (selectedChoice === question.answer) {
        // インクリメントでスコアを1追加する
        score++;
        // 結果の表示
        resultText.textContent = "正解です！";
    } else {
        // 不正解の場合
        selectedButton.classList.add("incorrect");
        resultText.textContent = "不正解です。";
    }

    // 解説と得点の表示
    explanationText.textContent = question.explanation + " 現在の得点：" + score + "点";
}

loadQuestions();
