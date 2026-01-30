import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';

export class CombatScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-pause', () => this.togglePauseMenu());
        this.bindClick('#btn-exit-combat', () => this.exitCombat());

        // Pause Menu
        this.bindClick('#btn-resume', () => this.togglePauseMenu());
        this.bindClick('#btn-restart', () => console.log('Restart not implemented')); // TODO
        this.bindClick('#btn-combat-log', () => console.log('Log not implemented')); // TODO
        this.bindClick('#btn-exit-to-home', () => this.exitCombat());

        this.bindClick('#btn-pass-turn', () => this.passTurn());
    }

    togglePauseMenu() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.toggle('hidden');
        }
    }

    exitCombat() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
        this.gameManager.stateManager.setState(GameState.HOME);
        // TODO: Limpar cena AR
    }

    passTurn() {
        eventBus.emit('passTurn');
    }
}
