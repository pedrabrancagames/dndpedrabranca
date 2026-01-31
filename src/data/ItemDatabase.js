/**
 * ItemDatabase - Base de dados de todos os itens do jogo
 * Define categorias, raridades, atributos e efeitos de cada item
 */

import { CardRarity } from './CardDatabase.js';

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
    sword_basic: {
        id: 'sword_basic',
        name: 'Espada de Ferro',
        icon: '🗡️',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.COMMON,
        description: 'Uma espada simples, mas confiável.',
        stats: { atk: 5 },
        equipSlot: 'mainHand',
        price: 50
    },
    sword_flame: {
        id: 'sword_flame',
        name: 'Lâmina Flamejante',
        icon: '🔥',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.RARE,
        description: 'Uma espada encantada com fogo eterno. Causa dano adicional de fogo.',
        stats: { atk: 12, fireDamage: 5 },
        equipSlot: 'mainHand',
        price: 350
    },
    staff_arcane: {
        id: 'staff_arcane',
        name: 'Cajado Arcano',
        icon: '🪄',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.UNCOMMON,
        description: 'Um cajado imbuído de energia arcana. Aumenta poder mágico.',
        stats: { mag: 10 },
        equipSlot: 'mainHand',
        classRestriction: ['mage', 'cleric'],
        price: 200
    },
    dagger_shadow: {
        id: 'dagger_shadow',
        name: 'Adaga das Sombras',
        icon: '🗡️',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.EPIC,
        description: 'Uma adaga que parece absorver a luz. Aumenta chance de crítico.',
        stats: { atk: 8, crit: 15 },
        equipSlot: 'mainHand',
        classRestriction: ['rogue'],
        price: 500
    },
    hammer_holy: {
        id: 'hammer_holy',
        name: 'Martelo Sagrado',
        icon: '🔨',
        category: ItemCategory.WEAPON,
        rarity: CardRarity.LEGENDARY,
        description: 'Forjado pelos deuses, emana luz divina. Dano aumentado contra mortos-vivos.',
        stats: { atk: 20, holyDamage: 15 },
        equipSlot: 'mainHand',
        effects: { bonusVsUndead: 2.0 },
        price: 1500
    },

    // ========== ARMADURAS ==========
    armor_leather: {
        id: 'armor_leather',
        name: 'Armadura de Couro',
        icon: '🧥',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.COMMON,
        description: 'Proteção básica feita de couro curtido.',
        stats: { def: 5 },
        equipSlot: 'torso',
        price: 40
    },
    armor_chain: {
        id: 'armor_chain',
        name: 'Cota de Malha',
        icon: '🛡️',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.UNCOMMON,
        description: 'Anéis de metal entrelaçados oferecem boa proteção.',
        stats: { def: 10 },
        equipSlot: 'torso',
        classRestriction: ['warrior', 'cleric'],
        price: 150
    },
    robe_mage: {
        id: 'robe_mage',
        name: 'Manto do Arcanista',
        icon: '🧙',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.RARE,
        description: 'Tecido encantado que amplifica magias.',
        stats: { def: 3, mag: 8 },
        equipSlot: 'torso',
        classRestriction: ['mage'],
        price: 300
    },
    armor_plate: {
        id: 'armor_plate',
        name: 'Armadura de Placas',
        icon: '🏰',
        category: ItemCategory.ARMOR,
        rarity: CardRarity.EPIC,
        description: 'Proteção máxima para os mais bravos guerreiros.',
        stats: { def: 20, maxHp: 20 },
        equipSlot: 'torso',
        classRestriction: ['warrior'],
        price: 600
    },

    // ========== CONSUMÍVEIS ==========
    potion_health_small: {
        id: 'potion_health_small',
        name: 'Poção de Vida Menor',
        icon: '🧪',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.COMMON,
        description: 'Restaura 30 pontos de vida.',
        effects: { heal: 30 },
        stackable: true,
        maxStack: 10,
        price: 25
    },
    potion_health_medium: {
        id: 'potion_health_medium',
        name: 'Poção de Vida',
        icon: '🧪',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.UNCOMMON,
        description: 'Restaura 60 pontos de vida.',
        effects: { heal: 60 },
        stackable: true,
        maxStack: 10,
        price: 60
    },
    potion_mana: {
        id: 'potion_mana',
        name: 'Poção de Mana',
        icon: '💧',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.UNCOMMON,
        description: 'Restaura 2 pontos de ação.',
        effects: { restorePA: 2 },
        stackable: true,
        maxStack: 5,
        price: 75
    },
    scroll_fireball: {
        id: 'scroll_fireball',
        name: 'Pergaminho de Bola de Fogo',
        icon: '📜',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.RARE,
        description: 'Conjura uma poderosa bola de fogo. Uso único.',
        effects: { castSpell: 'fireball', damage: 50, aoe: true },
        stackable: true,
        maxStack: 3,
        price: 200
    },
    elixir_power: {
        id: 'elixir_power',
        name: 'Elixir de Poder',
        icon: '⚗️',
        category: ItemCategory.CONSUMABLE,
        rarity: CardRarity.EPIC,
        description: '+10 ATK por 3 turnos.',
        effects: { buff: { atk: 10 }, duration: 3 },
        stackable: true,
        maxStack: 3,
        price: 150
    },

    // ========== ITENS DE QUEST ==========
    key_crypt: {
        id: 'key_crypt',
        name: 'Chave da Cripta',
        icon: '🗝️',
        category: ItemCategory.QUEST,
        rarity: CardRarity.UNCOMMON,
        description: 'Uma chave antiga que abre a cripta do cemitério de Pedra Branca.',
        questId: 'crypt_entrance',
        stackable: false
    },
    amulet_cursed: {
        id: 'amulet_cursed',
        name: 'Amuleto Amaldiçoado',
        icon: '📿',
        category: ItemCategory.QUEST,
        rarity: CardRarity.RARE,
        description: 'Um amuleto que emana energia sombria. O Clérigo pode purificá-lo.',
        questId: 'purify_amulet',
        stackable: false
    },
    letter_sealed: {
        id: 'letter_sealed',
        name: 'Carta Lacrada',
        icon: '✉️',
        category: ItemCategory.QUEST,
        rarity: CardRarity.COMMON,
        description: 'Uma carta endereçada ao Prefeito de Pedra Branca.',
        questId: 'deliver_letter',
        stackable: false
    },

    // ========== ACESSÓRIOS ==========
    ring_protection: {
        id: 'ring_protection',
        name: 'Anel de Proteção',
        icon: '💍',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.UNCOMMON,
        description: 'Um anel encantado que oferece proteção mágica.',
        stats: { def: 3 },
        equipSlot: 'accessory',
        price: 100
    },
    amulet_life: {
        id: 'amulet_life',
        name: 'Amuleto da Vitalidade',
        icon: '💚',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.RARE,
        description: 'Aumenta a vitalidade do portador.',
        stats: { maxHp: 20 },
        equipSlot: 'accessory',
        price: 250
    },
    cloak_shadows: {
        id: 'cloak_shadows',
        name: 'Manto das Sombras',
        icon: '🦇',
        category: ItemCategory.ACCESSORY,
        rarity: CardRarity.EPIC,
        description: 'Permite mover-se nas sombras sem ser detectado.',
        stats: { crit: 10 },
        equipSlot: 'accessory',
        effects: { stealthBonus: 20 },
        classRestriction: ['rogue'],
        price: 400
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
