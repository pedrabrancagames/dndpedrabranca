import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';
import { getQuestData, ObjectiveType, canAcceptQuest, QuestDatabase } from '../../data/QuestDatabase.js';

export class MapScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.mapInitialized = false;
        this.gpsListenerSetup = false;
    }

    setupEvents() {
        this.bindClick('#btn-map-back', () => this.gameManager.stateManager.setState(GameState.HOME));

        // Escutar evento de combate vencido para atualizar progresso de quests
        eventBus.on('combat:victory', (data) => this.onCombatVictory(data));
    }

    onShow() {
        if (!this.mapInitialized && this.gameManager.mapManager) {
            setTimeout(() => {
                this.gameManager.mapManager.init('map-container');
                this.mapInitialized = true;
                this.waitForGPSAndSpawnMarkers();
            }, 100);
        } else {
            // Mapa já existe, garantir renderização correta
            setTimeout(() => {
                if (this.gameManager.mapManager.map) {
                    this.gameManager.mapManager.map.invalidateSize();
                }
                this.updateQuestMarkers();
            }, 100);
        }
    }

    /**
     * Aguarda GPS retornar posição real antes de spawnar marcadores
     */
    waitForGPSAndSpawnMarkers() {
        const mapManager = this.gameManager.mapManager;

        // Se já tem posição, spawnar imediatamente
        if (mapManager.currentPosition) {
            console.log('GPS: Posição prévia disponível, spawnando marcadores');
            this.spawnQuestMarkers();
            return;
        }

        // Caso contrário, aguardar evento de GPS
        if (!this.gpsListenerSetup) {
            console.log('GPS: Aguardando posição para spawnar markers...');
            eventBus.once('gps:update', (pos) => {
                console.log('GPS: Primeiro fix recebido, spawnando marcadores');
                this.spawnQuestMarkers();
            });
            this.gpsListenerSetup = true;
        }
    }

    /**
     * Gera marcadores de quests ativas na posição atual do jogador
     */
    spawnQuestMarkers() {
        const quests = this.gameManager.gameData.quests;
        const mapManager = this.gameManager.mapManager;

        if (!quests || !quests.active || quests.active.length === 0) {
            console.log('Nenhuma quest ativa para gerar marcadores');
            return;
        }

        // IMPORTANTE: Usar posição atual do GPS
        // Se ainda for null, aguarda o próximo update (waitForGPS já cuida disso se for 1a vez)
        const playerPos = mapManager.currentPosition;
        if (!playerPos) {
            console.warn('Tentativa de spawnar markers sem posição GPS. Abortando.');
            return;
        }

        console.log(`Gerando marcadores na posição: ${playerPos.lat}, ${playerPos.lng}`);

        // Inicializar armazenamento de posições se não existir
        if (!quests.markerPositions) {
            quests.markerPositions = {};
        }

        // Coletar todos os objetivos ativos para distribuição global
        // BUGFIX: Apenas o primeiro objetivo incompleto de cada quest deve aparecer
        const allObjectives = [];
        quests.active.forEach(questId => {
            const quest = getQuestData(questId);
            if (!quest) return;
            const progress = quests.progress[questId] || {};

            // Encontrar o primeiro objetivo não completado
            for (const objective of quest.objectives) {
                const currentProgress = progress[objective.id] || 0;

                // VERIFICAÇÃO: Apenas mostrar objetivos desbloqueados (sequenciais)
                const canShow = this.gameManager.progressionSystem.checkQuestPrerequisites(questId, objective.id);

                if (canShow && currentProgress < objective.required) {
                    allObjectives.push({ quest, objective });
                    // Adicionamos break se quisermos mostrar APENAS o próximo passo linear
                    // Mas como verificamos checkQuestPrerequisites, se a DB permitir paralelo, mostra.
                    // Se a DB for sequencial (padrão), o checkQuestPrerequisites barra os futuros.
                }
            }
        });

        // Gerar marcadores
        allObjectives.forEach((item, index) => {
            const { quest, objective } = item;
            const markerKey = `${quest.id}_${objective.id}`;

            // Tentar recuperar posição salva
            let lat, lng;
            const savedPos = quests.markerPositions[markerKey];

            if (savedPos) {
                // Usar posição salva (fixa no mundo)
                lat = savedPos.lat;
                lng = savedPos.lng;
            } else {
                // Gerar nova posição distribuída
                const totalMarkers = allObjectives.length;
                // Usar índice global para evitar sobreposição
                // Adicionar offset aleatório leve para não ficar um círculo perfeito
                const angle = ((index) / totalMarkers) * Math.PI * 2 + (Math.random() * 0.5);
                const distance = 0.0002 + (Math.random() * 0.0001); // 20-30 metros

                lat = playerPos.lat + Math.cos(angle) * distance;
                lng = playerPos.lng + Math.sin(angle) * distance;

                // Salvar posição
                quests.markerPositions[markerKey] = { lat, lng };
            }

            const markerData = this.createQuestMarker(quest, objective, { lat, lng }, 0, 0); // distance 0 pois já calculamos
            mapManager.addMissionMarker(markerData);
        });

        // Salvar persistência das posições
        this.gameManager.saveGame();

        console.log(`Marcadores de ${allObjectives.length} objetivos criados`);

        // Spawnar marcadores de quests disponíveis (Amarelo !)
        this.spawnAvailableQuestMarkers(playerPos);
    }

    /**
     * Spawna marcadores para quests que podem ser aceitas
     */
    spawnAvailableQuestMarkers(playerPos) {
        const activeQuests = this.gameManager.gameData.quests.active || [];
        const completedQuests = this.gameManager.gameData.quests.completed || [];
        const playerData = {
            level: 1, // TODO: Pegar do ProgressionSystem
            completedQuests: completedQuests
        };
        // Pegar nível real se possível
        if (this.gameManager.gameData.heroes && this.gameManager.gameData.heroes.length > 0) {
            playerData.level = this.gameManager.gameData.heroes[0].level;
        }

        const mapManager = this.gameManager.mapManager;

        Object.values(QuestDatabase).forEach((quest, index) => {
            // Ignorar se já está ativa ou completa
            if (activeQuests.includes(quest.id) || completedQuests.includes(quest.id)) return;

            // Verificar se pode aceitar
            if (canAcceptQuest(quest, playerData)) {
                // Criar marcador de missão disponível
                const markerKey = `available_${quest.id}`;

                // Posição: Tentar manter consistente ou gerar perto
                // Idealmente, seria a posição do NPC Giver.
                // Como não temos DB de posições fixas, vamos gerar uma posição "fixa" baseada no ID para ser determinística
                // ou usar a posição do jogador com offset se for a primeira vez

                let lat, lng;

                // Pseudo-aleatório determinístico baseado no ID da quest para ficar sempre no mesmo lugar
                const hash = quest.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const angle = (hash % 360) * (Math.PI / 180);
                const distance = 0.0003; // ~30m

                // Usar a posição atual do jogador como base central (ou uma base fixa se tivesse)
                // Para não "correr" com o jogador, idealmente persistimos isso.
                // Mas 'available' quests podem "aparecer" perto do jogador.

                lat = playerPos.lat + Math.cos(angle) * distance;
                lng = playerPos.lng + Math.sin(angle) * distance;

                const markerData = {
                    id: `available_${quest.id}`,
                    type: 'npc', // Usa tratamento de NPC
                    icon: '❗', // Exclamação Amarela/Vermelha
                    title: `Nova Missão: ${quest.name}`,
                    description: `Fale com ${quest.giver} para aceitar.`,
                    lat: lat,
                    lng: lng,
                    target: quest.giverId || 'mayor', // Fallback
                    targetId: quest.giverId || 'mayor',
                    isAvailableQuest: true, // Flag para tratamento especial se precisar
                    questId: quest.id // Contexto para o diálogo saber qual quest iniciar
                };

                mapManager.addMissionMarker(markerData);
            }
        });
    }

    /**
     * Cria dados do marcador para um objetivo de quest
     */
    createQuestMarker(quest, objective, position, angle, distance) {
        // Se angle/distance forem 0, usa position diretamente
        const lat = distance > 0 ? position.lat + Math.cos(angle) * distance : position.lat;
        const lng = distance > 0 ? position.lng + Math.sin(angle) * distance : position.lng;

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
                icon = '💬'; // Ícone correto de diálogo
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
            title: quest.name,
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
     * Atualiza marcadores quando quests mudam
     */
    updateQuestMarkers() {
        const mapManager = this.gameManager.mapManager;
        if (!mapManager || !mapManager.markersLayer) return;

        mapManager.markersLayer.clearLayers();

        if (mapManager.currentPosition) {
            this.spawnQuestMarkers();
        } else {
            this.waitForGPSAndSpawnMarkers();
        }
    }

    /**
     * Callback quando um combate é vencido
     */
    onCombatVictory(data) {
        if (!data) return;

        // Dados precisos vindos do CombatManager
        if (data.questId && data.objectiveId) {
            this.updateQuestProgress(data.questId, data.objectiveId, data.enemiesKilled || 1);
        }
        else if (data.missionId && data.missionId.startsWith('quest_')) {
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
        console.log(`Atualizando progresso: quest=${questId}, objective=${objectiveId}, amount=${amount}`);

        const quests = this.gameManager.gameData.quests;
        if (!quests || !quests.progress) return;

        if (!quests.progress[questId]) quests.progress[questId] = {};

        const quest = getQuestData(questId);
        if (!quest) return;

        const objective = quest.objectives.find(o => o.id === objectiveId);
        if (!objective) return;

        const currentProgress = quests.progress[questId][objectiveId] || 0;
        const newProgress = Math.min(currentProgress + amount, objective.required);
        quests.progress[questId][objectiveId] = newProgress;

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

        this.checkQuestCompletion(questId);
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
