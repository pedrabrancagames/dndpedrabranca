/**
 * GameMaster - Sistema de Narrativa Virtual
 * Gerencia diálogos, eventos e narrativa do jogo
 */
import { eventBus } from '../core/EventEmitter.js';
import { EnemyDatabase } from '../data/EnemyDatabase.js';
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

        // Evento de Inimigo Derrotado (Bestiário)
        eventBus.on('enemyDied', ({ enemyId }) => {
            this.unlockBestiaryEntry(enemyId);
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
            }

            // Remover da lista de quests ativas
            if (this.gameManager.gameData.quests && this.gameManager.gameData.quests.active) {
                const activeIndex = this.gameManager.gameData.quests.active.indexOf(questId);
                if (activeIndex > -1) {
                    this.gameManager.gameData.quests.active.splice(activeIndex, 1);
                    console.log(`Quest ${questId} removed from active list`);
                }

                // Adicionar à lista de concluídas na estrutura de quests também (para consistência)
                if (!this.gameManager.gameData.quests.completed) {
                    this.gameManager.gameData.quests.completed = [];
                }
                if (!this.gameManager.gameData.quests.completed.includes(questId)) {
                    this.gameManager.gameData.quests.completed.push(questId);
                }
            }

            // Salvar jogo
            this.gameManager.saveGame();

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
    /**
     * Helper para esperar transições CSS
     * @param {HTMLElement} element 
     * @returns {Promise<void>}
     */
    waitForTransition(element) {
        return new Promise(resolve => {
            const onEnd = () => {
                element.removeEventListener('transitionend', onEnd);
                element.removeEventListener('transitioncancel', onEnd);
                resolve();
            };

            // Timeout de segurança caso a transição falhe ou não ocorra
            const timeout = setTimeout(onEnd, 1000);

            element.addEventListener('transitionend', () => {
                clearTimeout(timeout);
                onEnd();
            });
            element.addEventListener('transitioncancel', () => {
                clearTimeout(timeout);
                onEnd();
            });
        });
    }

    /**
     * Helper seguro para delay (ainda útil para ritmo, mas com verificação opcional)
     */
    delay(ms, conditionFn = () => true) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (conditionFn()) resolve();
            }, ms);
        });
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

        // Animar entrada de forma segura
        // Pequeno delay para garantir que o browser registrou o append
        requestAnimationFrame(() => {
            if (!document.body.contains(overlay)) return;
            overlay.classList.add('visible');
        });

        // Espera a transição de entrada
        await this.waitForTransition(overlay);

        // Se o overlay tiver sido fechado nesse meio tempo, aborta
        if (!document.body.contains(overlay)) return;

        // Mostrar linhas uma a uma
        for (const line of lines) {
            if (!document.body.contains(overlay)) break;

            await this.typewriterEffect(linesContainer, line);

            // Pausa entre linhas, verificando se o elemento ainda existe
            await this.delay(500, () => document.body.contains(overlay));
        }

        if (!document.body.contains(overlay)) return;

        // Mostrar botão de continuar
        if (continueBtn) {
            continueBtn.style.display = 'block';

            // Esperar clique
            await new Promise(resolve => {
                const safeResolve = () => {
                    if (document.body.contains(overlay)) resolve();
                };

                continueBtn.onclick = safeResolve;
                overlay.onclick = (e) => {
                    if (e.target === overlay) safeResolve();
                };
            });
        }

        // Animar saída
        if (document.body.contains(overlay)) {
            overlay.classList.remove('visible');
            await this.waitForTransition(overlay);
            if (document.body.contains(overlay)) {
                overlay.remove();
            }
        }

        if (onComplete) onComplete();
    }

    /**
     * Efeito de máquina de escrever seguro
     */
    async typewriterEffect(container, text) {
        const p = document.createElement('p');
        p.className = 'narrative-line';
        container.appendChild(p);

        for (const char of text) {
            // Verifica se o container principal (overlay) ainda está no DOM
            // Isso evita erro se o jogador fechar a janela durante a escrita
            if (!document.body.contains(container)) break;

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
     * Desbloqueia ou atualiza entrada no Bestiário
     */
    unlockBestiaryEntry(enemyInstanceId) {
        // Precisamos descobrir o TIPO do inimigo, não o ID da instância.
        // O ID da instância geralmente é "goblin_123", o tipo é "goblin".
        // O CombatManager ou EnemyDatabase deve ter essa info.
        // Vamos tentar inferir ou pegar do CombatManager se possível.

        const combatManager = this.gameManager.combatManager;
        if (!combatManager) return;

        // Tentar achar o inimigo morto na lista de inimigos (pode já ter sido removido, mas o evento tem o ID)
        // Se foi removido, talvez o CombatManager tenha um histórico ou a gente parseie o ID.
        // Assumindo convenção: type_id ou apenas type se único.
        // Melhor: O CombatManager deve passar o TIPO no evento enemyDied, vou ajustar o CombatManager depois?
        // Por enquanto, vamos tentar achar nos inimigos do encontro (inclusive mortos se não limpou ainda)

        let enemyType = null;

        // Hack: Tentar extrair do ID se for string (ex: "goblin_1", "orc_3")
        if (typeof enemyInstanceId === 'string') {
            const parts = enemyInstanceId.split('_');
            // Remove o último número se for sufixo
            if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
                parts.pop();
                enemyType = parts.join('_');
            } else {
                enemyType = enemyInstanceId;
            }
        }

        // Verificar se existe no DB
        if (!EnemyDatabase[enemyType]) {
            // Tentar procurar nas chaves do EnemyDatabase quem tem esse prefixo
            const match = Object.keys(EnemyDatabase).find(key => enemyInstanceId.startsWith(key));
            if (match) enemyType = match;
            else return; // Não achou tipo válido
        }

        if (!this.gameManager.gameData.bestiary) {
            this.gameManager.gameData.bestiary = {};
        }

        const entry = this.gameManager.gameData.bestiary[enemyType] || { kills: 0, seen: false };
        entry.kills = (entry.kills || 0) + 1;
        entry.seen = true;

        // Notificar desbloqueio na primeira vez ou em marcos (1, 5, 10)
        if (entry.kills === 1) {
            this.showGMMessage(`Nova entrada no Bestiário: ${EnemyDatabase[enemyType].name}`, 'success');
        } else if (entry.kills === 5 || entry.kills === 10) {
            this.showGMMessage(`Informações atualizadas no Bestiário: ${EnemyDatabase[enemyType].name}`, 'info');
        }

        this.gameManager.gameData.bestiary[enemyType] = entry;
        this.gameManager.saveGame();
    }

    /**
     * Utilitário de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
