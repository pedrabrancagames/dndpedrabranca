/**
 * TurnManager - Gerenciador de Turnos
 * Controla a ordem de iniciativa e fluxo do round
 */
import { eventBus } from '../core/EventEmitter.js';

export class TurnManager {
    constructor() {
        this.participants = []; // { id, type, speed, ... }
        this.currentTurnIndex = 0;
        this.round = 1;
        this.active = false;
    }

    /**
     * Inicia o combate
     * @param {Array} heroes 
     * @param {Array} enemies 
     */
    startCombat(heroes, enemies) {
        // Flatten participants
        this.participants = [
            ...heroes.map(h => ({ ...h, type: 'hero', isDead: false })),
            ...enemies.map(e => ({ ...e, type: 'enemy', isDead: false }))
        ];

        // Ordem fixa MVP: Heróis depois Inimigos
        // Ou usar speed no futuro
        this.currentTurnIndex = -1;
        this.round = 1;
        this.active = true;

        console.log('Combat started. Participants:', this.participants.length);
        this.nextTurn();
    }

    /**
     * Avança para o próximo turno
     */
    nextTurn() {
        if (!this.active) return;

        // Verificar vitória/derrota antes de seguir
        if (this.checkEndConditions()) return;

        this.currentTurnIndex++;

        // Loop de round
        if (this.currentTurnIndex >= this.participants.length) {
            this.currentTurnIndex = 0;
            this.round++;
            console.log(`Round ${this.round} started`);
            eventBus.emit('roundStart', this.round);
        }

        const currentUnit = this.participants[this.currentTurnIndex];

        // Pular mortos
        if (currentUnit.isDead) {
            this.nextTurn();
            return;
        }

        console.log(`Turn: ${currentUnit.name}`);
        eventBus.emit('turnStart', currentUnit);

        // Se for inimigo, lógica de IA será chamada externamente
    }

    /**
     * Verifica fim de combate
     */
    checkEndConditions() {
        const heroesAlive = this.participants.filter(p => p.type === 'hero' && !p.isDead).length;
        const enemiesAlive = this.participants.filter(p => p.type === 'enemy' && !p.isDead).length;

        if (heroesAlive === 0) {
            this.endCombat(false); // Derrota
            return true;
        }

        if (enemiesAlive === 0) {
            this.endCombat(true); // Vitória
            return true;
        }

        return false;
    }

    /**
     * Encerra combate
     */
    endCombat(victory) {
        this.active = false;
        eventBus.emit('combatEnd', { victory });
    }

    /**
     * Marca unidade como morta
     */
    killUnit(unitId) {
        const unit = this.participants.find(p => p.id === unitId);
        if (unit) {
            unit.isDead = true;
        }
    }
}
