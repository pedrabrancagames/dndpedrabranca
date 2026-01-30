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

        this.bindClick('#btn-resume', () => this.togglePauseMenu());
        this.bindClick('#btn-exit-to-home', () => this.exitCombat());

        this.bindClick('#btn-pass-turn', () => this.passTurn());

        // Ouvir eventos de combate para atualizar UI
        eventBus.on('turnStart', (unit) => this.updateTurnInfo(unit));
    }

    onShow(data) {
        // Configuração inicial quando tela abre
        const firstHero = this.gameManager.gameData.heroes[0];
        if (firstHero) this.updateTurnInfo(firstHero);
    }

    updateTurnInfo(unit) {
        const nameEl = this.findElement('.character-name');
        const avatarEl = this.findElement('.character-avatar');

        if (nameEl) nameEl.textContent = unit.name;
        if (avatarEl) avatarEl.textContent = unit.icon;

        console.log('UI Updated for:', unit.name);
    }

    togglePauseMenu() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.toggle('hidden');
        }
    }

    exitCombat() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) pauseMenu.classList.add('hidden');

        // Encerrar sessão AR se existir
        if (this.gameManager.arSceneManager) {
            this.gameManager.arSceneManager.endSession();
        }

        this.gameManager.stateManager.setState(GameState.HOME);
    }

    passTurn() {
        eventBus.emit('passTurn');
    }
}
