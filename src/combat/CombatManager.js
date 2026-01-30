/**
 * CombatManager - Gerenciador Central de Combate
 * Coordena Turnos, Cartas e Status
 */
import { TurnManager } from './TurnManager.js';
import { CardSystem } from './CardSystem.js';
import { StatusEffects } from './StatusEffects.js';
import { eventBus } from '../core/EventEmitter.js';
import { GameState } from '../core/StateManager.js';

export class CombatManager {
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.turnManager = new TurnManager();
        this.cardSystem = new CardSystem(this);
        this.statusEffects = new StatusEffects();

        this.activeEncounter = null;

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

        // Mock inimigos para MVP - com type para modelo 3D
        this.enemies = [
            { id: 'goblin_1', name: 'Goblin', type: 'goblin', hp: 30, maxHp: 30, atk: 10 },
            { id: 'goblin_2', name: 'Goblin Arqueiro', type: 'goblin_archer', hp: 25, maxHp: 25, atk: 12 }
        ];

        this.activeEncounter = {
            missionId,
            heroes,
            enemies: this.enemies
        };

        // Transitar UI para combate (já feito pelo MapManager, mas reforçando sub-estado)
        this.gameManager.stateManager.setCombatState('setup');

        // Iniciar turnos
        setTimeout(() => {
            this.gameManager.stateManager.setCombatState('player_turn');
            this.turnManager.startCombat(heroes, this.enemies);
        }, 2000); // Delay simulando animação de entrada
    }

    handleTurnStart(unit) {
        if (unit.type === 'hero') {
            console.log(`Player turn: ${unit.name}`);
            // Atualizar UI de combate com PA cheio
            unit.pa = unit.maxPa;
            // Notificar UI
            // TODO: update HUD
        } else {
            console.log(`Enemy turn: ${unit.name}`);
            this.executeEnemyAI(unit);
        }
    }

    executeEnemyAI(enemy) {
        // IA Simples: Ataca herói aleatório
        setTimeout(() => {
            console.log(`${enemy.name} attacks!`);
            // Aplicar dano (mock)
            const target = this.activeEncounter.heroes[0]; // Sempre ataca o primeiro
            this.applyDamage(target, enemy.atk);
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
        }
        console.log(`${target.name} took ${amount} damage. HP: ${target.hp}`);
        // Emitir evento para visual
        eventBus.emit('damageTaken', { targetId: target.id, amount, currentHp: target.hp });
    }

    handleCombatEnd(victory) {
        alert(victory ? "Vitória!" : "Derrota!");
        this.gameManager.stateManager.setState(GameState.HOME);
        // Dar loot, xp, etc
    }

    isPlayerTurn() {
        // Simplificado
        return true;
    }
}
