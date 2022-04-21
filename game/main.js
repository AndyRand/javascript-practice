var _ = require('lodash');

require("@babel/core").transform("code", {
    presets: ["@babel/preset-env"],
});

let GAME_TABLE = [];

const MATRIX_WIDTH  = 9;
const MATRIX_HEIGHT = 5;
const CASE_EMPTY    = '0';
const CASE_PLAYER_1 = '1';
const CASE_PLAYER_2 = '2';
const DIRECTIONS_ARRAY = ['tl','t','tr','l','c','r','bl','b','br'];


//Building the matrix
const alternate = (a, b) => a.length ? [a[0], ...alternate(b, a.slice(1))] : b;

const buildLine = content => {
    const array = Array.from(Array(MATRIX_WIDTH));
    
    _.fill(array, content, 0, MATRIX_WIDTH);

    return array;
};

const buildMiddleLine = () => {
    const quarter = Math.trunc(MATRIX_WIDTH/4); 
    const player1 = Array.from(Array(quarter), () => CASE_PLAYER_1);
    const player2 = Array.from(Array(quarter), () => CASE_PLAYER_2);
    return [
        ...alternate(player1, player2),
        CASE_EMPTY,
        ...alternate(player1, player2)
    ];
};

const buildEmptyBoard = () => {
    return Array.from(Array(MATRIX_HEIGHT), () => buildLine(CASE_EMPTY));
}

const addPiece  =  piece => table => (x, y) => (table[y]||[]).splice(x, 1, piece);
const emptyCase = table => (x, y) => addPiece(CASE_EMPTY)(table)(x, y);

const movePiece = table => (startX, startY) => (targetX, targetY) => {
    addPiece(table[startY][startX])(table)(targetX, targetY);
    addPiece(CASE_EMPTY)(table)(startX, startY);
}
const countPieces = array => _.countBy(_.flatMap(array));

console.log("\n\n**********************FANORONA************************");

//Initializing a game
const restartGameBoard = () => {
    const middle = Math.trunc(MATRIX_HEIGHT/2);
    const array  = Array.from(Array(MATRIX_HEIGHT), () => Array(MATRIX_WIDTH));
    _.fill(array, buildLine(CASE_PLAYER_1), 0, middle);
    _.fill(array, buildMiddleLine(), middle, middle+1);
    _.fill(array, buildLine(CASE_PLAYER_2), middle+1, MATRIX_HEIGHT);
    return array;
};

const init = () => {
    GAME_TABLE = restartGameBoard();
}

init();

//Output formating
const showLine = array => array.map((element)=> {
    process.stdout.write('\t'+element);
});

const showUndisruptedLine = array => array.map((element)=> {
    process.stdout.write(element);
});

const showMatrix = lines => matrix => matrix.map((element) => {
    lines(element);
    console.log('\n');
});

const showCover = showMatrix => {
    const cover = buildLine('________');
    process.stdout.write('\t');
    showUndisruptedLine(cover);
    console.log('\n\n');
    showMatrix();
    process.stdout.write('\t');
    showUndisruptedLine(cover);
    console.log('\n');
};

const showGameTable  = table => showCover(() => { showMatrix(showLine)(table) });
showGameTable(GAME_TABLE);
console.log("\nGame Infos:");

const {
    '1' : p1,
    '2' : p2,
    '0': emp,
} = countPieces(GAME_TABLE);

console.table({
    'Player 1': p1, 
    'Player 2': p2, 
    'Empty Cases':emp,
});

showUndisruptedLine(_.flatMapDeep(GAME_TABLE));

//Detecting piece position
const reduce        = (x, y) => x+y*MATRIX_WIDTH;
const reverse       = position => [ position % MATRIX_WIDTH , Math.trunc(position/MATRIX_WIDTH)];
const getValue      = (x, y) => table => _.flatMap(table)[reduce(x, y)];
const getValueAt    = (x, y) => getValue(x, y)(GAME_TABLE);

//A move is a set of directions and checks to apply
//The next move will depend on registered move positions and avalaible spaces around
//Moving to a direction should return a destination based on a source
//A direction is a function to apply to x,y 
const applyDirection = direction => ({
    t:  ([x, y]) => [x+0, y-1],
    tr: ([x, y]) => [x+1, y-1],
    rt: ([x, y]) => [x+1, y-1],
    r:  ([x, y]) => [x+1, y+0],
    br: ([x, y]) => [x+1, y+1],
    rb: ([x, y]) => [x+1, y+1],
    b:  ([x, y]) => [x+0, y+1],
    bl: ([x, y]) => [x-1, y+1],
    lb: ([x, y]) => [x-1, y+1],
    l:  ([x, y]) => [x-1, y+0],
    tl: ([x, y]) => [x-1, y-1],
    lt: ([x, y]) => [x-1, y-1],
}[direction] || (([x, y]) => [x, y]));

const applyFlatDirection    = direction => position     => applyDirection(direction)([...reverse(position)]);
const moveToDirection       = table     => direction    => (x, y) => movePiece(table)(x, y)(...applyDirection(direction)([x, y]));
const findUniquePiece       = table     => piece        => reverse(_.flatMapDeep(table).findIndex((value) => value === piece));
const getPieceAt            = table     => (x, y)       => (table[y]||[])[x];
const buildRange            = table     => x            => _.map(table, (el) => [x, el]);

const squareCombinatory     = (start, end)  => _.flatMap(
                                                    _.range(start, end), (el) => 
                                                    buildRange(_.range(start , end))(el)
                                                );

const getPiecesAround = table => (x, y) => _.pull((_.map(squareCombinatory(-1,2), 
                                 (el)   => (el[0]!=0 || el[1]!=0) && getPieceAt(table)(x+el[1], y+el[0])||-1)),-1);

const getDirections = (x, y) => DIRECTIONS_ARRAY[_.findIndex(squareCombinatory(-1, 2), (el) => _.isEqual(el, [y, x]))];

const checkContent = value => table => (x,y) => getPieceAt(table)(x,y) === value;
const checkEmptyContent = checkContent(CASE_EMPTY);
//Returns all directions where there is no piece 
const getAvalaibleDirectionsFrom = table => (x, y) => _.pull(_.map(squareCombinatory(-1, 2), (el) => checkEmptyContent(table)(x+el[1], y+el[0]) && getDirections(el[1], el[0])), 'c', false);

const y=3, x=4;
const flat = 22;
console.log("Reverse of "+ flat +" = ", reverse(flat));
console.log("Value at x,y", getValueAt(x, y));

//Applying directions
const direction = 'tr';
const newPosition = applyDirection(direction)([x,y]);
console.table({x, y});
console.log("Applying direction ", direction);
console.table({newPosition});
console.log("Flat direction of", flat);
console.log("Converting flat ", reverse(flat));
const newFlatPosition = applyFlatDirection(direction)(flat);
console.table({newFlatPosition});

/*
    let newBoard = buildEmptyBoard();
    const piece = 'X';
    const addXPiece = addPiece(piece);
    addXPiece(newBoard)(x, y);
    showGameTable(newBoard);
    moveToDirection(newBoard)('b')(x, y);
    showGameTable(newBoard);
    moveToDirection(newBoard)('tl')(...findUniquePiece(newBoard)(piece));
    showGameTable(newBoard);
    moveToDirection(newBoard)('tr')(...findUniquePiece(newBoard)(piece));
    showGameTable(newBoard);
    moveToDirection(newBoard)('l')(...findUniquePiece(newBoard)(piece));
    showGameTable(newBoard);
    moveToDirection(GAME_TABLE)('b')(x, y);
    showGameTable(GAME_TABLE);
*/

//Detecting piece around
console.log("Pieces around", x, y);
console.table(getPiecesAround(GAME_TABLE)(x, y));
const dirX = -1, dirY = 1;

emptyCase(GAME_TABLE)(3, 3);
emptyCase(GAME_TABLE)(3, 5);
console.log("NEW BOARD");
showGameTable(GAME_TABLE);
console.log("Avalaible DIRECTIONS from", x, y);
console.log(getAvalaibleDirectionsFrom(GAME_TABLE)(x, y));

//Detecting piece target
//Can move a piece
//Moving piece
//Move effect
//Win condition
//Game rules

console.log("\n**************************************************************************************\n");
