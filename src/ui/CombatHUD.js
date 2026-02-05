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
     * Renderiza o painel de heróis com PA no herói ativo
     */
    renderHeroPanel() {
        if (!this.heroPanel) return;

        const heroes = this.gameManager.gameData.heroes || [];
        const currentPA = heroes[this.currentHeroIndex]?.pa || 3;

        this.heroPanel.innerHTML = heroes.map((hero, index) => {
            const isActive = index === this.currentHeroIndex;
            const paDisplay = isActive ? this.renderPADots(currentPA) : '';

            return `
                <div class="hero-portrait ${isActive ? 'active' : ''}" 
                     data-hero-id="${hero.id}">
                    <div class="hero-icon">${hero.icon}</div>
                    <div class="hero-info">
                        <div class="hero-name">${hero.name}</div>
                        <div class="hero-hp-bar">
                            <div class="hp-fill" style="width: ${(hero.hp / hero.maxHp) * 100}%"></div>
                        </div>
                        <div class="hero-hp-text">${hero.hp}/${hero.maxHp}</div>
                        ${paDisplay}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza os pontos de ação como indicadores visuais
     */
    renderPADots(pa) {
        const maxPA = 3;
        let dots = '';
        for (let i = 0; i < maxPA; i++) {
            dots += i < pa ? '●' : '○';
        }
        return `<div class="hero-pa-indicator">PA: <span class="pa-dots">${dots}</span></div>`;
    }

    /**
     * Renderiza as cartas do herói atual em scroll horizontal
     */
    renderCards() {
        if (!this.cardCarousel) return;

        const heroes = this.gameManager.gameData.heroes || [];
        const currentHero = heroes[this.currentHeroIndex];

        if (!currentHero || !currentHero.deck || currentHero.deck.length === 0) {
            this.cardCarousel.innerHTML = '<div class="no-cards">Sem cartas</div>';
            return;
        }

        // Sort cards by type: class > equipment > consumable
        const sortedDeck = [...currentHero.deck].sort((a, b) => {
            const typeOrder = { 'class': 0, 'equipment': 1, 'consumable': 2 };
            const orderA = typeOrder[a.sourceType || a.cardType || 'class'] ?? 0;
            const orderB = typeOrder[b.sourceType || b.cardType || 'class'] ?? 0;
            return orderA - orderB;
        });

        // Render cards with subtle fan effect (slight rotation and overlap)
        const totalCards = sortedDeck.length;

        this.cardCarousel.innerHTML = sortedDeck.map((card, index) => {
            const cardType = card.sourceType || card.cardType || 'class';
            const typeClass = `card-type-${cardType}`;

            // Subtle rotation for visual appeal (-5 to +5 degrees)
            const centerIndex = (totalCards - 1) / 2;
            const rotation = (index - centerIndex) * 2;

            const isSelected = this.selectedCard === index;

            return `
                <div class="combat-card scroll-card ${typeClass} ${isSelected ? 'selected' : ''}" 
                     data-card-index="${index}" 
                     data-card-cost="${card.cost}"
                     style="--card-rotation: ${rotation}deg;">
                    <div class="card-cost">${card.cost}</div>
                    <div class="card-icon">${card.icon || '⚔️'}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-effect">${card.description || ''}</div>
                    ${card.consumable ? '<div class="card-consumable-badge">1x</div>' : ''}
                </div>
            `;
        }).join('');

        // Add click events
        this.cardCarousel.querySelectorAll('.combat-card').forEach(cardEl => {
            cardEl.addEventListener('click', (e) => this.onCardClick(e));
        });
    }

    /**
     * Atualiza o indicador de PA no herói ativo
     */
    updatePA(pa) {
        // Update PA in the active hero's panel
        const paIndicator = this.heroPanel?.querySelector('.hero-portrait.active .pa-dots');
        if (paIndicator) {
            const maxPA = 3;
            let dots = '';
            for (let i = 0; i < maxPA; i++) {
                dots += i < pa ? '●' : '○';
            }
            paIndicator.textContent = dots;
        }
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
