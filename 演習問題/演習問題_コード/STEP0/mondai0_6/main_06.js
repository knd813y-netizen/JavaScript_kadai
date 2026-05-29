var numListElm = document.getElementById("numList");

for (var i = 1; i <= 10; i++) {
    // 1 から 10 までの数字を順番に画面とコンソールに出力する
    numListElm.innerHTML += '<li>' + i + '</li>';
    console.log(i);
}