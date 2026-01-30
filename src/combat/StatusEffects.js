/**
 * StatusEffects - Sistema de Efeitos de Status
 * Gerencia buffs e debuffs em unidades
 */

export const StatusType = {
    BURN: 'burn',         // Dano por turno
    POISON: 'poison',     // Dano por turno
    FREEZE: 'freeze',     // Perde turno
    STUN: 'stun',         // Perde turno
    SLOW: 'slow',         // -1 PA
    BLESS: 'bless',       // +Dano
    PROTECT: 'protect',   // +Defesa
    INVISIBLE: 'invisible' // Não pode ser alvo
};

export class StatusEffects {
    constructor() {
        this.activeEffects = new Map(); // targetId -> list of effects
    }

    /**
     * Aplica um status a um alvo
     */
    applyStatus(targetId, type, duration, value = 0) {
        if (!this.activeEffects.has(targetId)) {
            this.activeEffects.set(targetId, []);
        }

        const effects = this.activeEffects.get(targetId);

        // Verificar se já tem o efeito (renovar ou acumular?)
        // Por simplicidade MVP: renova duração
        const existing = effects.find(e => e.type === type);
        if (existing) {
            existing.duration = duration;
            existing.value = value;
        } else {
            effects.push({ type, duration, value });
        }

        console.log(`Status applied: ${type} on ${targetId} for ${duration} turns`);

        // Check combos
        this.checkCombos(targetId);
    }

    /**
     * Verifica e processa combos de status
     * Ex: Molhado + Gelo = Congelado
     */
    checkCombos(targetId) {
        const effects = this.activeEffects.get(targetId);
        if (!effects) return;

        const types = effects.map(e => e.type);

        // Exemplo de combo: Se tiver WET e usar ICE -> FREEZE
        // (Lógica completa será expandida depois)
    }

    /**
     * Processa efeitos no início do turno
     */
    processStartTurn(targetId) {
        const effects = this.activeEffects.get(targetId);
        if (!effects) return { canAct: true, damage: 0 };

        let canAct = true;
        let turnDamage = 0;

        // Processar efeitos
        effects.forEach(effect => {
            switch (effect.type) {
                case StatusType.FREEZE:
                case StatusType.STUN:
                    canAct = false;
                    break;
                case StatusType.BURN:
                    turnDamage += 10;
                    break;
                case StatusType.POISON:
                    turnDamage += 10;
                    break;
            }

            // Decrementar duração
            effect.duration--;
        });

        // Remover efeitos expirados
        const active = effects.filter(e => e.duration > 0);
        this.activeEffects.set(targetId, active);

        return { canAct, damage: turnDamage };
    }

    /**
     * Limpa efeitos de um alvo
     */
    clearStatus(targetId) {
        this.activeEffects.delete(targetId);
    }
}
