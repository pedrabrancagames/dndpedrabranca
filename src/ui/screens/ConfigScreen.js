import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class ConfigScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-config-back', () => this.gameManager.stateManager.setState(GameState.HOME));


    }

    onShow() {

    }
}
