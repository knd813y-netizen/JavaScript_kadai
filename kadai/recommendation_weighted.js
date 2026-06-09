// 難易度が混ざる出題で、おすすめの山を判定するための重み付き得点
let weightedScore = 0;
let weightedMaxScore = 0;

// 問題の難易度に応じた得点を返す
function getDifficultyWeight(difficulty) {
    const difficultyWeights = {
        "初級": 1,
        "中級": 2,
        "上級": 3
    };

    return difficultyWeights[difficulty] || 0;
}

// 難易度が「すべて」、または完全ランダムの場合だけ重み付き得点を使用する
function usesWeightedRecommendation() {
    return lastQuizSettings.randomMode || lastQuizSettings.difficulty === "all";
}

// 元のクイズ開始処理を残し、開始後に重み付き得点を初期化する
const originalStartQuizForRecommendation = startQuiz;
startQuiz = function(settings) {
    weightedScore = 0;
    weightedMaxScore = 0;

    originalStartQuizForRecommendation(settings);

    // 条件に合う問題がなく開始できなかった場合は計算しない
    if (!quizBox.classList.contains("hidden")) {
        weightedMaxScore = quizData.reduce(function(total, question) {
            return total + getDifficultyWeight(question.difficulty);
        }, 0);
    }
};

// 回答後、正解した問題の難易度に応じて重み付き得点を加算する
choices.addEventListener("click", function(event) {
    const selectedButton = event.target.closest(".choice-button");

    if (!selectedButton) {
        return;
    }

    const question = quizData[currentQuestionIndex];

    if (selectedButton.textContent === question.answer) {
        weightedScore += getDifficultyWeight(question.difficulty);
    }
});

const originalGetRecommendationDifficulty = getRecommendationDifficulty;
const originalGetScoreGroup = getScoreGroup;

// 難易度が混ざる場合は、重み付き得点率からおすすめの難易度を決める
getRecommendationDifficulty = function() {
    if (!usesWeightedRecommendation()) {
        return originalGetRecommendationDifficulty();
    }

    const weightedRatio = weightedScore / weightedMaxScore;

    if (weightedRatio < 0.6) {
        return "初級";
    }

    if (weightedRatio < 0.9) {
        return "中級";
    }

    return "上級";
};

// 重み付き得点率を6段階に分けるため、各難易度内の半分未満・半分以上も決める
getScoreGroup = function() {
    if (!usesWeightedRecommendation()) {
        return originalGetScoreGroup();
    }

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
};

// 難易度が混ざる場合は、結果画面に重み付き得点も表示する
const originalShowRecommendedMountains = showRecommendedMountains;
showRecommendedMountains = function() {
    originalShowRecommendedMountains();

    if (usesWeightedRecommendation()) {
        recommendationText.textContent += "（難易度別得点 " + weightedScore + " / " + weightedMaxScore + "点で判定）";
    }
};
