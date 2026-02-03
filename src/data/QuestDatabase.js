/**
 * QuestDatabase - Base de dados para o NOVO sistema de missões em RA
 * Substitui o sistema antigo.
 */

export const QuestStatus = {
    AVAILABLE: 'available',  // No mapa, visível
    ACTIVE: 'active',        // Aceita, em progresso
    COMPLETED: 'completed',  // Finalizada
    FAILED: 'failed'         // Falhou/Desistiu
};

export const QuestType = {
    COMBAT: 'combat',
    COLLECTION: 'collection',
    PUZZLE: 'puzzle',
    INTERACTION: 'interaction'
};

export const QuestObjectiveType = {
    KILL: 'kill',
    COLLECT: 'collect',
    INTERACT: 'interact',
    FIND: 'find'
};

/**
 * Definição da estrutura de uma Missão
 * @typedef {Object} Quest
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} type - Enum QuestType
 * @property {string} giverId - ID do modelo do NPC (ex: 'mayor')
 * @property {Object} icon - Emoji ou icone
 * @property {Object} location - Posição no mapa (simulado para este protótipo)
 * @property {Object} dialogue - Árvore de diálogo
 * @property {Array} objectives - Lista de objetivos
 * @property {Object} rewards - Recompensas
 */

export const QuestDatabase = {
    // --- Missão de Combate (Exemplo) ---
    goblin_threat: {
        id: 'goblin_threat',
        title: 'A Ameaça Goblin',
        description: 'Goblins estão aterrorizando o bairro. Ajude o Prefeito!',
        type: QuestType.COMBAT,
        giverId: 'mayor', // Modelo do prefeito
        markerIcon: '⚔️',
        location: { x: 0, z: -5 }, // Posição relativa inicial no mapa

        dialogue: {
            // Quando a missão está DISPONÍVEL
            offer: {
                text: "Olá viajante! Goblins estão roubando nossas colheitas. Você poderia nos ajudar a afugentá-los?",
                options: [
                    { text: "Claro, deixe comigo!", action: 'accept' },
                    { text: "Agora não posso.", action: 'refuse' }
                ]
            },
            // Quando a missão está ATIVA (Em progresso)
            active: {
                text: "Como está indo a caçada? Os goblins ainda estão por aí.",
                options: [
                    { text: "Ainda estou cuidando disso.", action: 'close' },
                    { text: "Está muito difícil, quero desistir.", action: 'abandon' }
                ]
            },
            // Quando a missão está CONCLUÍDA (Pronta para entregar)
            completed: {
                text: "Você salvou nossa pele! Aqui está sua recompensa.",
                options: [
                    { text: "Obrigado!", action: 'complete' }
                ]
            }
        },

        objectives: [
            {
                id: 'kill_goblins',
                type: QuestObjectiveType.KILL,
                target: 'goblin_grunt',
                amount: 3,
                current: 0,
                description: "Derrote 3 Goblins"
            }
        ],

        rewards: {
            xp: 100,
            gold: 50,
            items: ['potion_health']
        }
    },

    // --- Missão de Coleta (Exemplo) ---
    herb_collection: {
        id: 'herb_collection',
        title: 'Ervas Medicinais',
        description: 'O curandeiro precisa de ervas raras.',
        type: QuestType.COLLECTION,
        giverId: 'healer',
        markerIcon: '🌿',
        location: { x: 10, z: 5 },

        dialogue: {
            offer: {
                text: "Saudações. Meus estoques de Erva-Lua estão baixos. Se encontrar alguma, eu pago bem.",
                options: [
                    { text: "Vou procurar para você.", action: 'accept' },
                    { text: "Não sou jardineiro.", action: 'refuse' }
                ]
            },
            active: {
                text: "Encontrou as ervas? Meus pacientes estão esperando.",
                options: [
                    { text: "Ainda procurando.", action: 'close' },
                    { text: "Não consigo encontrar, desisto.", action: 'abandon' }
                ]
            },
            completed: {
                text: "Perfeito! Essas ervas são de ótima qualidade.",
                options: [
                    { text: "Fico feliz em ajudar.", action: 'complete' }
                ]
            }
        },

        objectives: [
            {
                id: 'collect_herbs',
                type: QuestObjectiveType.COLLECT,
                target: 'moon_herb',
                amount: 5,
                current: 0,
                description: "Colete 5 Ervas-Lua"
            }
        ],

        rewards: {
            xp: 50,
            gold: 20
        }
    }
},

    // --- Missão de Puzzle (Runes) ---
    ancient_secrets: {
        id: 'ancient_secrets',
        title: 'Segredo dos Antigos',
        description: 'Decifre a sequência das runas para abrir o selo.',
        type: QuestType.PUZZLE,
        giverId: 'mayor', // Prefeito dá a missão
        markerIcon: '🧩',
        location: { x: -5, z: 0 },

        dialogue: {
            offer: {
                text: "Ah, que bom te ver! Encontrei escrituras antigas. Dizem: 'Fogo queima, Água apaga, Terra sustenta'. Pode investigar?",
                options: [
                    { text: "Parece um enigma. Eu aceito.", action: 'accept' },
                    { text: "Não sou bom com charadas.", action: 'refuse' }
                ]
            },
            active: {
                text: "Lembre-se da ordem: Fogo primeiro, depois Água, por fim a Terra.",
                options: [
                    { text: "Entendido.", action: 'close' },
                    { text: "Desisto, é muito difícil.", action: 'abandon' }
                ]
            },
            completed: {
                text: "Incrível! O selo foi quebrado e os conhecimentos antigos recuperados.",
                options: [
                    { text: "Foi um prazer.", action: 'complete' }
                ]
            }
        },

        objectives: [
            {
                id: 'solve_runes',
                type: QuestObjectiveType.INTERACT,
                target: 'runes_puzzle',
                amount: 1,
                current: 0,
                description: "Resolva a Sequência das Runas",
                puzzleData: {
                    sequence: ['rune_red', 'rune_blue', 'rune_green'], // Fogo, Água, Terra
                    models: [
                        { id: 'rune_red', model: '/models/items/gem.glb', color: 0xff0000 },
                        { id: 'rune_blue', model: '/models/items/gem.glb', color: 0x0000ff },
                        { id: 'rune_green', model: '/models/items/gem.glb', color: 0x00ff00 }
                    ]
                }
            }
        ],

        rewards: {
            xp: 150,
            gold: 100,
            items: ['gem']
        }
    }
};

/** Helpers */
export function getQuestData(id) {
    return QuestDatabase[id];
}

export function getQuestsByChapter(chapter) {
    // Por enquanto retorna todas, sistema de capítulos simplificado
    return Object.values(QuestDatabase);
}

export function getQuestProgress(quest) {
    // Calculado no runtime via MissionManager, mas para exibição estática:
    if (!quest.objectives) return 0;
    // Retorna 0 como base se não tiver dados de progresso injetados
    // A UI deve injetar o progresso antes de chamar ou tratar aqui se for objeto de estado
    if (quest.progress !== undefined) return quest.progress; // Se já vier com progresso

    // Se for o objeto estático, não tem progresso salvo nele.
    return 0;
}

export function getQuestTypeName(type) {
    const map = {
        [QuestType.COMBAT]: 'Combate',
        [QuestType.COLLECTION]: 'Coleta',
        [QuestType.PUZZLE]: 'Enigma',
        [QuestType.INTERACTION]: 'Interação'
    };
    return map[type] || 'Desconhecido';
}

export function getQuestTypeIcon(type) {
    const map = {
        [QuestType.COMBAT]: '⚔️',
        [QuestType.COLLECTION]: '🎒',
        [QuestType.PUZZLE]: '🧩',
        [QuestType.INTERACTION]: '💬'
    };
    return map[type] || '❓';
}

export function canAcceptQuest(quest, playerData) {
    // Implementação básica
    return true;
}
