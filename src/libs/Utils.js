import TicTacToe from './TicTacToe.js';

const games = {};

export function newGame(network, localPlayer, remotePlayer) {
    games[remotePlayer] = new TicTacToe(network, localPlayer, remotePlayer);
}

export function getGame(key) {
    return games[key];
}

export function setGame(key, game) {
    games[key] = game;
}

export function getGames() {
    return games;
}

export function sendData(network, target, data) {
    let msg = new network.ircClient.Message('TAGMSG', target);
    msg.prefix = network.nick;
    msg.tags['+kiwiirc.com/ttt'] = JSON.stringify(data);
    network.ircClient.raw(msg);
}

export function terminateGame(game) {
    if (!game) {
        return;
    }
    let network = game.getNetwork();
    // eslint-disable-next-line no-undef
    let buffer = kiwi.state.getBufferByName(network.id, game.getRemotePlayer());

    if (network && game.getShowInvite()) {
        sendData(network, game.getRemotePlayer(), { cmd: 'invite_declined' });
    } else if (!game.getGameOver()) {
        game.setGameOver(true);
        if (network) {
            sendData(network, game.getRemotePlayer(), { cmd: 'terminate' });
        }
        if (buffer) {
            // eslint-disable-next-line no-undef
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: 'You ended the game of Tic-Tac-Toe!',
                type: 'message',
            });
        }
    }
    games[game.getRemotePlayer()] = null;
}

export function incrementUnread(buffer) {
    // eslint-disable-next-line no-undef
    let activeBuffer = kiwi.state.getActiveBuffer();
    if (activeBuffer && activeBuffer !== buffer) {
        buffer.incrementFlag('unread');
    }
}
