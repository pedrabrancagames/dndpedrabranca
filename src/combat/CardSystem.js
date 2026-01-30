/**
 * CardSystem - Sistema de Cartas
 * Gerencia validação, efeitos e execução de cartas
 */

export class CardSystem {
    constructor() {
        // Biblioteca de efeitos
    }

    /**
     * Valida se a carta pode ser jogada
     */
    canPlayCard(card, hero) {
        if (hero.pa < card.cost) return false;
        // Outras validações (cooldowns, silêncio, etc)
        return true;
    }

    /**
     * Executa o efeito de uma carta
     */
    executeCard(cardId, source, target) {
        // Simulação simples MVP
        // No futuro, ler de cards.json com definições de efeitos

        const cardData = this.getCardData(cardId);
        let damage = 0;
        let healing = 0;

        let resultLog = `${source.name} usou ${cardData.name}`;

        // Lógica hardcoded provisória para MVP
        if (cardId.includes('golpe')) damage = 25;
        if (cardId.includes('bola_de_fogo')) damage = 40;
        if (cardId.includes('cura')) healing = 30;

        // Aplicar
        if (damage > 0) {
            // Reduzir HP target
            // (Isso deve ser processado pelo CombatManager, aqui só calcula)
            resultLog += ` e causou ${damage} de dano!`;
        }

        if (healing > 0) {
            resultLog += ` e curou ${healing} HP!`;
        }

        return {
            success: true,
            damage,
            healing,
            cost: cardData.cost,
            log: resultLog
        };
    }

    getCardData(cardId) {
        // Mock data - substituir por JSON real depois
        return {
            id: cardId,
            name: cardId.replace(/_/g, ' ').toUpperCase(),
            cost: 1,
            description: 'Carta genérica'
        };
    }
}
