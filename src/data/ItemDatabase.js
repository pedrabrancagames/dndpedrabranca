/**
 * ItemDatabase - Base de dados de todos os itens do jogo
 * Define categorias, raridades, atributos e efeitos de cada item
 */

import { CardRarity } from './CardDatabase.js';
import { ItemIDs, HeroIDs, QuestIDs } from './GameConstants.js';

// Re-exportar CardRarity para uso consistente
export { CardRarity };

export const ItemCategory = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    CONSUMABLE: 'consumable',
    QUEST: 'quest',
    ACCESSORY: 'accessory'
};

/**
 * Cores de raridade para UI (já definidas em CSS como --color-rarity-*)
 */
export const RarityColors = {
    [CardRarity.COMMON]: '#9ca3af',      // Cinza
    [CardRarity.UNCOMMON]: '#22c55e',    // Verde
    [CardRarity.RARE]: '#3b82f6',        // Azul
    [CardRarity.EPIC]: '#a855f7',        // Roxo
    [CardRarity.LEGENDARY]: '#fbbf24'    // Dourado
};

/**
 * Base de dados de itens
 * Cada item possui: id, name, icon, category, rarity, description, stats, effects
 */
export const ItemDatabase = {
    // ========== ARMAS ==========
    [ItemIDs.SWORD_BASIC]: {
        id: ItemIDs.SWORD_BASIC,
        name: 'Espada de Ferro',
        icon: '🗡️',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.COMMON,
        description: 'Uma espada simples, mas confiável.',
        stats: { atk: 5 },
        equipSlot: 'weapon',
        price: 50,
        generatesCard: {
            id: 'sword_basic_strike',
            name: 'Golpe de Espada',
            icon: '🗡️',
            cost: 1,
            damage: 18,
            description: 'Ataque básico com espada de ferro',
            cardType: 'equipment'
        }
    },
    [ItemIDs.SWORD_FLAME]: {
        id: ItemIDs.SWORD_FLAME,
        name: 'Lâmina Flamejante',
        icon: '🔥',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.RARE,
        description: 'Uma espada encantada com fogo eterno. Causa dano adicional de fogo.',
        stats: { atk: 12, fireDamage: 5 },
        equipSlot: 'weapon',
        price: 350,
        generatesCard: {
            id: 'sword_flame_strike',
            name: 'Corte Flamejante',
            icon: '🔥',
            cost: 2,
            damage: 22,
            fireDamage: 10,
            description: 'Ataque de fogo que queima o inimigo',
            cardType: 'equipment'
        }
    },
    [ItemIDs.STAFF_ARCANE]: {
        id: ItemIDs.STAFF_ARCANE,
        name: 'Cajado Arcano',
        icon: '🪄',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.UNCOMMON,
        description: 'Um cajado imbuído de energia arcana. Aumenta poder mágico.',
        stats: { mag: 10 },
        equipSlot: 'weapon',
        classRestriction: [HeroIDs.MAGE, HeroIDs.CLERIC],
        price: 200,
        generatesCard: {
            id: 'staff_arcane_blast',
            name: 'Explosão Arcana',
            icon: '🪄',
            cost: 2,
            damage: 28,
            description: 'Dispara energia arcana concentrada',
            cardType: 'equipment'
        }
    },
    [ItemIDs.DAGGER_SHADOW]: {
        id: ItemIDs.DAGGER_SHADOW,
        name: 'Adaga das Sombras',
        icon: '🗡️',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.EPIC,
        description: 'Uma adaga que parece absorver a luz. Aumenta chance de crítico.',
        stats: { atk: 8, crit: 15 },
        equipSlot: 'weapon',
        classRestriction: [HeroIDs.ROGUE],
        price: 500,
        generatesCard: {
            id: 'dagger_shadow_strike',
            name: 'Punhalada Sombria',
            icon: '👤',
            cost: 2,
            damage: 35,
            critBonus: 30,
            description: 'Golpe das sombras com alta chance de crítico',
            cardType: 'equipment'
        }
    },
    [ItemIDs.HAMMER_HOLY]: {
        id: ItemIDs.HAMMER_HOLY,
        name: 'Martelo Sagrado',
        icon: '🔨',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.LEGENDARY,
        description: 'Forjado pelos deuses, emana luz divina. Dano aumentado contra mortos-vivos.',
        stats: { atk: 20, holyDamage: 15 },
        equipSlot: 'weapon',
        effects: { bonusVsUndead: 2.0 },
        price: 1500,
        generatesCard: {
            id: 'hammer_holy_smite',
            name: 'Castigo Divino',
            icon: '🔨',
            cost: 2,
            damage: 40,
            holyDamage: 20,
            description: 'Golpe sagrado devastador (2x vs mortos-vivos)',
            cardType: 'equipment'
        }
    },

    // ========== ARMADURAS ==========
    [ItemIDs.ARMOR_LEATHER]: {
        id: ItemIDs.ARMOR_LEATHER,
        name: 'Armadura de Couro',
        icon: '🧥',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.COMMON,
        description: 'Proteção básica feita de couro curtido.',
        stats: { def: 5 },
        equipSlot: 'armor',
        price: 40,
        generatesCard: {
            id: 'armor_leather_guard',
            name: 'Postura Defensiva',
            icon: '🧥',
            cost: 1,
            defense: 8,
            description: 'Assume postura defensiva (+8 DEF)',
            cardType: 'equipment'
        }
    },
    [ItemIDs.ARMOR_CHAIN]: {
        id: ItemIDs.ARMOR_CHAIN,
        name: 'Cota de Malha',
        icon: '🛡️',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.UNCOMMON,
        description: 'Anéis de metal entrelaçados oferecem boa proteção.',
        stats: { def: 10 },
        equipSlot: 'armor',
        classRestriction: [HeroIDs.WARRIOR, HeroIDs.CLERIC],
        price: 150,
        generatesCard: {
            id: 'armor_chain_block',
            name: 'Bloquear',
            icon: '🛡️',
            cost: 1,
            defense: 15,
            description: 'Bloqueia ataques (+15 DEF)',
            cardType: 'equipment'
        }
    },
    [ItemIDs.ROBE_MAGE]: {
        id: ItemIDs.ROBE_MAGE,
        name: 'Manto do Arcanista',
        icon: '🧙',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.RARE,
        description: 'Tecido encantado que amplifica magias.',
        stats: { def: 3, mag: 8 },
        equipSlot: 'armor',
        classRestriction: [HeroIDs.MAGE],
        price: 300,
        generatesCard: {
            id: 'robe_mage_barrier',
            name: 'Barreira Mágica',
            icon: '🔮',
            cost: 1,
            defense: 12,
            buff: { mag: 5 },
            description: '+12 DEF e +5 MAG temporário',
            cardType: 'equipment'
        }
    },
    [ItemIDs.ARMOR_PLATE]: {
        id: ItemIDs.ARMOR_PLATE,
        name: 'Armadura de Placas',
        icon: '🏰',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.EPIC,
        description: 'Proteção máxima para os mais bravos guerreiros.',
        stats: { def: 20, maxHp: 20 },
        equipSlot: 'armor',
        classRestriction: [HeroIDs.WARRIOR],
        price: 600,
        generatesCard: {
            id: 'armor_plate_fortress',
            name: 'Fortaleza de Aço',
            icon: '🏰',
            cost: 2,
            defense: 25,
            taunt: true,
            description: '+25 DEF e força inimigos a atacar',
            cardType: 'equipment'
        }
    },

    // ========== CONSUMÍVEIS ==========
    [ItemIDs.POTION_HEALTH_SMALL]: {
        id: ItemIDs.POTION_HEALTH_SMALL,
        name: 'Poção de Vida Menor',
        icon: '🧪',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.COMMON,
        description: 'Restaura 30 pontos de vida.',
        effects: { heal: 30 },
        stackable: true,
        maxStack: 10,
        price: 25,
        generatesCard: {
            id: 'potion_health_small_use',
            name: 'Beber Poção Menor',
            icon: '🧪',
            cost: 1,
            heal: 30,
            targetSelf: true,
            consumable: true,
            sourceItemId: ItemIDs.POTION_HEALTH_SMALL,
            description: 'Cura 30 HP (consome poção)',
            cardType: 'consumable'
        }
    },
    [ItemIDs.POTION_HEALTH_MEDIUM]: {
        id: ItemIDs.POTION_HEALTH_MEDIUM,
        name: 'Poção de Vida',
        icon: '🧪',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.UNCOMMON,
        description: 'Restaura 60 pontos de vida.',
        effects: { heal: 60 },
        stackable: true,
        maxStack: 10,
        price: 60,
        generatesCard: {
            id: 'potion_health_medium_use',
            name: 'Beber Poção',
            icon: '🧪',
            cost: 1,
            heal: 60,
            targetSelf: true,
            consumable: true,
            sourceItemId: ItemIDs.POTION_HEALTH_MEDIUM,
            description: 'Cura 60 HP (consome poção)',
            cardType: 'consumable'
        }
    },
    [ItemIDs.POTION_MANA]: {
        id: ItemIDs.POTION_MANA,
        name: 'Poção de Mana',
        icon: '💧',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.UNCOMMON,
        description: 'Restaura 2 pontos de ação.',
        effects: { restorePA: 2 },
        stackable: true,
        maxStack: 5,
        price: 75,
        generatesCard: {
            id: 'potion_mana_use',
            name: 'Beber Poção de Mana',
            icon: '💧',
            cost: 0,
            restorePA: 2,
            targetSelf: true,
            consumable: true,
            sourceItemId: ItemIDs.POTION_MANA,
            description: 'Restaura 2 PA (consome poção)',
            cardType: 'consumable'
        }
    },
    [ItemIDs.SCROLL_FIREBALL]: {
        id: ItemIDs.SCROLL_FIREBALL,
        name: 'Pergaminho de Bola de Fogo',
        icon: '📜',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.RARE,
        description: 'Conjura uma poderosa bola de fogo. Uso único.',
        effects: { castSpell: 'fireball', damage: 50, aoe: true },
        stackable: true,
        maxStack: 3,
        price: 200,
        generatesCard: {
            id: 'scroll_fireball_use',
            name: 'Ler Pergaminho',
            icon: '📜',
            cost: 1,
            damage: 50,
            aoe: true,
            consumable: true,
            sourceItemId: ItemIDs.SCROLL_FIREBALL,
            description: 'Bola de Fogo em todos (consome)',
            cardType: 'consumable'
        }
    },
    [ItemIDs.ELIXIR_POWER]: {
        id: ItemIDs.ELIXIR_POWER,
        name: 'Elixir de Poder',
        icon: '⚗️',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.EPIC,
        description: '+10 ATK por 3 turnos.',
        effects: { buff: { atk: 10 }, duration: 3 },
        stackable: true,
        maxStack: 3,
        price: 150,
        generatesCard: {
            id: 'elixir_power_use',
            name: 'Beber Elixir',
            icon: '⚗️',
            cost: 1,
            buff: { atk: 10 },
            duration: 3,
            targetSelf: true,
            consumable: true,
            sourceItemId: ItemIDs.ELIXIR_POWER,
            description: '+10 ATK por 3 turnos (consome)',
            cardType: 'consumable'
        }
    },

    // ========== ITENS DE QUEST ==========
    [ItemIDs.KEY_CRYPT]: {
        id: ItemIDs.KEY_CRYPT,
        name: 'Chave da Cripta',
        icon: '🗝️',
        category: ItemCategory.QUEST,
        rarity: CardRarity.UNCOMMON,
        description: 'Uma chave antiga que abre a cripta do cemitério de Pedra Branca.',
        questId: QuestIDs.CRYPT_ENTRANCE,
        stackable: false
    },
    [ItemIDs.AMULET_CURSED]: {
        id: ItemIDs.AMULET_CURSED,
        name: 'Amuleto Amaldiçoado',
        icon: '📿',
        category: ItemCategory.QUEST,
        rarity: CardRarity.RARE,
        description: 'Um amuleto que emana energia sombria. O Clérigo pode purificá-lo.',
        questId: QuestIDs.PURIFY_AMULET,
        stackable: false
    },
    [ItemIDs.LETTER_SEALED]: {
        id: ItemIDs.LETTER_SEALED,
        name: 'Carta Lacrada',
        icon: '✉️',
        category: ItemCategory.QUEST,
        rarity: CardRarity.COMMON,
        description: 'Uma carta endereçada ao Prefeito de Pedra Branca.',
        questId: QuestIDs.DELIVER_LETTER,
        stackable: false
    },

    // ========== ACESSÓRIOS ==========
    [ItemIDs.RING_PROTECTION]: {
        id: ItemIDs.RING_PROTECTION,
        name: 'Anel de Proteção',
        icon: '💍',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.UNCOMMON,
        description: 'Um anel encantado que oferece proteção mágica.',
        stats: { def: 3 },
        equipSlot: 'accessory',
        price: 100,
        generatesCard: {
            id: 'ring_protection_activate',
            name: 'Escudo do Anel',
            icon: '💍',
            cost: 1,
            defense: 10,
            description: 'Ativa proteção mágica (+10 DEF)',
            cardType: 'equipment'
        }
    },
    [ItemIDs.AMULET_LIFE]: {
        id: ItemIDs.AMULET_LIFE,
        name: 'Amuleto da Vitalidade',
        icon: '💚',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.RARE,
        description: 'Aumenta a vitalidade do portador.',
        stats: { maxHp: 20 },
        equipSlot: 'accessory',
        price: 250,
        generatesCard: {
            id: 'amulet_life_pulse',
            name: 'Pulso Vital',
            icon: '💚',
            cost: 1,
            heal: 25,
            targetSelf: true,
            description: 'Cura 25 HP usando energia vital',
            cardType: 'equipment'
        }
    },
    [ItemIDs.CLOAK_SHADOWS]: {
        id: ItemIDs.CLOAK_SHADOWS,
        name: 'Manto das Sombras',
        icon: '🦇',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.EPIC,
        description: 'Permite mover-se nas sombras sem ser detectado.',
        stats: { crit: 10 },
        equipSlot: 'accessory',
        effects: { stealthBonus: 20 },
        classRestriction: [HeroIDs.ROGUE],
        price: 400,
        generatesCard: {
            id: 'cloak_shadows_vanish',
            name: 'Desaparecer',
            icon: '🦇',
            cost: 2,
            stealth: true,
            duration: 2,
            description: 'Fica invisível por 2 turnos',
            cardType: 'equipment'
        }
    }
};

/**
 * Retorna os dados de um item pelo ID
 * @param {string} itemId - ID do item
 * @returns {Object|null} - Dados do item ou null se não encontrado
 */
export function getItemData(itemId) {
    return ItemDatabase[itemId] || null;
}

/**
 * Retorna todos os itens de uma categoria
 * @param {string} category - Categoria (ItemCategory.*)
 * @returns {Array} - Array de itens da categoria
 */
export function getItemsByCategory(category) {
    return Object.values(ItemDatabase).filter(item => item.category === category);
}

/**
 * Retorna todos os itens de uma raridade
 * @param {string} rarity - Raridade (CardRarity.*)
 * @returns {Array} - Array de itens da raridade
 */
export function getItemsByRarity(rarity) {
    return Object.values(ItemDatabase).filter(item => item.rarity === rarity);
}

/**
 * Verifica se um herói pode equipar um item
 * @param {Object} item - Dados do item
 * @param {Object} hero - Dados do herói
 * @returns {boolean} - True se pode equipar
 */
export function canEquipItem(item, hero) {
    if (!item.equipSlot) return false;
    if (!item.classRestriction) return true;
    return item.classRestriction.includes(hero.class);
}

/**
 * Retorna a cor CSS para uma raridade
 * @param {string} rarity - Raridade do item
 * @returns {string} - Cor hexadecimal
 */
export function getRarityColor(rarity) {
    return RarityColors[rarity] || RarityColors[CardRarity.COMMON];
}

/**
 * Retorna o nome traduzido da categoria
 * @param {string} category - Categoria do item
 * @returns {string} - Nome em português
 */
export function getCategoryName(category) {
    const names = {
        [ItemCategory.WEAPON]: 'Armas',
        [ItemCategory.ARMOR]: 'Armaduras',
        [ItemCategory.CONSUMABLE]: 'Consumíveis',
        [ItemCategory.QUEST]: 'Itens de Quest',
        [ItemCategory.ACCESSORY]: 'Acessórios'
    };
    return names[category] || 'Outros';
}

/**
 * Retorna o nome traduzido da raridade
 * @param {string} rarity - Raridade do item
 * @returns {string} - Nome em português
 */
export function getRarityName(rarity) {
    const names = {
        [CardRarity.COMMON]: 'Comum',
        [CardRarity.UNCOMMON]: 'Incomum',
        [CardRarity.RARE]: 'Raro',
        [CardRarity.EPIC]: 'Épico',
        [CardRarity.LEGENDARY]: 'Lendário'
    };
    return names[rarity] || 'Desconhecido';
}
