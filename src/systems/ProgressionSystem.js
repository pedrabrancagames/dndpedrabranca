/**
 * ProgressionSystem - Sistema de Progressão
 * Gerencia XP, níveis, upgrades e fragmentos de alma
 */
import { eventBus } from '../core/EventEmitter.js';
import { getUpgradeCost } from '../data/CardDatabase.js';

/**
 * Tabela de XP necessário por nível
 */
const XP_TABLE = [
    0,      // Nível 1 (início)
    100,    // Nível 2
    250,    // Nível 3
    500,    // Nível 4
    850,    // Nível 5
    1300,   // Nível 6
    1900,   // Nível 7
    2650,   // Nível 8
    3550,   // Nível 9
    4600,   // Nível 10
    6000,   // Nível 11
    7700,   // Nível 12
    9700,   // Nível 13
    12000,  // Nível 14
    15000   // Nível 15 (máximo)
];

const MAX_LEVEL = 15;
const MAX_CARD_LEVEL = 2; // 0, 1, 2 (3 níveis)

export class ProgressionSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    /**
     * Adiciona XP a um herói
     * @returns {Object} { leveledUp, newLevel, xpGained }
     */
    addXP(heroId, amount) {
        const hero = this.getHero(heroId);
        if (!hero) return null;

        const previousLevel = hero.level;
        hero.xp += amount;

        // Verificar level up
        while (hero.level < MAX_LEVEL && hero.xp >= this.getXPForNextLevel(hero.level)) {
            hero.xp -= this.getXPForNextLevel(hero.level);
            hero.level++;
            this.applyLevelUpBonus(hero);
        }

        // Cap XP no nível máximo
        if (hero.level >= MAX_LEVEL) {
            hero.xp = 0;
        }

        const leveledUp = hero.level > previousLevel;

        if (leveledUp) {
            console.log(`${hero.name} subiu para nível ${hero.level}!`);
            eventBus.emit('levelUp', {
                heroId,
                newLevel: hero.level,
                levelsGained: hero.level - previousLevel
            });
        }

        eventBus.emit('xpGained', { heroId, amount, total: hero.xp });

        return {
            leveledUp,
            newLevel: hero.level,
            xpGained: amount
        };
    }

    /**
     * Retorna XP necessário para o próximo nível
     */
    getXPForNextLevel(currentLevel) {
        if (currentLevel >= MAX_LEVEL) return Infinity;
        return XP_TABLE[currentLevel];
    }

    /**
     * Aplica bônus de level up
     */
    applyLevelUpBonus(hero) {
        // Bônus por classe
        const bonuses = {
            warrior: { hp: 10, atk: 2, def: 2 },
            mage: { hp: 4, mag: 3, mp: 5 },
            rogue: { hp: 6, atk: 2, crit: 1 },
            cleric: { hp: 7, mag: 2, def: 1 }
        };

        const bonus = bonuses[hero.class] || { hp: 5, atk: 1 };

        hero.maxHp += bonus.hp || 0;
        hero.hp = hero.maxHp; // Full heal on level up
        hero.atk = (hero.atk || 0) + (bonus.atk || 0);
        hero.def = (hero.def || 0) + (bonus.def || 0);
        hero.mag = (hero.mag || 0) + (bonus.mag || 0);
        hero.crit = (hero.crit || 0) + (bonus.crit || 0);
    }

    /**
     * Distribui XP para toda a party após combate
     */
    distributeXP(xpAmount) {
        const heroes = this.gameManager.gameData.heroes;
        const xpPerHero = Math.floor(xpAmount / heroes.length);

        const results = heroes.map(hero => this.addXP(hero.id, xpPerHero));

        eventBus.emit('showMessage', {
            text: `+${xpAmount} XP distribuído!`,
            type: 'success'
        });

        return results;
    }

    /**
     * Tenta fazer upgrade de uma carta
     * @returns {boolean} Sucesso do upgrade
     */
    upgradeCard(heroId, cardIndex) {
        const hero = this.getHero(heroId);
        if (!hero || !hero.deck?.[cardIndex]) return false;

        const card = hero.deck[cardIndex];
        const cardLevel = card.level || 0;

        if (cardLevel >= MAX_CARD_LEVEL) {
            eventBus.emit('showMessage', { text: 'Carta já está no nível máximo!', type: 'error' });
            return false;
        }

        const cost = getUpgradeCost(card.id || card.name.toLowerCase().replace(/ /g, '_'), cardLevel);
        if (!cost) return false;

        const gameData = this.gameManager.gameData;

        // Verificar recursos
        if (gameData.gold < cost.gold) {
            eventBus.emit('showMessage', { text: 'Ouro insuficiente!', type: 'error' });
            return false;
        }

        if ((gameData.fragments || 0) < cost.fragments) {
            eventBus.emit('showMessage', { text: 'Fragmentos insuficientes!', type: 'error' });
            return false;
        }

        // Consumir recursos
        gameData.gold -= cost.gold;
        gameData.fragments = (gameData.fragments || 0) - cost.fragments;

        // Fazer upgrade
        card.level = cardLevel + 1;

        console.log(`Carta ${card.name} melhorada para nível ${card.level + 1}`);
        eventBus.emit('cardUpgraded', { heroId, cardIndex, newLevel: card.level });
        eventBus.emit('showMessage', { text: `${card.name} melhorada!`, type: 'success' });

        return true;
    }

    /**
     * Adiciona fragmentos de alma
     */
    addFragments(amount) {
        const gameData = this.gameManager.gameData;
        gameData.fragments = (gameData.fragments || 0) + amount;

        eventBus.emit('fragmentsGained', { amount, total: gameData.fragments });

        return gameData.fragments;
    }

    /**
     * Adiciona ouro
     */
    addGold(amount) {
        const gameData = this.gameManager.gameData;
        gameData.gold = (gameData.gold || 0) + amount;

        eventBus.emit('goldGained', { amount, total: gameData.gold });

        return gameData.gold;
    }

    /**
     * Processa recompensas de vitória em combate
     */
    processVictoryRewards(enemies) {
        let totalXP = 0;
        let totalGold = 0;
        let totalFragments = 0;

        enemies.forEach(enemy => {
            // XP baseado no HP máximo do inimigo
            totalXP += Math.floor(enemy.maxHp * 0.5);

            // Ouro aleatório
            totalGold += Math.floor(Math.random() * 20) + 10;

            // Fragmentos raros
            if (Math.random() < 0.2) { // 20% de chance
                totalFragments += 1;
            }
        });

        this.distributeXP(totalXP);
        this.addGold(totalGold);

        if (totalFragments > 0) {
            this.addFragments(totalFragments);
            eventBus.emit('showMessage', {
                text: `+${totalFragments} Fragmento(s) de Alma!`,
                type: 'success'
            });
        }

        return { xp: totalXP, gold: totalGold, fragments: totalFragments };
    }

    /**
     * Helper para pegar herói por ID
     */
    getHero(heroId) {
        return this.gameManager.gameData.heroes.find(h => h.id === heroId);
    }

    /**
     * Retorna progresso de XP como porcentagem
     */
    getXPProgress(heroId) {
        const hero = this.getHero(heroId);
        if (!hero || hero.level >= MAX_LEVEL) return 100;

        const required = this.getXPForNextLevel(hero.level);
        return Math.floor((hero.xp / required) * 100);
    }
}
