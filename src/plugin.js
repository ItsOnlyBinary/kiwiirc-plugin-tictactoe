import GameManager from '@/components/GameManager.vue';
import GameButton from '@/components/GameButton.vue';
import GameComponent from '@/components/GameComponent.vue';
import MessageTemplate from '@/components/MessageTemplate.vue';
import translations from '@/translations';

/* global kiwi:true */

const TextFormatting = kiwi.require('helpers/TextFormatting');

// eslint-disable-next-line no-undef
kiwi.plugin('tictactoe', (kiwi) => {
    let mediaViewerOpen = false;
    let gameManager = new GameManager();

    kiwi.addTranslations('plugin-tictactoe', translations);

    kiwi.addUi('header_query', GameButton, { props: { gameManager } });

    kiwi.on('irc.nick', gameManager.handleIrcNick);
    kiwi.on('irc.quit', gameManager.handleIrcQuit);

    // Listen to incoming messages
    kiwi.on('irc.raw.TAGMSG', (command, event, network) => {
        if (
            event.params[0] !== network.nick ||
            event.nick === network.nick ||
            !event.tags['+kiwiirc.com/tictactoe'] ||
            event.tags['+kiwiirc.com/tictactoe'].charAt(0) !== '{'
        ) {
            return;
        }
        const data = JSON.parse(event.tags['+kiwiirc.com/tictactoe']);

        let game = gameManager.getWaitingOrActive(event.nick);
        let buffer = kiwi.state.getBufferByName(network.id, event.nick);

        switch (data.cmd) {
        case 'invite': {
            let blockNewPms = kiwi.state.setting('buffers.block_pms');
            if (!buffer && blockNewPms) {
                game = gameManager.create(null, network.nick, event.nick);
                game.inviteRespond(false);
                return;
            }

            buffer = kiwi.state.getOrAddBufferByName(network.id, event.nick);

            game = gameManager.create(buffer, network.nick, event.nick);
            game.inviteReceived = true;

            kiwi.state.addMessage(buffer, {
                nick: '',
                message: '',
                bodyTemplate: MessageTemplate,
                bodyTemplateProps: { game },
                type: 'message',
            });

            game.sendData({ cmd: 'invite_received' });

            break;
        }
        case 'invite_received': {
            clearTimeout(game.inviteTimeout);
            game.inviteTimeout = null;
            break;
        }
        case 'invite_accepted': {
            game.inviteAccepted = true;
            game.start(data.startPlayer);

            if (!mediaViewerOpen && kiwi.state.getActiveBuffer() === game.buffer) {
                gameManager.show();
            }
            break;
        }
        case 'invite_declined': {
            game.inviteDeclined = true;
            clearTimeout(game.inviteTimeout);
            game.inviteTimeout = null;

            if (!mediaViewerOpen || kiwi.state.getActiveBuffer() !== game.buffer) {
                gameManager.remove(game);
            }
            break;
        }
        case 'action': {
            if (typeof data.clicked === 'number' && game.board[data.clicked].val === '') {
                if (game.turn !== data.turn || game.isLocalTurn) {
                    game.over = true;
                    game.message = TextFormatting.t('plugin-tictactoe:error_sync');
                    game.sendData({ cmd: 'error', type: 'sync' });
                } else {
                    game.board[data.clicked].val = game.getMarker();
                    game.incrementTurn();
                    game.checkGame();
                }

                if (!game.over) {
                    game.setTurnMessage();
                }
            }
            break;
        }
        case 'terminate': {
            game.over = true;
            game.message = TextFormatting.t('plugin-tictactoe:terminated', {
                nick: game.remotePlayer,
            });
            break;
        }
        case 'error': {
            if (game) {
                game.over = true;
                if (data.message) {
                    game.message = data.message;
                } else if (data.type === 'sync') {
                    game.message = TextFormatting.t('plugin-tictactoe:error_sync');
                }
                return;
            }

            // eslint-disable-next-line no-console
            console.error('plugin-tictactoe: Something bad happened', event);
            break;
        }
        default: {
            // eslint-disable-next-line no-console
            console.error('plugin-tictactoe: Something bad happened', event);
            break;
        }
        }

        if (buffer && data.cmd && data.cmd !== 'invite_received') {
            const activeBuffer = kiwi.state.getActiveBuffer();
            if (activeBuffer && activeBuffer !== buffer) {
                buffer.incrementFlag('unread');
            }
        }
    });

    kiwi.on('mediaviewer.show', (url) => {
        mediaViewerOpen = url.component === GameComponent;
    });

    kiwi.on('mediaviewer.hide', (event) => {
        if (mediaViewerOpen && event && event.source === 'user') {
            const buffer = kiwi.state.getActiveBuffer();
            const game = gameManager.get(buffer.name);
            if (game) {
                gameManager.terminate(game);
            }
        }
        mediaViewerOpen = false;
    });

    kiwi.on('buffer.close', (event) => {
        const game = gameManager.getWaitingOrActive(event.buffer.name);
        if (!game) {
            return;
        }
        gameManager.terminate(game);
    });

    kiwi.state.$watch(
        () => kiwi.state.ui.active_network + kiwi.state.ui.active_buffer,
        () => {
            const buffer = kiwi.state.getActiveBuffer();
            const game = gameManager.get(buffer.name);
            if (game && game.started && !mediaViewerOpen) {
                gameManager.show();
            } else if (!game && mediaViewerOpen) {
                kiwi.emit('mediaviewer.hide');
            }
        }
    );
});
