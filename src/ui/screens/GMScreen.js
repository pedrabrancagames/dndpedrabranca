import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class GMScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-gm-back', () => this.gameManager.stateManager.setState(GameState.HOME));
    }

    onShow() {
        const gmText = this.findElement('#gm-text');
        if (gmText) {
            gmText.textContent = 'Bem-vindo, aventureiro! Rumores sombrios ecoam pelas ruas do bairro. ' +
                'Goblins foram avistados nas proximidades. Você está pronto para investigar?';
        }

        const gmActions = this.findElement('#gm-actions');
        if (gmActions) {
            // Nota: Precisei usar addEventListener diretamente pois os botões são criados dinamicamente
            gmActions.innerHTML = '';

            const btnInvestigate = document.createElement('button');
            btnInvestigate.textContent = 'Investigar';
            btnInvestigate.onclick = () => this.gameManager.stateManager.setState(GameState.MAP);

            const btnBack = document.createElement('button');
            btnBack.textContent = 'Voltar';
            btnBack.onclick = () => this.gameManager.stateManager.setState(GameState.HOME);

            gmActions.appendChild(btnInvestigate);
            gmActions.appendChild(btnBack);
        }
    }
}
