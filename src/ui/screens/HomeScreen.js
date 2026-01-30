import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class HomeScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        // Menu Principal
        this.bindClick('#btn-combat', () => this.gameManager.stateManager.setState(GameState.MAP));
        this.bindClick('#btn-gm', () => this.gameManager.stateManager.setState(GameState.GM));
        this.bindClick('#btn-heroes', () => this.gameManager.stateManager.setState(GameState.HEROES));
        this.bindClick('#btn-inventory', () => this.gameManager.stateManager.setState(GameState.INVENTORY));
        this.bindClick('#btn-config', () => this.gameManager.stateManager.setState(GameState.CONFIG));
    }
}
