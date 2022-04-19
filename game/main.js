var _ = require('lodash');

require("@babel/core").transform("code", {
    presets: ["@babel/preset-env"],
});

let GAME_TABLE = [];

const MATRIX_WIDTH  = 9;
const MATRIX_HEIGHT = 5;
const CASE_EMPTY    = 0;
const CASE_PLAYER_1 = 'X';
const CASE_PLAYER_2 = 'Y';

const showLine = array => array.map((element)=> {
    process.stdout.write('\t'+element);
});

const showMatrix = lines => matrix => matrix.map((element) => {
    lines(element);
    console.log('\n');
});

const showGameTable = table => showMatrix(showLine)(table);

const alternate = (a, b) => a.length ? [a[0], ...alternate(b, a.slice(1))] : b;

const buildPlayerLines = player => {
    const array = Array.from(Array(MATRIX_WIDTH));
    
    _.fill(array, player, 0, MATRIX_WIDTH);

    return array;
};

const buildMiddleLines = () => {
    const middle  = Math.trunc(MATRIX_WIDTH/2);
    const player1 = Array.from(Array(middle/2), () => CASE_PLAYER_1);
    const player2 = Array.from(Array(middle/2), () => CASE_PLAYER_2);
    return [
        ...alternate(player1, player2),
        CASE_EMPTY,
        ...alternate(player1, player2)
    ];
};

const restartGameBoard = () => {
    const middle = Math.trunc(MATRIX_HEIGHT/2);
    const array  = Array.from(Array(MATRIX_HEIGHT), () => Array(MATRIX_WIDTH));
    _.fill(array, buildPlayerLines(CASE_PLAYER_1), 0, middle);
    _.fill(array, buildMiddleLines(), middle, middle+1);
    _.fill(array, buildPlayerLines(CASE_PLAYER_2), middle+1, MATRIX_HEIGHT);
    return array;
};

const init = () => {
    GAME_TABLE = restartGameBoard();
}

console.log("\n\n**********************FANORONA************************");
console.log("**************************************************************************************\n\n");


//Initializing a game

init();

//Output formating
showGameTable(GAME_TABLE);
//Detecting piece position
//Detecting piece around
//Detecting piece target
//Can move a piece
//Moving piece
//Move effect
//Win condition
//Game rules


console.log("\n**************************************************************************************\n");
