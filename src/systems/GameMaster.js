/**
 * GameMaster - Sistema de Narrativa Virtual
 * Gerencia diálogos, eventos e narrativa do jogo
 */
import { eventBus } from '../core/EventEmitter.js';
import {
    getChapterIntro,
    getCombatIntro,
    getRandomLine,
    VictoryLines,
    DefeatLines,
    GMCombatLines,
    ExplorationEvents
} from '../data/NarrativeDatabase.js';

export class GameMaster {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isShowingNarrative = false;
        this.currentEvent = null;
        this.narrativeQueue = [];

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos de combate
        eventBus.on('combatStart', ({ enemies }) => {
            const enemyType = this.getEnemyCategory(enemies);
            this.showCombatIntro(enemyType);
        });

        eventBus.on('combatVictory', () => {
            this.showVictoryMessage();
        });

        eventBus.on('combatDefeat', () => {
            this.showDefeatMessage();
        });

        // Eventos de Quest completada via diálogo
        eventBus.on('questCompleted', ({ questId }) => {
            console.log(`Quest Completed via GameMaster: ${questId}`);

            // Remover marcador do mapa
            if (this.gameManager.mapManager) {
                // Tenta remover todos os marcadores dessa quest
                this.gameManager.mapManager.removeMissionMarker(questId);
                // Ou iterar se houver múltiplos
            }

            // Atualizar dados do jogo (Persistência)
            if (!this.gameManager.gameData.completedQuests) {
                this.gameManager.gameData.completedQuests = [];
            }
            if (!this.gameManager.gameData.completedQuests.includes(questId)) {
                this.gameManager.gameData.completedQuests.push(questId);

                // Salvar jogo
                this.gameManager.saveGame();
            }

            this.showGMMessage(`Missão "${questId}" completada!`, 'success');
        });

        // Eventos de ação
        eventBus.on('damageTaken', ({ targetId, amount }) => {
            this.checkCombatSituation();
        });

        // Eventos de capítulo
        eventBus.on('chapterStart', ({ chapter }) => {
            this.showChapterIntro(chapter);
        });
    }

    /**
     * Determina a categoria do inimigo para narrativa
     */
    getEnemyCategory(enemies) {
        if (!enemies || enemies.length === 0) return 'goblin';

        const enemy = enemies[0];
        if (enemy.isBoss) return 'boss';

        const typeMap = {
            humanoid: 'goblin',
            undead: 'undead',
            beast: 'beast',
            demon: 'demon'
        };

        return typeMap[enemy.type] || 'goblin';
    }

    /**
     * Mostra a introdução de um capítulo
     */
    async showChapterIntro(chapter) {
        const intro = getChapterIntro(chapter);
        if (!intro) return;

        this.isShowingNarrative = true;

        await this.showNarrativeOverlay({
            title: intro.title,
            lines: intro.lines,
            type: 'chapter',
            onComplete: () => {
                this.isShowingNarrative = false;
                eventBus.emit('chapterIntroComplete', { chapter });
            }
        });
    }

    /**
     * Mostra introdução do combate
     */
    showCombatIntro(enemyType) {
        const message = getCombatIntro(enemyType);
        this.showGMMessage(message, 'combat');
    }

    /**
     * Mostra mensagem de vitória
     */
    showVictoryMessage() {
        const message = getRandomLine(VictoryLines);
        this.showGMMessage(message, 'success');
    }

    /**
     * Mostra mensagem de derrota
     */
    showDefeatMessage() {
        const message = getRandomLine(DefeatLines);
        this.showGMMessage(message, 'error');
    }

    /**
     * Verifica situação do combate e comenta
     */
    checkCombatSituation() {
        const combatManager = this.gameManager.combatManager;
        if (!combatManager?.activeEncounter) return;

        const heroes = combatManager.activeEncounter.heroes;
        const enemies = combatManager.enemies;

        // Verificar heróis com HP baixo
        const lowHPHero = heroes.find(h => h.hp > 0 && h.hp / h.maxHp < 0.25);
        if (lowHPHero && Math.random() < 0.3) {
            this.showGMMessage(getRandomLine(GMCombatLines.hero_low_hp), 'warning');
            return;
        }

        // Verificar inimigos com HP baixo
        const lowHPEnemy = enemies.find(e => e.hp > 0 && e.hp / e.maxHp < 0.25);
        if (lowHPEnemy && Math.random() < 0.3) {
            this.showGMMessage(getRandomLine(GMCombatLines.enemy_low_hp), 'info');
        }
    }

    /**
     * Mostra uma mensagem do Game Master (toast)
     */
    showGMMessage(text, type = 'info') {
        eventBus.emit('showMessage', {
            text: `🎲 ${text}`,
            type,
            duration: 3000
        });
    }

    /**
     * Mostra overlay de narrativa com texto typewriter
     */
    async showNarrativeOverlay({ title, lines, type, onComplete }) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'narrative-overlay';
        overlay.innerHTML = `
            <div class="narrative-content ${type}">
                <h2 class="narrative-title">${title}</h2>
                <div class="narrative-lines"></div>
                <button class="narrative-continue" style="display: none;">Continuar ▶</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const linesContainer = overlay.querySelector('.narrative-lines');
        const continueBtn = overlay.querySelector('.narrative-continue');

        // Animar entrada
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        // Mostrar linhas uma a uma
        for (const line of lines) {
            await this.typewriterEffect(linesContainer, line);
            await this.delay(500);
        }

        // Mostrar botão de continuar
        continueBtn.style.display = 'block';

        // Esperar clique
        await new Promise(resolve => {
            continueBtn.onclick = resolve;
            overlay.onclick = (e) => {
                if (e.target === overlay) resolve();
            };
        });

        // Animar saída
        overlay.classList.remove('visible');
        await this.delay(300);
        overlay.remove();

        if (onComplete) onComplete();
    }

    /**
     * Efeito de máquina de escrever
     */
    async typewriterEffect(container, text) {
        const p = document.createElement('p');
        p.className = 'narrative-line';
        container.appendChild(p);

        for (const char of text) {
            p.textContent += char;
            await this.delay(30);
        }
    }

    /**
     * Mostra um evento de escolha
     */
    async showChoiceEvent(eventId) {
        const event = ExplorationEvents[eventId];
        if (!event) return null;

        this.currentEvent = event;

        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'choice-overlay';
            overlay.innerHTML = `
                <div class="choice-content">
                    <h2 class="choice-title">${event.title}</h2>
                    <p class="choice-description">${event.description}</p>
                    ${event.loreText ? `<p class="choice-lore">"${event.loreText}"</p>` : ''}
                    <div class="choice-buttons">
                        ${event.choices.map((choice, i) => `
                            <button class="choice-btn" data-index="${i}">
                                ${choice.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.classList.add('visible');
            });

            overlay.querySelectorAll('.choice-btn').forEach(btn => {
                btn.onclick = async () => {
                    const index = parseInt(btn.dataset.index);
                    const choice = event.choices[index];

                    overlay.classList.remove('visible');
                    await this.delay(300);
                    overlay.remove();

                    this.currentEvent = null;
                    resolve(choice);
                };
            });
        });
    }

    /**
     * Processa o resultado de uma escolha
     */
    processChoiceOutcome(choice) {
        if (choice.reward) {
            if (choice.reward.gold) {
                this.gameManager.progressionSystem.addGold(choice.reward.gold);
            }
            if (choice.reward.xp) {
                const heroes = this.gameManager.gameData.heroes;
                heroes.forEach(h => {
                    this.gameManager.progressionSystem.addXP(h.id, choice.reward.xp);
                });
            }
            if (choice.reward.reputation) {
                const gameData = this.gameManager.gameData;
                gameData.reputation = (gameData.reputation || 0) + choice.reward.reputation;
            }
        }

        if (choice.penalty) {
            if (choice.penalty.reputation) {
                const gameData = this.gameManager.gameData;
                gameData.reputation = (gameData.reputation || 0) + choice.penalty.reputation;
            }
        }

        return choice.outcome;
    }

    /**
     * Trigger um evento aleatório de exploração
     */
    triggerRandomEvent() {
        const eventIds = Object.keys(ExplorationEvents);
        const randomId = eventIds[Math.floor(Math.random() * eventIds.length)];
        return this.showChoiceEvent(randomId);
    }

    /**
     * Utilitário de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
