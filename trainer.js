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

var moveNet = new network([16, 4]);
var generation = 0;

setTimeout(run, 500);
var scores = [];

var datEl0 = document.createElement("p");
var datEl1 = document.createElement("p");
var datEl2 = document.createElement("p");
var datEl3 = document.createElement("p");
var cont = document.getElementsByClassName("container")[0];
var body = document.getElementsByTagName("body")[0];
body.insertBefore(datEl0, cont);
body.insertBefore(datEl1, cont);
body.insertBefore(datEl2, cont);
body.insertBefore(datEl3, cont);



function run(){
    if(game.over){
    	learn(game.score, largestTile());
    	console.log('-----------------------');
    	console.log("Num moves: ", allMoves.length);
    	console.log("gen: ", generation);
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
    var cells = getValues();
    var out = moveNet.fire(cells);

    datEl0.innerHTML = out[0];
    datEl1.innerHTML = out[1];
    datEl2.innerHTML = out[2];
    datEl3.innerHTML = out[3];
    var moves = [];
    for(var i = 0; i < 4; i++){
	   moves.push({i: i, val: out[i]});
    }
    var sortedOut = moves.sort(function(a, b){
	   return b.val - a.val;
    });

    var temp = cells;
    var dir = 0;
	dir = sortedOut[0].i;
	game.move(dir);
	temp = getValues();

    var scoreDesired = [0,0,0,0];
    var moveDesired = getLast(moveOuts);
    moveDesired[dir] = moved(temp, cells) ? 1 : -1;
    moveNet.learn(moveDesired, moveOuts);

    setTimeout(run,0);
}

function moved(prev, cur){
    for(var i = 0; i < 16; i++){
	   if(prev[i] != cur[i]) return true;
    }
    return false;
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

function getLast(arr){
    return arr[arr.length - 1];
}