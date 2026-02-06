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
    DRAGON: 'dragon',
    ABERRATION: 'aberration',
    CONSTRUCT: 'construct',
    GIANT: 'giant',
    MONSTROSITY: 'monstrosity',
    OOZE: 'ooze'
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
    // ========== GOBLINS E GOBLINOIDES ==========
    goblin: {
        name: 'Goblin',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        scale: 1.275,
        stats: { hp: 30, atk: 10, def: 5, speed: 12 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico'],
        drops: { gold: { min: 5, max: 15 }, fragmentChance: 0.1, items: [] },
        xpReward: 15,
        description: 'Criatura pequena e covarde, mas perigosa em grupos.'
    },

    goblin_archer: {
        name: 'Goblin Arqueiro',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        scale: 1.275,
        stats: { hp: 25, atk: 12, def: 3, speed: 14 },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['ataque_basico', 'tiro_certeiro'],
        drops: { gold: { min: 8, max: 20 }, fragmentChance: 0.15, items: [] },
        xpReward: 20,
        description: 'Arqueiro goblin que mira nos mais fracos.'
    },

    goblin_shaman: {
        name: 'Goblin Xamã',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        scale: 1.275,
        stats: { hp: 20, atk: 8, def: 2, speed: 10, mag: 15 },
        behavior: EnemyBehavior.HEALER,
        abilities: ['ataque_basico', 'cura_menor', 'maldicao'],
        drops: { gold: { min: 10, max: 25 }, fragmentChance: 0.25, items: [] },
        xpReward: 25,
        description: 'Feiticeiro goblin que fortalece seus aliados.'
    },

    hobgoblin: {
        name: 'Hobgoblin',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/hobgoblin.glb',
        scale: 1.7,
        stats: { hp: 45, atk: 15, def: 12, speed: 10 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'formacao_militar', 'golpe_disciplinado'],
        drops: { gold: { min: 15, max: 35 }, fragmentChance: 0.2, items: [] },
        xpReward: 30,
        description: 'Guerreiro goblinoide disciplinado e tático.'
    },

    bugbear: {
        name: 'Bugbear',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/bugbear.glb',
        scale: 2.0,
        stats: { hp: 55, atk: 20, def: 8, speed: 12 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'emboscada', 'golpe_brutal'],
        drops: { gold: { min: 20, max: 45 }, fragmentChance: 0.25, items: [] },
        xpReward: 40,
        description: 'Brutamontes furtivo que ataca de surpresa.'
    },

    // ========== HUMANOIDES ==========
    kobold: {
        name: 'Kobold',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/kobold.glb',
        scale: 1.0,
        stats: { hp: 20, atk: 8, def: 4, speed: 14 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'armadilha', 'tatica_de_grupo'],
        drops: { gold: { min: 3, max: 10 }, fragmentChance: 0.08, items: [] },
        xpReward: 12,
        description: 'Criatura reptiliana covarde mas astuta.'
    },

    bandit: {
        name: 'Bandido',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/bandit.glb',
        scale: 1.7,
        stats: { hp: 40, atk: 14, def: 8, speed: 12 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'golpe_sujo', 'roubar'],
        drops: { gold: { min: 15, max: 40 }, fragmentChance: 0.15, items: [] },
        xpReward: 25,
        description: 'Fora-da-lei que ataca viajantes desavisados.'
    },

    gnoll: {
        name: 'Gnoll',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/gnoll.glb',
        scale: 1.8,
        stats: { hp: 50, atk: 18, def: 10, speed: 14 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'frenesi', 'mordida_selvagem'],
        drops: { gold: { min: 18, max: 42 }, fragmentChance: 0.2, items: [] },
        xpReward: 35,
        description: 'Hiena humanoide sedenta de sangue.'
    },

    orc: {
        name: 'Orc',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/orc.glb',
        scale: 1.9,
        stats: { hp: 60, atk: 20, def: 12, speed: 10 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'grito_de_guerra', 'investida'],
        drops: { gold: { min: 20, max: 50 }, fragmentChance: 0.22, items: [] },
        xpReward: 40,
        description: 'Guerreiro feroz e brutal.'
    },

    drow: {
        name: 'Drow',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/drow.glb',
        scale: 1.7,
        stats: { hp: 45, atk: 16, def: 10, speed: 16, mag: 12 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'escuridao_magica', 'veneno_drow'],
        weaknesses: ['light'],
        resistances: ['charm'],
        drops: { gold: { min: 25, max: 60 }, fragmentChance: 0.3, items: [] },
        xpReward: 45,
        description: 'Elfo das trevas, perigoso e traiçoeiro.'
    },

    // ========== MORTOS-VIVOS ==========
    skeleton: {
        name: 'Esqueleto',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/skeleton.glb',
        scale: 1.7,
        stats: { hp: 35, atk: 12, def: 8, speed: 8 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'golpe_osseo'],
        weaknesses: ['holy'],
        resistances: ['poison'],
        drops: { gold: { min: 10, max: 30 }, fragmentChance: 0.15, items: [] },
        xpReward: 20,
        description: 'Guerreiro morto há muito tempo, movido por magia negra.'
    },

    zombie: {
        name: 'Zumbi',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/zombie.glb',
        scale: 1.7,
        stats: { hp: 50, atk: 15, def: 5, speed: 4 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'mordida_infecta'],
        weaknesses: ['holy', 'fire'],
        resistances: ['poison'],
        drops: { gold: { min: 8, max: 25 }, fragmentChance: 0.2, items: [] },
        xpReward: 22,
        description: 'Cadáver reanimado, lento mas resistente.'
    },

    ghoul: {
        name: 'Carniçal',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/ghoul.glb',
        scale: 1.7,
        stats: { hp: 45, atk: 18, def: 6, speed: 14 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'garras_paralisantes', 'devorar'],
        weaknesses: ['holy'],
        immunities: ['poison'],
        drops: { gold: { min: 15, max: 35 }, fragmentChance: 0.22, items: [] },
        xpReward: 30,
        description: 'Morto-vivo que se alimenta de cadáveres.'
    },

    wight: {
        name: 'Áspide',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/wight.glb',
        scale: 1.8,
        stats: { hp: 60, atk: 20, def: 12, speed: 10 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'drenar_vida', 'toque_da_morte'],
        weaknesses: ['holy'],
        resistances: ['necrotic'],
        drops: { gold: { min: 25, max: 55 }, fragmentChance: 0.3, items: [] },
        xpReward: 45,
        description: 'Guerreiro morto-vivo que drena a força vital.'
    },

    specter: {
        name: 'Espectro',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/specter.glb',
        scale: 1.7,
        stats: { hp: 30, atk: 15, def: 0, speed: 18, mag: 15 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['toque_gelido', 'drenar_vida', 'incorporeo'],
        weaknesses: ['holy'],
        immunities: ['physical', 'poison'],
        drops: { gold: { min: 20, max: 50 }, fragmentChance: 0.35, items: [] },
        xpReward: 40,
        description: 'Espírito maligno que atravessa paredes.'
    },

    shadow: {
        name: 'Sombra',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/shadow.glb',
        scale: 1.6,
        stats: { hp: 25, atk: 12, def: 0, speed: 20 },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['toque_sombrio', 'drenar_forca', 'fundir_sombras'],
        weaknesses: ['holy', 'light'],
        immunities: ['poison', 'necrotic'],
        drops: { gold: { min: 15, max: 40 }, fragmentChance: 0.3, items: [] },
        xpReward: 35,
        description: 'Criatura das trevas que consome força vital.'
    },

    mummy: {
        name: 'Múmia',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/mummy.glb',
        scale: 1.8,
        stats: { hp: 70, atk: 22, def: 15, speed: 6 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['ataque_basico', 'maldição', 'punho_apodrecente'],
        weaknesses: ['fire', 'holy'],
        resistances: ['necrotic'],
        drops: { gold: { min: 30, max: 70 }, fragmentChance: 0.35, items: [] },
        xpReward: 55,
        description: 'Guardião antigo envolto em faixas mágicas.'
    },

    vampire_spawn: {
        name: 'Cria Vampírica',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/vampire_spawn.glb',
        scale: 1.8,
        stats: { hp: 65, atk: 20, def: 14, speed: 16 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'mordida_vampirica', 'garras', 'charme'],
        weaknesses: ['holy', 'light'],
        resistances: ['necrotic'],
        drops: { gold: { min: 35, max: 75 }, fragmentChance: 0.4, items: [] },
        xpReward: 60,
        description: 'Servo vampírico sedento de sangue.'
    },

    ghost: {
        name: 'Fantasma',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/specter.glb',
        scale: 1.7,
        stats: { hp: 25, atk: 10, def: 0, speed: 16, mag: 12 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['toque_gelido', 'drenar_vida', 'incorporeo'],
        weaknesses: ['holy'],
        immunities: ['physical'],
        drops: { gold: { min: 15, max: 40 }, fragmentChance: 0.35, items: [] },
        xpReward: 35,
        description: 'Espírito atormentado, imune a ataques físicos.'
    },

    // ========== BESTAS ==========
    wolf: {
        name: 'Lobo',
        type: EnemyType.BEAST,
        model: '/models/enemies/wolf.glb',
        scale: 1.53,
        stats: { hp: 28, atk: 14, def: 4, speed: 18 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'mordida'],
        drops: { gold: { min: 5, max: 12 }, fragmentChance: 0.08, items: [] },
        xpReward: 15,
        description: 'Predador rápido e feroz.'
    },

    dire_wolf: {
        name: 'Lobo Atroz',
        type: EnemyType.BEAST,
        model: '/models/enemies/wolf.glb',
        scale: 2.21,
        stats: { hp: 55, atk: 20, def: 8, speed: 16 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'mordida_brutal', 'uivo'],
        drops: { gold: { min: 15, max: 35 }, fragmentChance: 0.2, items: [] },
        xpReward: 40,
        description: 'Lobo monstruoso, líder da matilha.'
    },

    werewolf: {
        name: 'Lobisomem',
        type: EnemyType.BEAST,
        model: '/models/enemies/werewolf.glb',
        scale: 2.0,
        stats: { hp: 75, atk: 25, def: 12, speed: 16 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'mordida_licantropa', 'frenesi', 'regeneracao'],
        weaknesses: ['silver'],
        resistances: ['physical'],
        drops: { gold: { min: 35, max: 70 }, fragmentChance: 0.35, items: [] },
        xpReward: 65,
        description: 'Humano amaldiçoado que se transforma em lobo.'
    },

    giant_spider: {
        name: 'Aranha Gigante',
        type: EnemyType.BEAST,
        model: '/models/enemies/giant_spider.glb',
        scale: 1.36,
        stats: { hp: 30, atk: 12, def: 6, speed: 14 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'teia', 'veneno'],
        drops: { gold: { min: 8, max: 20 }, fragmentChance: 0.15, items: [] },
        xpReward: 22,
        description: 'Aranha do tamanho de um cão, veneno paralisante.'
    },

    giant_rat: {
        name: 'Rato Gigante',
        type: EnemyType.BEAST,
        model: '/models/enemies/giant_rat.glb',
        scale: 1.2,
        stats: { hp: 18, atk: 8, def: 3, speed: 16 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'mordida_doentia'],
        drops: { gold: { min: 2, max: 8 }, fragmentChance: 0.05, items: [] },
        xpReward: 10,
        description: 'Rato do tamanho de um gato, transmite doenças.'
    },

    giant_bat: {
        name: 'Morcego Gigante',
        type: EnemyType.BEAST,
        model: '/models/enemies/giant_bat.glb',
        scale: 1.4,
        stats: { hp: 22, atk: 10, def: 2, speed: 20 },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['ataque_basico', 'mergulho', 'ecolocalização'],
        drops: { gold: { min: 5, max: 12 }, fragmentChance: 0.08, items: [] },
        xpReward: 15,
        description: 'Morcego enorme que ataca de surpresa.'
    },

    giant_snake: {
        name: 'Serpente Gigante',
        type: EnemyType.BEAST,
        model: '/models/enemies/giant_snake.glb',
        scale: 1.8,
        stats: { hp: 40, atk: 15, def: 8, speed: 12 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'constricao', 'mordida_venenosa'],
        drops: { gold: { min: 12, max: 28 }, fragmentChance: 0.15, items: [] },
        xpReward: 28,
        description: 'Cobra enorme que esmaga suas presas.'
    },

    brown_bear: {
        name: 'Urso Pardo',
        type: EnemyType.BEAST,
        model: '/models/enemies/brown_bear.glb',
        scale: 2.2,
        stats: { hp: 65, atk: 22, def: 10, speed: 10 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'patada', 'abraco_esmagador'],
        drops: { gold: { min: 15, max: 35 }, fragmentChance: 0.18, items: [] },
        xpReward: 45,
        description: 'Urso territorial extremamente forte.'
    },

    owlbear: {
        name: 'Urso-Coruja',
        type: EnemyType.MONSTROSITY,
        model: '/models/enemies/owlbear.glb',
        scale: 2.3,
        stats: { hp: 70, atk: 24, def: 12, speed: 12 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'bicada', 'garras_rasgantes', 'furia'],
        drops: { gold: { min: 25, max: 55 }, fragmentChance: 0.25, items: [] },
        xpReward: 55,
        description: 'Híbrido monstruoso de urso e coruja.'
    },

    // ========== DEMÔNIOS ==========
    imp: {
        name: 'Diabrete',
        type: EnemyType.DEMON,
        model: '/models/enemies/imp.glb',
        scale: 1.02,
        stats: { hp: 25, atk: 10, def: 4, speed: 20, mag: 10 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'bola_de_fogo_menor', 'teleporte'],
        weaknesses: ['holy'],
        resistances: ['fire'],
        drops: { gold: { min: 20, max: 50 }, fragmentChance: 0.3, items: [] },
        xpReward: 30,
        description: 'Demônio menor, ágil e traiçoeiro.'
    },

    quasit: {
        name: 'Quasit',
        type: EnemyType.DEMON,
        model: '/models/enemies/quasit.glb',
        scale: 0.9,
        stats: { hp: 20, atk: 8, def: 3, speed: 22, mag: 12 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'garras_venenosas', 'invisibilidade', 'mudar_forma'],
        weaknesses: ['holy'],
        resistances: ['fire', 'cold', 'poison'],
        drops: { gold: { min: 18, max: 45 }, fragmentChance: 0.28, items: [] },
        xpReward: 28,
        description: 'Demônio menor que pode se tornar invisível.'
    },

    dretch: {
        name: 'Dretch',
        type: EnemyType.DEMON,
        model: '/models/enemies/dretch.glb',
        scale: 1.4,
        stats: { hp: 35, atk: 12, def: 6, speed: 8 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'nuvem_fétida', 'garras'],
        weaknesses: ['holy'],
        resistances: ['fire', 'cold', 'lightning'],
        drops: { gold: { min: 15, max: 35 }, fragmentChance: 0.2, items: [] },
        xpReward: 25,
        description: 'Demônio inferior repugnante.'
    },

    balor: {
        name: 'Balor',
        type: EnemyType.DEMON,
        model: '/models/enemies/balor.glb',
        scale: 3.5,
        isBoss: true,
        stats: { hp: 250, atk: 45, def: 25, speed: 12, mag: 30 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['espada_flamejante', 'chicote_de_fogo', 'aura_de_medo', 'explosao_mortal'],
        weaknesses: ['holy'],
        immunities: ['fire', 'poison'],
        drops: { gold: { min: 200, max: 400 }, fragmentChance: 1.0, fragmentAmount: 8, items: ['chifre_de_balor'] },
        xpReward: 300,
        description: 'Senhor demônio de fogo, terror dos abismos.'
    },

    // ========== ELEMENTAIS ==========
    fire_elemental: {
        name: 'Elemental de Fogo',
        type: EnemyType.ELEMENTAL,
        model: '/models/enemies/fire_elemental.glb',
        scale: 2.0,
        stats: { hp: 55, atk: 20, def: 8, speed: 14, mag: 18 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['toque_flamejante', 'explosao_de_fogo', 'forma_de_fogo'],
        immunities: ['fire'],
        weaknesses: ['cold', 'water'],
        drops: { gold: { min: 25, max: 55 }, fragmentChance: 0.3, items: [] },
        xpReward: 50,
        description: 'Espírito elemental feito de chamas vivas.'
    },

    water_elemental: {
        name: 'Elemental de Água',
        type: EnemyType.ELEMENTAL,
        model: '/models/enemies/water_elemental.glb',
        scale: 2.0,
        stats: { hp: 60, atk: 18, def: 10, speed: 12, mag: 16 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['golpe_aquatico', 'afogamento', 'forma_de_agua'],
        immunities: ['cold'],
        weaknesses: ['lightning'],
        drops: { gold: { min: 25, max: 55 }, fragmentChance: 0.3, items: [] },
        xpReward: 50,
        description: 'Espírito elemental feito de água turbulenta.'
    },

    earth_elemental: {
        name: 'Elemental de Terra',
        type: EnemyType.ELEMENTAL,
        model: '/models/enemies/earth_elemental.glb',
        scale: 2.2,
        stats: { hp: 80, atk: 22, def: 18, speed: 6 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['golpe_de_pedra', 'terremoto', 'fundir_pedra'],
        resistances: ['physical'],
        weaknesses: ['thunder'],
        drops: { gold: { min: 30, max: 60 }, fragmentChance: 0.32, items: [] },
        xpReward: 55,
        description: 'Espírito elemental feito de rocha sólida.'
    },

    air_elemental: {
        name: 'Elemental de Ar',
        type: EnemyType.ELEMENTAL,
        model: '/models/enemies/air_elemental.glb',
        scale: 2.0,
        stats: { hp: 45, atk: 16, def: 4, speed: 22 },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['rajada_de_vento', 'turbilhao', 'forma_de_ar'],
        resistances: ['physical'],
        weaknesses: ['thunder'],
        drops: { gold: { min: 22, max: 50 }, fragmentChance: 0.28, items: [] },
        xpReward: 45,
        description: 'Espírito elemental feito de ventos furiosos.'
    },

    // ========== CONSTRUCTOS ==========
    animated_armor: {
        name: 'Armadura Animada',
        type: EnemyType.CONSTRUCT,
        model: '/models/enemies/animated_armor.glb',
        scale: 1.9,
        stats: { hp: 55, atk: 18, def: 18, speed: 8 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['ataque_basico', 'golpe_de_escudo', 'postura_defensiva'],
        immunities: ['poison', 'psychic'],
        drops: { gold: { min: 20, max: 45 }, fragmentChance: 0.25, items: [] },
        xpReward: 40,
        description: 'Armadura vazia animada por magia.'
    },

    stone_golem: {
        name: 'Golem de Pedra',
        type: EnemyType.CONSTRUCT,
        model: '/models/enemies/stone_golem.glb',
        scale: 2.5,
        isBoss: true,
        stats: { hp: 150, atk: 30, def: 22, speed: 4 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['ataque_basico', 'pisoteio', 'lentidao_magica'],
        immunities: ['poison', 'psychic', 'fire', 'cold'],
        drops: { gold: { min: 80, max: 160 }, fragmentChance: 1.0, fragmentAmount: 4, items: [] },
        xpReward: 150,
        description: 'Construto mágico de pedra indestrutível.'
    },

    iron_golem: {
        name: 'Golem de Ferro',
        type: EnemyType.CONSTRUCT,
        model: '/models/enemies/iron_golem.glb',
        scale: 2.8,
        isBoss: true,
        stats: { hp: 200, atk: 35, def: 25, speed: 4, mag: 15 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'sopro_venenoso', 'punhos_esmagadores'],
        immunities: ['poison', 'psychic', 'fire'],
        drops: { gold: { min: 120, max: 240 }, fragmentChance: 1.0, fragmentAmount: 6, items: ['nucleo_de_golem'] },
        xpReward: 200,
        description: 'Máquina de guerra mágica implacável.'
    },

    // ========== GIGANTES ==========
    ogre: {
        name: 'Ogro',
        type: EnemyType.GIANT,
        model: '/models/enemies/ogre.glb',
        scale: 2.5,
        stats: { hp: 70, atk: 24, def: 10, speed: 8 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'golpe_de_clava', 'arremessar'],
        drops: { gold: { min: 30, max: 65 }, fragmentChance: 0.25, items: [] },
        xpReward: 50,
        description: 'Gigante estúpido mas extremamente forte.'
    },

    troll: {
        name: 'Troll',
        type: EnemyType.GIANT,
        model: '/models/enemies/troll.glb',
        scale: 2.6,
        stats: { hp: 85, atk: 26, def: 12, speed: 10 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['ataque_basico', 'garras_rasgantes', 'regeneracao'],
        weaknesses: ['fire', 'acid'],
        drops: { gold: { min: 35, max: 75 }, fragmentChance: 0.3, items: [] },
        xpReward: 60,
        description: 'Monstro regenerador, só morre com fogo.'
    },

    hill_giant: {
        name: 'Gigante das Colinas',
        type: EnemyType.GIANT,
        model: '/models/enemies/hill_giant.glb',
        scale: 3.0,
        stats: { hp: 100, atk: 28, def: 14, speed: 8 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'arremessar_pedra', 'pisoteio'],
        drops: { gold: { min: 50, max: 100 }, fragmentChance: 0.35, items: [] },
        xpReward: 80,
        description: 'O menor dos gigantes, mas ainda aterrador.'
    },

    frost_giant: {
        name: 'Gigante do Gelo',
        type: EnemyType.GIANT,
        model: '/models/enemies/frost_giant.glb',
        scale: 3.2,
        isBoss: true,
        stats: { hp: 140, atk: 32, def: 18, speed: 8, mag: 15 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'sopro_gelido', 'arremessar_gelo'],
        immunities: ['cold'],
        weaknesses: ['fire'],
        drops: { gold: { min: 100, max: 200 }, fragmentChance: 1.0, fragmentAmount: 4, items: [] },
        xpReward: 150,
        description: 'Guerreiro gigante das terras geladas.'
    },

    fire_giant: {
        name: 'Gigante de Fogo',
        type: EnemyType.GIANT,
        model: '/models/enemies/fire_giant.glb',
        scale: 3.2,
        isBoss: true,
        stats: { hp: 150, atk: 35, def: 20, speed: 8 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['ataque_basico', 'espada_flamejante', 'arremessar_rocha_quente'],
        immunities: ['fire'],
        weaknesses: ['cold'],
        drops: { gold: { min: 110, max: 220 }, fragmentChance: 1.0, fragmentAmount: 5, items: [] },
        xpReward: 160,
        description: 'Forjador gigante das montanhas vulcânicas.'
    },

    storm_giant: {
        name: 'Gigante das Tempestades',
        type: EnemyType.GIANT,
        model: '/models/enemies/storm_giant.glb',
        scale: 3.5,
        isBoss: true,
        stats: { hp: 180, atk: 38, def: 22, speed: 10, mag: 25 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'relampago', 'controlar_clima', 'teletransporte'],
        immunities: ['lightning'],
        drops: { gold: { min: 150, max: 300 }, fragmentChance: 1.0, fragmentAmount: 6, items: ['essencia_de_tempestade'] },
        xpReward: 200,
        description: 'O mais poderoso dos gigantes, senhor das tempestades.'
    },

    // ========== ABERRAÇÕES ==========
    beholder: {
        name: 'Observador',
        type: EnemyType.ABERRATION,
        model: '/models/enemies/beholder.glb',
        scale: 2.2,
        isBoss: true,
        stats: { hp: 130, atk: 20, def: 16, speed: 8, mag: 40 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['raio_de_morte', 'raio_paralisante', 'raio_de_medo', 'campo_antimagia', 'desintegrar'],
        drops: { gold: { min: 140, max: 280 }, fragmentChance: 1.0, fragmentAmount: 5, items: ['olho_de_observador'] },
        xpReward: 180,
        description: 'Esfera flutuante coberta de olhos mortais.'
    },

    gazer: {
        name: 'Contemplador',
        type: EnemyType.ABERRATION,
        model: '/models/enemies/gazer.glb',
        scale: 1.0,
        stats: { hp: 25, atk: 10, def: 4, speed: 14, mag: 15 },
        behavior: EnemyBehavior.SNIPER,
        abilities: ['raio_de_frio', 'raio_de_fogo', 'telecinese'],
        drops: { gold: { min: 20, max: 45 }, fragmentChance: 0.25, items: [] },
        xpReward: 30,
        description: 'Criatura ocular menor ligada a um Observador.'
    },

    mind_flayer: {
        name: 'Devorador de Mentes',
        type: EnemyType.ABERRATION,
        model: '/models/enemies/mind_flayer.glb',
        scale: 1.8,
        isBoss: true,
        stats: { hp: 90, atk: 18, def: 12, speed: 10, mag: 35 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['explosao_mental', 'dominar_mente', 'extrair_cerebro', 'teletransporte'],
        resistances: ['psychic'],
        drops: { gold: { min: 120, max: 240 }, fragmentChance: 1.0, fragmentAmount: 4, items: ['tentaculo_de_illithid'] },
        xpReward: 150,
        description: 'Criatura alienígena que se alimenta de cérebros.'
    },

    aboleth: {
        name: 'Aboleth',
        type: EnemyType.ABERRATION,
        model: '/models/enemies/Aboleth.glb',
        scale: 3.0,
        isBoss: true,
        stats: { hp: 160, atk: 25, def: 18, speed: 8, mag: 30 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['tentaculos', 'escravizar', 'nuvem_mucosa', 'ilusao'],
        drops: { gold: { min: 160, max: 320 }, fragmentChance: 1.0, fragmentAmount: 6, items: ['muco_de_aboleth'] },
        xpReward: 200,
        description: 'Criatura ancestral das profundezas aquáticas.'
    },

    // ========== GOSMAS ==========
    gelatinous_cube: {
        name: 'Cubo Gelatinoso',
        type: EnemyType.OOZE,
        model: '/models/enemies/gelatinous_cube.glb',
        scale: 2.0,
        stats: { hp: 80, atk: 15, def: 5, speed: 4 },
        behavior: EnemyBehavior.DEFENSIVE,
        abilities: ['engolir', 'acido', 'transparencia'],
        immunities: ['psychic', 'lightning'],
        drops: { gold: { min: 25, max: 55 }, fragmentChance: 0.3, items: [] },
        xpReward: 45,
        description: 'Cubo transparente que dissolve tudo que toca.'
    },

    // ========== MONSTROSIDADES ==========
    mimic: {
        name: 'Mímico',
        type: EnemyType.MONSTROSITY,
        model: '/models/enemies/mimic.glb',
        scale: 1.5,
        stats: { hp: 50, atk: 18, def: 12, speed: 4 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['mordida_adesiva', 'pseudopode', 'mudança_de_forma'],
        immunities: ['acid'],
        drops: { gold: { min: 30, max: 80 }, fragmentChance: 0.35, items: [] },
        xpReward: 40,
        description: 'Criatura que se disfarça de baú de tesouro.'
    },

    // ========== DRAGÕES ==========
    young_red_dragon: {
        name: 'Dragão Vermelho Jovem',
        type: EnemyType.DRAGON,
        model: '/models/enemies/young_red_dragon.glb',
        scale: 2.8,
        isBoss: true,
        stats: { hp: 180, atk: 35, def: 20, speed: 14, mag: 25 },
        behavior: EnemyBehavior.AGGRESSIVE,
        abilities: ['mordida', 'garras', 'sopro_de_fogo', 'asa_atacante', 'presenca_aterrorizante'],
        immunities: ['fire'],
        drops: { gold: { min: 200, max: 400 }, fragmentChance: 1.0, fragmentAmount: 8, items: ['escama_de_dragao_vermelho'] },
        xpReward: 250,
        description: 'Jovem dragão de fogo, arrogante e destrutivo.'
    },

    young_black_dragon: {
        name: 'Dragão Negro Jovem',
        type: EnemyType.DRAGON,
        model: '/models/enemies/young_black_dragon.glb',
        scale: 2.6,
        isBoss: true,
        stats: { hp: 160, atk: 32, def: 18, speed: 14, mag: 22 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['mordida', 'garras', 'sopro_acido', 'emboscada_aquatica'],
        immunities: ['acid'],
        drops: { gold: { min: 180, max: 360 }, fragmentChance: 1.0, fragmentAmount: 7, items: ['escama_de_dragao_negro'] },
        xpReward: 220,
        description: 'Dragão sombrio dos pântanos, cruel e calculista.'
    },

    young_white_dragon: {
        name: 'Dragão Branco Jovem',
        type: EnemyType.DRAGON,
        model: '/models/enemies/young_white_dragon.glb',
        scale: 2.5,
        isBoss: true,
        stats: { hp: 140, atk: 28, def: 16, speed: 16, mag: 18 },
        behavior: EnemyBehavior.BERSERKER,
        abilities: ['mordida', 'garras', 'sopro_gelido', 'escalar_gelo'],
        immunities: ['cold'],
        weaknesses: ['fire'],
        drops: { gold: { min: 160, max: 320 }, fragmentChance: 1.0, fragmentAmount: 6, items: ['escama_de_dragao_branco'] },
        xpReward: 200,
        description: 'Dragão bestial das terras congeladas.'
    },

    // ========== BOSSES ESPECIAIS ==========
    goblin_king: {
        name: 'Rei Goblin',
        type: EnemyType.HUMANOID,
        model: '/models/enemies/goblin.glb',
        scale: 1.87,
        isBoss: true,
        stats: { hp: 150, atk: 20, def: 12, speed: 8 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['ataque_basico', 'golpe_brutal', 'convocar_goblins', 'grito_de_guerra'],
        drops: { gold: { min: 100, max: 200 }, fragmentChance: 1.0, fragmentAmount: 3, items: ['coroa_goblin'] },
        xpReward: 150,
        description: 'O líder supremo dos goblins. Covarde, mas perigoso.'
    },

    lich: {
        name: 'Lich',
        type: EnemyType.UNDEAD,
        model: '/models/enemies/lich.glb',
        scale: 2.04,
        isBoss: true,
        stats: { hp: 120, atk: 15, def: 8, speed: 10, mag: 35 },
        behavior: EnemyBehavior.TACTICAL,
        abilities: ['raio_necrotico', 'drenar_vida', 'invocar_mortos', 'escudo_osseo'],
        weaknesses: ['holy'],
        immunities: ['poison', 'fear'],
        drops: { gold: { min: 150, max: 300 }, fragmentChance: 1.0, fragmentAmount: 5, items: ['filacterio_quebrado'] },
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
        mag: enemy.stats.mag || 0,
        scale: enemy.scale || 1.7
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
        enemyType: enemyId, // Preserva o ID original para carregamento de modelo
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
        1: ['goblin', 'goblin_archer', 'wolf', 'kobold', 'giant_rat'],
        2: ['goblin', 'goblin_shaman', 'hobgoblin', 'skeleton', 'zombie', 'wolf', 'giant_spider', 'bandit'],
        3: ['skeleton', 'zombie', 'ghoul', 'specter', 'giant_spider', 'giant_snake', 'gnoll', 'orc'],
        4: ['ghost', 'wight', 'mummy', 'imp', 'dretch', 'werewolf', 'ogre', 'drow'],
        5: ['vampire_spawn', 'quasit', 'troll', 'animated_armor', 'gazer', 'fire_elemental'],
        6: ['shadow', 'earth_elemental', 'water_elemental', 'air_elemental', 'owlbear', 'brown_bear'],
        7: ['mimic', 'gelatinous_cube', 'hill_giant', 'bugbear', 'stone_golem'],
        8: ['frost_giant', 'fire_giant', 'mind_flayer', 'young_white_dragon'],
        9: ['iron_golem', 'balor', 'young_black_dragon', 'aboleth'],
        10: ['storm_giant', 'beholder', 'young_red_dragon', 'lich'] // Boss chapter
    };

    return chapterEnemies[chapter] || chapterEnemies[1];
}

/**
 * Retorna N inimigos aleatórios (diferentes entre si, exclui bosses)
 * @param {number} count - Quantidade de inimigos
 */
export function getRandomEnemies(count = 2) {
    const allEnemyIds = Object.keys(EnemyDatabase)
        .filter(id => !EnemyDatabase[id].isBoss);

    // Embaralhar e pegar N primeiros
    const shuffled = allEnemyIds.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
