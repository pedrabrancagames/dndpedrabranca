import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';
import { getQuestData, ObjectiveType } from '../../data/QuestDatabase.js';

export class MapScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.mapInitialized = false;
        this.questMarkersSpawned = false;
    }

    setupEvents() {
        this.bindClick('#btn-map-back', () => this.gameManager.stateManager.setState(GameState.HOME));

        // Escutar evento de combate vencido para atualizar progresso de quests
        eventBus.on('combat:victory', (data) => this.onCombatVictory(data));
    }

    onShow() {
        // Inicializar mapa na primeira vez
        if (!this.mapInitialized && this.gameManager.mapManager) {
            setTimeout(() => {
                this.gameManager.mapManager.init('map-container');
                this.mapInitialized = true;
                this.spawnAllMarkers();
            }, 100);
        } else {
            // Se já inicializado, invalidar tamanho para corrigir renderização
            setTimeout(() => {
                if (this.gameManager.mapManager.map) {
                    this.gameManager.mapManager.map.invalidateSize();
                }
                // Atualizar marcadores de quests
                this.updateQuestMarkers();
            }, 100);
        }
    }

    /**
     * Gera todos os marcadores: quests ativas + eventos aleatórios
     */
    spawnAllMarkers() {
        this.spawnQuestMarkers();
        this.spawnRandomEncounters();
    }

    /**
     * Gera marcadores de quests ativas
     */
    spawnQuestMarkers() {
        const quests = this.gameManager.gameData.quests;
        if (!quests || !quests.active || quests.active.length === 0) {
            console.log('Nenhuma quest ativa para gerar marcadores');
            return;
        }

        const playerPos = this.gameManager.mapManager.currentPosition || { lat: -23.5874, lng: -46.6576 };

        quests.active.forEach((questId, index) => {
            const quest = getQuestData(questId);
            if (!quest) return;

            // Gerar marcadores para cada objetivo não completado
            const progress = quests.progress[questId] || {};

            quest.objectives.forEach((objective, objIndex) => {
                const currentProgress = progress[objective.id] || 0;
                if (currentProgress >= objective.required) return; // Já completo

                // Posicionar marcadores em círculo ao redor do jogador
                const angle = (index * 0.7 + objIndex * 0.3) * Math.PI * 2 / Math.max(quests.active.length, 1);
                const distance = 0.0003 + objIndex * 0.0001; // ~30-40 metros

                const markerData = this.createQuestMarker(quest, objective, playerPos, angle, distance);
                this.gameManager.mapManager.addMissionMarker(markerData);
            });
        });

        this.questMarkersSpawned = true;
        console.log(`Marcadores de ${quests.active.length} quest(s) criados`);
    }

    /**
     * Cria dados do marcador para um objetivo de quest
     */
    createQuestMarker(quest, objective, playerPos, angle, distance) {
        const lat = playerPos.lat + Math.cos(angle) * distance;
        const lng = playerPos.lng + Math.sin(angle) * distance;

        // Determinar tipo e ícone baseado no tipo de objetivo
        let type = 'quest';
        let icon = '📍';

        switch (objective.type) {
            case ObjectiveType.KILL:
                type = 'combat';
                icon = '⚔️';
                break;
            case ObjectiveType.COLLECT:
                type = 'collect';
                icon = '📦';
                break;
            case ObjectiveType.TALK:
                type = 'npc';
                icon = '💬';
                break;
            case ObjectiveType.EXPLORE:
                type = 'explore';
                icon = '🔍';
                break;
            case ObjectiveType.DELIVER:
                type = 'deliver';
                icon = '📜';
                break;
        }

        return {
            id: `quest_${quest.id}_${objective.id}`,
            type: type,
            icon: icon,
            title: `${quest.name}`,
            description: objective.description,
            lat: lat,
            lng: lng,
            questId: quest.id,
            objectiveId: objective.id,
            objectiveType: objective.type,
            target: objective.target
        };
    }

    /**
     * Gera encontros aleatórios (mantém comportamento anterior)
     */
    spawnRandomEncounters() {
        const playerPos = this.gameManager.mapManager.currentPosition || { lat: -23.5874, lng: -46.6576 };

        // Adicionar um encontro aleatório de teste
        this.gameManager.mapManager.addMissionMarker({
            id: 'random_encounter_1',
            type: 'combat',
            icon: '👺',
            title: 'Encontro Aleatório',
            description: 'Goblins patrulhando a área.',
            lat: playerPos.lat + 0.0004,
            lng: playerPos.lng - 0.0002,
            isRandomEncounter: true
        });
    }

    /**
     * Atualiza marcadores quando quests mudam
     */
    updateQuestMarkers() {
        if (!this.gameManager.mapManager || !this.gameManager.mapManager.markersLayer) return;

        // Limpar marcadores antigos e recriar
        this.gameManager.mapManager.markersLayer.clearLayers();
        this.spawnAllMarkers();
    }

    /**
     * Callback quando um combate é vencido
     */
    onCombatVictory(data) {
        if (!data || !data.missionId) return;

        // Verificar se é um marcador de quest
        if (data.missionId.startsWith('quest_')) {
            const parts = data.missionId.split('_');
            const questId = parts[1];
            const objectiveId = parts.slice(2).join('_');

            this.updateQuestProgress(questId, objectiveId, data.enemiesKilled || 1);
        }
    }

    /**
     * Atualiza progresso de uma quest
     */
    updateQuestProgress(questId, objectiveId, amount = 1) {
        const quests = this.gameManager.gameData.quests;
        if (!quests || !quests.progress[questId]) return;

        const quest = getQuestData(questId);
        if (!quest) return;

        const objective = quest.objectives.find(o => o.id === objectiveId);
        if (!objective) return;

        // Atualizar progresso
        const currentProgress = quests.progress[questId][objectiveId] || 0;
        const newProgress = Math.min(currentProgress + amount, objective.required);
        quests.progress[questId][objectiveId] = newProgress;

        // Notificar usuário
        if (newProgress >= objective.required) {
            eventBus.emit('showMessage', {
                text: `✅ Objetivo completo: ${objective.description}`,
                type: 'success'
            });
        } else {
            eventBus.emit('showMessage', {
                text: `📝 ${objective.description}: ${newProgress}/${objective.required}`,
                type: 'info'
            });
        }

        // Verificar se toda a quest foi completada
        this.checkQuestCompletion(questId);

        // Salvar progresso
        this.gameManager.saveGame();
    }

    /**
     * Verifica se todos os objetivos de uma quest foram completados
     */
    checkQuestCompletion(questId) {
        const quests = this.gameManager.gameData.quests;
        const quest = getQuestData(questId);
        if (!quest) return;

        const progress = quests.progress[questId] || {};
        const allComplete = quest.objectives.every(obj => {
            const current = progress[obj.id] || 0;
            return current >= obj.required;
        });

        if (allComplete) {
            eventBus.emit('showMessage', {
                text: `🎉 Missão "${quest.name}" pronta para entregar!`,
                type: 'success'
            });
        }
    }
}

