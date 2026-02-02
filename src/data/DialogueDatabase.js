/**
 * DialogueDatabase - Base de dados de diálogos dos NPCs
 * Estrutura baseada em nós (nodes) para conversas ramificadas
 */

export const DialogueDatabase = {
    // ========== PREFEITO (Mayor) ==========
    mayor_intro: {
        start: {
            text: "Saudações, aventureiro! Bem-vindo a Pedra Branca. Nossa cidade costumava ser pacífica, mas ultimamente... temos tido problemas.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Que tipo de problemas?", next: "goblins" },
                { text: "Só estou de passagem.", next: "end_rude" }
            ]
        },
        goblins: {
            text: "Goblins! Eles montaram um acampamento na floresta vizinha e estão roubando nossos suprimentos. A guarda está sobrecarregada.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Eu posso ajudar com isso.", next: "accept_quest", action: "START_QUEST:goblin_threat" },
                { text: "Parece perigoso. Quanto você paga?", next: "negotiate" }
            ]
        },
        negotiate: {
            text: "O tesouro da cidade está baixo, mas posso oferecer 50 moedas de ouro e algumas poções se você resolver isso.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Aceito a oferta.", next: "accept_quest", action: "START_QUEST:goblin_threat" },
                { text: "Vou pensar no caso.", next: "end" }
            ]
        },
        accept_quest: {
            text: "Excelente! Por favor, tenha cuidado. O líder deles é astuto. Volte aqui quando terminar.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Deixe comigo.", next: "end" }
            ]
        },
        end: {
            text: "Que a luz guie seu caminho.",
            speaker: "Prefeito Magnus",
            isEnd: true
        },
        end_rude: {
            text: "Ah... compreendo. Bem, cuidado nas estradas.",
            speaker: "Prefeito Magnus",
            isEnd: true
        }
    },

    // Diálogos específicos da missão Goblin Threat
    mayor_goblin_threat_scout: {
        start: {
            text: "Você ainda não investigou o acampamento? Vá rápido, antes que eles ataquem!",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Estou indo.", next: "end" }
            ]
        },
        end: {
            text: "Conto com você.",
            speaker: "Prefeito Magnus",
            isEnd: true
        }
    },

    mayor_goblin_threat_kill_goblins: {
        start: {
            text: "Recebi seu relatório sobre o acampamento. Agora precisamos agir! Derrote aqueles batedores.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Vou cuidar disso.", next: "end" }
            ]
        },
        end: {
            text: "Boa sorte, aventureiro.",
            speaker: "Prefeito Magnus",
            isEnd: true
        }
    },

    mayor_goblin_threat_report: {
        start: {
            text: "Pelos deuses! Você conseguiu limpar o acampamento? Pedra Branca tem uma dívida de gratidão com você.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Foi um prazer ajudar.", next: "reward", action: "COMPLETE_QUEST:goblin_threat" }
            ]
        },
        reward: {
            text: "Aqui está a recompensa prometida. Que isso ajude em sua jornada.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Obrigado, Prefeito.", next: "end" }
            ]
        },
        end: {
            text: "Se precisar de mais trabalho, volte a falar comigo.",
            speaker: "Prefeito Magnus",
            isEnd: true
        }
    },

    mayor_deliver_letter_deliver: {
        start: {
            text: "Oh! Você trouxe a carta do conselho? Excelente notícia, estávamos esperando ansiosamente.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Aqui está.", next: "reward", action: "COMPLETE_QUEST:deliver_letter" }
            ]
        },
        reward: {
            text: "Muito obrigado. Aqui está sua recompensa pelo serviço rápido. A cidade de Pedra Branca agradece.",
            speaker: "Prefeito Magnus",
            options: [
                { text: "Obrigado, Prefeito.", next: "end" }
            ]
        },
        end: {
            text: "Se precisar de mais trabalho, volte a falar comigo.",
            speaker: "Prefeito Magnus",
            isEnd: true
        }
    },

    // ========== MERCADOR (Merchant) ==========
    merchant_welcome: {
        start: {
            text: "Olá! Gostaria de ver minhas mercadorias? Tenho os melhores preços da região!",
            speaker: "Balthazar",
            options: [
                { text: "Mostre o que tem.", next: "end", action: "OPEN_SHOP" },
                { text: "Alguma novidade na cidade?", next: "rumors" },
                { text: "Agora não.", next: "end" }
            ]
        },
        rumors: {
            text: "Dizem que coisas estranhas acontecem no cemitério à noite. Eu ficaria longe se fosse você... a menos que goste de conversar com esqueletos.",
            speaker: "Balthazar",
            options: [
                { text: "Interessante...", next: "start" },
                { text: "Vou dar uma olhada na loja.", next: "end", action: "OPEN_SHOP" }
            ]
        },
        end: {
            text: "Volte sempre!",
            speaker: "Balthazar",
            isEnd: true
        }
    }
};

/**
 * Retorna um diálogo pelo ID
 */
export function getDialogue(dialogueId) {
    return DialogueDatabase[dialogueId] || null;
}
