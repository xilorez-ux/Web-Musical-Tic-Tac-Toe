// server.js
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = [];
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;

server.on('connection', (ws) => {
    clients.push(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'move' && isGameActive) {
            board[data.index] = currentPlayer;
            ws.send(JSON.stringify({ action: 'updateBoard', board }));
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            const winner = checkWinner();
            if (winner) {
                isGameActive = false;
                clients.forEach(client => client.send(JSON.stringify({ action: 'gameOver', winner })));
            }
        } else if (data.action === 'restart') {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            isGameActive = true;
            clients.forEach(client => client.send(JSON.stringify({ action: 'resetBoard', board })));
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

function checkWinner() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

console.log('WebSocket server is running on ws://localhost:8080');
