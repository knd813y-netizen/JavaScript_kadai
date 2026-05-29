var button = document.getElementById('btn');
button.addEventListener('click', function() {

    var pointElm = document.getElementById('point');
    var pointval = pointElm.value;
    var point = parseInt(pointval);

    if (point >= 80) {
        alert('合格です')
    } else {
        alert('不合格です')
    }
});