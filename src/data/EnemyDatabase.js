/**
 * EnemyDatabase - Base de dados de todos os inimigos
 * Define stats, comportamentos, drops e tipos
 */

export const EnemyType = {
    BEAST: 'beast',
    HUMANOID: 'humanoid',
    UNDEAD: 'undead',
    DEMON: 'demon',
    ELEMENTAL: 'elemental',
    DRAGON: 'dragon'
};

export const EnemyBehavior = {
    AGGRESSIVE: 'aggressive',   // Ataca o alvo mais próximo
    DEFENSIVE: 'defensive',     // Prioriza defesa, ataca quando seguro
    HEALER: 'healer',          // Cura aliados
    SNIPER: 'sniper',          // Ataca o alvo com menos HP
    BERSERKER: 'berserker',    // Mais dano quando HP baixo
    TACTICAL: 'tactical'       // Usa habilidades especiais estrategicamente
};

/**
 * Base de dados de inimigos
 */
export const EnemyDatabase = {
    // ========== GOBLINS (Capítulo 1) ==========
    goblin: {
        name: 'Goblin',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        stats: {
            hp: 30,
            atk: 10,
            def: 5,
            speed: 12
        },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico'],
        drops: {
            gold: { min: 5, max: 15 },
            fragmentChance: 0.1,
            items: []
        },
        xpReward: 15,
        description: 'Criatura pequena e covarde, mas perigosa em grupos.'
    },

    goblin_archer: {
        name: 'Goblin Arqueiro',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb', // Mesmo modelo por enquanto
        stats: {
            hp: 25,
            atk: 12,
            def: 3,
            speed: 14
        },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['ataque_basico', 'tiro_certeiro'],
        drops: {
            gold: { min: 8, max: 20 },
            fragmentChance: 0.15,
            items: []
        },
        xpReward: 20,
        description: 'Arqueiro goblin que mira nos mais fracos.'
    },

    goblin_shaman: {
        name: 'Goblin Xamã',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        stats: {
            hp: 20,
            atk: 8,
            def: 2,
            speed: 10,
            mag: 15
        },
        behavior: EnemyBehavior.HEALER,
        abilities: ['ataque_basico', 'cura_menor', 'maldicao'],
        drops: {
            gold: { min: 10, max: 25 },
            fragmentChance: 0.25,
            items: []
        },
        xpReward: 25,
        description: 'Feiticeiro goblin que fortalece seus aliados.'
    },

    // ========== MORTOS-VIVOS (Capítulo 2) ==========
    skeleton: {
        name: 'Esqueleto',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/skeleton.glb',
        stats: {
            hp: 35,
            atk: 12,
            def: 8,
            speed: 8
        },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'golpe_osseo'],
        weaknesses: ['holy'],
        resistances: ['poison'],
        drops: {
            gold: { min: 10, max: 30 },
            fragmentChance: 0.15,
            items: []
        },
        xpReward: 20,
        description: 'Guerreiro morto há muito tempo, movido por magia negra.'
    },

    zombie: {
        name: 'Zumbi',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/zombie.glb',
        stats: {
            hp: 50,
            atk: 15,
            def: 5,
            speed: 4
        },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'mordida_infecta'],
        weaknesses: ['holy', 'fire'],
        resistances: ['poison'],
        drops: {
            gold: { min: 8, max: 25 },
            fragmentChance: 0.2,
            items: []
        },
        xpReward: 22,
        description: 'Cadáver reanimado, lento mas resistente.'
    },

    ghost: {
        name: 'Fantasma',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/ghost.glb',
        stats: {
            hp: 25,
            atk: 10,
            def: 0,
            speed: 16,
            mag: 12
        },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['toque_gelido', 'drenar_vida', 'incorporeo'],
        weaknesses: ['holy'],
        immunities: ['physical'],
        drops: {
            gold: { min: 15, max: 40 },
            fragmentChance: 0.35,
            items: []
        },
        xpReward: 35,
        description: 'Espírito atormentado, imune a ataques físicos.'
    },

    // ========== BESTAS (Capítulo 1-2) ==========
    wolf: {
        name: 'Lobo',
        type: EnemyType.BEAST,
        model: '/models/enemies/wolf.glb',
        stats: {
            hp: 28,
            atk: 14,
            def: 4,
            speed: 18
        },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'mordida'],
        drops: {
            gold: { min: 5, max: 12 },
            fragmentChance: 0.08,
            items: []
        },
        xpReward: 15,
        description: 'Predador rápido e feroz.'
    },

    dire_wolf: {
        name: 'Lobo Atroz',
        type: EnemyType.BEAST,
        model: '/models/enemies/wolf.glb',
        stats: {
            hp: 55,
            atk: 20,
            def: 8,
            speed: 16
        },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'mordida_brutal', 'uivo'],
        drops: {
            gold: { min: 15, max: 35 },
            fragmentChance: 0.2,
            items: []
        },
        xpReward: 40,
        description: 'Lobo monstruoso, líder da matilha.'
    },

    spider: {
        name: 'Aranha Gigante',
        type: EnemyType.BEAST,
        model: '/models/enemies/spider.glb',
        stats: {
            hp: 30,
            atk: 12,
            def: 6,
            speed: 14
        },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'teia', 'veneno'],
        drops: {
            gold: { min: 8, max: 20 },
            fragmentChance: 0.15,
            items: []
        },
        xpReward: 22,
        description: 'Aranha do tamanho de um cão, veneno paralisante.'
    },

    // ========== DEMÔNIOS (Capítulo 3+) ==========
    imp: {
        name: 'Diabrete',
        type: EnemyType.DEMON,
        model: '/models/enemies/imp.glb',
        stats: {
            hp: 25,
            atk: 10,
            def: 4,
            speed: 20,
            mag: 10
        },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'bola_de_fogo_menor', 'teleporte'],
        weaknesses: ['holy'],
        resistances: ['fire'],
        drops: {
            gold: { min: 20, max: 50 },
            fragmentChance: 0.3,
            items: []
        },
        xpReward: 30,
        description: 'Demônio menor, ágil e traiçoeiro.'
    },

    demon_soldier: {
        name: 'Soldado Demoníaco',
        type: EnemyType.DEMON,
        model: '/models/enemies/demon.glb',
        stats: {
            hp: 80,
            atk: 25,
            def: 15,
            speed: 10
        },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'golpe_infernal', 'furia_demonaca'],
        weaknesses: ['holy'],
        resistances: ['fire', 'poison'],
        drops: {
            gold: { min: 40, max: 80 },
            fragmentChance: 0.4,
            items: []
        },
        xpReward: 60,
        description: 'Guerreiro do abismo, força brutal.'
    },

    // ========== BOSSES ==========
    goblin_king: {
        name: 'Rei Goblin',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin_king.glb',
        isBoss: true,
        stats: {
            hp: 150,
            atk: 20,
            def: 12,
            speed: 8
        },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'golpe_brutal', 'convocar_goblins', 'grito_de_guerra'],
        drops: {
            gold: { min: 100, max: 200 },
            fragmentChance: 1.0, // Garantido
            fragmentAmount: 3,
            items: ['coroa_goblin']
        },
        xpReward: 150,
        description: 'O líder supremo dos goblins. Covarde, mas perigoso.'
    },

    lich: {
        name: 'Lich',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/lich.glb',
        isBoss: true,
        stats: {
            hp: 120,
            atk: 15,
            def: 8,
            speed: 10,
            mag: 35
        },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['raio_necrotico', 'drenar_vida', 'invocar_mortos', 'escudo_osseo'],
        weaknesses: ['holy'],
        immunities: ['poison', 'fear'],
        drops: {
            gold: { min: 150, max: 300 },
            fragmentChance: 1.0,
            fragmentAmount: 5,
            items: ['filacterio_quebrado']
        },
        xpReward: 200,
        description: 'Mago que transcendeu a morte. Mestre da necromancia.'
    }
};

/**
 * Retorna dados de um inimigo por ID
 */
export function getEnemyData(enemyId) {
    const enemy = EnemyDatabase[enemyId];
    if (!enemy) return null;

    return {
        id: enemyId,
        ...enemy,
        hp: enemy.stats.hp,
        maxHp: enemy.stats.hp,
        atk: enemy.stats.atk,
        def: enemy.stats.def,
        speed: enemy.stats.speed,
        mag: enemy.stats.mag || 0
    };
}

/**
 * Cria uma instância de inimigo com stats e ID único
 */
export function createEnemyInstance(enemyId, instanceId) {
    const data = getEnemyData(enemyId);
    if (!data) return null;

    return {
        ...data,
        id: instanceId || `${enemyId}_${Date.now()}`,
        model: null // Será preenchido pelo ARSceneManager
    };
}

/**
 * Calcula drops de um inimigo derrotado
 */
export function calculateDrops(enemy) {
    const data = EnemyDatabase[enemy.type || enemy.id?.split('_')[0]];
    if (!data?.drops) {
        return { gold: 10, fragments: 0, items: [] };
    }

    const drops = data.drops;

    // Ouro aleatório
    const gold = Math.floor(
        Math.random() * (drops.gold.max - drops.gold.min + 1) + drops.gold.min
    );

    // Fragmentos com chance
    let fragments = 0;
    if (Math.random() < drops.fragmentChance) {
        fragments = drops.fragmentAmount || 1;
    }

    // Items especiais (para bosses)
    const items = drops.items ? [...drops.items] : [];

    return { gold, fragments, items };
}

/**
 * Retorna inimigos por tipo
 */
export function getEnemiesByType(type) {
    return Object.entries(EnemyDatabase)
        .filter(([_, enemy]) => enemy.type === type)
        .map(([id, _]) => id);
}

/**
 * Retorna inimigos para um capítulo específico
 */
export function getEnemiesForChapter(chapter) {
    const chapterEnemies = {
        1: ['goblin', 'goblin_archer', 'wolf'],
        2: ['goblin', 'goblin_shaman', 'skeleton', 'zombie', 'wolf', 'spider'],
        3: ['skeleton', 'zombie', 'ghost', 'imp', 'spider', 'dire_wolf'],
        4: ['ghost', 'imp', 'demon_soldier', 'dire_wolf'],
        5: ['demon_soldier', 'lich'] // Boss chapter
    };

    return chapterEnemies[chapter] || chapterEnemies[1];
}
