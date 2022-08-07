const { green, white } = require('colors');
var _ = require('lodash');

require("@babel/core").transform("code", {
    presets: ["@babel/preset-env"],
});

const colors = require('colors');

let TABLE_GAME = [];

const BOARD_WIDTH   = 9;
const BOARD_HEIGHT  = 5;
const CASE_EMPTY    = '0';
const CASE_PLAYER_1 = '1';
const CASE_PLAYER_2 = '2';
const DIRECTIONS_ARRAY = ['tl','t','tr','l','c','r','bl','b','br'];

colors.enable();
colors.setTheme({
    silly:      'rainbow',
    input:      'grey',
    verbose:    'cyan',
    prompt:     'grey',
    info:       'green',
    data:       'grey',
    help:       'cyan',
    warn:       'yellow',
    debug:      'blue',
    error:      'red',
    primary:    ['bgBrightRed', 'bold', 'hidden'],
    secondary:  ['bgBrightBlue', 'bold', 'hidden'],
    neutral:    ['bgGrey','hidden'],
});


//Atomic functions

const alternateValues       = (a, b)        => a.length ? [a[0], ...alternateValues(b, a.slice(1))] : b;
const rangeValues           = array         => row => _.map(array, (el) => [row, el]);

const countElements         = array         => _.countBy(_.flatMap(array));
const squareElements        = (start, end)  => _.flatMap(_.range(start, end), (el) => rangeValues(_.range(start , end))(el));

const transposeElements     = source => target => value => target[_.findIndex(source, (el) => _.isEqual(el, value))];


//Element functions

const createLine            = width     => content          => Array.from(Array(width), () => content);
const createLineMultiple    = content   => (height, width)  => _.chunk(Array.from(Array(height*width), () => content), width);
const createLineMiddle      = width     => (content_1, content_2, content_center) => [
    ...alternateValues(Array.from(Array(Math.trunc(width/4)), 
    () => content_1),
    Array.from(Array(Math.trunc(width/4)), 
    () => content_2)),
    content_center,
    ...alternateValues(Array.from(Array(Math.trunc(width/4)), 
    () => content_1), 
    Array.from(Array(Math.trunc(width/4)), 
    () => content_2)),
];

//Start using defined constants

const buildBoardGame = () => [
    ...createLineMultiple(CASE_PLAYER_1)(Math.trunc(BOARD_HEIGHT/2), BOARD_WIDTH),
    createLineMiddle(BOARD_WIDTH)(CASE_PLAYER_1, CASE_PLAYER_2, CASE_EMPTY),
    ...createLineMultiple(CASE_PLAYER_2)(Math.trunc(BOARD_HEIGHT/2), BOARD_WIDTH),
];

const getBoardIndexFromPosition         = (x, y)    => x+y*BOARD_WIDTH;
const getBoardPositionFromIndex         = index     => [ index % BOARD_WIDTH , Math.trunc(index/BOARD_WIDTH)];
const getBoardValue                     = (x, y)    => board => _.flatMap(board)[getBoardIndexFromPosition(x, y)];
const isEmptyValue                      = (x, y)    => board => getBoardValue(x, y)(board) === CASE_EMPTY;

const transposePositionIntoDirection    = (x, y)    => transposeElements([...squareElements(-1, 2)])(DIRECTIONS_ARRAY)([y, x])
const transposeDirectionIntoPosition    = direction => transposeElements(DIRECTIONS_ARRAY)([...squareElements(-1, 2)])(direction);
const applyDirection                    = (x, y)    => direction =>  [x+transposeDirectionIntoPosition(direction)[1], y+transposeDirectionIntoPosition(direction)[0]];
const applyFlatDirection                = index     => direction =>  applyDirection([...getBoardPositionFromIndex(index)])(direction);

const addValueToBoard                   = (x, y)    => board => value  =>  (board[y]||[]).splice(x, 1, value);
const removeValueFromBoard              = (x, y)    => board => (board[y]||[]).splice(x, 1, CASE_EMPTY);
const removeValueMultipleFromBoard      = (x, y)    => direction => board => {

}

const moveBoard                 = board  => (sourceX, sourceY) => (targetX, targetY) =>  {
    addValueToBoard(targetX, targetY)(board)(board[sourceY][sourceX]);
    removeValueFromBoard(sourceX, sourceY)(board);    
    return board;
}

const moveBoardToDirection      = (x, y) => direction => board  => moveBoard(board)(x, y)(...applyDirection(x, y)(direction));
const getBoardValuesAround      = (x, y) => board  =>  _.pull((_.map(squareElements(-1,2), (el) => (el[0]!=0 || el[1]!=0) && getBoardValue(x+el[1], y+el[0])(board)||-1)),-1);
const getBoardDirectionsFrom    = (x, y) => board  =>  _.pull(_.map(squareElements(-1,2), (el) => isEmptyValue(x+el[1], y+el[0])(board) && transposePositionIntoDirection(el[1], el[0])), 'c', false);

//Table functions

const moveTableToDirection      = (x, y) => direction => moveBoardToDirection(x, y)(direction)(TABLE_GAME);
const getTableValue             = (x, y) => getBoardValue(x, y)(TABLE_GAME);
const getTablePiecesAround      = (x, y) => getBoardValuesAround(x, y)(TABLE_GAME);
const getTableDirectionsFrom    = (x, y) => getBoardDirectionsFrom(x, y)(TABLE_GAME);


//Output functions

const colorPiece = piece => ({    
    [CASE_PLAYER_1]:  piece.primary,
    [CASE_PLAYER_2]:  piece.secondary,
    [CASE_EMPTY]:     piece.neutral,
}[piece] || piece);

const printLine = array => array.map((element)=> {    
    process.stdout.write('\t'+colorPiece(element));
});

const printLineUndisrupted = array => array.map((element)=> {
    process.stdout.write(element.prompt.bgGrey);
});

const printBoard = lines => board => board.map((element) => {
    lines(element);
    console.log('\n');
});


const showBoardCover = printBoard => {
    process.stdout.write('\n');
    const cover = createLine(BOARD_WIDTH)('________');
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
        [CASE_PLAYER_1] : p1,
        [CASE_PLAYER_2] : p2,
        [CASE_EMPTY]    : emp,
    } = countElements(table);

    console.table({
        'Player 1': p1, 
        'Player 2': p2, 
        'Empty Cases':emp,
    });
};



//Executed functions
console.log("\n\n\t\t\t\t\t**********************FANORONA************************".prompt);

const init = () => {
    TABLE_GAME = buildBoardGame();    
}

init();

showTableGame(TABLE_GAME);

console.log("\nGame Infos:".prompt);
showTableReport(TABLE_GAME);

const y=1, x=4;
const direction = 'b';
console.log('We start from'.prompt);
console.table({x, y});
showTableGame(TABLE_GAME);

console.log('Moving piece from '.prompt, {x, y},'to direction '.prompt,  direction.bold);

moveTableToDirection(x, y)(direction);
showTableGame(TABLE_GAME);