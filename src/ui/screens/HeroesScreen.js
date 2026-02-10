import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { CardDatabase, CardRarity, getCardData, getUpgradeCost } from '../../data/CardDatabase.js';
import { getItemData } from '../../data/ItemDatabase.js';
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
    this.currentHeroTab = 'general'; // Default tab

    // Populate modal
    const modal = this.findElement('#hero-detail-modal');
    const portraitEl = this.findElement('#hero-portrait-large');
    const nameEl = this.findElement('#hero-detail-name');
    const classEl = this.findElement('#hero-detail-class');
    const levelEl = this.findElement('#hero-detail-level');
    const xpFill = this.findElement('#xp-fill');
    const xpText = this.findElement('#xp-text');

    // Setup Tabs
    const contentContainer = this.findElement('.hero-detail-body') || modal.querySelector('.modal-content');

    // Inject Tab Navigation if not exists (or replace body structure)
    // Vamos alterar a estrutura do modal via JS para suportar abas sem mexer muito no HTML base se possível
    // Mas o ideal é injetar a estrutura de abas.

    // Atualizar Header
    if (portraitEl) portraitEl.textContent = hero.icon;
    if (nameEl) {
      nameEl.innerHTML = `
                <span id="hero-name-text">${hero.name}</span>
                <button class="edit-name-btn" id="btn-edit-name">✏️</button>
                <input type="text" id="hero-name-input" class="hidden" value="${hero.name}" maxlength="15">
                <button class="save-name-btn hidden" id="btn-save-name">💾</button>
            `;
      this.setupNameEditing(nameEl, hero);
    }

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

    // Render Tabs
    this.renderHeroTabs(hero);

    // Show modal
    if (modal) modal.classList.remove('hidden');
  }

  setupNameEditing(nameEl, hero) {
    setTimeout(() => {
      const btnEdit = nameEl.querySelector('#btn-edit-name');
      const btnSave = nameEl.querySelector('#btn-save-name');
      const input = nameEl.querySelector('#hero-name-input');
      const text = nameEl.querySelector('#hero-name-text');

      if (btnEdit && input && text && btnSave) {
        btnEdit.onclick = () => {
          text.classList.add('hidden');
          btnEdit.classList.add('hidden');
          input.classList.remove('hidden');
          btnSave.classList.remove('hidden');
          input.focus();
        };

        const save = () => {
          const newName = input.value.trim();
          if (newName) {
            hero.name = newName;
            text.textContent = newName;
            this.gameManager.saveGame();
            this.renderHeroes();
          }
          input.classList.add('hidden');
          btnSave.classList.add('hidden');
          text.classList.remove('hidden');
          btnEdit.classList.remove('hidden');
        };

        btnSave.onclick = save;
        input.onkeypress = (e) => { if (e.key === 'Enter') save(); };
      }
    }, 0);
  }

  renderHeroTabs(hero) {
    // Encontrar containers originais e esconder/mostrar baseado na aba
    const statsGrid = this.findElement('#hero-stats-grid');
    const deckGrid = this.findElement('#deck-grid');
    const equipmentGrid = this.findElement('#equipment-grid');

    // Criar ou atualizar barra de abas
    let tabBar = this.findElement('.hero-tabs');
    if (!tabBar) {
      const header = this.findElement('.hero-detail-header');
      tabBar = document.createElement('div');
      tabBar.className = 'hero-tabs';
      header.after(tabBar);
    }

    tabBar.innerHTML = `
            <button class="hero-tab ${this.currentHeroTab === 'general' ? 'active' : ''}" data-tab="general">Geral</button>
            <button class="hero-tab ${this.currentHeroTab === 'stats' ? 'active' : ''}" data-tab="stats">Estatísticas</button>
            <button class="hero-tab ${this.currentHeroTab === 'deck' ? 'active' : ''}" data-tab="deck">Deck</button>
        `;

    // Add Listeners
    tabBar.querySelectorAll('.hero-tab').forEach(btn => {
      btn.onclick = () => {
        this.currentHeroTab = btn.dataset.tab;
        this.renderHeroTabs(hero); // Re-render content
      };
    });

    // Content Rendering
    const contentContainer = this.findElement('.hero-detail-content-body'); // Precisaria criar esse container no HTML ou limpar e reinjetar

    // Simplificação: Manipular display dos containers existentes
    // O HTML atual tem grids espalhados. Vamos consolidar visualmente.

    if (this.currentHeroTab === 'general') {
      if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.innerHTML = this.renderGeneralStats(hero);
      }
      if (equipmentGrid) {
        equipmentGrid.style.display = 'flex';
        equipmentGrid.innerHTML = this.renderEquipment(hero);
      }
      if (deckGrid) deckGrid.style.display = 'none';
    } else if (this.currentHeroTab === 'stats') {
      if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.innerHTML = this.renderDetailedStats(hero);
      }
      if (equipmentGrid) equipmentGrid.style.display = 'none';
      if (deckGrid) deckGrid.style.display = 'none';
    } else if (this.currentHeroTab === 'deck') {
      if (statsGrid) statsGrid.style.display = 'none';
      if (equipmentGrid) equipmentGrid.style.display = 'none';
      if (deckGrid) {
        deckGrid.style.display = 'grid';
        deckGrid.innerHTML = this.renderDeck(hero);
      }
    }
  }

  renderGeneralStats(hero) {
    const stats = [
      { icon: '⚔️', name: 'Ataque', value: hero.atk },
      { icon: '🛡️', name: 'Defesa', value: hero.def },
      { icon: '❤️', name: 'HP Máximo', value: hero.maxHp },
      { icon: '🔋', name: 'PA Máximo', value: hero.maxPa }
    ];

    if (hero.mag) stats.push({ icon: '✨', name: 'Magia', value: hero.mag });
    if (hero.crit) stats.push({ icon: '💥', name: 'Crítico', value: `${hero.crit}%` });

    // Level Up Preview Container
    const bonus = this.gameManager.progressionSystem.getClassLevelUpBonus(hero.class);
    const levelUpHtml = `
            <div id="level-up-preview" class="level-up-preview-container" style="grid-column: 1 / -1; margin-top: 10px;">
                <div class="preview-header">Próximo Nível (${hero.level + 1})</div>
                <div class="preview-stats">
                    ${bonus.hp ? `<div class="preview-stat"><span class="stat-label">❤️ HP</span> <span class="stat-change">+${bonus.hp}</span></div>` : ''}
                    ${bonus.atk ? `<div class="preview-stat"><span class="stat-label">⚔️ ATK</span> <span class="stat-change">+${bonus.atk}</span></div>` : ''}
                    ${bonus.def ? `<div class="preview-stat"><span class="stat-label">🛡️ DEF</span> <span class="stat-change">+${bonus.def}</span></div>` : ''}
                    ${bonus.mag ? `<div class="preview-stat"><span class="stat-label">✨ MAG</span> <span class="stat-change">+${bonus.mag}</span></div>` : ''}
                </div>
            </div>
        `;

    return `
            ${stats.map(s => `
                <div class="stat-item">
                    <span class="stat-name">${s.icon} ${s.name}</span>
                    <span class="stat-value">${s.value}</span>
                </div>
            `).join('')}
            ${levelUpHtml}
        `;
  }

  renderDetailedStats(hero) {
    // Mock de stats derivados baseados em atributos primários + equipamentos
    const evasion = Math.floor((hero.dex || 10) / 2) + (hero.equipment?.accessory ? 5 : 0);
    const block = hero.str ? Math.floor(hero.str / 2) : 0;
    const magicResist = hero.wis ? Math.floor(hero.wis / 2) : 0;

    const detailedStats = [
      { name: 'Chance de Crítico', value: `${hero.crit || 5}%`, icon: '💥' },
      { name: 'Dano Crítico', value: '150%', icon: '🗡️' },
      { name: 'Evasão', value: `${evasion}%`, icon: '💨' },
      { name: 'Bloqueio', value: `${block}%`, icon: '🛡️' },
      { name: 'Resistência Mágica', value: `${magicResist}%`, icon: '🔮' },
      { name: 'Regeneração de HP', value: '1/turno', icon: '❤️' },
      { name: 'Iniciativa', value: hero.speed || 10, icon: '⚡' }
    ];

    return detailedStats.map(s => `
            <div class="stat-item detailed">
                <span class="stat-name">${s.icon} ${s.name}</span>
                <span class="stat-value">${s.value}</span>
            </div>
        `).join('');
  }

  renderHeroStats(hero) {
    // Deixar vazio ou redirecionar, pois renderHeroTabs cuida disso
    return '';
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

  renderEquipment(hero) {
    const slots = [
      { key: 'weapon', label: 'Arma', emptyIcon: '⚔️' },
      { key: 'armor', label: 'Armadura', emptyIcon: '🛡️' },
      { key: 'accessory', label: 'Acessório', emptyIcon: '📿' }
    ];

    const equipment = hero.equipment || {};

    return slots.map(slot => {
      const itemId = equipment[slot.key];
      const item = itemId ? getItemData(itemId) : null;

      if (item) {
        return `
          <div class="equipment-slot equipped">
            <div class="equipment-slot-icon">${item.icon}</div>
            <div class="equipment-slot-name">${item.name}</div>
          </div>
        `;
      } else {
        return `
          <div class="equipment-slot">
            <div class="equipment-slot-icon" style="opacity: 0.3">${slot.emptyIcon}</div>
            <div class="equipment-slot-label">${slot.label}</div>
          </div>
        `;
      }
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
