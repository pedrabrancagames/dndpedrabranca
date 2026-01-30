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
     * @param {string} missionId 
     */
    startEncounter(missionId) {
        console.log(`Starting encounter for mission: ${missionId}`);

        const heroes = this.gameManager.gameData.heroes;

        // Criar inimigos usando o banco de dados
        this.enemies = [
            createEnemyInstance('goblin', 'goblin_1'),
            createEnemyInstance('goblin_archer', 'goblin_2')
        ];

        this.activeEncounter = {
            missionId,
            heroes,
            enemies: this.enemies
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
        if (victory) {
            // Processar recompensas
            const rewards = this.gameManager.progressionSystem.processVictoryRewards(this.enemies);

            eventBus.emit('showMessage', {
                text: `Vitória! +${rewards.gold} ouro`,
                type: 'success'
            });

            console.log('Victory rewards:', rewards);
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

        // Voltar para o mapa após delay
        setTimeout(() => {
            this.gameManager.stateManager.setState(GameState.MAP);
        }, 2000);
    }

    isPlayerTurn() {
        return this.gameManager.stateManager.combatState === 'player_turn';
    }
}
