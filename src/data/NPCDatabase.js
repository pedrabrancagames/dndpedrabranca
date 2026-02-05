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
        scale: 1.7, // Ajuste de escala se necessário
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
        name: 'Balthazar',
        role: NPCRole.MERCHANT,
        model: '/models/npc/merchant_npc.glb', // Updated path
        scale: 1.7,
        animations: {
            idle: 'Idle',
            talk: 'Talk',
            interact: 'Trade'
        },
        dialogueId: 'merchant_welcome',
        shopInventory: ['potion_health_small', 'potion_mana_small', 'sword_iron'],
        description: 'Um mercador viajante com produtos exóticos.'
    },

    // ========== NPCs Secundários ==========
    guard_captain: {
        id: 'guard_captain',
        name: 'Capitão Valerius',
        role: NPCRole.QUEST_GIVER,
        model: '/models/npc/guard_captain.glb',
        scale: 1.87,
        animations: {
            idle: 'Idle', // Adjusted expected animation names
            talk: 'Talk'
        },
        dialogueId: 'captain_report',
        description: 'Líder da guarda da cidade.'
    },

    healer: {
        id: 'healer',
        name: 'Sábia Elara',
        role: NPCRole.HEALER,
        model: '/models/npc/healer.glb',
        scale: 1.7,
        dialogueId: 'healer_intro',
        description: 'Curandeira local.'
    },

    city_guard: {
        id: 'city_guard',
        name: 'Guarda',
        role: NPCRole.GUARD,
        model: '/models/npc/city_guard.glb',
        scale: 1.87,
        description: 'Um guarda vigilante.'
    },

    villager_m: {
        id: 'villager_m',
        name: 'Aldeão',
        role: NPCRole.CIVILIAN,
        model: '/models/npc/villager_m.glb',
        scale: 1.7,
        description: 'Habitante local.'
    },

    villager_f: {
        id: 'villager_f',
        name: 'Aldeã',
        role: NPCRole.CIVILIAN,
        model: '/models/npc/villager_f.glb',
        scale: 1.7,
        description: 'Habitante local.'
    },

    messenger: {
        id: 'messenger',
        name: 'Mensageiro',
        role: NPCRole.CIVILIAN,
        model: '/models/npc/messenger.glb',
        scale: 1.7,
        description: 'Entregador de notícias.'
    },

    merchant_wife: {
        id: 'merchant_wife',
        name: 'Sarah',
        role: NPCRole.MERCHANT,
        model: '/models/npc/merchant_wife.glb',
        scale: 1.7,
        description: 'Esposa do mercador.'
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
