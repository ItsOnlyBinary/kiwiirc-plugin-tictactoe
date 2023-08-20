<script>
/* global kiwi:true */

/* eslint-disable no-multi-spaces */
const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6],            // Diagonal
];
/* eslint-enable no-multi-spaces */

export default kiwi.Vue.extend({
    data() {
        return {
            gameManager: null,
            buffer: null,
            localPlayer: null,
            remotePlayer: null,
            startPlayer: null,
            inviteTimeout: null,
            inviteSent: false,
            inviteReceived: false,
            inviteAccepted: false,
            inviteDeclined: false,
            inviteFailed: false,
            started: false,
            over: false,
            drawn: false,
            turn: 1,
            message: '',
            board: [],
        };
    },
    created() {
        for (let i = 0; i < 9; i++) {
            this.board.push({ id: i, val: '', win: false });
        }
    },
    computed: {
        isLocalTurn() {
            const turn = (this.turn % 2 === 0);
            return (this.startPlayer === this.localPlayer) ? !turn : turn;
        },
    },
    methods: {
        start(startPlayer) {
            this.startPlayer = startPlayer;
            this.started = true;
            this.setTurnMessage();
        },
        setTurnMessage() {
            this.message = this.isLocalTurn
                ? this.$t('plugin-tictactoe:turn')
                : this.$t('plugin-tictactoe:waiting', { nick: this.remotePlayer });
        },
        getMarker() {
            return this.turn % 2 === 0 ? 'O' : 'X';
        },
        incrementTurn() {
            this.turn++;
        },
        checkWin() {
            const board = this.board;

            for (let i = 0; i < winningLines.length; i++) {
                const line = winningLines[i];
                const [a, b, c] = line;

                if (board[a].val === '') {
                    continue;
                }

                if (board[a].val === board[b].val && board[a].val === board[c].val) {
                    return line;
                }
            }

            return null;
        },
        checkGame() {
            const line = this.checkWin();

            this.over = !!line || !this.board.some((a) => a.val === '');
            this.draw = this.over && !line;

            if (line) {
                const marker = this.board[line[0]].val;

                // Highlight winning line
                line.forEach((i) => (this.board[i].win = true));

                // Get winning nick
                const localStart = (this.startPlayer === this.localPlayer);
                const nick = ((localStart && marker === 'X') || (!localStart && marker === 'O'))
                    ? this.localPlayer
                    : this.remotePlayer;

                // Set win message
                this.message = this.$t('plugin-tictactoe:winner', { nick, marker });

                return;
            }

            if (this.draw) {
                this.message = this.$t('plugin-tictactoe:draw');
            }
        },
        inviteSend() {
            this.inviteSent = true;
            this.sendData({ cmd: 'invite' });
            this.inviteTimeout = setTimeout(() => {
                this.inviteTimeout = null;
                this.inviteFailed = true;
            }, 4000);
        },
        inviteRespond(accepted) {
            if (!accepted) {
                this.inviteDeclined = true;
                this.sendData({ cmd: 'invite_declined' });
                this.gameManager.remove(this.remotePlayer);
                return;
            }

            const network = this.buffer.getNetwork();
            const startPlayer = Math.floor(Math.random() * 2) === 0
                ? network.nick
                : this.remotePlayer;

            this.inviteAccepted = true;
            this.start(startPlayer);
            this.sendData({
                cmd: 'invite_accepted',
                startPlayer,
            });
            this.gameManager.show();
        },
        sendData(data) {
            const network = this.buffer.getNetwork();
            const msg = new network.ircClient.Message('TAGMSG', this.remotePlayer);
            msg.prefix = network.nick;
            msg.tags['+kiwiirc.com/tictactoe'] = JSON.stringify(data);
            network.ircClient.raw(msg);
        },
    },
});
</script>
