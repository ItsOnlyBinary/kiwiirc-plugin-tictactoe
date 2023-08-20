<script>
/* global kiwi:true */

import GameInstance from './GameInstance.vue';
import GameComponent from './GameComponent.vue';

export default kiwi.Vue.extend({
    data() {
        return {
            active: {},
            waiting: {},
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

            this.$set(this.waiting, remotePlayer, game);
            return game;
        },
        get(remotePlayer) {
            return this.active[remotePlayer];
        },
        getWaiting(remotePlayer) {
            return this.waiting[remotePlayer];
        },
        getWaitingOrActive(remotePlayer) {
            return this.waiting[remotePlayer] ?? this.active[remotePlayer];
        },
        show() {
            kiwi.emit('mediaviewer.show', {
                component: GameComponent,
                componentProps: { gameManager: this },
            });
        },
        makeActive(remotePlayer) {
            this.$set(this.active, remotePlayer, this.waiting[remotePlayer]);
            this.$delete(this.waiting, remotePlayer);
        },
        terminate(game) {
            if (game.inviteReceived && !game.started) {
                game.sendData({ cmd: 'invite_declined' });
            } else if ((game.inviteSent && !game.started) || (game.started && !game.over)) {
                game.sendData({ cmd: 'terminate' });
                game.over = true;
                game.message = this.$t('plugin-tictactoe:terminated_you');
            }
            this.remove(game);
        },
        remove(game) {
            const activeGame = this.active[game.remotePlayer];
            if (activeGame === game) {
                this.$delete(this.active, game.remotePlayer);
                return;
            }

            const waitingGame = this.waiting[game.remotePlayer];
            if (waitingGame === game) {
                this.$delete(this.waiting, game.remotePlayer);
            }
        },

        handleIrcNick(event, network) {
            [this.active, this.waiting].forEach((groupedGames) => {
                if (!event.nick !== network.nick) {
                    // Does not effect local player

                    const game = groupedGames[event.nick];
                    if (!game) {
                        return;
                    }

                    if (game.startPlayer === event.nick) {
                        game.startPlayer = event.new_nick;
                    }

                    game.remotePlayer = event.new_nick;

                    this.$set(groupedGames, event.new_nick, game);
                    this.$delete(groupedGames, event.nick);

                    return;
                }

                Object.values(groupedGames).forEach((game) => {
                    if (game.startPlayer === event.nick) {
                        game.startPlayer = event.new_nick;
                    }
                    game.localPlayer = event.new_nick;
                });
            });
        },
        handleIrcQuit(event, network) {
            [this.active, this.waiting].forEach((groupedGames) => {
                if (event.nick !== network.nick) {
                    // Does not effect local player

                    const game = groupedGames[event.nick];
                    if (!game) {
                        return;
                    }

                    game.over = true;
                    game.message = this.$t('plugin-tictactoe:terminated', {
                        nick: game.remotePlayer,
                    });

                    return;
                }

                Object.values(groupedGames).forEach((game) => {
                    game.over = true;
                    game.message = this.$t('plugin-tictactoe:terminated_you');
                });
            });
        },
    },
});
</script>
