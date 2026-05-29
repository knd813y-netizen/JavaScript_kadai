var numElm = document.getElementById("num");

for (var i = 0; i < 10; i++) {
    // i は 0 から 9 まで動くので、1 から 10 を表示するには i + 1 を使います
    numElm.innerHTML += (i + 1) + "<br>";
}