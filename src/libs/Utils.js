/* global kiwi:true */

import TicTacToe from './TicTacToe.js';

const gameStore = kiwi.Vue.extend({
    data() {
        return {
            games: {},
        };
    },
});

export function newGame(network, localPlayer, remotePlayer) {
    gameStore.games[remotePlayer] = new TicTacToe(network, localPlayer, remotePlayer);
}

export function getGame(key) {
    return gameStore.games[key];
}

export function setGame(key, game) {
    gameStore.games[key] = game;
}

export function getGames() {
    return gameStore.games;
}

export function getGameStore() {
    return gameStore;
}

export function sendData(network, target, data) {
    let msg = new network.ircClient.Message('TAGMSG', target);
    msg.prefix = network.nick;
    msg.tags['+kiwiirc.com/ttt'] = kiwi.JSON5.stringify(data);
    network.ircClient.raw(msg);
}

export function terminateGame(game) {
    if (!game) {
        return;
    }
    let network = game.getNetwork();
    let buffer = kiwi.state.getBufferByName(network.id, game.getRemotePlayer());

    if (network && game.getShowInvite()) {
        sendData(network, game.getRemotePlayer(), { cmd: 'invite_declined' });
    } else if (!game.getGameOver()) {
        game.setGameOver(true);
        if (network) {
            sendData(network, game.getRemotePlayer(), { cmd: 'terminate' });
        }
        if (buffer) {
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: 'You ended the game of Tic-Tac-Toe!',
                type: 'message',
            });
        }
    }
    gameStore.games[game.getRemotePlayer()] = null;
}

export function incrementUnread(buffer) {
    let activeBuffer = kiwi.state.getActiveBuffer();
    if (activeBuffer && activeBuffer !== buffer) {
        buffer.incrementFlag('unread');
    }
}
