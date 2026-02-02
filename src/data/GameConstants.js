/**
 * GameConstants - Constantes globais do jogo
 * Centraliza IDs e chaves para evitar strings mágicas
 */

export const ItemIDs = {
    // ARMAS
    SWORD_BASIC: 'sword_basic',
    SWORD_FLAME: 'sword_flame',
    STAFF_ARCANE: 'staff_arcane',
    DAGGER_SHADOW: 'dagger_shadow',
    HAMMER_HOLY: 'hammer_holy',

    // ARMADURAS
    ARMOR_LEATHER: 'armor_leather',
    ARMOR_CHAIN: 'armor_chain',
    ROBE_MAGE: 'robe_mage',
    ARMOR_PLATE: 'armor_plate',

    // CONSUMÍVEIS
    POTION_HEALTH_SMALL: 'potion_health_small',
    POTION_HEALTH_MEDIUM: 'potion_health_medium',
    POTION_MANA: 'potion_mana',
    SCROLL_FIREBALL: 'scroll_fireball',
    ELIXIR_POWER: 'elixir_power',

    // QUEST
    KEY_CRYPT: 'key_crypt',
    AMULET_CURSED: 'amulet_cursed',
    LETTER_SEALED: 'letter_sealed',

    // ACESSÓRIOS
    RING_PROTECTION: 'ring_protection',
    AMULET_LIFE: 'amulet_life',
    CLOAK_SHADOWS: 'cloak_shadows'
};

export const HeroIDs = {
    WARRIOR: 'warrior',
    MAGE: 'mage',
    ROGUE: 'rogue',
    CLERIC: 'cleric'
};

export const QuestIDs = {
    CRYPT_ENTRANCE: 'crypt_entrance',
    PURIFY_AMULET: 'purify_amulet',
    DELIVER_LETTER: 'deliver_letter'
};

export const EventNames = {
    LOADING_PROGRESS: 'loadingProgress',
    STATE_CHANGE: 'stateChange',
    SHOW_MESSAGE: 'showMessage',
    DIALOGUE_ENDED: 'dialogueEnded',
    AR_SURFACE_SELECTED: 'arSurfaceSelected',
    DAMAGE_TAKEN: 'damageTaken',
    ENEMY_DIED: 'enemyDied',
    ARENA_PLACED: 'arenaPlaced',
    ENEMIES_SPAWNED: 'enemiesSpawned',
    NPC_SPAWNED: 'npcSpawned',
    AR_SESSION_STARTED: 'arSessionStarted',
    AR_SESSION_ENDED: 'arSessionEnded',
    COMBAT_STATE_CHANGE: 'combatStateChange'
};

export const AssetTypes = {
    MODEL: 'model',
    TEXTURE: 'texture',
    JSON: 'json'
};

export const ToastTypes = {
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success',
    ERROR: 'error'
};

export const NPCIDs = {
    MAYOR: 'mayor',
    MERCHANT: 'merchant_npc',
    GUARD_CAPTAIN: 'guard_captain',
    HEALER: 'healer',
    CITY_GUARD: 'city_guard'
};

export const EnemyTypes = {
    GOBLIN: 'goblin',
    ORC: 'orc',
    SKELETON: 'skeleton',
    DRAGON: 'dragon'
};
