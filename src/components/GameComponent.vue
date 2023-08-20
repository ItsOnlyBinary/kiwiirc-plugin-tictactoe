<template>
    <div class="tictactoe">
        <div class="tictactoe-board">
            <div
                v-for="box in game.board"
                :key="box.id"
                :class="{
                    'tictactoe-selectable': isViable(box),
                    'tictactoe-winner': box.win,
                }"
                @click="boxClicked(box)"
            >
                <svg v-if="box.val == 'O'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M224 96a160 160 0 1 0 0 320 160 160 0 1 0 0-320zM448 256A224
                        224 0 1 1 0 256a224 224 0 1 1 448 0z"
                    />
                </svg>
                <svg v-else-if="box.val == 'X'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206
                        56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256
                        7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306
                        327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256
                        376.6 84.5z"
                    />
                </svg>
            </div>
        </div>
        <div class="tictactoe-message">{{ game.message }}</div>
    </div>
</template>

<script>
/* global kiwi:true */

export default {
    props: ['gameManager'],
    computed: {
        game() {
            const buffer = kiwi.state.getActiveBuffer();
            return this.gameManager.get(buffer.name);
        },
    },
    methods: {
        isViable(box) {
            return (!this.game.over && this.game.isLocalTurn && box.val === '');
        },
        boxClicked(box) {
            if (!this.isViable(box)) {
                return;
            }

            box.val = this.game.getMarker();
            this.game.sendData({
                cmd: 'action',
                clicked: box.id,
                turn: this.game.turn,
            });
            this.game.incrementTurn();
            this.game.checkGame();
            if (!this.game.over && !this.game.isLocalTurn) {
                this.game.setTurnMessage();
            }
        },
    },
};
</script>

<style lang="scss">
.tictactoe {
    position: relative;
    display: block;
    width: 100%;
    padding: 6px 0;
    user-select: none;

    .tictactoe-board {
        display: grid;
        margin: 0 auto;
        width: 286px;
        height: 286px;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-columns: 1fr 1fr 1fr;

        > div {
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 8px solid var(--brand-default-fg);
            border-bottom: 8px solid var(--brand-default-fg);

            svg {
                width: 74px;
                height: 74px;

                > path {
                    fill: var(--brand-default-fg);
                }
            }
        }

        & :nth-child(3n+3) {
            border-right: initial;
        }

        & :nth-last-child(-n+3) {
            border-bottom: initial;
        }
    }

    .tictactoe-selectable {
        cursor: pointer;
    }

    .tictactoe-winner {
        background-color: #00ff0080;
    }

    .tictactoe-message {
        text-align: center;
        font-size: 1.4em;
        font-weight: 700;
        margin-top: 6px;
    }
}
</style>
