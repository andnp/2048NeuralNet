var game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
game.restart();

var brain = new Brain();

setTimeout(run, 500);
var scores = [];

var datEl0 = document.createElement("p");
var datEl1 = document.createElement("p");
var datEl2 = document.createElement("p");
var cont = document.getElementsByClassName("container")[0];
var body = document.getElementsByTagName("body")[0];
body.insertBefore(datEl0, cont);
body.insertBefore(datEl1, cont);
body.insertBefore(datEl2, cont);

var moves = 0;
var generation = 0;

function run(){
    if(game.over){
        console.log('-----------------------');
        console.log("score: ", game.score);
        scores.push(game.score);
        var avg = 0;
        var rollingAvg = 0;
        for(var i = 0; i < scores.length; i++){
            avg += scores[i];
        }
        for(var i = scores.length - 1; i >= scores.length - 20 && i >= 0; i--){
            rollingAvg += scores[i];
        }
        console.log("avg: ", avg / scores.length);
        console.log("roll avg: ", rollingAvg / 20);
        game.restart();
        generation++;
        if(generation == 250000) {
            alert(scores);
            return;
        }
    }

    var startScore = game.score;
    var action = brain.forward(getValues());
    game.move(action);
    var endScore = game.score;
    var scoreDif = endScore - startScore ? endScore - startScore : 1;
    var reward = (Math.log2(scoreDif) / 11) > 1 ? 1 : (Math.log2(scoreDif) / 11);
    brain.backward(reward);

    var exp = brain.experiences;
    var countRand = 0;
    for(var i = 0; i < exp.length; i++){
    	if(exp[i].random) countRand++;
    }
    var countTotal = exp.length;
    datEl0.innerHTML = moves++;
    datEl1.innerHTML = countTotal;
    datEl2.innerHTML = countRand;
    var speed = 0;

    setTimeout(run,speed);
}

function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function getEmptyTiles(){
    var empty = [];
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
            if(game.grid.cells[i][j] == 0) empty.push(game.grid.cells[i][j]);
        }
    }
    return empty;
}

function moved(prev, cur){
    for(var i = 0; i < cur.length; i++){
       if(prev[i] != cur[i]) return true;
    }
    return false;
}

function largestTile(){
    var tiles = [];
    for(var i = 0; i < 4; i++){
    for(var j= 0; j < 4; j++){
        tiles.push(game.grid.cells[i][j] ? game.grid.cells[i][j].value : 0);
    }
    }
    return Math.max.apply(null, tiles);
}

function getValues(){
    var cells = [];
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
            cells.push(game.grid.cells[i][j] ? game.grid.cells[i][j].value : 0);
        }
    }
    //var largest = Math.max.apply(null,ret);
    var ret = [];
    for(var i = 0; i < 16; i++){
        var temp = Math.log2(cells[i]);
        cells[i] = temp < 0 ? 0 : temp;
        var arr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        arr[cells[i]] = 1;
        ret = ret.concat(arr);
    }
    return ret;
}

function getLast(arr){
    return arr[arr.length - 1];
}