import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import {
    QuestDatabase,
    QuestStatus,
    QuestType,
    getQuestData,
    getQuestsByChapter,
    getQuestProgress,
    getQuestTypeName,
    getQuestTypeIcon,
    canAcceptQuest
} from '../../data/QuestDatabase.js';
import { getItemData } from '../../data/ItemDatabase.js';
import { eventBus } from '../../core/EventEmitter.js';

export class GMScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.currentTab = 'quests';
        this.currentFilter = 'active';
        this.selectedQuest = null;
    }

    setupEvents() {
        this.bindClick('#btn-gm-back', () => this.gameManager.stateManager.setState(GameState.HOME));
        this.bindClick('#btn-close-quest-modal', () => this.closeQuestModal());
        this.bindClick('#btn-accept-quest', () => this.acceptQuest());
        this.bindClick('#btn-abandon-quest', () => this.abandonQuest());
        this.bindClick('#btn-complete-quest', () => this.completeQuest());

        // Setup tab clicks
        const tabs = this.findElement('#gm-tabs');
        if (tabs) {
            tabs.addEventListener('click', (e) => {
                if (e.target.classList.contains('gm-tab')) {
                    this.setTab(e.target.dataset.tab);
                }
            });
        }

        // Setup quest filter clicks
        const filters = this.findElement('#quest-filters');
        if (filters) {
            filters.addEventListener('click', (e) => {
                if (e.target.classList.contains('quest-filter')) {
                    this.setFilter(e.target.dataset.filter);
                }
            });
        }

        // Setup quest list clicks
        const questList = this.findElement('#quest-list');
        if (questList) {
            questList.addEventListener('click', (e) => {
                const questCard = e.target.closest('.quest-card');
                if (questCard && questCard.dataset.questId) {
                    this.showQuestDetails(questCard.dataset.questId);
                }
            });
        }
    }

    onShow() {
        this.initializeQuestData();
        this.renderQuests();
    }

    initializeQuestData() {
        // Inicializar estrutura de quests no gameData se não existir
        if (!this.gameManager.gameData.quests) {
            this.gameManager.gameData.quests = {
                active: [],      // IDs das quests ativas
                completed: [],   // IDs das quests completas
                progress: {}     // Progresso por quest: { questId: { objectiveId: progress } }
            };
        }
    }

    setTab(tab) {
        this.currentTab = tab;

        // Update active tab button
        const tabs = this.element.querySelectorAll('.gm-tab');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

        // Update visible content
        const contents = this.element.querySelectorAll('.gm-tab-content');
        contents.forEach(c => {
            const tabId = c.id.replace('gm-', '');
            c.classList.toggle('active', tabId === tab);
        });

        if (tab === 'quests') {
            this.renderQuests();
        } else if (tab === 'log') {
            this.renderEventLog();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update active filter button
        const filters = this.element.querySelectorAll('.quest-filter');
        filters.forEach(f => f.classList.toggle('active', f.dataset.filter === filter));

        this.renderQuests();
    }

    getFilteredQuests() {
        const gameData = this.gameManager.gameData;
        const chapter = gameData.chapter || 1;
        const allQuests = getQuestsByChapter(chapter);
        const activeIds = gameData.quests?.active || [];
        const completedIds = gameData.quests?.completed || [];

        switch (this.currentFilter) {
            case 'active':
                return activeIds.map(id => this.getQuestWithProgress(id)).filter(Boolean);

            case 'available':
                return allQuests.filter(quest => {
                    if (activeIds.includes(quest.id) || completedIds.includes(quest.id)) return false;
                    return canAcceptQuest(quest, {
                        level: this.getPlayerLevel(),
                        completedQuests: completedIds
                    });
                });

            case 'completed':
                return completedIds.map(id => getQuestData(id)).filter(Boolean);

            default:
                return [];
        }
    }

    getQuestWithProgress(questId) {
        const quest = getQuestData(questId);
        if (!quest) return null;

        const progress = this.gameManager.gameData.quests?.progress?.[questId] || {};

        // Mesclar progresso com objetivos
        const questWithProgress = { ...quest };
        questWithProgress.objectives = quest.objectives.map(obj => ({
            ...obj,
            progress: progress[obj.id] || 0
        }));

        return questWithProgress;
    }

    getPlayerLevel() {
        const heroes = this.gameManager.gameData.heroes || [];
        if (heroes.length === 0) return 1;
        return Math.max(...heroes.map(h => h.level));
    }

    renderQuests() {
        const questList = this.findElement('#quest-list');
        if (!questList) return;

        const quests = this.getFilteredQuests();

        if (quests.length === 0) {
            const emptyMessages = {
                active: 'Nenhuma missão ativa. Aceite uma missão disponível!',
                available: 'Nenhuma missão disponível no momento.',
                completed: 'Nenhuma missão concluída ainda.'
            };
            questList.innerHTML = `<p class="quest-list-empty">${emptyMessages[this.currentFilter]}</p>`;
            return;
        }

        questList.innerHTML = quests.map(quest => {
            const typeIcon = getQuestTypeIcon(quest.type);
            const typeName = getQuestTypeName(quest.type);
            const progress = getQuestProgress(quest);
            const isCompleted = this.currentFilter === 'completed';

            return `
                <div class="quest-card ${quest.type} ${isCompleted ? 'completed' : ''}" data-quest-id="${quest.id}">
                    <div class="quest-card-header">
                        <span class="quest-type-icon">${typeIcon}</span>
                        <div class="quest-card-title">
                            <h4>${quest.name}</h4>
                            <span class="quest-type-label">${typeName}</span>
                        </div>
                    </div>
                    <p class="quest-card-description">${quest.briefDescription}</p>
                    ${this.currentFilter === 'active' ? `
                        <div class="quest-card-progress">
                            <div class="mini-progress-bar">
                                <div class="mini-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-label">${progress}%</span>
                        </div>
                    ` : ''}
                    ${isCompleted ? '<div class="completed-badge">✅ Concluída</div>' : ''}
                </div>
            `;
        }).join('');
    }

    showQuestDetails(questId) {
        const quest = this.currentFilter === 'active'
            ? this.getQuestWithProgress(questId)
            : getQuestData(questId);

        if (!quest) return;

        this.selectedQuest = quest;
        const isActive = this.gameManager.gameData.quests?.active?.includes(questId);
        const isCompleted = this.gameManager.gameData.quests?.completed?.includes(questId);
        const progress = getQuestProgress(quest);

        // Populate modal
        const modal = this.findElement('#quest-detail-modal');

        // Header
        this.findElement('#quest-type-badge').textContent = `${getQuestTypeIcon(quest.type)} ${getQuestTypeName(quest.type)}`;
        this.findElement('#quest-detail-name').textContent = quest.name;
        this.findElement('#quest-giver').textContent = `Dado por: ${quest.giver}`;
        this.findElement('#quest-detail-description').textContent = quest.description;

        // Objectives
        const objectivesList = this.findElement('#objectives-list');
        if (objectivesList) {
            objectivesList.innerHTML = quest.objectives.map(obj => {
                const completed = obj.progress >= obj.required;
                return `
                    <div class="objective-item ${completed ? 'completed' : ''}">
                        <span class="objective-check">${completed ? '✅' : '⬜'}</span>
                        <span class="objective-text">${obj.description}</span>
                        <span class="objective-progress">${obj.progress}/${obj.required}</span>
                    </div>
                `;
            }).join('');
        }

        // Progress bar
        this.findElement('#quest-progress-fill').style.width = `${progress}%`;
        this.findElement('#quest-progress-text').textContent = `${progress}% Completo`;

        // Rewards
        const rewardsGrid = this.findElement('#rewards-grid');
        if (rewardsGrid) {
            const rewards = [];
            if (quest.rewards.xp) rewards.push(`<span class="reward-item">⭐ ${quest.rewards.xp} XP</span>`);
            if (quest.rewards.gold) rewards.push(`<span class="reward-item">💰 ${quest.rewards.gold} Ouro</span>`);
            if (quest.rewards.items) {
                quest.rewards.items.forEach(itemId => {
                    const item = getItemData(itemId);
                    if (item) rewards.push(`<span class="reward-item">${item.icon} ${item.name}</span>`);
                });
            }
            rewardsGrid.innerHTML = rewards.join('');
        }

        // Action buttons
        const acceptBtn = this.findElement('#btn-accept-quest');
        const abandonBtn = this.findElement('#btn-abandon-quest');
        const completeBtn = this.findElement('#btn-complete-quest');

        acceptBtn.classList.toggle('hidden', isActive || isCompleted);
        abandonBtn.classList.toggle('hidden', !isActive || isCompleted);
        completeBtn.classList.toggle('hidden', !isActive || progress < 100);

        if (modal) modal.classList.remove('hidden');
    }

    closeQuestModal() {
        const modal = this.findElement('#quest-detail-modal');
        if (modal) modal.classList.add('hidden');
        this.selectedQuest = null;
    }

    acceptQuest() {
        if (!this.selectedQuest) return;

        const quests = this.gameManager.gameData.quests;
        if (!quests.active.includes(this.selectedQuest.id)) {
            quests.active.push(this.selectedQuest.id);

            // Inicializar progresso
            quests.progress[this.selectedQuest.id] = {};
            this.selectedQuest.objectives.forEach(obj => {
                quests.progress[this.selectedQuest.id][obj.id] = 0;
            });

            eventBus.emit('showMessage', {
                text: `Missão "${this.selectedQuest.name}" aceita!`,
                type: 'success'
            });

            this.addToEventLog(`📜 Aceitou a missão: ${this.selectedQuest.name}`);
        }

        this.closeQuestModal();
        this.setFilter('active');
        this.gameManager.saveGame();
    }

    abandonQuest() {
        if (!this.selectedQuest) return;

        const quests = this.gameManager.gameData.quests;
        const index = quests.active.indexOf(this.selectedQuest.id);

        if (index > -1) {
            quests.active.splice(index, 1);
            delete quests.progress[this.selectedQuest.id];

            eventBus.emit('showMessage', {
                text: `Missão "${this.selectedQuest.name}" abandonada.`,
                type: 'info'
            });

            this.addToEventLog(`❌ Abandonou a missão: ${this.selectedQuest.name}`);
        }

        this.closeQuestModal();
        this.renderQuests();
        this.gameManager.saveGame();
    }

    completeQuest() {
        if (!this.selectedQuest) return;

        const quests = this.gameManager.gameData.quests;
        const index = quests.active.indexOf(this.selectedQuest.id);

        if (index > -1) {
            // Mover para completadas
            quests.active.splice(index, 1);
            quests.completed.push(this.selectedQuest.id);
            delete quests.progress[this.selectedQuest.id];

            // Dar recompensas
            const rewards = this.selectedQuest.rewards;
            if (rewards.gold) {
                this.gameManager.gameData.gold += rewards.gold;
            }
            if (rewards.xp) {
                this.giveXPToHeroes(rewards.xp);
            }
            if (rewards.items) {
                rewards.items.forEach(itemId => {
                    this.addItemToInventory(itemId);
                });
            }

            eventBus.emit('showMessage', {
                text: `🏆 Missão "${this.selectedQuest.name}" concluída! Recompensas recebidas.`,
                type: 'success'
            });

            this.addToEventLog(`🏆 Completou a missão: ${this.selectedQuest.name}`);
        }

        this.closeQuestModal();
        this.setFilter('completed');
        this.gameManager.saveGame();
    }

    giveXPToHeroes(xp) {
        const heroes = this.gameManager.gameData.heroes;
        const xpPerHero = Math.floor(xp / heroes.length);

        heroes.forEach(hero => {
            hero.xp = (hero.xp || 0) + xpPerHero;
            // Check level up
            const xpNeeded = hero.level * 100;
            while (hero.xp >= xpNeeded) {
                hero.xp -= xpNeeded;
                hero.level++;
                eventBus.emit('showMessage', {
                    text: `🎉 ${hero.name} subiu para o nível ${hero.level}!`,
                    type: 'success'
                });
            }
        });
    }

    addItemToInventory(itemId) {
        const inventory = this.gameManager.gameData.inventory;
        const existing = inventory.find(i => i.itemId === itemId);

        if (existing) {
            existing.quantity++;
        } else {
            inventory.push({ itemId, quantity: 1 });
        }
    }

    addToEventLog(message) {
        if (!this.gameManager.gameData.eventLog) {
            this.gameManager.gameData.eventLog = [];
        }

        this.gameManager.gameData.eventLog.unshift({
            message,
            timestamp: new Date().toLocaleTimeString('pt-BR')
        });

        // Manter apenas os últimos 20 eventos
        if (this.gameManager.gameData.eventLog.length > 20) {
            this.gameManager.gameData.eventLog.pop();
        }
    }

    renderEventLog() {
        const logEl = this.findElement('#event-log');
        if (!logEl) return;

        const events = this.gameManager.gameData.eventLog || [];

        if (events.length === 0) {
            logEl.innerHTML = '<p class="log-empty">Nenhum evento registrado ainda.</p>';
            return;
        }

        logEl.innerHTML = events.map(event => `
            <div class="log-entry">
                <span class="log-time">${event.timestamp}</span>
                <span class="log-message">${event.message}</span>
            </div>
        `).join('');
    }
}
