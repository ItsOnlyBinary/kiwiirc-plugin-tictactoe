import * as Utils from './libs/Utils.js';
import GameButton from './components/GameButton.vue';
import GameComponent from './components/GameComponent.vue';

// eslint-disable-next-line no-undef
kiwi.plugin('tictactoe', (kiwi) => {
    let mediaViewerOpen = false;

    kiwi.addUi('header_query', GameButton);

    // Listen to incoming messages
    kiwi.on('irc.raw.TAGMSG', (command, event, network) => {
        if (event.params[0] !== network.nick ||
            event.nick === network.nick ||
            event.tags['+kiwiirc.com/ttt'].charAt(0) !== '{'
        ) {
            return;
        }
        let data = JSON.parse(event.tags['+kiwiirc.com/ttt']);

        let buffer = kiwi.state.getOrAddBufferByName(network.id, event.nick);
        let game = Utils.getGame(event.nick);

        switch (data.cmd) {
        case 'invite': {
            if (!game) {
                Utils.newGame(network, network.nick, event.nick);
            }
            game = Utils.getGame(event.nick);
            game.setShowInvite(true);
            kiwi.emit('plugin-tictactoe.update-button');
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: 'You have been invited to play Tic-Tac-Toe!',
                type: 'message',
            });
            Utils.sendData(network, event.nick, { cmd: 'invite_received' });
            if (!mediaViewerOpen && kiwi.state.getActiveBuffer().name === event.nick) {
                kiwi.emit('mediaviewer.show', { component: GameComponent });
            }
            break;
        }
        case 'invite_received': {
            let inviteTimeout = game.getInviteTimeout();
            if (inviteTimeout) {
                window.clearTimeout(inviteTimeout);
                game.setInviteTimeout(null);
            }
            break;
        }
        case 'invite_accepted': {
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: event.nick + ' accepted your invite to play Tic-Tac-Toe!',
                type: 'message',
            });
            game.startGame(data.startPlayer);
            game.setInviteSent(false);
            game.setTurnMessage();
            if (!mediaViewerOpen && kiwi.state.getActiveBuffer().name === game.getRemotePlayer()) {
                kiwi.emit('mediaviewer.show', { component: GameComponent });
            }
            break;
        }
        case 'invite_declined': {
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: event.nick + ' declined your invite to play Tic-Tac-Toe!',
                type: 'message',
            });
            game.setInviteSent(false);
            break;
        }
        case 'action': {
            if (data.clicked && game.getGameBoard()[data.clicked[0]][data.clicked[1]].val === '') {
                game.getGameBoard()[data.clicked[0]][data.clicked[1]].val = game.getMarker();
                if (game.getGameTurn() !== data.turn) {
                    game.setGameOver(true);
                    let message = 'Error: Game turn out of sync :(';
                    game.setGameMessage = message;
                    Utils.sendData(network, game.getRemotePlayer(), { cmd: 'error', message: message });
                } else {
                    game.incrementGameTurn();
                    game.checkGame();
                }

                if (!game.getGameOver()) {
                    game.setTurnMessage();
                }
            }
            break;
        }
        case 'error': {
            if (game) {
                game.setGameOver(true);
                game.setGameMessage(data.message);
            }
            break;
        }
        case 'terminate': {
            game.setGameOver(true);
            game.setGameMessage('Game ended by ' + event.nick);
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: event.nick + ' ended the game of Tic-Tac-Toe!',
                type: 'message',
            });
            break;
        }
        default: {
            // eslint-disable-next-line no-console
            console.error('TicTacToe: Something bad happened', event);
            break;
        }
        }
        if (data.cmd && data.cmd !== 'invite_received') {
            Utils.incrementUnread(buffer);
        }
    });

    kiwi.on('mediaviewer.show', (url) => {
        mediaViewerOpen = url.component === GameComponent;
    });

    kiwi.on('mediaviewer.hide', (event) => {
        if (mediaViewerOpen && event && event.source === 'user') {
            let buffer = kiwi.state.getActiveBuffer();
            let game = Utils.getGame(buffer.name);
            if (game) {
                Utils.terminateGame(game);
            }
        }
        mediaViewerOpen = false;
    });

    kiwi.on('irc.nick', (event, network, ircEventObj) => {
        if (event.nick === network.nick) {
            Object.keys(Utils.getGames()).forEach((key) => {
                let game = Utils.getGame(key);
                if (game) {
                    if (game.getStartPlayer() === event.nick) {
                        game.setStartPlayer(event.new_nick);
                    }
                    game.setLocalPlayer(event.new_nick);
                }
            });
            return;
        }

        let game = Utils.getGame(event.nick);
        if (game) {
            if (game.getStartPlayer() === event.nick) {
                game.setStartPlayer(event.new_nick);
            }
            game.setRemotePlayer(event.new_nick);
            Utils.setGame(event.new_nick, game);
            Utils.setGame(event.nick, null);
        }
    });

    kiwi.on('irc.quit', (event, network, ircEventObj) => {
        if (event.nick === network.nick) {
            Object.keys(Utils.getGames()).forEach((key) => {
                let game = Utils.getGame(key);
                if (game && game.getInviteSent()) {
                    Utils.setGame(game.getRemotePlayer(), null);
                }
            });
            kiwi.emit('plugin-tictactoe.update-button');
            return;
        }

        let game = Utils.getGame(event.nick);
        if (game && game.getInviteSent()) {
            Utils.setGame(game.getRemotePlayer(), null);
            kiwi.emit('plugin-tictactoe.update-button');
        }
    });

    kiwi.state.$watch('ui.active_buffer', () => {
        let buffer = kiwi.state.getActiveBuffer();
        let game = Utils.getGame(buffer.name);
        if (game && (game.getShowGame() || game.getShowInvite()) && !mediaViewerOpen) {
            kiwi.emit('mediaviewer.show', { component: GameComponent });
        } else if (!game && mediaViewerOpen) {
            kiwi.emit('mediaviewer.hide');
        }
    });
});
