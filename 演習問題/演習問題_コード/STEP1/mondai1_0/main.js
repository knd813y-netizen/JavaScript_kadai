var digitalClock_date = document.getElementById('digitalClock_date');
var digitalClock_time = document.getElementById('digitalClock_time');

function zeroPad(value) {
    return value.toString().padStart(2, '0');
}

function updateClock() {
    var now = new Date();
    var year = now.getFullYear();
    var month = zeroPad(now.getMonth() + 1);
    var date = zeroPad(now.getDate());
    var weekNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    var week = weekNames[now.getDay()];
    var hours = zeroPad(now.getHours());
    var minutes = zeroPad(now.getMinutes());
    var seconds = zeroPad(now.getSeconds());

    digitalClock_date.textContent = year + '.' + month + '.' + date + ' ' + week;
    digitalClock_time.textContent = hours + ':' + minutes + ':' + seconds;
}

updateClock();
setInterval(updateClock, 1000);