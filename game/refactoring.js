var _ = require('lodash');

require("@babel/core").transform("code", {
    presets: ["@babel/preset-env"],
});

let TABLE_GAME = [];

const BOARD_WIDTH  = 9;
const BOARD_HEIGHT = 5;
const CASE_EMPTY    = '0';
const CASE_PLAYER_1 = '1';
const CASE_PLAYER_2 = '2';
const DIRECTIONS_ARRAY = ['tl','t','tr','l','c','r','bl','b','br'];


//Atomic functions

const alternateValues       = (a, b) => a.length ? [a[0], ...alternateValues(b, a.slice(1))] : b;
const rangeValues           = array => row => _.map(array, (el) => [row, el]);

const countElements         = array => _.countBy(_.flatMap(array));
const squareElements        = (start, end)  => _.flatMap(
    _.range(start, end), (el) => 
    rangeValues(_.range(start , end))(el)
);

const transposeElements     = source => target => value => target[_.findIndex(source, (el) => _.isEqual(el, value))];


//Element functions

const createLine = content => {
    const array = Array.from(Array(BOARD_WIDTH));
    
    _.fill(array, content, 0, BOARD_WIDTH);

    return array;
};

const createLineMiddle = () => {
    const quarter = Math.trunc(BOARD_WIDTH/4); 
    const player1 = Array.from(Array(quarter), () => CASE_PLAYER_1);
    const player2 = Array.from(Array(quarter), () => CASE_PLAYER_2);
    return [
        ...alternateValues(player1, player2),
        CASE_EMPTY,
        ...alternateValues(player1, player2)
    ];
};

const createBoardEmpty = () => {
    return Array.from(Array(BOARD_HEIGHT), () => createLine(CASE_EMPTY));
}


const buildBoardGame = () => {
    const middle = Math.trunc(BOARD_HEIGHT/2);
    const array  = Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH));
    _.fill(array, createLine(CASE_PLAYER_1), 0, middle);
    _.fill(array, createLineMiddle(), middle, middle+1);
    _.fill(array, createLine(CASE_PLAYER_2), middle+1, BOARD_HEIGHT);
    return array;
};

const getBoardIndexFromPosition  = (x, y) => x+y*BOARD_WIDTH;
const getBoardPositionFromIndex  = index  => [ index % BOARD_WIDTH , Math.trunc(index/BOARD_WIDTH)];
const getBoardValue              = (x, y) => board => _.flatMap(board)[getBoardIndexFromPosition(x, y)];
const isEmptyValue               = (x, y) => board => getBoardValue(x, y)(board) === CASE_EMPTY;

const transposePositionIntoDirection   = (x, y)    => transposeElements([...squareElements(-1, 2)])(DIRECTIONS_ARRAY)([y, x])
const transposeDirectionIntoPosition   = direction => transposeElements(DIRECTIONS_ARRAY)([...squareElements(-1, 2)])(direction);
const applyDirection                   = direction => (x, y) => [x+transposeDirectionIntoPosition(direction)[1], y+transposeDirectionIntoPosition(direction)[0]]
const applyFlatDirection               = direction => index  => applyDirection(direction)([...getBoardPositionFromIndex(index)]);

const addValueToBoard           = value  => board => (x, y) => (board[y]||[]).splice(x, 1, value);
const removeValueFromBoard      = (x, y) => board => addValueToBoard(CASE_EMPTY)(board)(x, y);

const moveBoard               = board  => (sourceX, sourceY) => (targetX, targetY) =>  {
    addValueToBoard(board[sourceY][sourceX])(board)(targetX, targetY);
    removeValueFromBoard(sourceX, sourceY)(board);    
}

const moveBoardToDirection      = (x, y) => direction => board  => moveBoard(board)(x, y)(...applyDirection(direction)(x, y));
const getBoardValuesAround      = (x, y) => board  =>  _.pull((_.map(squareElements(-1,2), (el) => (el[0]!=0 || el[1]!=0) && getBoardValue(x+el[1], y+el[0])(board)||-1)),-1);
const getBoardDirectionsFrom    = (x, y) => board  =>  _.pull(_.map(squareElements(-1,2), (el) => isEmptyValue(x+el[1], y+el[0])(board) && transposePositionIntoDirection(el[1], el[0])), 'c', false);

//Table functions

const moveTableToDirection      = (x, y) => direction => moveBoardToDirection(x, y)(direction)(TABLE_GAME)
const getTableValue             = (x, y) => getBoardValue(x, y)(TABLE_GAME);
const getTablePiecesAround      = (x, y) => getBoardValuesAround(x, y)(TABLE_GAME);
const getTableDirectionsFrom    = (x, y) => getBoardDirectionsFrom(x, y)(TABLE_GAME);


//Output functions

const printLine = array => array.map((element)=> {
    process.stdout.write('\t'+element);
});

const printLineUndisrupted = array => array.map((element)=> {
    process.stdout.write(element);
});

const printBoard = lines => board => board.map((element) => {
    lines(element);
    console.log('\n');
});


const showBoardCover = printBoard => {
    const cover = createLine('________');
    process.stdout.write('\t');
    printLineUndisrupted(cover);
    console.log('\n\n');
    printBoard();
    process.stdout.write('\t');
    printLineUndisrupted(cover);
    console.log('\n');
};

const showTableGame   = table => showBoardCover(() => { printBoard(printLine)(table) });

const showTableReport = table => {
    const {
        '1' : p1,
        '2' : p2,
        '0': emp,
    } = countElements(table);

    console.table({
        'Player 1': p1, 
        'Player 2': p2, 
        'Empty Cases':emp,
    });
};



//Executed functions
console.log("\n\n**********************FANORONA************************");

const init = () => {
    TABLE_GAME = buildBoardGame();
}

init();

showTableGame(TABLE_GAME);

console.log("\nGame Infos:");
showTableReport(TABLE_GAME);

// console.table(transposePositionToDirection(1, 1));

const y=3, x=4;
const direction = 'tr';
console.log('We start from');
console.table({x, y});
console.log('And direction', direction);
showTableGame(TABLE_GAME);

moveTableToDirection(x, y)(direction);
const newPosition = applyDirection(direction)(x, y);
console.table({newPosition});
showTableGame(TABLE_GAME);