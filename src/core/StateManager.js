/**
 * StateManager - Máquina de Estados do Jogo
 * Gerencia transições entre estados (SPLASH, HOME, MAP, COMBAT, etc.)
 */

import { eventBus } from './EventEmitter.js';

// Estados possíveis do jogo
export const GameState = {
    SPLASH: 'splash',
    LOADING: 'loading',
    HOME: 'home',
    MAP: 'map',
    HEROES: 'heroes',
    INVENTORY: 'inventory',
    CONFIG: 'config',
    GM: 'gm',
    COMBAT: 'combat'
};

// Sub-estados do combate
export const CombatState = {
    SETUP: 'setup',
    DETECTING_PLANE: 'detecting_plane',
    PLACING_ENEMIES: 'placing_enemies',
    PLAYER_TURN: 'player_turn',
    SELECTING_CARD: 'selecting_card',
    TARGETING: 'targeting',
    EXECUTING_ACTION: 'executing_action',
    ENEMY_TURN: 'enemy_turn',
    ROUND_END: 'round_end',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

export class StateManager {
    constructor() {
        this.currentState = GameState.SPLASH;
        this.previousState = null;
        this.combatState = null;
        this.stateHistory = [];

        // Mapeamento de telas para estados
        this.screenMap = {
            [GameState.SPLASH]: 'splash-screen',
            [GameState.HOME]: 'home-screen',
            [GameState.MAP]: 'map-screen',
            [GameState.HEROES]: 'heroes-screen',
            [GameState.INVENTORY]: 'inventory-screen',
            [GameState.CONFIG]: 'config-screen',
            [GameState.GM]: 'gm-screen',
            [GameState.COMBAT]: 'combat-hud'
        };
    }

    /**
     * Retorna o estado atual
     */
    getState() {
        return this.currentState;
    }

    /**
     * Retorna o sub-estado do combate
     */
    getCombatState() {
        return this.combatState;
    }

    /**
     * Transiciona para um novo estado
     * @param {string} newState - Novo estado
     * @param {object} data - Dados opcionais para a transição
     */
    setState(newState, data = {}) {
        if (!Object.values(GameState).includes(newState)) {
            console.error(`Invalid state: ${newState}`);
            return;
        }

        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;
        this.stateHistory.push({ from: oldState, to: newState, timestamp: Date.now() });

        // Limitar histórico
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }

        // Atualizar UI
        this.updateScreenVisibility(oldState, newState);

        // Emitir evento de mudança de estado
        eventBus.emit('stateChange', { from: oldState, to: newState, data });
        eventBus.emit(`state:${newState}`, data);

        console.log(`State: ${oldState} → ${newState}`);
    }

    /**
     * Define o sub-estado do combate
     * @param {string} state - Sub-estado do combate
     * @param {object} data - Dados opcionais
     */
    setCombatState(state, data = {}) {
        if (!Object.values(CombatState).includes(state)) {
            console.error(`Invalid combat state: ${state}`);
            return;
        }

        const oldState = this.combatState;
        this.combatState = state;

        eventBus.emit('combatStateChange', { from: oldState, to: state, data });
        eventBus.emit(`combat:${state}`, data);

        console.log(`Combat State: ${oldState} → ${state}`);
    }

    /**
     * Volta para o estado anterior
     */
    goBack() {
        if (this.previousState) {
            this.setState(this.previousState);
        }
    }

    /**
     * Atualiza a visibilidade das telas
     */
    updateScreenVisibility(oldState, newState) {
        // Esconder tela antiga
        if (oldState && this.screenMap[oldState]) {
            const oldScreen = document.getElementById(this.screenMap[oldState]);
            if (oldScreen) {
                oldScreen.classList.remove('active');
            }
        }

        // Mostrar nova tela
        if (this.screenMap[newState]) {
            const newScreen = document.getElementById(this.screenMap[newState]);
            if (newScreen) {
                newScreen.classList.add('active');
            }
        }

        // Controle especial do canvas 3D
        const canvas = document.getElementById('three-canvas');
        if (canvas) {
            if (newState === GameState.COMBAT) {
                canvas.classList.add('active');
            } else {
                canvas.classList.remove('active');
            }
        }
    }

    /**
     * Verifica se está em um estado específico
     */
    isState(state) {
        return this.currentState === state;
    }

    /**
     * Verifica se está em combate
     */
    isInCombat() {
        return this.currentState === GameState.COMBAT;
    }
}
