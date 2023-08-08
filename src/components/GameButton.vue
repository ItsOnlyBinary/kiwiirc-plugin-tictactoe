<template>
    <div><div v-if="showButton" @click="buttonClicked">
        <a>Play Tic Tac Toe</a>
    </div></div>
</template>

<script>
/* global kiwi:true */

import * as Utils from '../libs/Utils.js';

export default {
    data() {
        return { count: 0 };
    },
    computed: {
        showButton() {
            // the count = count is to force the button to update when first game is created
            // eslint-disable-next-line no-unused-expressions
            this.count;

            /* eslint-disable no-undef */
            let buffer = kiwi.state.getActiveBuffer();
            let network = kiwi.state.getActiveNetwork();
            /* eslint-enable no-undef */

            // Don't show the button if they have a chat to them self
            if (network.nick === buffer.name) {
                return false;
            }

            // If there is no game show the button
            let game = Utils.getGame(buffer.name);
            if (!game) {
                return true;
            }

            // Decide if the button is needed or not
            let gameActive = game.getShowGame() && !game.getGameOver();
            let inviteActive = game.getInviteSent() || game.getShowInvite();
            let ret = !gameActive && !inviteActive;
            return ret;
        },
    },
    mounted() {
        this.listen(kiwi, 'plugin-tictactoe.update-button', () => {
            this.forceUpdateUI();
        });
    },
    methods: {
        forceUpdateUI() {
            this.count++;
        },
        buttonClicked() {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            let network = buffer.getNetwork();

            if (buffer.name === network.nick) {
                return;
            }

            if (!Utils.getGame(buffer.name)) {
                Utils.newGame(network, network.nick, buffer.name);
            }
            let game = Utils.getGame(buffer.name);

            let gameActive = game.getShowGame() && !game.getGameOver();
            let inviteActive = game.getInviteSent() && game.getShowInvite();
            if (gameActive || inviteActive) {
                return;
            }

            game.setInviteSent(true);
            if (!game.getInviteTimeout()) {
                game.setInviteTimeout(window.setTimeout(() => {
                    game.setInviteTimeout(null);
                    game.setInviteSent(false);

                    // eslint-disable-next-line no-undef
                    kiwi.state.addMessage(buffer, {
                        nick: '*',
                        message: 'The invite to ' + buffer.name +
                            ' has timed out :( maybe they don\'t have the Tic-Tac-Toe plugin?',
                        type: 'message',
                    });
                }, 4000));
            }
            this.forceUpdateUI();
            Utils.sendData(network, buffer.name, { cmd: 'invite' });
            // eslint-disable-next-line no-undef
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: buffer.name + ' has been invited to play Tic-Tac-Toe!',
                type: 'message',
            });
        },
    },
};
</script>
