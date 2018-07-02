const winBoard = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
];

export default class TicTacToe {
    constructor(network, localPlayer, remotePlayer) {
        // eslint-disable-next-line no-undef
        this.data = new kiwi.Vue({
            data() {
                return {
                    network: network,
                    localPlayer: localPlayer,
                    remotePlayer: remotePlayer,
                    startPlayer: null,
                    inviteTimeout: null,
                    inviteSent: false,
                    showInvite: false,
                    showGame: false,
                    gameOver: false,
                    gameDraw: false,
                    gameTurn: 1,
                    gameWinner: '',
                    gameMessage: '',
                    gameBoard: [
                        [ // Row 1
                            { id: [0, 0], val: '', win: false },
                            { id: [0, 1], val: '', win: false },
                            { id: [0, 2], val: '', win: false },
                        ],
                        [ // Row 2
                            { id: [1, 0], val: '', win: false },
                            { id: [1, 1], val: '', win: false },
                            { id: [1, 2], val: '', win: false },
                        ],
                        [ // Row 3
                            { id: [2, 0], val: '', win: false },
                            { id: [2, 1], val: '', win: false },
                            { id: [2, 2], val: '', win: false },
                        ],
                    ],
                };
            },
        });
    }

    startGame(startPlayer) {
        this.data.startPlayer = startPlayer;
        this.data.showGame = true;
        this.data.gameOver = false;
        this.data.gameDraw = false;
        this.data.gameTurn = 1;
        this.data.gameWinner = '';
        this.data.gameMessage = '';
        this.data.gameBoard.forEach((row) => {
            row.forEach((cell) => {
                cell.val = '';
                cell.win = false;
            });
        });
    }

    checkGame() {
        const winboardValues = this.getWinboardValues();
        const isDraw = this.getBoardValues().every(x => x.every(y => y !== ''));
        let vector;

        winboardValues.forEach((x, ind) => {
            if (x.every(y => y === 'X')) {
                this.data.gameMessage = 'Winner: X';
                vector = winBoard[ind];
                this.data.gameOver = true;
            }

            if (x.every(y => y === 'O')) {
                this.data.gameMessage = 'Winner: O';
                vector = winBoard[ind];
                this.data.gameOver = true;
            }
        });

        if (!this.data.gameOver && isDraw) {
            this.data.gameMessage = 'Winner: Draw';
            this.data.gameDraw = true;
            this.data.gameOver = true;
        }

        if (this.data.gameOver) {
            this.setWinVector(vector);
        }
    }

    setWinVector(vector) {
        if (!this.data.gameDraw) {
            vector.forEach((x) => {
                this.data.gameBoard[x[0]][x[1]].win = true;
            });
        }
    }

    isMyTurn() {
        let turn = (this.data.gameTurn % 2 === 0);
        return (this.data.startPlayer === this.data.localPlayer) ? !turn : turn;
    }

    getMarker() {
        return this.data.gameTurn % 2 === 0 ? 'O' : 'X';
    }

    getNetwork() {
        return this.data.network;
    }

    setLocalPlayer(val) {
        this.data.setLocalPlayer = val;
    }

    getRemotePlayer() {
        return this.data.remotePlayer;
    }

    setRemotePlayer(val) {
        this.data.remotePlayer = val;
    }

    getStartPlayer() {
        return this.data.startPlayer;
    }

    setStartPlayer(val) {
        this.data.startPlayer = val;
    }

    getInviteTimeout() {
        return this.data.inviteTimeout;
    }

    setInviteTimeout(val) {
        this.data.inviteTimeout = val;
    }

    getInviteSent() {
        return this.data.inviteSent;
    }

    setInviteSent(val) {
        this.data.inviteSent = val;
    }

    getShowInvite() {
        return this.data.showInvite;
    }

    setShowInvite(val) {
        this.data.showInvite = val;
    }

    getShowGame() {
        return this.data.showGame;
    }

    setShowGame(val) {
        this.data.showGame = val;
    }

    getGameOver() {
        return this.data.gameOver;
    }

    setGameOver(val) {
        this.data.gameOver = val;
    }

    getGameTurn() {
        return this.data.gameTurn;
    }

    incrementGameTurn() {
        this.data.gameTurn++;
    }

    getGameBoard() {
        return this.data.gameBoard;
    }

    getGameMessage() {
        return this.data.gameMessage;
    }

    setGameMessage(val) {
        this.data.gameMessage = val;
    }

    setTurnMessage() {
        this.data.gameMessage = this.isMyTurn() ? 'Your Turn!' : 'Waiting for ' + this.data.remotePlayer;
    }

    getBoardValues() {
        return this.data.gameBoard.map(x => x.map(y => y.val));
    }

    getWinboardValues() {
        return winBoard.map(x => x.map(y => this.data.gameBoard[y[0]][y[1]].val));
    }
}
