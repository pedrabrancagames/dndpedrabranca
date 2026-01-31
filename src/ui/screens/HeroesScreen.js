import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { CardDatabase, CardRarity, getCardData, getUpgradeCost } from '../../data/CardDatabase.js';
import { eventBus } from '../../core/EventEmitter.js';

export class HeroesScreen extends BaseScreen {
  constructor(screenId, gameManager) {
    super(screenId);
    this.gameManager = gameManager;
    this.selectedHero = null;
    this.selectedCard = null;
    this.selectedCardIndex = null;
  }

  setupEvents() {
    this.bindClick('#btn-heroes-back', () => this.gameManager.stateManager.setState(GameState.HOME));
    this.bindClick('#btn-close-hero-modal', () => this.closeHeroDetails());
    this.bindClick('#btn-close-upgrade-modal', () => this.closeUpgradeModal());
    this.bindClick('#btn-confirm-upgrade', () => this.confirmUpgrade());

    // Setup hero card clicks
    const grid = this.findElement('#heroes-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.hero-card');
        if (card && card.dataset.heroId) {
          this.showHeroDetails(card.dataset.heroId);
        }
      });
    }

    // Setup deck card clicks
    const deckGrid = this.findElement('#deck-grid');
    if (deckGrid) {
      deckGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.deck-card');
        if (card && card.dataset.cardIndex !== undefined) {
          this.showUpgradeModal(parseInt(card.dataset.cardIndex));
        }
      });
    }
  }

  onShow() {
    this.renderResources();
    this.renderHeroes();
  }

  renderResources() {
    const goldEl = this.findElement('#heroes-gold');
    const fragmentsEl = this.findElement('#heroes-fragments');

    if (goldEl) goldEl.textContent = `💰 ${this.gameManager.gameData.gold || 0}`;
    if (fragmentsEl) fragmentsEl.textContent = `💎 ${this.gameManager.gameData.fragments || 0}`;
  }

  renderHeroes() {
    const grid = this.findElement('#heroes-grid');
    if (!grid) return;

    const heroes = this.gameManager.gameData.heroes;

    grid.innerHTML = heroes.map(hero => `
            <div class="hero-card ${hero.class}" data-hero-id="${hero.id}">
                <div class="hero-icon">${hero.icon}</div>
                <div class="hero-name">${hero.name}</div>
                <div class="hero-class">Nível ${hero.level}</div>
                <div class="stat-bar hp">
                    <div class="fill" style="width: ${(hero.hp / hero.maxHp) * 100}%"></div>
                </div>
                <div class="stat-label">HP: ${hero.hp}/${hero.maxHp}</div>
                <div class="stat-bar pa">
                    <div class="fill" style="width: 100%"></div>
                </div>
                <div class="stat-label">PA: ${hero.pa}/${hero.maxPa}</div>
                <div class="hero-xp-mini">
                    <div class="xp-fill-mini" style="width: ${this.getXPProgress(hero)}%"></div>
                </div>
            </div>
        `).join('');
  }

  getXPProgress(hero) {
    const xpNeeded = this.getXPForNextLevel(hero.level);
    return Math.min((hero.xp / xpNeeded) * 100, 100);
  }

  getXPForNextLevel(level) {
    return level * 100;
  }

  showHeroDetails(heroId) {
    const heroes = this.gameManager.gameData.heroes;
    const hero = heroes.find(h => h.id === heroId);

    if (!hero) return;

    this.selectedHero = hero;

    // Populate modal
    const modal = this.findElement('#hero-detail-modal');
    const portraitEl = this.findElement('#hero-portrait-large');
    const nameEl = this.findElement('#hero-detail-name');
    const classEl = this.findElement('#hero-detail-class');
    const levelEl = this.findElement('#hero-detail-level');
    const xpFill = this.findElement('#xp-fill');
    const xpText = this.findElement('#xp-text');
    const statsGrid = this.findElement('#hero-stats-grid');
    const deckGrid = this.findElement('#deck-grid');

    if (portraitEl) portraitEl.textContent = hero.icon;
    if (nameEl) nameEl.textContent = hero.name;
    if (classEl) {
      const classNames = { warrior: 'Guerreiro', mage: 'Mago', rogue: 'Ladino', cleric: 'Clérigo' };
      classEl.textContent = classNames[hero.class] || hero.class;
      classEl.className = `hero-detail-class ${hero.class}`;
    }
    if (levelEl) levelEl.textContent = `Nível ${hero.level}`;

    // XP Bar
    const xpNeeded = this.getXPForNextLevel(hero.level);
    if (xpFill) xpFill.style.width = `${this.getXPProgress(hero)}%`;
    if (xpText) xpText.textContent = `${hero.xp || 0} / ${xpNeeded} XP`;

    // Stats
    if (statsGrid) {
      statsGrid.innerHTML = this.renderHeroStats(hero);
    }

    // Deck
    if (deckGrid) {
      deckGrid.innerHTML = this.renderDeck(hero);
    }

    // Show modal
    if (modal) modal.classList.remove('hidden');
  }

  renderHeroStats(hero) {
    const stats = [
      { icon: '⚔️', name: 'Ataque', value: hero.atk },
      { icon: '🛡️', name: 'Defesa', value: hero.def },
      { icon: '❤️', name: 'HP Máximo', value: hero.maxHp },
      { icon: '🔋', name: 'PA Máximo', value: hero.maxPa }
    ];

    if (hero.mag) stats.push({ icon: '✨', name: 'Magia', value: hero.mag });
    if (hero.crit) stats.push({ icon: '💥', name: 'Crítico', value: `${hero.crit}%` });

    return `<div class="stats-grid">
            ${stats.map(s => `
                <div class="stat-item">
                    <span class="stat-name">${s.icon} ${s.name}</span>
                    <span class="stat-value">${s.value}</span>
                </div>
            `).join('')}
        </div>`;
  }

  renderDeck(hero) {
    if (!hero.deck || hero.deck.length === 0) {
      return '<p class="no-cards">Nenhuma carta no deck</p>';
    }

    return hero.deck.map((card, index) => {
      const cardLevel = card.level || 0;
      const canUpgrade = cardLevel < 2; // Max level is 2 (3 levels: 0, 1, 2)

      return `
                <div class="deck-card ${canUpgrade ? 'upgradable' : 'max-level'}" 
                     data-card-index="${index}">
                    <div class="deck-card-icon">${card.icon}</div>
                    <div class="deck-card-name">${card.name}</div>
                    <div class="deck-card-cost">${card.cost} PA</div>
                    <div class="deck-card-level">Nv. ${cardLevel + 1}</div>
                    ${canUpgrade ? '<div class="upgrade-indicator">⬆️</div>' : '<div class="max-indicator">MAX</div>'}
                </div>
            `;
    }).join('');
  }

  closeHeroDetails() {
    const modal = this.findElement('#hero-detail-modal');
    if (modal) modal.classList.add('hidden');
    this.selectedHero = null;
  }

  showUpgradeModal(cardIndex) {
    if (!this.selectedHero) return;

    const card = this.selectedHero.deck[cardIndex];
    if (!card) return;

    const cardLevel = card.level || 0;
    if (cardLevel >= 2) {
      eventBus.emit('showMessage', { text: 'Esta carta já está no nível máximo!', type: 'info' });
      return;
    }

    this.selectedCard = card;
    this.selectedCardIndex = cardIndex;

    // Get upgrade cost
    const cost = this.getCardUpgradeCost(card, cardLevel);

    // Populate modal
    const modal = this.findElement('#card-upgrade-modal');

    // Current card
    this.findElement('#upgrade-card-icon').textContent = card.icon;
    this.findElement('#upgrade-card-name').textContent = card.name;
    this.findElement('#upgrade-card-level').textContent = `Nível ${cardLevel + 1}`;
    this.findElement('#upgrade-current-stats').innerHTML = this.renderCardStats(card);

    // Next level card
    const nextCard = this.getNextLevelCard(card, cardLevel);
    this.findElement('#upgrade-next-icon').textContent = card.icon;
    this.findElement('#upgrade-next-name').textContent = card.name;
    this.findElement('#upgrade-next-level').textContent = `Nível ${cardLevel + 2}`;
    this.findElement('#upgrade-next-stats').innerHTML = this.renderCardStats(nextCard);

    // Cost
    const costEl = this.findElement('#upgrade-cost');
    if (costEl) {
      costEl.innerHTML = `<span>💰 ${cost.gold}</span><span>💎 ${cost.fragments}</span>`;
    }

    // Button state
    const btn = this.findElement('#btn-confirm-upgrade');
    const canAfford = this.canAffordUpgrade(cost);
    if (btn) {
      btn.disabled = !canAfford;
      btn.classList.toggle('disabled', !canAfford);
    }

    if (modal) modal.classList.remove('hidden');
  }

  getCardUpgradeCost(card, level) {
    // Base cost increases with level
    const baseCost = { gold: 100, fragments: 5 };
    const multiplier = level + 1;

    return {
      gold: baseCost.gold * multiplier,
      fragments: baseCost.fragments * multiplier
    };
  }

  getNextLevelCard(card, currentLevel) {
    // Simulate improved stats
    const nextCard = { ...card };

    if (nextCard.damage) nextCard.damage = Math.floor(nextCard.damage * 1.3);
    if (nextCard.heal) nextCard.heal = Math.floor(nextCard.heal * 1.3);
    if (nextCard.defense) nextCard.defense = Math.floor(nextCard.defense * 1.3);

    return nextCard;
  }

  renderCardStats(card) {
    const stats = [];

    if (card.damage) stats.push(`⚔️ ${card.damage} dano`);
    if (card.heal) stats.push(`💚 ${card.heal} cura`);
    if (card.defense) stats.push(`🛡️ ${card.defense} def`);
    if (card.dot) stats.push(`☠️ ${card.dot}/turno`);
    if (card.description) stats.push(card.description);

    return stats.map(s => `<div class="card-stat-line">${s}</div>`).join('');
  }

  canAffordUpgrade(cost) {
    const gold = this.gameManager.gameData.gold || 0;
    const fragments = this.gameManager.gameData.fragments || 0;
    return gold >= cost.gold && fragments >= cost.fragments;
  }

  closeUpgradeModal() {
    const modal = this.findElement('#card-upgrade-modal');
    if (modal) modal.classList.add('hidden');
    this.selectedCard = null;
    this.selectedCardIndex = null;
  }

  confirmUpgrade() {
    if (!this.selectedHero || !this.selectedCard || this.selectedCardIndex === null) return;

    const cardLevel = this.selectedCard.level || 0;
    const cost = this.getCardUpgradeCost(this.selectedCard, cardLevel);

    if (!this.canAffordUpgrade(cost)) {
      eventBus.emit('showMessage', { text: 'Recursos insuficientes!', type: 'error' });
      return;
    }

    // Deduct cost
    this.gameManager.gameData.gold -= cost.gold;
    this.gameManager.gameData.fragments -= cost.fragments;

    // Upgrade card
    const card = this.selectedHero.deck[this.selectedCardIndex];
    card.level = (card.level || 0) + 1;

    // Improve stats
    if (card.damage) card.damage = Math.floor(card.damage * 1.3);
    if (card.heal) card.heal = Math.floor(card.heal * 1.3);
    if (card.defense) card.defense = Math.floor(card.defense * 1.3);

    eventBus.emit('showMessage', {
      text: `${card.name} melhorada para Nível ${card.level + 1}!`,
      type: 'success'
    });

    // Refresh UI
    this.closeUpgradeModal();
    this.renderResources();

    // Refresh deck display
    const deckGrid = this.findElement('#deck-grid');
    if (deckGrid) {
      deckGrid.innerHTML = this.renderDeck(this.selectedHero);
    }

    this.gameManager.saveGame();
  }
}
