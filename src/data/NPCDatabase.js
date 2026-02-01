/**
 * NPCDatabase - Base de dados de todos os NPCs
 * Define modelos, comportamentos, e diálogos iniciais
 */

export const NPCRole = {
    MERCHANT: 'merchant',
    QUEST_GIVER: 'quest_giver',
    HEALER: 'healer',
    CIVILIAN: 'civilian',
    GUARD: 'guard'
};

/**
 * Base de dados de NPCs
 */
export const NPCDatabase = {
    // ========== NPCs Principais ==========
    mayor: {
        id: 'mayor',
        name: 'Prefeito Magnus',
        role: NPCRole.QUEST_GIVER,
        model: '/models/npc/mayor.glb',
        scale: 1.0, // Ajuste de escala se necessário
        animations: {
            idle: 'Idle',
            talk: 'Talk',
            interact: 'Wave'
        },
        dialogueId: 'mayor_intro',
        description: 'O preocupado prefeito de Pedra Branca.'
    },

    merchant_npc: {
        id: 'merchant_npc',
        name: 'Balthazar', // Nome genérico de mercador
        role: NPCRole.MERCHANT,
        model: '/models/npc/merchant.glb',
        scale: 1.0,
        animations: {
            idle: 'Idle',
            talk: 'Talk',
            interact: 'Trade'
        },
        dialogueId: 'merchant_welcome',
        shopInventory: ['potion_health_small', 'potion_mana_small', 'sword_iron'],
        description: 'Um mercador viajante com produtos exóticos.'
    },

    // ========== NPCs Secundários (Futuro) ==========
    guard_captain: {
        id: 'guard_captain',
        name: 'Capitão Valerius',
        role: NPCRole.QUEST_GIVER,
        model: '/models/npc/guard.glb', // Placeholder
        scale: 1.1,
        animations: {
            idle: 'Idle_Guard',
            talk: 'Talk_Military'
        },
        dialogueId: 'captain_report',
        description: 'Líder da guarda da cidade.'
    }
};

/**
 * Retorna dados de um NPC por ID
 */
export function getNPCData(npcId) {
    return NPCDatabase[npcId] || null;
}

/**
 * Cria uma instância de NPC
 */
export function createNPCInstance(npcId, instanceId) {
    const data = getNPCData(npcId);
    if (!data) return null;

    return {
        ...data,
        id: instanceId || `${npcId}_${Date.now()}`,
        // Estado da instância (ex: já falou hoje?)
        hasMet: false
    };
}
