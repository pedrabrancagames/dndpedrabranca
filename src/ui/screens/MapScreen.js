import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';
import { getQuestData, QuestObjectiveType, canAcceptQuest, QuestDatabase } from '../../data/QuestDatabase.js';

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
        if (this.gameManager.mapManager) {
            this.gameManager.mapManager.startTracking();
        }

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

    onHide() {
        if (this.gameManager.mapManager) {
            this.gameManager.mapManager.stopTracking();
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
     * Gera todos os marcadores de missão (Ativas e Disponíveis)
     */
    spawnQuestMarkers() {
        const mapManager = this.gameManager.mapManager;
        const playerPos = mapManager.currentPosition;

        if (!playerPos) {
            console.warn('GPS não pronto, adiando spawn de markers.');
            return;
        }

        const missionManager = this.gameManager.missionManager;
        const activeQuests = missionManager.getActiveQuests();  // Array de estados
        const allQuestDefs = Object.values(QuestDatabase); // Todas definições

        // 1. Processar CADA quest definida no banco para ver o status dela
        allQuestDefs.forEach(questDef => {
            const questState = missionManager.getQuestState(questDef.id);

            // --- A. Marcador do NPC (Persistente) ---
            // O NPC deve aparecer se a quest está Disponível, Ativa ou Completa (para entregar)
            // Se estiver Falhou, talvez não apareça, ou apareça para reiniciar.

            // Gerar posição distribuída uniformemente baseada no índice para evitar sobreposições
            const index = allQuestDefs.findIndex(q => q.id === questDef.id);
            const totalQuests = allQuestDefs.length;
            const angle = (index / totalQuests) * (Math.PI * 2); // Distribuição radial uniforme
            const distance = 0.0008; // ~80m do jogador (Aumentado de 0.0003)

            const npcLat = playerPos.lat + Math.cos(angle) * distance;
            const npcLng = playerPos.lng + Math.sin(angle) * distance;

            let npcIcon = questDef.markerIcon || '❗'; // Usar ícone da quest se disponível, fallback para padrão
            let npcDesc = 'Nova Missão disponível';
            let showNPC = false;

            if (questState === 'available') {
                if (canAcceptQuest(questDef, { level: 1, completedQuests: [] })) {
                    showNPC = true;
                    // Se estiver disponível, mantemos o ícone da quest ou o de exclamação para indicar novo?
                    // O usuário reclamou de icones iguais. Vamos tentar usar o icone temático da quest.
                    npcDesc = 'Nova Missão disponível';
                }
            } else if (questState === 'active') {
                showNPC = true;
                npcIcon = '💬'; // Em progresso (Talk/Desistir) -> Mantemos padrao para indicar interação
                npcDesc = 'Missão em andamento';
            } else if (questState === 'completed') {
                if (missionManager.canComplete(questDef.id)) {
                    showNPC = true;
                    npcIcon = '🎁'; // Pronto para entregar
                    npcDesc = 'Completar Missão';
                }
            }

            if (showNPC) {
                mapManager.addMissionMarker({
                    id: `npc_${questDef.id}`,
                    type: 'npc',
                    icon: npcIcon,
                    title: questDef.title || questDef.name,
                    description: npcDesc,
                    lat: npcLat,
                    lng: npcLng,
                    target: questDef.giverId || 'mayor',
                    targetId: questDef.giverId || 'mayor',
                    questId: questDef.id,
                    isNPC: true
                });
            }

            // --- B. Objetivos da Missão (Inimigos/Itens) ---
            // Apenas se estiver ATIVA
            if (questState === 'active') {
                const activeQuestState = activeQuests.find(q => q.id === questDef.id);
                if (activeQuestState) {
                    this.spawnObjectiveMarkers(questDef, activeQuestState, playerPos);
                }
            }
        });

        // Adicionar marcador da loja (Balthazar)
        // Posição fixa em relação ao jogador
        const shopAngle = Math.PI * 0.25; // 45 graus
        const shopDistance = 0.0006; // ~60m
        mapManager.addShopMarker({
            npcId: 'merchant_npc',
            name: 'Loja de Balthazar',
            lat: playerPos.lat + Math.cos(shopAngle) * shopDistance,
            lng: playerPos.lng + Math.sin(shopAngle) * shopDistance
        });

        console.log("Markers atualizados via MissionManager");
    }

    spawnObjectiveMarkers(questDef, questState, centerPos) {
        const mapManager = this.gameManager.mapManager;

        questState.objectives.forEach((objState, index) => {
            // Se já completou esse objetivo específico, não mostra marker
            if (objState.current >= objState.amount) return;

            // Gerar markers para o 'amount' restante
            const remaining = objState.amount - objState.current;

            for (let i = 0; i < remaining; i++) {
                // Espalhar objetivos ao redor do NPC ou Jogador
                // Usar hash composto para posição determinística mas única
                const objHash = (questDef.id.length + index + i) * 123;
                const angle = (objHash % 360) * (Math.PI / 180);
                const dist = 0.0012 + (Math.random() * 0.0005); // Mais afastado (antes era 0.0004)

                const mLat = centerPos.lat + Math.cos(angle) * dist;
                const mLng = centerPos.lng + Math.sin(angle) * dist;

                let icon = '📍';
                let type = 'quest';

                if (objState.type === 'kill') { icon = '⚔️'; type = 'combat'; }
                if (objState.type === 'collect') { icon = '📦'; type = 'collect'; }
                if (objState.type === 'interact') { icon = '🧩'; type = 'puzzle'; }

                mapManager.addMissionMarker({
                    id: `obj_${questDef.id}_${objState.id}_${i}`,
                    type: type,
                    icon: icon,
                    title: objState.description,
                    description: `Objetivo ${i + 1}/${remaining}`,
                    lat: mLat,
                    lng: mLng,
                    questId: questDef.id,
                    objectiveId: objState.id,
                    objectiveType: objState.type, // IMPORTANT: Pass this for MapManager logic
                    target: objState.target, // Modelo 3D
                    isObjective: true
                });
            }
        });
    }

    /**
     * (Removido spawnAvailableQuestMarkers antigo pois agora é unificado)
     */

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
            case QuestObjectiveType.KILL:
                type = 'combat';
                icon = '⚔️';
                break;
            case QuestObjectiveType.COLLECT:
                type = 'collect';
                icon = '📦';
                break;
            case QuestObjectiveType.TALK: // Nota: QuestObjectiveType não tem TALK explícito, mas sim INTERACT. Ajustando.
                type = 'npc';
                icon = '💬';
                break;
            case QuestObjectiveType.EXPLORE: // FIND
                type = 'explore';
                icon = '🔍';
                break;
            case QuestObjectiveType.INTERACT:
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
        const newProgress = Math.min(currentProgress + amount, objective.amount);
        quests.progress[questId][objectiveId] = newProgress;

        if (newProgress >= objective.amount) {
            eventBus.emit('showMessage', {
                text: `✅ Objetivo completo: ${objective.description}`,
                type: 'success'
            });
        } else {
            eventBus.emit('showMessage', {
                text: `📝 ${objective.description}: ${newProgress}/${objective.amount}`,
                type: 'info'
            });
        }

        this.checkQuestCompletion(questId);
        this.gameManager.saveGame();
        this.updateQuestMarkers(); // Refresh markers to remove completed objectives
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
            return current >= obj.amount;
        });

        if (allComplete) {
            eventBus.emit('showMessage', {
                text: `🎉 Missão "${quest.name}" pronta para entregar!`,
                type: 'success'
            });
        }
    }
}
