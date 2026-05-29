var fruitsListElm = document.getElementById("fruitsList");

var fruitsObj = {
    'キャベツ' : '春',
    'スイカ' : '夏',
    'ナス' : '秋',
    'ハクサイ' : '冬'
}

console.log(fruitsObj);

fruitsListElm.innerHTML = '<li>野菜 : 季節</li>';
for (var key in fruitsObj) {
    var value = fruitsObj[key];
    console.log(value);
    fruitsListElm.innerHTML += '<li>' + key + ' : ' + value + '</li>';
}

var fruitsListElm = document.getElementById("fruitsList");

var fruitsObj = {
    'キャベツ' : '春',
    'スイカ' : '夏',
    'ナス' : '秋',
    'ハクサイ' : '冬'
};

fruitsListElm.innerHTML = '<li>野菜 : 季節</li>';
for (var key in fruitsObj) {
    if (Object.prototype.hasOwnProperty.call(fruitsObj, key)) {
        var value = fruitsObj[key];
        console.log(key + ' : ' + value);
        fruitsListElm.innerHTML += '<li>' + key + ' : ' + value + '</li>';
    }
}

