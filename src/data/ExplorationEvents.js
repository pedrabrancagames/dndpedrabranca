/**
 * ExplorationEvents - Base de dados de eventos de exploração
 * Define eventos narrativos com escolhas e consequências
 */

export const EventType = {
    ENCOUNTER: 'encounter',     // Encontro com NPC/criatura
    DISCOVERY: 'discovery',     // Descoberta (baú, ruína)
    DANGER: 'danger',           // Perigo (armadilha, emboscada)
    MYSTERY: 'mystery',         // Mistério (pistas, enigmas)
    REST: 'rest'               // Ponto de descanso
};

export const ConsequenceType = {
    DAMAGE: 'damage',           // Dano aos heróis
    HEAL: 'heal',              // Cura
    GOLD: 'gold',              // Ganho/perda de ouro
    ITEM: 'item',              // Ganho de item
    XP: 'xp',                  // Ganho de XP
    QUEST: 'quest',            // Ativa uma quest
    COMBAT: 'combat',          // Inicia combate
    NOTHING: 'nothing'         // Nada acontece
};

/**
 * Base de dados de eventos de exploração
 * Cada evento possui: id, type, title, description, choices
 */
export const ExplorationEvents = {
    // ========== ENCONTROS ==========
    wandering_merchant: {
        id: 'wandering_merchant',
        type: EventType.ENCOUNTER,
        title: 'Mercador Ambulante',
        icon: '🧳',
        description: 'Você encontra um mercador solitário na estrada. Ele parece cansado, mas seus olhos brilham ao ver viajantes. Sua carroça está repleta de bugigangas e alguns itens que parecem valiosos.',
        choices: [
            {
                id: 'trade',
                text: '💰 Negociar com ele',
                consequences: [
                    { type: ConsequenceType.NOTHING, message: 'Você examina os itens à venda.' }
                ],
                followUp: 'O mercador sorri e mostra suas mercadorias. "Tenho poções, amuletos e segredos..."'
            },
            {
                id: 'help',
                text: '🤝 Oferecer ajuda',
                consequences: [
                    { type: ConsequenceType.XP, value: 20, message: '+20 XP pela bondade' },
                    { type: ConsequenceType.ITEM, itemId: 'potion_health_small', message: 'Recebeu: Poção de Cura Menor' }
                ],
                followUp: '"Muito obrigado, estranho bondoso! Tome isto como agradecimento." Ele lhe entrega uma poção.'
            },
            {
                id: 'ignore',
                text: '🚶 Seguir em frente',
                consequences: [
                    { type: ConsequenceType.NOTHING, message: 'Você segue seu caminho.' }
                ],
                followUp: 'Você acena brevemente e continua sua jornada.'
            }
        ]
    },

    goblin_scouts: {
        id: 'goblin_scouts',
        type: EventType.ENCOUNTER,
        title: 'Batedores Goblins',
        icon: '👺',
        description: 'Você avista dois goblins escondidos atrás de arbustos, observando a estrada. Eles ainda não notaram sua presença.',
        choices: [
            {
                id: 'ambush',
                text: '⚔️ Emboscá-los primeiro',
                consequences: [
                    { type: ConsequenceType.COMBAT, enemyId: 'goblin', count: 2, message: 'Iniciando combate!' }
                ],
                followUp: 'Você ataca de surpresa! Os goblins gritam em pânico.'
            },
            {
                id: 'sneak',
                text: '👤 Passar despercebido',
                skillCheck: { stat: 'dex', difficulty: 12 },
                consequences: [
                    { type: ConsequenceType.XP, value: 30, message: '+30 XP por evitar conflito' }
                ],
                failConsequences: [
                    { type: ConsequenceType.COMBAT, enemyId: 'goblin', count: 2, message: 'Você foi descoberto!' }
                ],
                followUp: 'Você se esgueira pelas sombras, passando sem ser notado.'
            },
            {
                id: 'intimidate',
                text: '💪 Intimidar para fugirem',
                skillCheck: { stat: 'str', difficulty: 10 },
                consequences: [
                    { type: ConsequenceType.XP, value: 15, message: '+15 XP' },
                    { type: ConsequenceType.GOLD, value: 10, message: '+10 ouro deixado para trás' }
                ],
                failConsequences: [
                    { type: ConsequenceType.COMBAT, enemyId: 'goblin', count: 2, message: 'Eles não se intimidaram!' }
                ],
                followUp: 'Você surge das sombras com um grito de guerra! Os goblins fogem em pânico, deixando algumas moedas para trás.'
            }
        ]
    },

    // ========== DESCOBERTAS ==========
    abandoned_campfire: {
        id: 'abandoned_campfire',
        type: EventType.DISCOVERY,
        title: 'Fogueira Abandonada',
        icon: '🔥',
        description: 'Você encontra os restos de uma fogueira recente. As cinzas ainda estão mornas. Há vestígios de acampamento e algo brilha entre os gravetos.',
        choices: [
            {
                id: 'search',
                text: '🔍 Vasculhar o local',
                consequences: [
                    { type: ConsequenceType.GOLD, value: 15, message: '+15 ouro encontrado' },
                    { type: ConsequenceType.ITEM, itemId: 'letter_sealed', message: 'Encontrou: Carta Lacrada' }
                ],
                followUp: 'Entre as cinzas você encontra algumas moedas e uma carta misteriosa.'
            },
            {
                id: 'rest',
                text: '⛺ Descansar aqui',
                consequences: [
                    { type: ConsequenceType.HEAL, value: 10, message: 'Heróis recuperaram 10 HP' }
                ],
                followUp: 'Você reacende a fogueira e descansa brevemente. O calor revigora o grupo.'
            },
            {
                id: 'leave',
                text: '🚶 Partir imediatamente',
                consequences: [
                    { type: ConsequenceType.NOTHING, message: 'Você segue em frente.' }
                ],
                followUp: 'Melhor não arriscar. Você continua sua jornada.'
            }
        ]
    },

    hidden_chest: {
        id: 'hidden_chest',
        type: EventType.DISCOVERY,
        title: 'Baú Escondido',
        icon: '📦',
        description: 'Atrás de algumas pedras, você nota um baú de madeira parcialmente coberto por folhas. Parece estar ali há muito tempo, mas a fechadura ainda brilha.',
        choices: [
            {
                id: 'open_force',
                text: '💪 Forçar a abertura',
                skillCheck: { stat: 'str', difficulty: 14 },
                consequences: [
                    { type: ConsequenceType.GOLD, value: 50, message: '+50 ouro!' },
                    { type: ConsequenceType.ITEM, itemId: 'ring_protection', message: 'Encontrou: Anel de Proteção' }
                ],
                failConsequences: [
                    { type: ConsequenceType.DAMAGE, value: 5, message: 'A fechadura feriu sua mão! -5 HP' }
                ],
                followUp: 'Com um estalo, a fechadura cede! Dentro há um tesouro guardado há anos.'
            },
            {
                id: 'pick_lock',
                text: '🔓 Arrombar a fechadura',
                skillCheck: { stat: 'dex', difficulty: 12 },
                consequences: [
                    { type: ConsequenceType.GOLD, value: 50, message: '+50 ouro!' },
                    { type: ConsequenceType.ITEM, itemId: 'ring_protection', message: 'Encontrou: Anel de Proteção' }
                ],
                failConsequences: [
                    { type: ConsequenceType.NOTHING, message: 'A fechadura é muito complexa.' }
                ],
                followUp: 'Suas mãos ágeis trabalham a fechadura. Click! Ela se abre suavemente.'
            },
            {
                id: 'leave_chest',
                text: '🚫 Deixar para lá',
                consequences: [
                    { type: ConsequenceType.NOTHING, message: 'Você ignora o baú.' }
                ],
                followUp: 'Pode ser uma armadilha. Você decide não arriscar.'
            }
        ]
    },

    // ========== PERIGOS ==========
    hidden_trap: {
        id: 'hidden_trap',
        type: EventType.DANGER,
        title: 'Armadilha Oculta!',
        icon: '⚠️',
        description: 'Você ouve um clique sob seus pés! O chão começa a ceder e você percebe que ativou uma armadilha antiga.',
        choices: [
            {
                id: 'jump',
                text: '🦘 Saltar para o lado',
                skillCheck: { stat: 'dex', difficulty: 13 },
                consequences: [
                    { type: ConsequenceType.XP, value: 25, message: '+25 XP por escapar' }
                ],
                failConsequences: [
                    { type: ConsequenceType.DAMAGE, value: 15, message: 'A armadilha acerta você! -15 HP' }
                ],
                followUp: 'Com reflexos rápidos, você salta para longe no último segundo!'
            },
            {
                id: 'brace',
                text: '🛡️ Preparar-se para o impacto',
                skillCheck: { stat: 'con', difficulty: 10 },
                consequences: [
                    { type: ConsequenceType.DAMAGE, value: 5, message: 'Dano reduzido! -5 HP' }
                ],
                failConsequences: [
                    { type: ConsequenceType.DAMAGE, value: 15, message: 'A armadilha acerta em cheio! -15 HP' }
                ],
                followUp: 'Você se protege com o escudo. O impacto dói, mas poderia ser pior.'
            }
        ]
    },

    bandit_ambush: {
        id: 'bandit_ambush',
        type: EventType.DANGER,
        title: 'Emboscada de Bandidos!',
        icon: '🗡️',
        description: 'Três figuras encapuzadas surgem das sombras, bloqueando seu caminho. "Bolsa ou vida!", grita o líder.',
        choices: [
            {
                id: 'fight',
                text: '⚔️ Enfrentar os bandidos',
                consequences: [
                    { type: ConsequenceType.COMBAT, enemyId: 'bandit', count: 3, message: 'Iniciando combate!' }
                ],
                followUp: '"Vocês escolheram mal suas vítimas!" Você saca sua arma.'
            },
            {
                id: 'pay',
                text: '💰 Pagar o pedágio (30 ouro)',
                requirements: { gold: 30 },
                consequences: [
                    { type: ConsequenceType.GOLD, value: -30, message: '-30 ouro' }
                ],
                followUp: 'Você entrega as moedas. Os bandidos riem e desaparecem nas sombras.'
            },
            {
                id: 'bluff',
                text: '🎭 Blefar sobre reforços',
                skillCheck: { stat: 'cha', difficulty: 14 },
                consequences: [
                    { type: ConsequenceType.XP, value: 40, message: '+40 XP pela astúcia' }
                ],
                failConsequences: [
                    { type: ConsequenceType.COMBAT, enemyId: 'bandit', count: 3, message: 'Eles não caíram no blefe!' }
                ],
                followUp: '"Meus amigos estão logo atrás, eu seria vocês e corria." Os bandidos olham nervosamente para trás e fogem.'
            }
        ]
    },

    // ========== MISTÉRIOS ==========
    strange_statue: {
        id: 'strange_statue',
        type: EventType.MYSTERY,
        title: 'Estátua Estranha',
        icon: '🗿',
        description: 'Uma estátua de pedra antiga se ergue no meio da clareira. Seus olhos parecem seguir você. Na base, há uma inscrição em runas e um pequeno altar.',
        choices: [
            {
                id: 'offer_gold',
                text: '💰 Deixar uma oferenda (20 ouro)',
                requirements: { gold: 20 },
                consequences: [
                    { type: ConsequenceType.GOLD, value: -20, message: '-20 ouro' },
                    { type: ConsequenceType.HEAL, value: 30, message: 'Bênção! Heróis recuperaram 30 HP' },
                    { type: ConsequenceType.XP, value: 15, message: '+15 XP' }
                ],
                followUp: 'A estátua brilha brevemente. Uma sensação de paz e cura envolve o grupo.'
            },
            {
                id: 'read_runes',
                text: '📖 Tentar ler as runas',
                skillCheck: { stat: 'int', difficulty: 15 },
                consequences: [
                    { type: ConsequenceType.XP, value: 50, message: '+50 XP pelo conhecimento' },
                    { type: ConsequenceType.QUEST, questId: 'secret_shrine', message: 'Nova quest desbloqueada!' }
                ],
                failConsequences: [
                    { type: ConsequenceType.NOTHING, message: 'As runas são muito antigas para decifrar.' }
                ],
                followUp: '"Aquele que busca, encontrará o santuário além das montanhas..." Você anota as instruções.'
            },
            {
                id: 'ignore_statue',
                text: '🚶 Seguir em frente',
                consequences: [
                    { type: ConsequenceType.NOTHING, message: 'Você passa pela estátua.' }
                ],
                followUp: 'Melhor não mexer com forças desconhecidas.'
            }
        ]
    },

    // ========== DESCANSO ==========
    peaceful_spring: {
        id: 'peaceful_spring',
        type: EventType.REST,
        title: 'Fonte Cristalina',
        icon: '💧',
        description: 'Você encontra uma fonte de água cristalina brotando entre as rochas. A água parece limpa e revigorante. Alguns animais pequenos bebem na margem.',
        choices: [
            {
                id: 'drink',
                text: '💧 Beber da fonte',
                consequences: [
                    { type: ConsequenceType.HEAL, value: 20, message: 'Heróis recuperaram 20 HP' }
                ],
                followUp: 'A água é deliciosamente refrescante! Vocês se sentem revigorados.'
            },
            {
                id: 'fill_bottles',
                text: '🧴 Encher frascos',
                consequences: [
                    { type: ConsequenceType.ITEM, itemId: 'potion_health_small', message: 'Criou: Água Curativa' }
                ],
                followUp: 'Você enche alguns frascos com a água mágica.'
            },
            {
                id: 'rest_fully',
                text: '⛺ Acampar aqui',
                consequences: [
                    { type: ConsequenceType.HEAL, value: 50, message: 'Descanso completo! Heróis recuperaram 50 HP' }
                ],
                followUp: 'Vocês montam acampamento e descansam a noite toda. Pela manhã, estão completamente recuperados.'
            }
        ]
    }
};

/**
 * Retorna um evento aleatório baseado no tipo ou aleatório geral
 * @param {string} type - Tipo do evento (opcional)
 * @returns {Object} - Dados do evento
 */
export function getRandomEvent(type = null) {
    const events = Object.values(ExplorationEvents);

    const filtered = type
        ? events.filter(e => e.type === type)
        : events;

    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Retorna os dados de um evento pelo ID
 * @param {string} eventId - ID do evento
 * @returns {Object|null} - Dados do evento
 */
export function getEventData(eventId) {
    return ExplorationEvents[eventId] || null;
}

/**
 * Retorna o nome traduzido do tipo de evento
 * @param {string} type - Tipo do evento
 * @returns {string} - Nome em português
 */
export function getEventTypeName(type) {
    const names = {
        [EventType.ENCOUNTER]: 'Encontro',
        [EventType.DISCOVERY]: 'Descoberta',
        [EventType.DANGER]: 'Perigo',
        [EventType.MYSTERY]: 'Mistério',
        [EventType.REST]: 'Descanso'
    };
    return names[type] || 'Evento';
}

/**
 * Retorna o ícone do tipo de evento
 * @param {string} type - Tipo do evento
 * @returns {string} - Emoji do tipo
 */
export function getEventTypeColor(type) {
    const colors = {
        [EventType.ENCOUNTER]: '#3b82f6',   // Azul
        [EventType.DISCOVERY]: '#f59e0b',   // Âmbar
        [EventType.DANGER]: '#ef4444',      // Vermelho
        [EventType.MYSTERY]: '#a855f7',     // Roxo
        [EventType.REST]: '#22c55e'         // Verde
    };
    return colors[type] || '#6b7280';
}
