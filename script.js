// ==UserScript==
// @name         My Fancy New Userscript
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        https://gabrielecirulli.github.io/2048/
// @grant        none
// @require      https://raw.githack.com/andnp/JavascriptNeuralNets/master/FeedforwardNet/sigNeuron.js
// @require      https://raw.githack.com/andnp/JavascriptNeuralNets/master/FeedforwardNet/layer.js
// @require      https://raw.githack.com/andnp/JavascriptNeuralNets/master/FeedforwardNet/network.js
// ==/UserScript==

var game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
game.restart();
//var LEFT = 3, UP = 0, RIGHT = 1, DOWN = 2;

var emptyNet = new network([16, 4]);
var scoreNet = new network([16, 8, 4]);
var lengthNet = new network([16, 8, 4]);
var largeNet = new network([16, 16, 4]);
var totalNet = new network([32, 18, 4]);
var generation = 0;

//setTimeout(function(){
//    for(var i = 0; i < 100; i++){
//        run();
//    }
//}, 1000);
setTimeout(run, 500);
var scores = [];

var allMoves = [];

function run(){
    if(game.over){
	learn(game.score, largestTile());
	console.log('-----------------------');
	console.log("Num moves: ", allMoves.length);
	console.log("gen: ", generation);
	console.log("score: ", game.score);
	allMoves = [];
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
    var cells = getValues();
    var emptyOuts = emptyNet.fire(cells);
    var scoreOuts = scoreNet.fire(cells);
    var lengthOuts = lengthNet.fire(cells);
    var largeOuts = largeNet.fire(cells);
    var allOuts = [];
    allOuts = allOuts.concat(emptyOuts[emptyOuts.length - 1], scoreOuts[scoreOuts.length - 1], lengthOuts[lengthOuts.length - 1], largeOuts[largeOuts.length - 1], cells);
    var outputs = totalNet.fire(allOuts);
    window.out = outputs[outputs.length - 1];
    var out = window.out;
    var moves = [];
    for(var i = 0; i < 4; i++){
	moves.push({i: i, val: out[i]});
    }
    var sortedOut = moves.sort(function(a, b){
	return b.val - a.val;
    });

    var temp = cells;
    var i = 0;
    var dir = 0;
    while(!moved(cells, temp)){
	dir = sortedOut[i].i;
	game.move(dir);
	i++;
	temp = getValues();
    }
    var endScore = game.score;
    var diffScore = endScore - startScore;

    var scoreComp = (diffScore / 60) - 1;

    var desired = [0,0,0,0];
    var emptyDesired = [0,0,0,0];
    var scoreDesired = [0,0,0,0];

    var emptyTilesComp = (getEmptyTiles(temp).length / 4) - 1;

    emptyDesired[dir] = emptyTilesComp;
    scoreDesired[dir] = scoreComp;
    //console.log(outputs[outputs.length - 1]);
    emptyNet.learn(emptyDesired, emptyOuts);
    scoreNet.learn(scoreDesired, scoreOuts);

    allMoves.push({dir: dir, outputs: outputs, lengthOuts: lengthOuts, largeOuts: largeOuts});
    setTimeout(run,0);
}

function learn(score, largest){
    for(var i = 0; i < allMoves.length; i++){
	var move = allMoves[i];
	var totalScoreComp = (Math.log2(score) / 8) - 1;
	var largestComp = (Math.log2(largest) / 8) - 1;
	var numMoves = (allMoves.length / 200) - 1;
	var desired = [0,0,0,0];
	var lengthDesired = [0,0,0,0];
	var largeDesired = [0,0,0,0];
	largeDesired[move.dir] = largestComp;
	lengthDesired[move.dir] = numMoves;
	desired[move.dir] = totalScoreComp;
	largeNet.learn(largeDesired, move.largeOuts);
	lengthNet.learn(lengthDesired, move.lengthOuts);
	totalNet.learn(desired, move.outputs);
    }
}

function getEmptyTiles(tiles){
    var empty = [];
    for(var i = 0; i < 16; i++){
	if(tiles[i] == 0) empty.push(tiles[i]);
    }
    return empty;
}

function moved(prev, cur){
    for(var i = 0; i < 16; i++){
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
    var ret = [];
    for(var i = 0; i < 4; i++){
	for(var j = 0; j < 4; j++){
	    ret.push(game.grid.cells[i][j] ? game.grid.cells[i][j].value : 0);
	}
    }
    var largest = Math.max.apply(null,ret);
    for(var i = 0; i < 16; i++){
	var temp = Math.log2(ret[i]) / Math.log2(largest);
	ret[i] = temp < 0 ? 0 : temp;
    }
    return ret;
}
