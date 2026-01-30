/**
 * NarrativeDatabase - Base de dados de narrativas e diálogos
 * Contém textos de introdução, eventos e falas do Game Master
 */

export const NarrativeType = {
    CHAPTER_INTRO: 'chapter_intro',
    COMBAT_INTRO: 'combat_intro',
    COMBAT_VICTORY: 'combat_victory',
    COMBAT_DEFEAT: 'combat_defeat',
    EXPLORATION: 'exploration',
    EVENT: 'event',
    CHOICE: 'choice',
    LORE: 'lore'
};

/**
 * Introduções dos capítulos
 */
export const ChapterIntros = {
    1: {
        title: 'Capítulo 1: As Sombras sobre Pedra Branca',
        lines: [
            'A vila de Pedra Branca sempre foi pacífica...',
            'Mas nas últimas semanas, criaturas estranhas começaram a aparecer nas redondezas.',
            'Goblins vindos das montanhas atacam viajantes nas estradas.',
            'O prefeito pediu ajuda a heróis corajosos.',
            'Vocês são a última esperança de Pedra Branca.',
            '⚔️ Sua jornada começa agora!'
        ],
        bgm: 'chapter1_theme'
    },
    2: {
        title: 'Capítulo 2: O Cemitério Profanado',
        lines: [
            'Com os goblins derrotados, a paz parecia restaurada...',
            'Mas algo sinistro desperta no antigo cemitério.',
            'Mortos-vivos caminham entre as lápides.',
            'Uma energia negra emana das catacumbas.',
            'Algo ou alguém está profanando o descanso eterno.',
            '💀 Enfrentem os horrores além da morte!'
        ],
        bgm: 'chapter2_theme'
    },
    3: {
        title: 'Capítulo 3: Portal das Trevas',
        lines: [
            'O Lich foi apenas o começo...',
            'Um portal foi aberto nas ruínas antigas.',
            'Demônios menores já atravessam o véu.',
            'Se o portal não for fechado, Pedra Branca será destruída.',
            'O destino do mundo repousa em suas mãos.',
            '🔥 Fechem o portal antes que seja tarde!'
        ],
        bgm: 'chapter3_theme'
    }
};

/**
 * Introduções de combate baseadas no tipo de inimigo
 */
export const CombatIntros = {
    goblin: [
        'Goblins selvagens bloqueiam o caminho!',
        'Uma emboscada! Goblins surgem das sombras!',
        'Risos estridentes ecoam... Goblins atacam!',
        'Um bando de goblins aparece, famintos por sangue!'
    ],
    undead: [
        'O chão treme... os mortos despertam!',
        'Esqueletos erguem-se das sepulturas!',
        'Um cheiro de podridão anuncia os mortos-vivos!',
        'Mãos esqueléticas emergem da terra!'
    ],
    beast: [
        'Olhos selvagens brilham na escuridão!',
        'Um uivo ecoa... predadores se aproximam!',
        'A natureza se volta contra vocês!',
        'Bestas famintas cercam o grupo!'
    ],
    demon: [
        'O ar fica denso... presenças malignas!',
        'Cheiro de enxofre... demônios surgem!',
        'Risos demoníacos ecoam do nada!',
        'O portal pulsa... invasores do abismo aparecem!'
    ],
    boss: [
        'Uma presença esmagadora se aproxima...',
        'O chão treme com passos pesados...',
        'Vocês sentem o poder emanando à frente...',
        'Este é o momento. O inimigo supremo aguarda!'
    ]
};

/**
 * Frases de vitória
 */
export const VictoryLines = [
    'Vitória! Os inimigos foram derrotados!',
    'A batalha terminou. Vocês prevalecem!',
    'Excelente! Os monstros jazem derrotados!',
    'Com coragem e estratégia, vocês vencem!',
    'O mal recua diante de sua força!'
];

/**
 * Frases de derrota
 */
export const DefeatLines = [
    'A escuridão vence... por enquanto.',
    'Vocês caem, mas a esperança não morre.',
    'Derrotados... mas não destruídos.',
    'Recuem e recuperem suas forças.',
    'Esta batalha foi perdida, não a guerra.'
];

/**
 * Eventos aleatórios de exploração
 */
export const ExplorationEvents = {
    treasure: {
        type: NarrativeType.EVENT,
        title: 'Tesouro Encontrado!',
        description: 'Vocês encontram um baú escondido entre as ruínas.',
        choices: [
            { text: 'Abrir o baú', outcome: 'gold', value: 50 },
            { text: 'Examinar por armadilhas', outcome: 'safe_gold', value: 75, skillCheck: 'perception' }
        ]
    },

    wounded_traveler: {
        type: NarrativeType.CHOICE,
        title: 'Viajante Ferido',
        description: 'Um viajante ferido pede socorro no caminho.',
        choices: [
            { text: 'Ajudar o viajante', outcome: 'help', reward: { reputation: 10, gold: 20 } },
            { text: 'Ignorar e seguir', outcome: 'ignore', penalty: { reputation: -5 } },
            { text: 'Curar com magia (Clérigo)', outcome: 'heal', reward: { reputation: 20, xp: 30 }, requires: 'cleric' }
        ]
    },

    ancient_shrine: {
        type: NarrativeType.LORE,
        title: 'Santuário Antigo',
        description: 'Um santuário em ruínas dedicado aos deuses antigos.',
        loreText: 'Os primeiros habitantes de Pedra Branca ergueram este santuário há mil anos, quando a magia fluía livremente pelo mundo...',
        choices: [
            { text: 'Orar no santuário', outcome: 'pray', reward: { blessing: true, duration: 3 } },
            { text: 'Examinar as runas', outcome: 'study', reward: { lore_fragment: 1 } },
            { text: 'Continuar jornada', outcome: 'leave' }
        ]
    },

    mysterious_merchant: {
        type: NarrativeType.EVENT,
        title: 'Mercador Misterioso',
        description: 'Uma figura encapuzada oferece mercadorias estranhas.',
        choices: [
            { text: 'Ver itens', outcome: 'shop' },
            { text: 'Perguntar sobre a região', outcome: 'info', reward: { map_reveal: 1 } },
            { text: 'Recusar', outcome: 'leave' }
        ]
    },

    goblin_camp: {
        type: NarrativeType.CHOICE,
        title: 'Acampamento Goblin',
        description: 'Vocês avistam um pequeno acampamento goblin à frente.',
        choices: [
            { text: 'Atacar de surpresa', outcome: 'combat_advantage', bonus: { initiative: 5 } },
            { text: 'Contornar silenciosamente', outcome: 'stealth', skillCheck: 'stealth' },
            { text: 'Observar de longe', outcome: 'scout', reward: { enemy_info: true } }
        ]
    }
};

/**
 * Falas do Game Master durante combate
 */
export const GMCombatLines = {
    critical_hit: [
        'Golpe crítico! Dano devastador!',
        'Um ataque perfeito! O inimigo cambaleia!',
        'Incrível! O golpe acerta com força total!'
    ],
    enemy_low_hp: [
        'O inimigo está enfraquecendo!',
        'Mais um golpe e ele cai!',
        'A criatura mal consegue ficar de pé!'
    ],
    hero_low_hp: [
        'Cuidado! Seu herói está ferido!',
        'HP crítico! Cure-se rapidamente!',
        'Um golpe a mais pode ser fatal!'
    ],
    heal: [
        'Energia vital restaurada!',
        'A luz sagrada cura as feridas!',
        'Vocês se sentem revitalizados!'
    ],
    buff: [
        'Poder emanando pelos heróis!',
        'Uma aura fortalece o grupo!',
        'Vocês sentem força renovada!'
    ],
    enemy_defeated: [
        'Um inimigo cai!',
        'Menos um para se preocupar!',
        'Excelente! Continue assim!'
    ]
};

/**
 * Retorna uma linha aleatória de uma categoria
 */
export function getRandomLine(category) {
    if (Array.isArray(category)) {
        return category[Math.floor(Math.random() * category.length)];
    }
    return category;
}

/**
 * Retorna intro de combate baseado no tipo de inimigo
 */
export function getCombatIntro(enemyType) {
    const intros = CombatIntros[enemyType] || CombatIntros.goblin;
    return getRandomLine(intros);
}

/**
 * Retorna intro do capítulo
 */
export function getChapterIntro(chapter) {
    return ChapterIntros[chapter] || ChapterIntros[1];
}
