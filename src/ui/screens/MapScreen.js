import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class MapScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.mapInitialized = false;
    }

    setupEvents() {
        this.bindClick('#btn-map-back', () => this.gameManager.stateManager.setState(GameState.HOME));
    }

    onShow() {
        // Inicializar mapa na primeira vez que a tela for mostrada
        // Isso garante que o container DIV já tenha tamanho definido
        if (!this.mapInitialized && this.gameManager.mapManager) {
            setTimeout(() => {
                this.gameManager.mapManager.init('map-container');
                this.mapInitialized = true;

                // Adicionar missões de teste
                this.addTestMissions();

            }, 100); // Pequeno delay para garantir renderização do layout
        }
    }

    addTestMissions() {
        // Adicionar um marcador de combate perto da posição inicial do modo teste
        if (this.gameManager.gameData.testMode) {
            this.gameManager.mapManager.addMissionMarker({
                id: 'test_combat',
                type: 'combat',
                icon: '⚔️',
                title: 'Goblins da Praça',
                description: 'Um grupo de goblins saqueadores.',
                lat: -23.5874 + 0.0002,
                lng: -46.6576 + 0.0002
            });
        }
    }
}
