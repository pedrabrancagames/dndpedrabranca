/**
 * CardDatabase - Base de dados de todas as cartas do jogo
 * Define stats, efeitos e upgrades de cada carta
 */

export const CardRarity = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

export const CardType = {
    ATTACK: 'attack',
    SKILL: 'skill',
    SPELL: 'spell',
    HEAL: 'heal',
    BUFF: 'buff',
    DEBUFF: 'debuff'
};

/**
 * Base de dados de cartas
 * Cada carta pode ter múltiplos níveis (upgrade)
 */
export const CardDatabase = {
    // ========== GUERREIRO ==========
    golpe: {
        name: 'Golpe',
        icon: '⚔️',
        type: CardType.ATTACK,
        rarity: CardRarity.COMMON,
        class: 'warrior',
        levels: [
            { cost: 1, damage: 15, description: 'Ataque básico' },
            { cost: 1, damage: 20, description: 'Ataque básico +' },
            { cost: 1, damage: 25, description: 'Ataque básico ++' }
        ]
    },
    golpe_brutal: {
        name: 'Golpe Brutal',
        icon: '💥',
        type: CardType.ATTACK,
        rarity: CardRarity.UNCOMMON,
        class: 'warrior',
        levels: [
            { cost: 2, damage: 30, description: 'Ataque pesado' },
            { cost: 2, damage: 40, description: 'Ataque pesado +' },
            { cost: 2, damage: 50, description: 'Ataque devastador' }
        ]
    },
    escudo: {
        name: 'Escudo',
        icon: '🛡️',
        type: CardType.BUFF,
        rarity: CardRarity.COMMON,
        class: 'warrior',
        targetSelf: true,
        levels: [
            { cost: 1, defense: 10, description: '+10 defesa este turno' },
            { cost: 1, defense: 15, description: '+15 defesa este turno' },
            { cost: 1, defense: 20, description: '+20 defesa este turno' }
        ]
    },
    investida: {
        name: 'Investida',
        icon: '🏃',
        type: CardType.ATTACK,
        rarity: CardRarity.UNCOMMON,
        class: 'warrior',
        levels: [
            { cost: 2, damage: 25, stun: 1, description: 'Ataca e atordoa' },
            { cost: 2, damage: 30, stun: 1, description: 'Ataca e atordoa +' },
            { cost: 2, damage: 35, stun: 2, description: 'Atordoamento maior' }
        ]
    },
    provocar: {
        name: 'Provocar',
        icon: '😤',
        type: CardType.SKILL,
        rarity: CardRarity.RARE,
        class: 'warrior',
        targetSelf: true,
        levels: [
            { cost: 1, taunt: true, defense: 5, description: 'Força inimigos a atacar você' },
            { cost: 1, taunt: true, defense: 10, description: 'Provocação +' },
            { cost: 0, taunt: true, defense: 15, description: 'Provocação gratuita' }
        ]
    },
    furia: {
        name: 'Fúria',
        icon: '🔥',
        type: CardType.BUFF,
        rarity: CardRarity.EPIC,
        class: 'warrior',
        targetSelf: true,
        levels: [
            { cost: 2, buff: { atk: 10 }, duration: 3, description: '+10 ATK por 3 turnos' },
            { cost: 2, buff: { atk: 15 }, duration: 3, description: '+15 ATK por 3 turnos' },
            { cost: 2, buff: { atk: 20 }, duration: 4, description: '+20 ATK por 4 turnos' }
        ]
    },

    // ========== MAGO ==========
    missil_arcano: {
        name: 'Míssil Arcano',
        icon: '✨',
        type: CardType.SPELL,
        rarity: CardRarity.COMMON,
        class: 'mage',
        levels: [
            { cost: 1, damage: 20, description: 'Projétil mágico certeiro' },
            { cost: 1, damage: 25, description: 'Míssil arcano +' },
            { cost: 1, damage: 30, description: 'Míssil arcano ++' }
        ]
    },
    bola_de_fogo: {
        name: 'Bola de Fogo',
        icon: '🔥',
        type: CardType.SPELL,
        rarity: CardRarity.RARE,
        class: 'mage',
        levels: [
            { cost: 2, damage: 25, aoe: true, description: 'Atinge todos os inimigos' },
            { cost: 2, damage: 35, aoe: true, description: 'Explosão maior' },
            { cost: 2, damage: 45, aoe: true, burn: 5, description: 'Queimadura adicional' }
        ]
    },
    raio: {
        name: 'Raio',
        icon: '⚡',
        type: CardType.SPELL,
        rarity: CardRarity.UNCOMMON,
        class: 'mage',
        levels: [
            { cost: 2, damage: 35, description: 'Descarga elétrica' },
            { cost: 2, damage: 45, description: 'Raio intenso' },
            { cost: 2, damage: 55, chain: 1, description: 'Encadeia para outro inimigo' }
        ]
    },
    escudo_arcano: {
        name: 'Escudo Arcano',
        icon: '🔮',
        type: CardType.BUFF,
        rarity: CardRarity.UNCOMMON,
        class: 'mage',
        targetSelf: true,
        levels: [
            { cost: 1, defense: 15, description: 'Barreira mágica' },
            { cost: 1, defense: 20, description: 'Barreira reforçada' },
            { cost: 1, defense: 25, reflect: 5, description: 'Reflete 5 dano' }
        ]
    },
    cone_de_gelo: {
        name: 'Cone de Gelo',
        icon: '❄️',
        type: CardType.SPELL,
        rarity: CardRarity.RARE,
        class: 'mage',
        levels: [
            { cost: 2, damage: 20, slow: 1, description: 'Gelo que desacelera' },
            { cost: 2, damage: 30, slow: 2, description: 'Congelamento parcial' },
            { cost: 2, damage: 40, freeze: 1, description: 'Congela por 1 turno' }
        ]
    },
    meteoro: {
        name: 'Meteoro',
        icon: '☄️',
        type: CardType.SPELL,
        rarity: CardRarity.LEGENDARY,
        class: 'mage',
        levels: [
            { cost: 3, damage: 60, aoe: true, description: 'Devastação celestial' },
            { cost: 3, damage: 80, aoe: true, description: 'Chuva de meteoros' },
            { cost: 3, damage: 100, aoe: true, stun: 1, description: 'Apocalipse' }
        ]
    },

    // ========== LADINO ==========
    punhalada: {
        name: 'Punhalada',
        icon: '🗡️',
        type: CardType.ATTACK,
        rarity: CardRarity.COMMON,
        class: 'rogue',
        levels: [
            { cost: 1, damage: 18, description: 'Golpe rápido' },
            { cost: 1, damage: 23, description: 'Punhalada +' },
            { cost: 1, damage: 28, description: 'Punhalada ++' }
        ]
    },
    golpe_furtivo: {
        name: 'Golpe Furtivo',
        icon: '👤',
        type: CardType.ATTACK,
        rarity: CardRarity.RARE,
        class: 'rogue',
        levels: [
            { cost: 2, damage: 45, critBonus: 50, description: 'Crítico garantido se furtivo' },
            { cost: 2, damage: 55, critBonus: 75, description: 'Assassinato +' },
            { cost: 2, damage: 65, critBonus: 100, description: 'Execução silenciosa' }
        ]
    },
    veneno: {
        name: 'Veneno',
        icon: '☠️',
        type: CardType.DEBUFF,
        rarity: CardRarity.UNCOMMON,
        class: 'rogue',
        levels: [
            { cost: 1, dot: 5, duration: 3, description: '5 dano/turno por 3 turnos' },
            { cost: 1, dot: 8, duration: 3, description: '8 dano/turno por 3 turnos' },
            { cost: 1, dot: 10, duration: 4, description: '10 dano/turno por 4 turnos' }
        ]
    },
    evasao: {
        name: 'Evasão',
        icon: '💨',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        class: 'rogue',
        targetSelf: true,
        levels: [
            { cost: 1, dodge: 1, description: 'Esquiva o próximo ataque' },
            { cost: 1, dodge: 2, description: 'Esquiva 2 ataques' },
            { cost: 0, dodge: 1, description: 'Esquiva gratuita' }
        ]
    },
    sombras: {
        name: 'Nas Sombras',
        icon: '🌑',
        type: CardType.BUFF,
        rarity: CardRarity.RARE,
        class: 'rogue',
        targetSelf: true,
        levels: [
            { cost: 2, stealth: true, duration: 2, description: 'Invisível por 2 turnos' },
            { cost: 2, stealth: true, duration: 3, description: 'Invisível por 3 turnos' },
            { cost: 1, stealth: true, duration: 2, description: 'Sombras baratas' }
        ]
    },
    execucao: {
        name: 'Execução',
        icon: '💀',
        type: CardType.ATTACK,
        rarity: CardRarity.LEGENDARY,
        class: 'rogue',
        levels: [
            { cost: 3, damagePercent: 30, execute: true, description: 'Mata se HP < 30%' },
            { cost: 3, damagePercent: 40, execute: true, description: 'Mata se HP < 40%' },
            { cost: 2, damagePercent: 50, execute: true, description: 'Mata se HP < 50%' }
        ]
    },

    // ========== CLÉRIGO ==========
    cura_menor: {
        name: 'Cura Menor',
        icon: '💚',
        type: CardType.HEAL,
        rarity: CardRarity.COMMON,
        class: 'cleric',
        targetAlly: true,
        levels: [
            { cost: 1, heal: 20, description: 'Cura leve' },
            { cost: 1, heal: 30, description: 'Cura menor +' },
            { cost: 1, heal: 40, description: 'Cura menor ++' }
        ]
    },
    cura_em_grupo: {
        name: 'Cura em Grupo',
        icon: '💕',
        type: CardType.HEAL,
        rarity: CardRarity.RARE,
        class: 'cleric',
        targetSelf: true,
        levels: [
            { cost: 2, heal: 15, aoe: true, description: 'Cura todos os aliados' },
            { cost: 2, heal: 25, aoe: true, description: 'Cura em grupo +' },
            { cost: 2, heal: 35, aoe: true, description: 'Onda de cura' }
        ]
    },
    luz_sagrada: {
        name: 'Luz Sagrada',
        icon: '☀️',
        type: CardType.SPELL,
        rarity: CardRarity.UNCOMMON,
        class: 'cleric',
        levels: [
            { cost: 2, damage: 25, holy: true, description: 'Dano sagrado (2x vs mortos-vivos)' },
            { cost: 2, damage: 35, holy: true, description: 'Luz sagrada +' },
            { cost: 2, damage: 45, holy: true, heal: 10, description: 'Luz que cura' }
        ]
    },
    bencao: {
        name: 'Bênção',
        icon: '🙏',
        type: CardType.BUFF,
        rarity: CardRarity.UNCOMMON,
        class: 'cleric',
        targetSelf: true,
        levels: [
            { cost: 1, buff: { atk: 5, def: 5 }, duration: 3, description: '+5 ATK/DEF' },
            { cost: 1, buff: { atk: 8, def: 8 }, duration: 3, description: '+8 ATK/DEF' },
            { cost: 1, buff: { atk: 10, def: 10 }, duration: 4, description: '+10 ATK/DEF' }
        ]
    },
    purificar: {
        name: 'Purificar',
        icon: '💫',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        class: 'cleric',
        targetAlly: true,
        levels: [
            { cost: 1, cleanse: 1, description: 'Remove 1 debuff' },
            { cost: 1, cleanse: 2, description: 'Remove 2 debuffs' },
            { cost: 1, cleanse: true, heal: 10, description: 'Remove todos + cura 10' }
        ]
    },
    ressurreicao: {
        name: 'Ressurreição',
        icon: '👼',
        type: CardType.HEAL,
        rarity: CardRarity.LEGENDARY,
        class: 'cleric',
        targetAlly: true,
        levels: [
            { cost: 3, revive: 0.25, description: 'Revive aliado com 25% HP' },
            { cost: 3, revive: 0.50, description: 'Revive aliado com 50% HP' },
            { cost: 2, revive: 0.50, description: 'Ressurreição barata' }
        ]
    }
};

/**
 * Retorna os dados de uma carta em um nível específico
 */
export function getCardData(cardId, level = 0) {
    const card = CardDatabase[cardId];
    if (!card) return null;

    const levelData = card.levels[Math.min(level, card.levels.length - 1)];

    return {
        id: cardId,
        name: card.name,
        icon: card.icon,
        type: card.type,
        rarity: card.rarity,
        class: card.class,
        level,
        ...levelData
    };
}

/**
 * Retorna todas as cartas de uma classe
 */
export function getCardsByClass(className) {
    return Object.entries(CardDatabase)
        .filter(([_, card]) => card.class === className)
        .map(([id, _]) => id);
}

/**
 * Custo de upgrade baseado na raridade
 */
export function getUpgradeCost(cardId, currentLevel) {
    const card = CardDatabase[cardId];
    if (!card) return null;

    const baseCost = {
        [CardRarity.COMMON]: 50,
        [CardRarity.UNCOMMON]: 100,
        [CardRarity.RARE]: 200,
        [CardRarity.EPIC]: 400,
        [CardRarity.LEGENDARY]: 800
    };

    return {
        gold: baseCost[card.rarity] * (currentLevel + 1),
        fragments: (currentLevel + 1) * 5
    };
}
