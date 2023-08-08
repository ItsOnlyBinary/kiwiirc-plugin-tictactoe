<template>
    <div id="tictactoe">
        <div v-if="game.getShowInvite()"
             :style="{'margin-bottom': (game.getShowGame()? '6px' : '0')}" class="invite"
        >
            <span class="invite_text">You have been invited to play Tic-Tac-Toe</span>
            <div class="invite_button invite_button_accept" @click="inviteClicked(true)">
                Accept
            </div>
            <div class="invite_button invite_button_decline" @click="inviteClicked(false)">
                Decline
            </div>
        </div>
        <div v-if="game.getShowGame()">
            <table id="board">
                <tr v-for="(row, index) in game.getGameBoard()" :key="index">
                    <td v-for="(box, key) in row" :key="key"
                        :class="[ isViable(box) ? 'selectable' : '', box.win ? 'winner' : '' ]"
                        @click="boxClicked(box)"
                    >
                        {{box.val}}
                    </td>
                </tr>
            </table>
            <div class="message">{{game.getGameMessage()}}</div>
        </div>
    </div>
</template>

<script>

import * as Utils from '../libs/Utils.js';

export default {
    computed: {
        game: function game() {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            return Utils.getGame(buffer.name);
        },
    },
    methods: {
        isViable: function isViable(box) {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            let game = Utils.getGame(buffer.name);
            return (!game.getGameOver() && game.isMyTurn() && box.val === '');
        },
        boxClicked: function boxClicked(box) {
            if (this.isViable(box)) {
                // eslint-disable-next-line no-undef
                let buffer = kiwi.state.getActiveBuffer();
                let game = Utils.getGame(buffer.name);
                box.val = game.getMarker();
                Utils.sendData(buffer.getNetwork(), game.getRemotePlayer(), {
                    cmd: 'action', clicked: box.id, turn: game.getGameTurn(),
                });
                game.incrementGameTurn();
                game.checkGame();
                if (!game.getGameOver() && !game.isMyTurn()) {
                    game.setTurnMessage();
                }
            }
        },
        inviteClicked: function buttonClicked(accepted) {
            /* eslint-disable no-undef */
            let network = kiwi.state.getActiveNetwork();
            let remotePlayer = kiwi.state.getActiveBuffer().name;
            /* eslint-enable no-undef */

            let game = Utils.getGame(remotePlayer);
            game.setShowInvite(false);
            game.setInviteSent(false);
            if (accepted) {
                let startPlayer = Math.floor(Math.random() * 2) === 0 ? network.nick : remotePlayer;
                game.startGame(startPlayer);
                game.setTurnMessage();
                Utils.sendData(network, remotePlayer, {
                    cmd: 'invite_accepted', startPlayer: startPlayer,
                });
            } else {
                Utils.sendData(network, remotePlayer, { cmd: 'invite_declined' });
                // eslint-disable-next-line no-undef
                kiwi.emit('mediaviewer.hide');
            }
        },
    },
};
</script>

<style>
#tictactoe {
    position: relative;
    display: block;
    width: 100%;
    padding: 6px 0;
    text-align: center;
}

#tictactoe .invite {
    display: inline-flex;
    margin: 0 auto;
    font-size: 1.1em;
    font-weight: bold;
    align-items: center;
}

#tictactoe .invite_text {
    float: left;
    margin-right: 5px;
}

#tictactoe .invite_button {
    float: left;
    cursor: pointer;
    margin: 0 5px;
    padding: 1px 5px;
    border: 1px solid black;
    border-radius: 20px;
}

#tictactoe .invite_button_accept {
    background-color: #6bff5e;
}

#tictactoe .invite_button_decline {
    background-color: #ff3030;
}

#tictactoe table {
    margin: 0 auto;
    font-size: 5em;
    text-align: center;
    font-weight: bold;
    border-collapse: collapse;
}

#tictactoe .selectable {
    cursor: pointer;
}

#tictactoe .winner {
    background-color: #6bff5e;
}

#tictactoe .message {
    text-align: center;
    font-size: 1.4em;
    font-weight: bold;
    margin-top: 6px;
}

#tictactoe table td {
    border: 6px solid black;
    width: 90px;
    height: 90px;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
}

#tictactoe table tr:first-child td {
    border-top: 0;
}

#tictactoe table tr:last-child td {
    border-bottom: 0;
}

#tictactoe table tr td:first-child,
table tr th:first-child {
    border-left: 0;
}

#tictactoe table tr td:last-child,
table tr th:last-child {
    border-right: 0;
}
</style>
