<template>
    <div v-if="showButton" @click="buttonClicked">
        <a v-if="$state.ui.app_width > 769 && !forceIcon">Play Tic-Tac-Toe</a>
        <a v-else class="tictactoe-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                <path
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0m-1 6h18m-9-9v18m-8-5l4 4m-4 0l4-4m8-12l4
                    4m-4 0l4-4m-4 14a2 2 0 1 0 4 0a2 2 0 1 0-4 0"
                />
            </svg>
        </a>
    </div>
</template>

<script>
/* global kiwi:true */

import * as config from '@/config.js';

import MessageTemplate from './MessageTemplate.vue';

export default {
    props: ['network', 'buffer', 'gameManager'],
    computed: {
        forceIcon() {
            return config.setting('forceIcon');
        },
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

<style>
.kiwi-header-option .tictactoe-button {
    height: 43px;
    display: flex;
    align-items: center;
    stroke: var(--brand-default-fg);
}
</style>
