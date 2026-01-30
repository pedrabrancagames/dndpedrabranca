import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';

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
        // Inicializar mapa na primeira vez
        if (!this.mapInitialized && this.gameManager.mapManager) {
            setTimeout(() => {
                this.gameManager.mapManager.init('map-container');
                this.mapInitialized = true;
                this.addTestMissions();
            }, 100);
        } else {
            // Se já inicializado, invalidar tamanho para corrigir renderização
            setTimeout(() => {
                if (this.gameManager.mapManager.map) {
                    this.gameManager.mapManager.map.invalidateSize();
                }
            }, 100);
        }
    }

    addTestMissions() {
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
        } else {
            // Modo GPS Real: Adicionar missões perto do jogador quando a posição for encontrada
            const spawnLiveMissions = (pos) => {
                // Evita criar múltiplos marcadores se a função for chamada várias vezes
                if (this.liveMissionsSpawned) return;

                this.gameManager.mapManager.addMissionMarker({
                    id: 'live_combat',
                    type: 'combat',
                    icon: '⚔️',
                    title: 'Inimigo Detectado',
                    description: 'Um inimigo apareceu perto de você!',
                    lat: pos.lat + 0.0002,
                    lng: pos.lng + 0.0002
                });

                this.liveMissionsSpawned = true;
            };

            if (this.gameManager.mapManager.currentPosition) {
                spawnLiveMissions(this.gameManager.mapManager.currentPosition);
            } else {
                // Usa once para garantir que só roda na primeira atualização
                eventBus.once('gps:update', spawnLiveMissions);
            }
        }
    }
}
