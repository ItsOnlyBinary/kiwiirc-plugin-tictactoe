<script>
/* global kiwi:true */

import GameInstance from './GameInstance.vue';
import GameComponent from './GameComponent.vue';

export default kiwi.Vue.extend({
    data() {
        return {
            games: {},
        };
    },
    methods: {
        create(buffer, localPlayer, remotePlayer) {
            const game = new GameInstance({
                data: {
                    buffer,
                    localPlayer,
                    remotePlayer,
                    gameManager: this,
                },
            });

            this.$set(this.games, remotePlayer, game);
            return game;
        },
        get(remotePlayer) {
            return this.games[remotePlayer];
        },
        rename(remotePlayer, newNick) {
            const game = this.get(remotePlayer);
            if (!game) {
                return;
            }

            if (game.startPlayer === remotePlayer) {
                game.startPlayer = newNick;
            }
            game.remotePlayer = newNick;

            this.$set(this.games, newNick, game);
            this.$delete(this.games, remotePlayer);
        },
        remove(remotePlayer) {
            this.$delete(this.games, remotePlayer);
        },
        show() {
            kiwi.emit('mediaviewer.show', { component: GameComponent, componentProps: { gameManager: this } });
        },
        terminate(game) {
            if (game.inviteReceived && !game.started) {
                game.sendData({ cmd: 'invite_declined' });
            } else if (game.started && !game.over) {
                game.sendData({ cmd: 'terminate' });
                game.over = true;
                game.message = this.$t('plugin-tictactoe:terminated_you');
            }
            this.remove(game.remotePlayer);
        },
    },
});
</script>
