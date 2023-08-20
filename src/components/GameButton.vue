<template>
    <div v-if="showButton" @click="buttonClicked">
        <a>Play Tic-Tac-Toe</a>
    </div>
</template>

<script>
/* global kiwi:true */

import MessageTemplate from './MessageTemplate.vue';

export default {
    props: ['network', 'buffer', 'gameManager'],
    computed: {
        showButton() {
            // Don't show the button if they have a chat to them self
            if (this.network.nick === this.buffer.name) {
                return false;
            }

            // If there is no game show the button
            let game = this.gameManager.getWaitingOrActive(this.buffer.name);
            if (!game) {
                return true;
            }

            return game.inviteDeclined || game.over;
        },
    },
    methods: {
        buttonClicked() {
            const game = this.gameManager.create(this.buffer, this.network.nick, this.buffer.name);

            kiwi.state.addMessage(this.buffer, {
                nick: '',
                message: '',
                bodyTemplate: MessageTemplate,
                bodyTemplateProps: { game },
                type: 'message',
            });

            game.inviteSend();
        },
    },
};
</script>
