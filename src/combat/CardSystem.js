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

        // Emitir evento para efeitos visuais
        eventBus.emit('cardPlayed', { card, source, target });

        // If targetSelf, use source as target
        const effectTarget = card.targetSelf ? source : target;

        // Aplicar dano
        if (card.damage) {
            let totalDamage = this.calculateDamage(card.damage, source, target);

            // Add fire damage if present
            if (card.fireDamage) {
                totalDamage += card.fireDamage;
            }
            // Add holy damage if present
            if (card.holyDamage) {
                totalDamage += card.holyDamage;
            }

            this.combatManager.applyDamage(target, totalDamage);
            resultLog += ` e causou ${totalDamage} de dano!`;

            eventBus.emit('showMessage', {
                text: `-${totalDamage} HP`,
                type: 'error'
            });
        }

        // Aplicar cura
        if (card.heal) {
            const healAmount = card.heal;
            effectTarget.hp = Math.min(effectTarget.maxHp, effectTarget.hp + healAmount);
            resultLog += ` e curou ${healAmount} HP!`;

            eventBus.emit('damageTaken', {
                targetId: effectTarget.id,
                amount: -healAmount,
                currentHp: effectTarget.hp
            });

            eventBus.emit('showMessage', {
                text: `+${healAmount} HP`,
                type: 'success'
            });
        }

        // Restaurar PA
        if (card.restorePA) {
            source.pa = Math.min(source.maxPa || 3, source.pa + card.restorePA);
            resultLog += ` e restaurou ${card.restorePA} PA!`;

            eventBus.emit('showMessage', {
                text: `+${card.restorePA} PA`,
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

        // Handle consumable cards - remove from deck and inventory
        if (card.consumable) {
            this.handleConsumableCard(card, source);
        }

        console.log(resultLog);

        return {
            success: true,
            log: resultLog
        };
    }


    /**
     * Gerencia cartas consumíveis - remove do deck e do inventário
     */
    handleConsumableCard(card, hero) {
        // Remove card from hero's deck
        const cardIndex = hero.deck.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            hero.deck.splice(cardIndex, 1);
            console.log(`Removed consumable card ${card.name} from deck`);
        }

        // Remove item from inventory
        if (card.sourceItemId) {
            const gameData = this.combatManager.gameManager.gameData;
            const inventory = gameData.inventory || [];
            const invIndex = inventory.findIndex(i => i.itemId === card.sourceItemId);

            if (invIndex !== -1) {
                if (inventory[invIndex].quantity > 1) {
                    inventory[invIndex].quantity--;
                } else {
                    inventory.splice(invIndex, 1);
                }
                console.log(`Removed ${card.sourceItemId} from inventory`);
            }
        }

        eventBus.emit('showMessage', {
            text: `${card.name} consumido!`,
            type: 'info'
        });
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
