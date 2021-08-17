const socket = io();
const boardBlock = document.querySelector('.board-block');
let blocked = true;

let Player1;
let player2;
let roomID;
let emptyCells = 9;

class Cell {
    constructor(i,j,ref) {
        this.row = i;
        this.col = j;
        this.mark = "";
        this.ref = ref;
    }
}

socket.on('room-full', (ID) => {
    roomID = ID;
    document.querySelector('.overlay').remove();
});

socket.on('mark', (mark) => {
    Player1 = mark;
    Player2 = mark == 'o'? 'x':'o';
    if(Player1 == 'x') {
        emptyCells++;
        toggleBoardBlock();
    } else {
        document.querySelector('.turn').innerHTML = Player2;
    }
    document.querySelector('.mark').innerHTML += Player1;
});


socket.on("opponentMove", ({row, col}) => {
    board[row][col].mark = Player2;
    board[row][col].ref.classList.add(Player2);
    toggleBoardBlock();
}); 

socket.on('draw', () => {drawScreen('Draw')});
socket.on('loss', () => {drawScreen("Loss")});

let cells = document.querySelectorAll('.cell');
let board = [];
for(let i=0; i<3; i++) {
    board.push([]);
    for(let j=0; j<3; j++) {
        board[i].push(new Cell(i,j,cells[3*i+j]));
        cells[3*i + j].addEventListener('click', (e) => {handleClick(e,i,j)});
    }
}

function handleClick(e, i, j) {
    board[i][j].mark = Player1;
    if(checkForWinner(i,j)) {
        socket.emit('win', roomID);
        drawScreen('Win');
    }
    e.target.classList.add(Player1);
    toggleBoardBlock();
    socket.emit('move', {i, j, roomID});
}

function toggleBoardBlock() {
    emptyCells--;
    if(!emptyCells) {
        socket.emit('draw', roomID);
    }
    const body = document.querySelector('body');
    const turn = document.querySelector('.turn');
    if(blocked) {
        turn.innerHTML = Player1;
        blocked = false;
        body.removeChild(boardBlock);
    } else {
        turn.innerHTML = Player2;
        blocked = true;
        body.appendChild(boardBlock);
    }
}

function checkForWinner(i,j) {
    if(board[i][0].mark != "" && board[i][0].mark == board[i][1].mark && board[i][1].mark == board[i][2].mark) {
        return true;
    } else if(board[0][j].mark != "" && board[0][j].mark === board[1][j].mark && board[1][j].mark === board[2][j].mark) {
        return true;
    } else if(board[0][0].mark != "" && board[0][0].mark === board[1][1].mark && board[1][1].mark === board[2][2].mark) {
        return true;
    } else if(board[0][2].mark != "" && board[0][2].mark === board[1][1].mark && board[1][1].mark === board[2][0].mark) {
        return true;
    }
    return false;
}

function drawScreen(status) {
    const endScreen = document.createElement('div');
    endScreen.classList.add("overlay");
    endScreen.innerHTML = `<h1>${status}</h1>`;
    document.querySelector('body').appendChild(endScreen);
}