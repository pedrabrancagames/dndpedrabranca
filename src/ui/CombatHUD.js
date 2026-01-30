/**
 * CombatHUD - Interface de Combate
 * Gerencia painéis de heróis, cartas e indicadores
 */
import { eventBus } from '../core/EventEmitter.js';

export class CombatHUD {
    constructor(gameManager) {
        this.gameManager = gameManager;

        // Elementos DOM
        this.heroPanel = document.getElementById('hero-panel');
        this.cardCarousel = document.getElementById('card-carousel');
        this.paIndicator = document.getElementById('pa-dots');
        this.turnIndicator = document.getElementById('turn-indicator');

        this.currentHeroIndex = 0;
        this.selectedCard = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        eventBus.on('turnStart', (unit) => this.onTurnStart(unit));
        eventBus.on('damageTaken', (data) => this.updateHeroHP(data));
        eventBus.on('enemySelected', (data) => this.onEnemySelected(data));
        eventBus.on('arenaPlaced', () => this.show());
        eventBus.on('arSessionEnded', () => this.hide());
    }

    /**
     * Mostra o HUD completo
     */
    show() {
        this.renderHeroPanel();
        this.renderCards();
        this.updatePA(3); // PA inicial
    }

    hide() {
        if (this.heroPanel) this.heroPanel.innerHTML = '';
        if (this.cardCarousel) this.cardCarousel.innerHTML = '';
    }

    /**
     * Renderiza o painel de heróis
     */
    renderHeroPanel() {
        if (!this.heroPanel) return;

        const heroes = this.gameManager.gameData.heroes || [];

        this.heroPanel.innerHTML = heroes.map((hero, index) => `
            <div class="hero-portrait ${index === this.currentHeroIndex ? 'active' : ''}" 
                 data-hero-id="${hero.id}">
                <div class="hero-icon">${hero.icon}</div>
                <div class="hero-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-hp-bar">
                        <div class="hp-fill" style="width: ${(hero.hp / hero.maxHp) * 100}%"></div>
                    </div>
                    <div class="hero-hp-text">${hero.hp}/${hero.maxHp}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza as cartas do herói atual
     */
    renderCards() {
        if (!this.cardCarousel) return;

        const heroes = this.gameManager.gameData.heroes || [];
        const currentHero = heroes[this.currentHeroIndex];

        if (!currentHero || !currentHero.deck) {
            this.cardCarousel.innerHTML = '<div class="no-cards">Sem cartas</div>';
            return;
        }

        // Pegar as primeiras 4 cartas do deck (mão)
        const hand = currentHero.deck.slice(0, 4);

        this.cardCarousel.innerHTML = hand.map((card, index) => `
            <div class="combat-card ${this.selectedCard === index ? 'selected' : ''}" 
                 data-card-index="${index}" data-card-cost="${card.cost}">
                <div class="card-cost">${card.cost}</div>
                <div class="card-icon">${card.icon || '⚔️'}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-effect">${card.description || ''}</div>
            </div>
        `).join('');

        // Adicionar eventos de clique
        this.cardCarousel.querySelectorAll('.combat-card').forEach(cardEl => {
            cardEl.addEventListener('click', (e) => this.onCardClick(e));
        });
    }

    /**
     * Atualiza o indicador de PA
     */
    updatePA(pa) {
        if (!this.paIndicator) return;

        const maxPA = 3;
        let dots = '';
        for (let i = 0; i < maxPA; i++) {
            dots += i < pa ? '●' : '○';
        }
        this.paIndicator.textContent = dots;
    }

    /**
     * Handler de clique em carta
     */
    onCardClick(e) {
        const cardEl = e.currentTarget;
        const index = parseInt(cardEl.dataset.cardIndex);

        // Toggle seleção
        if (this.selectedCard === index) {
            this.selectedCard = null;
            cardEl.classList.remove('selected');
        } else {
            // Desselecionar anterior
            this.cardCarousel.querySelectorAll('.combat-card').forEach(c => c.classList.remove('selected'));

            this.selectedCard = index;
            cardEl.classList.add('selected');
        }

        eventBus.emit('cardSelected', { index, card: this.getSelectedCard() });
    }

    getSelectedCard() {
        if (this.selectedCard === null) return null;

        const heroes = this.gameManager.gameData.heroes || [];
        const currentHero = heroes[this.currentHeroIndex];
        return currentHero?.deck?.[this.selectedCard];
    }

    /**
     * Quando um inimigo é selecionado, executar carta se houver uma selecionada
     */
    onEnemySelected({ enemy }) {
        const card = this.getSelectedCard();
        if (!card) {
            console.log('Nenhuma carta selecionada');
            return;
        }

        // Verificar PA suficiente
        const heroes = this.gameManager.gameData.heroes || [];
        const currentHero = heroes[this.currentHeroIndex];

        if (currentHero.pa < card.cost) {
            console.log('PA insuficiente');
            eventBus.emit('showMessage', { text: 'PA insuficiente!', type: 'error' });
            return;
        }

        // Usar carta
        currentHero.pa -= card.cost;
        this.updatePA(currentHero.pa);

        // Executar efeito da carta
        const combatManager = this.gameManager.combatManager;
        if (combatManager && combatManager.cardSystem) {
            combatManager.cardSystem.executeCard(card, currentHero, enemy);
        }

        // Desselecionar carta
        this.selectedCard = null;
        this.renderCards();

        console.log(`${currentHero.name} usou ${card.name} em ${enemy.name}`);
    }

    /**
     * Handler de início de turno
     */
    onTurnStart(unit) {
        // Atualizar indicador de turno
        if (this.turnIndicator) {
            this.turnIndicator.textContent = `Turno: ${unit.name}`;
        }

        // Se for herói, atualizar índice e PA
        const heroes = this.gameManager.gameData.heroes || [];
        const heroIndex = heroes.findIndex(h => h.id === unit.id);

        if (heroIndex >= 0) {
            this.currentHeroIndex = heroIndex;
            const hero = heroes[heroIndex];
            hero.pa = hero.maxPa || 3;
            this.updatePA(hero.pa);
            this.renderHeroPanel();
            this.renderCards();
        }
    }

    /**
     * Atualiza HP de um herói quando toma dano
     */
    updateHeroHP({ targetId, currentHp }) {
        const heroes = this.gameManager.gameData.heroes || [];
        const hero = heroes.find(h => h.id === targetId);

        if (hero) {
            hero.hp = currentHp;
            this.renderHeroPanel();

            // Flash visual no retrato
            const portrait = this.heroPanel?.querySelector(`[data-hero-id="${targetId}"]`);
            if (portrait) {
                portrait.classList.add('damage-flash');
                setTimeout(() => portrait.classList.remove('damage-flash'), 300);
            }
        }
    }
}
