/**
 * CombatManager - Gerenciador Central de Combate
 * Coordena Turnos, Cartas e Status
 */
import { TurnManager } from './TurnManager.js';
import { CardSystem } from './CardSystem.js';
import { StatusEffects } from './StatusEffects.js';
import { EnemyAI } from './EnemyAI.js';
import { eventBus } from '../core/EventEmitter.js';
import { GameState } from '../core/StateManager.js';
import { createEnemyInstance, EnemyBehavior } from '../data/EnemyDatabase.js';

export class CombatManager {
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.turnManager = new TurnManager();
        this.cardSystem = new CardSystem(this);
        this.statusEffects = new StatusEffects();
        this.enemyAI = new EnemyAI(this);

        this.activeEncounter = null;
        this.enemies = [];

        this.setupEvents();
    }

    setupEvents() {
        eventBus.on('passTurn', () => {
            if (this.isPlayerTurn()) {
                this.turnManager.nextTurn();
            }
        });

        eventBus.on('turnStart', (unit) => {
            this.handleTurnStart(unit);
        });

        eventBus.on('combatEnd', ({ victory }) => {
            this.handleCombatEnd(victory);
        });
    }

    /**
     * Inicia um encontro de combate
     * @param {Object} encounterData - Dados do encontro (missionId, questId, objectiveId, etc.)
     */
    startEncounter(encounterData) {
        // Suportar tanto string (legacy) quanto objeto
        const missionId = typeof encounterData === 'string' ? encounterData : encounterData.missionId;
        const questId = encounterData?.questId || null;
        const objectiveId = encounterData?.objectiveId || null;
        const target = encounterData?.target || null;

        console.log(`Starting encounter for mission: ${missionId}`, { questId, objectiveId });

        const heroes = this.gameManager.gameData.heroes;

        // Determinar inimigos com base no target
        this.enemies = this.spawnEnemiesForTarget(target);

        this.activeEncounter = {
            missionId,
            questId,
            objectiveId,
            target,
            heroes,
            enemies: this.enemies,
            enemiesKilled: 0
        };

        // Transitar UI para combate
        this.gameManager.stateManager.setCombatState('setup');

        // Iniciar turnos
        setTimeout(() => {
            this.gameManager.stateManager.setCombatState('player_turn');
            this.turnManager.startCombat(heroes, this.enemies);
        }, 2000);
    }

    handleTurnStart(unit) {
        if (unit.type === 'hero') {
            console.log(`Player turn: ${unit.name}`);
            unit.pa = unit.maxPa;
            eventBus.emit('heroTurnStart', { hero: unit });
        } else {
            console.log(`Enemy turn: ${unit.name}`);
            this.executeEnemyTurn(unit);
        }
    }

    /**
     * Executa o turno de um inimigo usando a IA
     */
    executeEnemyTurn(enemy) {
        setTimeout(() => {
            // Usar sistema de IA para decidir ação
            const action = this.enemyAI.executeAction(enemy);

            if (action) {
                this.enemyAI.applyAction(action);
            }

            // Limpar efeitos temporários
            if (enemy.defending) {
                enemy.defending = false;
                enemy.tempDef = 0;
            }

            this.turnManager.nextTurn();
        }, 1500);
    }

    /**
     * Aplica dano a uma unidade
     */
    applyDamage(target, amount) {
        target.hp -= amount;
        if (target.hp <= 0) {
            target.hp = 0;
            this.turnManager.killUnit(target.id);
            console.log(`${target.name} died!`);

            // Contar inimigo morto para progresso de quest
            if (this.activeEncounter && target.type !== 'hero') {
                this.activeEncounter.enemiesKilled = (this.activeEncounter.enemiesKilled || 0) + 1;
            }

            // Emitir evento de morte para animação
            eventBus.emit('enemyDied', { enemyId: target.id });

            // Verificar condição de vitória
            this.checkVictoryCondition();
        }
        console.log(`${target.name} took ${amount} damage. HP: ${target.hp}`);
        // Emitir evento para visual
        eventBus.emit('damageTaken', { targetId: target.id, amount, currentHp: target.hp });
    }

    /**
     * Verifica se o combate terminou
     */
    checkVictoryCondition() {
        if (!this.activeEncounter) return;

        const aliveEnemies = this.enemies.filter(e => e.hp > 0);
        const aliveHeroes = this.activeEncounter.heroes.filter(h => h.hp > 0);

        if (aliveEnemies.length === 0) {
            // Vitória!
            setTimeout(() => this.handleCombatEnd(true), 1000);
        } else if (aliveHeroes.length === 0) {
            // Derrota
            setTimeout(() => this.handleCombatEnd(false), 1000);
        }
    }

    handleCombatEnd(victory) {
        const encounter = this.activeEncounter;

        if (victory) {
            // Processar recompensas
            const rewards = this.gameManager.progressionSystem.processVictoryRewards(this.enemies);

            eventBus.emit('showMessage', {
                text: `Vitória! +${rewards.gold} ouro`,
                type: 'success'
            });

            console.log('Victory rewards:', rewards);

            // EMITIR EVENTO DE VITÓRIA PARA ATUALIZAR PROGRESSO DE QUESTS
            eventBus.emit('combat:victory', {
                missionId: encounter?.missionId,
                questId: encounter?.questId,
                objectiveId: encounter?.objectiveId,
                target: encounter?.target,
                enemiesKilled: encounter?.enemiesKilled || this.enemies.length
            });
        } else {
            eventBus.emit('showMessage', {
                text: 'Derrota... Tente novamente!',
                type: 'error'
            });
        }

        // Encerrar sessão AR
        if (this.gameManager.arSceneManager) {
            this.gameManager.arSceneManager.endSession();
        }

        // Limpar encontro ativo
        this.activeEncounter = null;

        // Voltar para o mapa após delay
        setTimeout(() => {
            this.gameManager.stateManager.setState(GameState.MAP);
        }, 2000);
    }

    clearEnemies() {
        this.enemies = [];
        this.activeEncounter = null;
    }

    /**
     * Gera lista de inimigos baseada no alvo da missão
     */
    spawnEnemiesForTarget(target) {
        if (!target) {
            // Default: patrulha goblin
            return [
                createEnemyInstance('goblin', 'goblin_1'),
                createEnemyInstance('goblin_archer', 'goblin_2')
            ];
        }

        const targetLower = target.toLowerCase();

        // Bosses
        if (targetLower.includes('grukk') || targetLower.includes('boss') || targetLower.includes('leader')) {
            return [
                createEnemyInstance('goblin_king', 'boss_grukk'),
                createEnemyInstance('goblin_shaman', 'minion_1')
            ];
        }

        // Tipos comuns
        if (targetLower.includes('goblin')) {
            // Ameaça média: 3-5 goblins (Ajustado para quests)
            const enemies = [
                createEnemyInstance('goblin', 'goblin_1'),
                createEnemyInstance('goblin', 'goblin_2'),
                createEnemyInstance('goblin_archer', 'goblin_3')
            ];

            // Chance alta de adicionar mais inimigos
            if (Math.random() > 0.3) enemies.push(createEnemyInstance('goblin_shaman', 'goblin_4'));
            if (Math.random() > 0.6) enemies.push(createEnemyInstance('goblin', 'goblin_extra'));

            return enemies;
        }

        if (targetLower.includes('wolf')) {
            return [
                createEnemyInstance('wolf', 'wolf_1'),
                createEnemyInstance('wolf', 'wolf_2')
            ];
        }

        if (targetLower.includes('skeleton')) {
            return [
                createEnemyInstance('skeleton', 'skel_1'),
                createEnemyInstance('skeleton', 'skel_2')
            ];
        }

        // Fallback genérico
        return [
            createEnemyInstance('goblin', 'goblin_1'),
            createEnemyInstance('goblin', 'goblin_2')
        ];
    }

    isPlayerTurn() {
        return this.gameManager.stateManager.combatState === 'player_turn';
    }
}
