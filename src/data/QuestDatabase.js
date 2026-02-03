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
};

/** Helpers */
export function getQuestData(id) {
    return QuestDatabase[id];
}
