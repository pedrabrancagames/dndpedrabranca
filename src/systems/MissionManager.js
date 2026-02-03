import { QuestDatabase, QuestStatus } from '../data/QuestDatabase.js';

export class MissionManager {
    constructor() {
        if (MissionManager.instance) {
            return MissionManager.instance;
        }
        MissionManager.instance = this;
        this.gameManager = null;
    }

    init(gameManager) {
        this.gameManager = gameManager;
    }

    getGameData() {
        return this.gameManager ? this.gameManager.gameData : null;
    }

    getQuestById(id) {
        return QuestDatabase[id];
    }

    /**
     * Aceita uma missão, movendo-a para a lista ativa
     * @param {string} questId 
     * @returns {boolean} sucesso
     */
    acceptQuest(questId) {
        const gameData = this.getGameData();
        if (!gameData) return false;

        const questDef = QuestDatabase[questId];
        if (!questDef) return false;

        if (this.isQuestActive(questId) || this.isQuestCompleted(questId)) return false;

        // Adicionar ID à lista ativa
        if (!gameData.quests.active.includes(questId)) {
            gameData.quests.active.push(questId);
        }

        // Inicializar progresso
        if (!gameData.quests.progress) gameData.quests.progress = {};

        // Criar entrada de progresso para a quest se não existir
        if (!gameData.quests.progress[questId]) {
            gameData.quests.progress[questId] = {};
            questDef.objectives.forEach(obj => {
                gameData.quests.progress[questId][obj.id] = 0;
            });
        }

        this.gameManager.saveGame();
        console.log(`[MissionManager] Quest Accepted: ${questId}`);
        return true;
    }

    /**
     * Abandona uma missão ativa
     * @param {string} questId 
     */
    abandonQuest(questId) {
        const gameData = this.getGameData();
        if (!gameData) return false;

        if (this.isQuestActive(questId)) {
            const index = gameData.quests.active.indexOf(questId);
            if (index > -1) {
                gameData.quests.active.splice(index, 1);
                // Opcional: Limpar progresso ou manter? Manter permite retomar.
                // delete gameData.quests.progress[questId];
                this.gameManager.saveGame();
                console.log(`[MissionManager] Quest Abandoned: ${questId}`);
                return true;
            }
        }
        return false;
    }

    /**
     * Conclui uma missão se todos objetivos estiverem prontos
     * @param {string} questId 
     */
    completeQuest(questId) {
        const gameData = this.getGameData();
        if (!gameData) return false;

        if (this.canComplete(questId)) {
            // Remover de ativas
            const index = gameData.quests.active.indexOf(questId);
            if (index > -1) {
                gameData.quests.active.splice(index, 1);
            }

            // Adicionar a completadas
            if (!gameData.quests.completed.includes(questId)) {
                gameData.quests.completed.push(questId);
            }

            // Limpar progresso (já salvo no histórico se precisar)
            delete gameData.quests.progress[questId];

            this.gameManager.saveGame();

            // Entregar recompensas
            const questDef = QuestDatabase[questId];
            this.giveRewards(questDef.rewards);

            console.log(`[MissionManager] Quest Completed: ${questId}`);
            return true;
        }
        return false;
    }

    /**
     * Verifica se todos os objetivos foram cumpridos
     */
    canComplete(questId) {
        const gameData = this.getGameData();
        if (!gameData) return false;

        const questDef = QuestDatabase[questId];
        if (!questDef) return false;

        const progress = gameData.quests.progress[questId] || {};

        return questDef.objectives.every(obj => {
            const current = progress[obj.id] || 0;
            return current >= obj.amount;
        });
    }

    /**
     * Atualiza o progresso de um objetivo
     * O MapScreen chama isso, mas o MapScreen já estava implementando sua própria lógica de update.
     * Vamos unificar.
     */
    updateProgress(questId, objectiveId, amount = 1) {
        // ... Logica movida para usar gameData ...
        // Como o MapScreen chama diretamente updateQuestProgress, esta função pode ser depreciada ou redirecionar
        // Mas para manter compatibilidade:

        // Esta função era genérica (type, targetId). Vamos suportar apenas se necessário.
        // O MapScreen hoje chama: this.updateQuestProgress(questId, objectiveId, amount)
        // O MapScreen gerencia seu próprio save? Sim.
        // Vamos deixar o MapScreen gerenciar a atualização fina, mas o MissionManager deve ser capaz de ler.
    }

    getQuestState(questId) {
        if (this.isQuestCompleted(questId)) return QuestStatus.COMPLETED;
        if (this.isQuestActive(questId)) return QuestStatus.ACTIVE;
        return QuestStatus.AVAILABLE;
    }

    getActiveQuests() {
        const gameData = this.getGameData();
        if (!gameData) return [];

        // Retornar array vazio se não houver quests ativas
        if (!gameData.quests || !gameData.quests.active) return [];

        return gameData.quests.active.map(id => {
            const def = QuestDatabase[id];
            if (!def) return null;

            const prog = gameData.quests.progress[id] || {};

            // Retorna formato híbrido similar ao antigo "questState" para compatibilidade com MapScreen
            return {
                id: id,
                status: QuestStatus.ACTIVE,
                objectives: def.objectives.map(obj => ({
                    ...obj,
                    current: prog[obj.id] || 0
                }))
            };
        }).filter(q => q !== null);
    }

    isQuestActive(questId) {
        return this.gameManager?.gameData.quests.active.includes(questId);
    }

    isQuestCompleted(questId) {
        return this.gameManager?.gameData.quests.completed.includes(questId);
    }

    giveRewards(rewards) {
        if (!this.gameManager) return;
        const gameData = this.gameManager.gameData;

        if (rewards.gold) gameData.gold += rewards.gold;
        if (rewards.xp) {
            // Lógica simplificada de XP
            gameData.heroes.forEach(h => h.xp += (rewards.xp / gameData.heroes.length));
        }
        // ... items ...
        this.gameManager.saveGame();
    }
}

export const missionManager = new MissionManager();
