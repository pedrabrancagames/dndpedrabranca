/**
 * QuestDatabase - Base de dados de todas as missões do jogo
 * Define objetivos, recompensas e estados das quests
 */

export const QuestStatus = {
    AVAILABLE: 'available',  // Disponível para aceitar
    ACTIVE: 'active',        // Em andamento
    COMPLETED: 'completed',  // Concluída
    FAILED: 'failed'         // Falhou (tempo expirado, etc.)
};

export const QuestType = {
    MAIN: 'main',           // Missão principal (história)
    SIDE: 'side',           // Missão secundária
    DAILY: 'daily',         // Missão diária
    EVENT: 'event'          // Evento especial
};

export const ObjectiveType = {
    KILL: 'kill',           // Matar X inimigos
    COLLECT: 'collect',     // Coletar X itens
    TALK: 'talk',           // Falar com NPC
    EXPLORE: 'explore',     // Visitar local
    DELIVER: 'deliver'      // Entregar item
};

/**
 * Base de dados de quests
 * Cada quest possui: id, name, type, description, objectives, rewards, requirements
 */
export const QuestDatabase = {
    // ========== CAPÍTULO 1: GOBLINS ==========
    goblin_threat: {
        id: 'goblin_threat',
        name: 'A Ameaça Goblin',
        type: QuestType.MAIN,
        chapter: 1,
        description: 'Goblins foram avistados nas proximidades de Pedra Branca. Investigue a origem dessa invasão e proteja os moradores.',
        briefDescription: 'Elimine a ameaça goblin que ronda a cidade.',
        giver: 'Prefeito de Pedra Branca',
        objectives: [
            { id: 'scout', type: ObjectiveType.EXPLORE, description: 'Investigar avistamentos de goblins', target: 'goblin_camp', progress: 0, required: 1 },
            { id: 'kill_goblins', type: ObjectiveType.KILL, description: 'Derrotar goblins', target: 'goblin', progress: 0, required: 3 },
            { id: 'report', type: ObjectiveType.TALK, description: 'Reportar ao Prefeito', target: 'mayor', progress: 0, required: 1 }
        ],
        rewards: {
            xp: 100,
            gold: 50,
            items: ['potion_health_small', 'potion_health_small']
        },
        requirements: {
            level: 1,
            quests: []
        }
    },

    goblin_leader: {
        id: 'goblin_leader',
        name: 'O Líder Goblin',
        type: QuestType.MAIN,
        chapter: 1,
        description: 'Os goblins comuns eram apenas batedores. Encontre e derrote o líder goblin antes que ele organize um ataque maior.',
        briefDescription: 'Derrote o líder goblin Grukk.',
        giver: 'Capitão da Guarda',
        objectives: [
            { id: 'find_lair', type: ObjectiveType.EXPLORE, description: 'Encontrar o covil goblin', target: 'goblin_lair', progress: 0, required: 1 },
            { id: 'kill_boss', type: ObjectiveType.KILL, description: 'Derrotar Grukk, o Líder', target: 'grukk_boss', progress: 0, required: 1 }
        ],
        rewards: {
            xp: 250,
            gold: 100,
            items: ['sword_flame']
        },
        requirements: {
            level: 2,
            quests: ['goblin_threat']
        }
    },

    // ========== MISSÕES SECUNDÁRIAS ==========
    lost_merchant: {
        id: 'lost_merchant',
        name: 'O Mercador Perdido',
        type: QuestType.SIDE,
        chapter: 1,
        description: 'Um mercador não retornou de sua jornada. Sua esposa está preocupada. Encontre-o e traga-o de volta em segurança.',
        briefDescription: 'Encontre o mercador desaparecido.',
        giver: 'Esposa do Mercador',
        objectives: [
            { id: 'search', type: ObjectiveType.EXPLORE, description: 'Procurar nas trilhas próximas', target: 'forest_path', progress: 0, required: 3 },
            { id: 'rescue', type: ObjectiveType.TALK, description: 'Resgatar o mercador', target: 'merchant_npc', progress: 0, required: 1 }
        ],
        rewards: {
            xp: 75,
            gold: 30,
            items: ['ring_protection']
        },
        requirements: {
            level: 1,
            quests: []
        }
    },

    herb_gathering: {
        id: 'herb_gathering',
        name: 'Ervas Medicinais',
        type: QuestType.SIDE,
        chapter: 1,
        description: 'O curandeiro local precisa de ervas raras para preparar poções. Colete-as nas redondezas.',
        briefDescription: 'Colete ervas para o curandeiro.',
        giver: 'Curandeiro',
        objectives: [
            { id: 'collect_herbs', type: ObjectiveType.COLLECT, description: 'Coletar Ervas Curativas', target: 'healing_herb', progress: 0, required: 5 }
        ],
        rewards: {
            xp: 50,
            gold: 20,
            items: ['potion_health_medium', 'potion_health_medium']
        },
        requirements: {
            level: 1,
            quests: []
        }
    },

    deliver_letter: {
        id: 'deliver_letter',
        name: 'Correspondência Urgente',
        type: QuestType.SIDE,
        chapter: 1,
        description: 'Uma carta lacrada precisa chegar ao Prefeito com urgência. O mensageiro original desapareceu no caminho.',
        briefDescription: 'Entregue a carta ao Prefeito.',
        giver: 'Mensageiro Ferido',
        objectives: [
            { id: 'get_letter', type: ObjectiveType.COLLECT, description: 'Pegar a carta lacrada', target: 'letter_sealed', progress: 0, required: 1 },
            { id: 'deliver', type: ObjectiveType.DELIVER, description: 'Entregar ao Prefeito', target: 'mayor', progress: 0, required: 1 }
        ],
        rewards: {
            xp: 40,
            gold: 25,
            items: []
        },
        requirements: {
            level: 1,
            quests: []
        }
    },

    // ========== MISSÕES DIÁRIAS ==========
    daily_patrol: {
        id: 'daily_patrol',
        name: 'Patrulha Diária',
        type: QuestType.DAILY,
        chapter: 1,
        description: 'Ajude a guarda local patrulhando as ruas e eliminando ameaças.',
        briefDescription: 'Patrulhe a cidade e elimine inimigos.',
        giver: 'Capitão da Guarda',
        objectives: [
            { id: 'patrol', type: ObjectiveType.EXPLORE, description: 'Visitar pontos de patrulha', target: 'patrol_point', progress: 0, required: 3 },
            { id: 'clear', type: ObjectiveType.KILL, description: 'Eliminar ameaças', target: 'any_enemy', progress: 0, required: 3 }
        ],
        rewards: {
            xp: 30,
            gold: 15,
            items: []
        },
        requirements: {
            level: 1,
            quests: []
        },
        isDaily: true,
        resetTime: 24 // horas
    }
};

/**
 * Retorna os dados de uma quest pelo ID
 * @param {string} questId - ID da quest
 * @returns {Object|null} - Dados da quest ou null se não encontrada
 */
export function getQuestData(questId) {
    return QuestDatabase[questId] || null;
}

/**
 * Retorna todas as quests de um tipo
 * @param {string} type - Tipo da quest (QuestType.*)
 * @returns {Array} - Array de quests do tipo
 */
export function getQuestsByType(type) {
    return Object.values(QuestDatabase).filter(quest => quest.type === type);
}

/**
 * Retorna todas as quests de um capítulo
 * @param {number} chapter - Número do capítulo
 * @returns {Array} - Array de quests do capítulo
 */
export function getQuestsByChapter(chapter) {
    return Object.values(QuestDatabase).filter(quest => quest.chapter === chapter);
}

/**
 * Verifica se um jogador pode aceitar uma quest
 * @param {Object} quest - Dados da quest
 * @param {Object} playerData - Dados do jogador (level, quests completadas)
 * @returns {boolean} - True se pode aceitar
 */
export function canAcceptQuest(quest, playerData) {
    // Verificar nível
    if (playerData.level < quest.requirements.level) return false;

    // Verificar quests pré-requisito
    const completedQuests = playerData.completedQuests || [];
    for (const reqQuest of quest.requirements.quests) {
        if (!completedQuests.includes(reqQuest)) return false;
    }

    return true;
}

/**
 * Calcula o progresso total de uma quest
 * @param {Object} quest - Dados da quest com objetivos
 * @returns {number} - Porcentagem de progresso (0-100)
 */
export function getQuestProgress(quest) {
    if (!quest.objectives || quest.objectives.length === 0) return 0;

    let totalProgress = 0;
    for (const obj of quest.objectives) {
        totalProgress += Math.min(obj.progress / obj.required, 1);
    }

    return Math.floor((totalProgress / quest.objectives.length) * 100);
}

/**
 * Retorna o nome traduzido do tipo de quest
 * @param {string} type - Tipo da quest
 * @returns {string} - Nome em português
 */
export function getQuestTypeName(type) {
    const names = {
        [QuestType.MAIN]: 'Principal',
        [QuestType.SIDE]: 'Secundária',
        [QuestType.DAILY]: 'Diária',
        [QuestType.EVENT]: 'Evento'
    };
    return names[type] || 'Missão';
}

/**
 * Retorna o ícone do tipo de quest
 * @param {string} type - Tipo da quest
 * @returns {string} - Emoji do tipo
 */
export function getQuestTypeIcon(type) {
    const icons = {
        [QuestType.MAIN]: '⭐',
        [QuestType.SIDE]: '📋',
        [QuestType.DAILY]: '🔄',
        [QuestType.EVENT]: '🎉'
    };
    return icons[type] || '📜';
}
