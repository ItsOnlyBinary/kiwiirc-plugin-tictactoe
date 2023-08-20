<template>
    <div class="plugin-tictactoe-msg">
        <div v-if="game.over">{{ game.message }}</div>
        <div v-else-if="game.inviteFailed">{{
            $t('plugin-tictactoe:invite_failed', { nick: buffer.name })
        }}</div>
        <template v-else-if="game.inviteSent">
            <div v-if="game.inviteAccepted">{{
                $t('plugin-tictactoe:invite_accepted', { nick: buffer.name })
            }}</div>
            <div v-else-if="game.inviteDeclined">{{
                $t('plugin-tictactoe:invite_declined', { nick: buffer.name })
            }}</div>
            <div v-else>{{
                $t('plugin-tictactoe:invite_sent', { nick: buffer.name })
            }}</div>
        </template>
        <template v-else-if="game.inviteReceived">
            <div v-if="game.inviteAccepted">{{
                $t('plugin-tictactoe:invite_accepted_you', { nick: buffer.name })
            }}</div>
            <div v-else-if="game.inviteDeclined">{{
                $t('plugin-tictactoe:invite_declined_you', { nick: buffer.name })
            }}</div>
            <template v-else>
                <div>{{ $t('plugin-tictactoe:invite_received', { nick: buffer.name }) }}</div>
                <div class="plugin-tictactoe-buttons">
                    <div
                        class="plugin-tictactoe-accept"
                        @click="inviteClicked(true)"
                    >{{ $t('plugin-tictactoe:accept') }}</div>
                    <div
                        class="plugin-tictactoe-decline"
                        @click="inviteClicked(false)"
                    >{{ $t('plugin-tictactoe:decline') }}</div>
                </div>
            </template>
        </template>
    </div>
</template>

<script>

export default {
    props: ['buffer', 'game'],
    methods: {
        inviteClicked(accepted) {
            this.game.inviteRespond(accepted);
        },
    },
};
</script>

<style lang="scss">
.plugin-tictactoe-msg {
    .kiwi-wrap .kiwi-messagelist & {
        display: flex;
        flex-direction: row;
        gap: 10px;
        font-weight: 600;
    }

    .plugin-tictactoe-buttons {
        color: var(--brand-default-bg);
    }

    .plugin-tictactoe-buttons > div {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        cursor: pointer;

        &:first-of-type {
            margin-right: 10px;
        }
    }

    .plugin-tictactoe-accept {
        background-color: var(--brand-primary);
    }

    .plugin-tictactoe-decline {
        background-color: var(--brand-error);
    }
}
</style>
