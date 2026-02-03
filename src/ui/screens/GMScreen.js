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
import {
    ExplorationEvents,
    ConsequenceType,
    getRandomEvent,
    getEventTypeName,
    getEventTypeColor
} from '../../data/ExplorationEvents.js';
import { getItemData } from '../../data/ItemDatabase.js';
import { eventBus } from '../../core/EventEmitter.js';

export class GMScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.currentTab = 'quests';
        this.currentFilter = 'active';
        this.selectedQuest = null;
        // Eventos
        this.currentEvent = null;
        this.selectedChoice = null;
    }

    setupEvents() {
        this.bindClick('#btn-gm-back', () => this.gameManager.stateManager.setState(GameState.HOME));
        this.bindClick('#btn-close-quest-modal', () => this.closeQuestModal());
        this.bindClick('#btn-accept-quest', () => this.acceptQuest());
        this.bindClick('#btn-abandon-quest', () => this.abandonQuest());
        this.bindClick('#btn-complete-quest', () => this.completeQuest());

        // Eventos de Exploração
        this.bindClick('#btn-explore', () => this.triggerRandomEvent());
        this.bindClick('#btn-continue-event', () => this.closeEventResultModal());

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

        // Setup event choices clicks
        const eventChoices = this.findElement('#event-choices');
        if (eventChoices) {
            eventChoices.addEventListener('click', (e) => {
                const choiceBtn = e.target.closest('.event-choice-btn');
                if (choiceBtn && choiceBtn.dataset.choiceId) {
                    this.selectChoice(choiceBtn.dataset.choiceId);
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
                const completed = obj.progress >= obj.amount;
                return `
                    <div class="objective-item ${completed ? 'completed' : ''}">
                        <span class="objective-check">${completed ? '✅' : '⬜'}</span>
                        <span class="objective-text">${obj.description}</span>
                        <span class="objective-progress">${obj.progress}/${obj.amount}</span>
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

    // ========== EVENTOS DE EXPLORAÇÃO ==========

    triggerRandomEvent() {
        this.currentEvent = getRandomEvent();
        this.showEventModal();
    }

    showEventModal() {
        if (!this.currentEvent) return;

        const modal = this.findElement('#exploration-event-modal');
        const event = this.currentEvent;

        // Header
        const typeBadge = this.findElement('#event-type-badge');
        typeBadge.textContent = getEventTypeName(event.type);
        typeBadge.style.backgroundColor = getEventTypeColor(event.type);

        this.findElement('#event-icon').textContent = event.icon;
        this.findElement('#event-title').textContent = event.title;
        this.findElement('#event-narration').textContent = event.description;

        // Choices
        const choicesContainer = this.findElement('#event-choices');
        if (choicesContainer) {
            choicesContainer.innerHTML = event.choices.map(choice => {
                // Verificar requisitos
                let disabled = false;
                let tooltip = '';

                if (choice.requirements) {
                    if (choice.requirements.gold && this.gameManager.gameData.gold < choice.requirements.gold) {
                        disabled = true;
                        tooltip = `Requer ${choice.requirements.gold} ouro`;
                    }
                }

                return `
                    <button class="event-choice-btn ${disabled ? 'disabled' : ''}" 
                            data-choice-id="${choice.id}"
                            ${disabled ? 'disabled' : ''}
                            ${tooltip ? `title="${tooltip}"` : ''}>
                        ${choice.text}
                        ${choice.skillCheck ? `<span class="skill-check-indicator">🎲</span>` : ''}
                    </button>
                `;
            }).join('');
        }

        if (modal) modal.classList.remove('hidden');
        this.addToEventLog(`🎲 Evento: ${event.title}`);
    }

    selectChoice(choiceId) {
        if (!this.currentEvent) return;

        const choice = this.currentEvent.choices.find(c => c.id === choiceId);
        if (!choice) return;

        this.selectedChoice = choice;

        // Verificar skill check se existir
        let success = true;
        let rollResult = null;

        if (choice.skillCheck) {
            rollResult = this.performSkillCheck(choice.skillCheck);
            success = rollResult.success;
        }

        // Aplicar consequências
        const consequences = success ? choice.consequences : (choice.failConsequences || []);
        this.applyConsequences(consequences);

        // Mostrar resultado
        this.showEventResult(choice, success, rollResult);
    }

    performSkillCheck(check) {
        // Rolagem D20 + modificador
        const roll = Math.floor(Math.random() * 20) + 1;

        // Pegar modificador do herói principal
        const heroes = this.gameManager.gameData.heroes;
        const hero = heroes[0];

        let modifier = 0;
        switch (check.stat) {
            case 'str': modifier = Math.floor((hero.atk - 10) / 2); break;
            case 'dex': modifier = Math.floor((hero.dex || 10 - 10) / 2); break;
            case 'con': modifier = Math.floor((hero.con || 12 - 10) / 2); break;
            case 'int': modifier = Math.floor((hero.int || 10 - 10) / 2); break;
            case 'cha': modifier = Math.floor((hero.cha || 10 - 10) / 2); break;
            default: modifier = 0;
        }

        const total = roll + modifier;
        const success = total >= check.difficulty;

        return { roll, modifier, total, difficulty: check.difficulty, success };
    }

    applyConsequences(consequences) {
        consequences.forEach(consequence => {
            switch (consequence.type) {
                case ConsequenceType.GOLD:
                    this.gameManager.gameData.gold = Math.max(0, this.gameManager.gameData.gold + consequence.value);
                    break;
                case ConsequenceType.XP:
                    this.giveXPToHeroes(consequence.value);
                    break;
                case ConsequenceType.HEAL:
                    this.healHeroes(consequence.value);
                    break;
                case ConsequenceType.DAMAGE:
                    this.damageHeroes(consequence.value);
                    break;
                case ConsequenceType.ITEM:
                    this.addItemToInventory(consequence.itemId);
                    break;
                case ConsequenceType.COMBAT:
                    // TODO: Integrar com sistema de combate
                    eventBus.emit('showMessage', { text: 'Combate iniciado!', type: 'warning' });
                    break;
            }
        });

        this.gameManager.saveGame();
    }

    healHeroes(amount) {
        this.gameManager.gameData.heroes.forEach(hero => {
            hero.hp = Math.min(hero.maxHp, hero.hp + amount);
        });
    }

    damageHeroes(amount) {
        this.gameManager.gameData.heroes.forEach(hero => {
            hero.hp = Math.max(1, hero.hp - Math.floor(amount / this.gameManager.gameData.heroes.length));
        });
    }

    showEventResult(choice, success, rollResult) {
        // Fechar modal do evento
        const eventModal = this.findElement('#exploration-event-modal');
        if (eventModal) eventModal.classList.add('hidden');

        // Mostrar modal de resultado
        const resultModal = this.findElement('#event-result-modal');

        // Ícone
        const resultIcon = this.findElement('#result-icon');
        resultIcon.textContent = success ? '✨' : '💔';

        // Texto
        const resultText = this.findElement('#result-text');
        resultText.textContent = choice.followUp;

        // Consequências
        const consequencesEl = this.findElement('#result-consequences');
        const consequences = success ? choice.consequences : (choice.failConsequences || []);

        if (consequencesEl) {
            // Adicionar info de skill check se houver
            let html = '';

            if (rollResult) {
                html += `
                    <div class="roll-result ${success ? 'success' : 'failure'}">
                        🎲 Rolou ${rollResult.roll} + ${rollResult.modifier} = ${rollResult.total} 
                        vs DC ${rollResult.difficulty}
                        <span class="roll-outcome">${success ? '✅ Sucesso!' : '❌ Falha!'}</span>
                    </div>
                `;
            }

            html += consequences.map(c => `
                <div class="consequence-item ${c.type}">${c.message}</div>
            `).join('');

            consequencesEl.innerHTML = html;
        }

        if (resultModal) resultModal.classList.remove('hidden');
    }

    closeEventResultModal() {
        const modal = this.findElement('#event-result-modal');
        if (modal) modal.classList.add('hidden');
        this.currentEvent = null;
        this.selectedChoice = null;
    }

    // ========== HELPERS ==========

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

