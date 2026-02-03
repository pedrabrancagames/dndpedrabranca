import { QuestDatabase, QuestStatus } from '../data/QuestDatabase.js';

export class MissionManager {
    constructor() {
        if (MissionManager.instance) {
            return MissionManager.instance;
        }
        MissionManager.instance = this;

        this.activeQuests = new Map(); // id -> questState
        this.completedQuests = new Set();

        // Carregar estado salvo (mockup para agora)
        this.loadState();
    }

    /**
     * Aceita uma missão, movendo-a para a lista ativa
     * @param {string} questId 
     * @returns {boolean} sucesso
     */
    acceptQuest(questId) {
        const questDef = QuestDatabase[questId];
        if (!questDef) return false;

        if (this.activeQuests.has(questId)) return false;

        // Criar estado da missão (cópia da definição para rastrear progresso)
        const questState = {
            id: questId,
            status: QuestStatus.ACTIVE,
            objectives: questDef.objectives.map(obj => ({ ...obj, current: 0 })),
            acceptedAt: Date.now()
        };

        this.activeQuests.set(questId, questState);
        this.saveState();

        console.log(`[MissionManager] Quest Accepted: ${questId}`);
        // TODO: Disparar evento de 'QuestAccepted' para HUD/Mapa

        return true;
    }

    /**
     * Abandona uma missão ativa
     * @param {string} questId 
     */
    abandonQuest(questId) {
        if (this.activeQuests.has(questId)) {
            this.activeQuests.delete(questId);
            this.saveState();
            console.log(`[MissionManager] Quest Abandoned: ${questId}`);
            // TODO: Disparar evento para limpar objetos do mundo
            return true;
        }
        return false;
    }

    /**
     * Conclui uma missão se todos objetivos estiverem prontos
     * @param {string} questId 
     */
    completeQuest(questId) {
        const questState = this.activeQuests.get(questId);
        if (!questState) return false;

        if (this.canComplete(questId)) {
            this.activeQuests.delete(questId);
            this.completedQuests.add(questId);
            this.saveState();

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
        const questState = this.activeQuests.get(questId);
        if (!questState) return false;

        return questState.objectives.every(obj => obj.current >= obj.amount);
    }

    /**
     * Atualiza o progresso de um objetivo
     * @param {string} type - Tipo de ação (ex: 'kill', 'collect')
     * @param {string} targetId - ID do alvo (ex: 'goblin_grunt')
     * @param {number} amount - Quantidade
     */
    updateProgress(type, targetId, amount = 1) {
        this.activeQuests.forEach(quest => {
            let updated = false;
            quest.objectives.forEach(obj => {
                if (obj.type === type && obj.target === targetId && obj.current < obj.amount) {
                    obj.current += amount;
                    updated = true;
                    console.log(`[MissionManager] Progress: ${quest.id} - ${obj.description} (${obj.current}/${obj.amount})`);
                }
            });

            if (updated) {
                this.saveState();
                // Check if quest is ready to complete (optional: auto-complete or notify)
                if (this.canComplete(quest.id)) {
                    console.log(`[MissionManager] Quest Ready to Turn In: ${quest.id}`);
                }
            }
        });
    }

    getQuestState(questId) {
        if (this.completedQuests.has(questId)) return QuestStatus.COMPLETED;
        if (this.activeQuests.has(questId)) return QuestStatus.ACTIVE;
        return QuestStatus.AVAILABLE;
    }

    getActiveQuests() {
        return Array.from(this.activeQuests.values());
    }

    giveRewards(rewards) {
        console.log("Rewards given:", rewards);
        // Integrar com InventorySystem / PlayerStats posteriormente
    }

    saveState() {
        // Persistência local simples
        localStorage.setItem('dndpb_missions_active', JSON.stringify(Array.from(this.activeQuests.entries())));
        localStorage.setItem('dndpb_missions_completed', JSON.stringify(Array.from(this.completedQuests)));
    }

    loadState() {
        const active = localStorage.getItem('dndpb_missions_active');
        if (active) {
            this.activeQuests = new Map(JSON.parse(active));
        }
        const completed = localStorage.getItem('dndpb_missions_completed');
        if (completed) {
            this.completedQuests = new Set(JSON.parse(completed));
        }
    }
}

export const missionManager = new MissionManager();
