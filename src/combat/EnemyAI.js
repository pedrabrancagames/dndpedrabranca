/**
 * EnemyAI - Sistema de Inteligência Artificial para Inimigos
 * Define comportamentos e tomada de decisão
 */
import { EnemyBehavior } from '../data/EnemyDatabase.js';
import { eventBus } from '../core/EventEmitter.js';

export class EnemyAI {
    constructor(combatManager) {
        this.combatManager = combatManager;
    }

    /**
     * Executa a ação de um inimigo baseado em seu comportamento
     */
    executeAction(enemy) {
        const behavior = enemy.behavior || EnemyBehavior.AGGRESSIVE;
        const heroes = this.combatManager.activeEncounter?.heroes || [];
        const allies = this.combatManager.enemies.filter(e => e.hp > 0 && e.id !== enemy.id);

        if (heroes.length === 0) return null;

        // Escolher ação baseada no comportamento
        switch (behavior) {
            case EnemyBehavior.AGGRESSIVE:
                return this.aggressiveAction(enemy, heroes);

            case EnemyBehavior.SNIPER:
                return this.sniperAction(enemy, heroes);

            case EnemyBehavior.HEALER:
                return this.healerAction(enemy, heroes, allies);

            case EnemyBehavior.BERSERKER:
                return this.berserkerAction(enemy, heroes);

            case EnemyBehavior.DEFENSIVE:
                return this.defensiveAction(enemy, heroes);

            case EnemyBehavior.TACTICAL:
                return this.tacticalAction(enemy, heroes, allies);

            default:
                return this.aggressiveAction(enemy, heroes);
        }
    }

    /**
     * Comportamento Agressivo: Ataca o primeiro herói disponível
     */
    aggressiveAction(enemy, heroes) {
        const target = heroes.find(h => h.hp > 0) || heroes[0];
        return this.createAttackAction(enemy, target);
    }

    /**
     * Comportamento Sniper: Ataca o herói com menos HP
     */
    sniperAction(enemy, heroes) {
        const aliveHeroes = heroes.filter(h => h.hp > 0);
        const target = aliveHeroes.reduce((weakest, hero) =>
            hero.hp < weakest.hp ? hero : weakest
            , aliveHeroes[0]);

        return this.createAttackAction(enemy, target);
    }

    /**
     * Comportamento Curandeiro: Cura aliados feridos ou ataca
     */
    healerAction(enemy, heroes, allies) {
        // Verificar se algum aliado precisa de cura
        const woundedAlly = allies.find(a => a.hp < a.maxHp * 0.5);

        if (woundedAlly && enemy.abilities?.includes('cura_menor')) {
            return this.createHealAction(enemy, woundedAlly);
        }

        // Se não tiver quem curar, ataca
        return this.aggressiveAction(enemy, heroes);
    }

    /**
     * Comportamento Berserker: Mais dano quando HP baixo
     */
    berserkerAction(enemy, heroes) {
        const hpPercent = enemy.hp / enemy.maxHp;
        const target = heroes.find(h => h.hp > 0) || heroes[0];

        // Bonus de dano quando HP baixo
        const damageMultiplier = hpPercent < 0.3 ? 1.5 : hpPercent < 0.5 ? 1.25 : 1;

        return {
            type: 'attack',
            source: enemy,
            target,
            damage: Math.floor(enemy.atk * damageMultiplier),
            isBerserking: hpPercent < 0.3
        };
    }

    /**
     * Comportamento Defensivo: Defende mais, ataca menos
     */
    defensiveAction(enemy, heroes) {
        const hpPercent = enemy.hp / enemy.maxHp;

        // Se HP alto, ataca normalmente
        if (hpPercent > 0.5) {
            return this.aggressiveAction(enemy, heroes);
        }

        // Se HP baixo, 50% chance de defender
        if (Math.random() < 0.5) {
            return {
                type: 'defend',
                source: enemy,
                defenseBonus: 10
            };
        }

        return this.aggressiveAction(enemy, heroes);
    }

    /**
     * Comportamento Tático: Usa habilidades estrategicamente
     */
    tacticalAction(enemy, heroes, allies) {
        // Prioridade: Curar aliado crítico > Habilidade especial > Ataque

        const abilities = enemy.abilities || ['ataque_basico'];

        // Verificar se pode usar habilidade especial
        for (const ability of abilities) {
            if (ability === 'ataque_basico') continue;

            const action = this.tryUseAbility(enemy, ability, heroes, allies);
            if (action) return action;
        }

        // Fallback para ataque básico
        return this.sniperAction(enemy, heroes);
    }

    /**
     * Tenta usar uma habilidade especial
     */
    tryUseAbility(enemy, abilityId, heroes, allies) {
        switch (abilityId) {
            case 'tiro_certeiro':
                // Ataque com bonus de dano
                const weakestHero = heroes.reduce((w, h) => h.hp < w.hp ? h : w, heroes[0]);
                return {
                    type: 'attack',
                    source: enemy,
                    target: weakestHero,
                    damage: Math.floor(enemy.atk * 1.5),
                    ability: 'Tiro Certeiro'
                };

            case 'cura_menor':
                const wounded = allies.find(a => a.hp < a.maxHp * 0.5);
                if (wounded) {
                    return this.createHealAction(enemy, wounded);
                }
                break;

            case 'maldicao':
                const target = heroes.find(h => h.hp > 0 && !h.cursed);
                if (target) {
                    return {
                        type: 'debuff',
                        source: enemy,
                        target,
                        effect: { cursed: true, atkReduction: 5, duration: 3 },
                        ability: 'Maldição'
                    };
                }
                break;

            case 'veneno':
                const poisonTarget = heroes.find(h => h.hp > 0 && !h.poisoned);
                if (poisonTarget) {
                    return {
                        type: 'debuff',
                        source: enemy,
                        target: poisonTarget,
                        effect: { poisoned: true, dot: 5, duration: 3 },
                        ability: 'Veneno'
                    };
                }
                break;

            case 'teia':
                const webTarget = heroes.find(h => h.hp > 0 && !h.webbed);
                if (webTarget) {
                    return {
                        type: 'debuff',
                        source: enemy,
                        target: webTarget,
                        effect: { webbed: true, speedReduction: 50, duration: 2 },
                        ability: 'Teia'
                    };
                }
                break;
        }

        return null;
    }

    /**
     * Cria uma ação de ataque
     */
    createAttackAction(enemy, target) {
        return {
            type: 'attack',
            source: enemy,
            target,
            damage: enemy.atk
        };
    }

    /**
     * Cria uma ação de cura
     */
    createHealAction(enemy, target) {
        const healAmount = Math.floor((enemy.mag || 10) * 1.5);
        return {
            type: 'heal',
            source: enemy,
            target,
            amount: healAmount,
            ability: 'Cura Menor'
        };
    }

    /**
     * Aplica uma ação determinada
     */
    applyAction(action) {
        if (!action) return;

        switch (action.type) {
            case 'attack':
                this.combatManager.applyDamage(action.target, action.damage);

                const abilityText = action.ability ? ` (${action.ability})` : '';
                console.log(`${action.source.name} atacou ${action.target.name}${abilityText} por ${action.damage} dano`);

                eventBus.emit('showMessage', {
                    text: `${action.source.name} atacou!`,
                    type: 'error'
                });
                break;

            case 'heal':
                const healed = Math.min(action.amount, action.target.maxHp - action.target.hp);
                action.target.hp += healed;

                console.log(`${action.source.name} curou ${action.target.name} por ${healed} HP`);

                eventBus.emit('showMessage', {
                    text: `${action.source.name} curou ${action.target.name}!`,
                    type: 'success'
                });
                break;

            case 'debuff':
                // Aplicar efeito de status
                Object.assign(action.target, action.effect);

                console.log(`${action.source.name} usou ${action.ability} em ${action.target.name}`);

                eventBus.emit('showMessage', {
                    text: `${action.ability}!`,
                    type: 'warning'
                });
                break;

            case 'defend':
                action.source.defending = true;
                action.source.tempDefense = (action.source.tempDefense || 0) + action.defenseBonus;

                console.log(`${action.source.name} está se defendendo (+${action.defenseBonus} DEF)`);
                break;
        }
    }
}
