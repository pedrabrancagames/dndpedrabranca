/**
 * CardSystem - Sistema de Cartas
 * Gerencia validação, efeitos e execução de cartas
 */
import { eventBus } from '../core/EventEmitter.js';

export class CardSystem {
    constructor(combatManager) {
        this.combatManager = combatManager;
    }

    /**
     * Valida se a carta pode ser jogada
     */
    canPlayCard(card, hero) {
        if (hero.pa < card.cost) return false;
        return true;
    }

    /**
     * Executa o efeito de uma carta
     * @param {Object} card - Dados da carta (do deck do herói)
     * @param {Object} source - Herói que usou a carta
     * @param {Object} target - Alvo (inimigo ou herói)
     */
    executeCard(card, source, target) {
        let resultLog = `${source.name} usou ${card.name}`;

        // Aplicar dano
        if (card.damage) {
            const finalDamage = this.calculateDamage(card.damage, source, target);
            this.combatManager.applyDamage(target, finalDamage);
            resultLog += ` e causou ${finalDamage} de dano!`;

            eventBus.emit('showMessage', {
                text: `-${finalDamage} HP`,
                type: 'error'
            });
        }

        // Aplicar cura
        if (card.heal) {
            const healAmount = card.heal;
            target.hp = Math.min(target.maxHp, target.hp + healAmount);
            resultLog += ` e curou ${healAmount} HP!`;

            eventBus.emit('damageTaken', {
                targetId: target.id,
                amount: -healAmount,
                currentHp: target.hp
            });

            eventBus.emit('showMessage', {
                text: `+${healAmount} HP`,
                type: 'success'
            });
        }

        // Aplicar defesa/buff
        if (card.defense) {
            source.tempDefense = (source.tempDefense || 0) + card.defense;
            resultLog += ` e ganhou +${card.defense} defesa!`;
        }

        // Aplicar buff
        if (card.buff) {
            Object.entries(card.buff).forEach(([stat, value]) => {
                source[stat] = (source[stat] || 0) + value;
            });
            resultLog += ` e recebeu um buff!`;
        }

        // Aplicar DoT (Damage over Time)
        if (card.dot) {
            target.statusEffects = target.statusEffects || [];
            target.statusEffects.push({
                type: 'dot',
                name: card.name,
                damage: card.dot,
                duration: card.duration || 3
            });
            resultLog += ` e aplicou ${card.name}!`;
        }

        // Aplicar cleanse
        if (card.cleanse) {
            target.statusEffects = [];
            resultLog += ` e removeu todos os debuffs!`;
        }

        console.log(resultLog);

        return {
            success: true,
            log: resultLog
        };
    }

    /**
     * Calcula dano final considerando ataque e defesa
     */
    calculateDamage(baseDamage, source, target) {
        const attackBonus = source.atk ? Math.floor(source.atk / 5) : 0;
        const defense = target.def || 0;
        const tempDefense = target.tempDefense || 0;

        const totalDamage = Math.max(1, baseDamage + attackBonus - defense - tempDefense);

        // Reset defesa temporária após uso
        if (target.tempDefense) target.tempDefense = 0;

        return totalDamage;
    }
}
