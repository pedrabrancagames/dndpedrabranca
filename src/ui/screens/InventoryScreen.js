import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import {
    ItemDatabase,
    ItemCategory,
    getItemData,
    getRarityColor,
    getRarityName,
    getCategoryName,
    canEquipItem
} from '../../data/ItemDatabase.js';
import { CardRarity } from '../../data/CardDatabase.js';
import { eventBus } from '../../core/EventEmitter.js';

export class InventoryScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.sortMethod = 'recent'; // recent, name, rarity, quantity
        this.selectedItem = null;
        this.selectedIndex = null;
        this.selectedHeroIndex = null;
        this.maxSlots = 20;
    }

    setupEvents() {
        this.bindClick('#btn-inventory-back', () => this.gameManager.stateManager.setState(GameState.HOME));
        this.bindClick('#btn-close-item-modal', () => this.closeItemDetails());
        this.bindClick('#btn-equip-item', () => this.equipItem());
        this.bindClick('#btn-use-item', () => this.useItem());
        this.bindClick('#btn-discard-item', () => this.discardItem());

        // Setup filter tabs
        const filters = this.findElement('#inventory-filters');
        if (filters) {
            filters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-tab')) {
                    this.setFilter(e.target.dataset.filter);
                }
            });
        }

        // Setup Search
        const searchInput = this.findElement('#inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderInventory();
            });
        }

        // Setup Sort
        const sortSelect = this.findElement('#inventory-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortMethod = e.target.value;
                this.renderInventory();
            });
        }

        // Setup grid click
        const grid = this.findElement('#inventory-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const slot = e.target.closest('.inventory-slot');
                if (slot && slot.dataset.index !== undefined) {
                    this.showItemDetails(parseInt(slot.dataset.index));
                }
            });
        }
    }

    onShow() {
        this.renderGold();
        this.renderInventory();
        this.renderCapacity();
    }

    renderGold() {
        const goldDisplay = this.findElement('#gold-display');
        if (goldDisplay) {
            goldDisplay.textContent = `💰 ${this.gameManager.gameData.gold || 0}`;
        }
    }

    renderCapacity() {
        const items = this.gameManager.gameData.inventory || [];
        const used = items.length;
        const fill = this.findElement('#capacity-fill');
        const text = this.findElement('#capacity-text');

        if (fill) {
            fill.style.width = `${(used / this.maxSlots) * 100}%`;
        }
        if (text) {
            text.textContent = `${used}/${this.maxSlots}`;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update active tab
        const tabs = this.element.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        this.renderInventory();
    }

    getFilteredItems() {
        const inventory = this.gameManager.gameData.inventory || [];

        // 1. Filter by Category & Search
        let filtered = inventory.filter(invItem => {
            const itemData = getItemData(invItem.itemId);
            if (!itemData) return false;

            // Category Filter
            if (this.currentFilter !== 'all' && itemData.category !== this.currentFilter) {
                return false;
            }

            // Search Filter
            if (this.searchQuery) {
                const nameMatch = itemData.name.toLowerCase().includes(this.searchQuery);
                const descMatch = itemData.description?.toLowerCase().includes(this.searchQuery);
                if (!nameMatch && !descMatch) return false;
            }

            return true;
        });

        // 2. Sort Items
        filtered.sort((a, b) => {
            const itemA = getItemData(a.itemId);
            const itemB = getItemData(b.itemId);

            switch (this.sortMethod) {
                case 'name':
                    return itemA.name.localeCompare(itemB.name);
                case 'rarity':
                    // Assuming rarity enum values equate to power (higher is better)
                    // If rarity is string, we need a map. Assuming ItemDatabase exports helpers or we define order.
                    // Simple hack: Rarity length/priority or just string compare for now strictly alphabetical reverse?
                    // Better: Define rarity weight map.
                    const rarityWeight = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
                    return (rarityWeight[itemB.rarity] || 0) - (rarityWeight[itemA.rarity] || 0);
                case 'quantity':
                    return b.quantity - a.quantity;
                case 'recent':
                default:
                    // Assuming inventory order is chronological by default push
                    return 0;
            }
        });

        return filtered;
    }

    renderInventory() {
        const grid = this.findElement('#inventory-grid');
        if (!grid) return;

        const inventory = this.gameManager.gameData.inventory || [];
        // Note: getFilteredItems returns wrappers around inventory items or the items themselves?
        // Actually it returns the inventory objects.
        const filteredItems = this.getFilteredItems();

        // If sorting/filtering active, hide empty slots logic or show only filled?
        // Better UX: Show only filled items when searching/filtering, 
        // but maintain grid structure if "all" and no search.
        const isDefaultView = this.currentFilter === 'all' && !this.searchQuery && this.sortMethod === 'recent';
        const totalSlots = isDefaultView ? Math.max(this.maxSlots, inventory.length) : filteredItems.length;

        let html = '';

        if (filteredItems.length === 0 && !isDefaultView) {
            grid.innerHTML = '<div class="no-items-found">Nenhum item encontrado.</div>';
            return;
        }

        // Loop strategy:
        // If default view: loop 0 to maxSlots, pick from ALL inventory by index.
        // If filtered view: loop 0 to filtered length, pick from FILTERED array.

        const itemsToRender = isDefaultView ? inventory : filteredItems;
        const loopCount = isDefaultView ? this.maxSlots : itemsToRender.length;

        for (let i = 0; i < loopCount; i++) {
            const invItem = itemsToRender[i];

            if (invItem) {
                const itemData = getItemData(invItem.itemId);
                if (itemData) {
                    const rarityClass = itemData.rarity;
                    // We need original index for reference actions
                    const originalIndex = inventory.indexOf(invItem);

                    html += `
                        <div class="inventory-slot has-item ${rarityClass}" 
                             data-index="${originalIndex}"
                             data-rarity="${rarityClass}">
                            <div class="item-icon">${itemData.icon || '📦'}</div>
                            ${invItem.quantity > 1 ? `<span class="item-quantity">${invItem.quantity}</span>` : ''}
                            ${invItem.isFavorite ? '<span class="favorite-indicator">❤️</span>' : ''}
                            <div class="rarity-glow"></div>
                        </div>
                    `;
                } else {
                    html += `<div class="inventory-slot empty"></div>`;
                }
            } else {
                html += `<div class="inventory-slot empty"></div>`;
            }
        }

        grid.innerHTML = html;
    }

    showItemDetails(index) {
        const inventory = this.gameManager.gameData.inventory || [];
        const invItem = inventory[index];
        if (!invItem) return;

        const itemData = getItemData(invItem.itemId);
        if (!itemData) return;

        this.selectedItem = itemData;
        this.selectedIndex = index;

        // Populate modal
        const modal = this.findElement('#item-detail-modal');
        const iconEl = this.findElement('#item-detail-icon');
        const nameEl = this.findElement('#item-detail-name');
        const rarityEl = this.findElement('#item-detail-rarity');
        const descEl = this.findElement('#item-detail-description');
        const statsEl = this.findElement('#item-detail-stats');
        const equipBtn = this.findElement('#btn-equip-item');
        const useBtn = this.findElement('#btn-use-item');
        const discardBtn = this.findElement('#btn-discard-item');

        if (iconEl) iconEl.textContent = itemData.icon;
        if (nameEl) nameEl.textContent = itemData.name;
        if (rarityEl) {
            rarityEl.textContent = getRarityName(itemData.rarity);
            rarityEl.style.color = getRarityColor(itemData.rarity);
        }
        if (descEl) descEl.textContent = itemData.description;

        // Render Stats & Comparison
        if (statsEl) {
            statsEl.innerHTML = this.renderStats(itemData, invItem);
        }

        // Show/hide action buttons
        if (equipBtn) {
            equipBtn.classList.toggle('hidden', !itemData.equipSlot);
        }
        if (useBtn) {
            useBtn.classList.toggle('hidden', itemData.category !== ItemCategory.CONSUMABLE);
        }
        if (discardBtn) {
            // Can't discard quest items OR FAVORITES
            const canDiscard = itemData.category !== ItemCategory.QUEST && !invItem.isFavorite;
            discardBtn.classList.toggle('hidden', !canDiscard);

            // Add FAVORITE toggle functionality via button text/icon state change? 
            // Or add a dedicated button. For simplicity, let's reuse discard btn area or add new one.
            // Let's add a toggle button dynamically if not present.
        }

        this.renderAttributes(invItem, statsEl); // Helper for favorite button injection

        // Render hero selector if equippable
        this.renderHeroSelector(itemData);

        if (modal) modal.classList.remove('hidden');
    }

    renderAttributes(invItem, container) {
        // Inject favorite toggle
        let favBtn = container.querySelector('.btn-favorite');
        if (!favBtn) {
            favBtn = document.createElement('button');
            favBtn.className = 'action-btn btn-favorite';
            favBtn.style.marginTop = '10px';
            favBtn.style.width = '100%';
            container.appendChild(favBtn);

            favBtn.addEventListener('click', () => {
                invItem.isFavorite = !invItem.isFavorite;
                this.renderAttributes(invItem, container); // Re-render btn state
                this.renderInventory(); // Update grid icon
                this.gameManager.saveGame();
            });
        }

        favBtn.textContent = invItem.isFavorite ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos';
        favBtn.style.background = invItem.isFavorite ? '#c0392b' : '#333';
    }

    renderStats(itemData, invItem) {
        let html = '<div class="stats-grid">';

        // 1. Basic Stats
        if (itemData.stats) {
            const statNames = { atk: '⚔️ Ataque', def: '🛡️ Defesa', mag: '✨ Magia', crit: '💥 Crítico', maxHp: '❤️ HP', pa: '⚡ PA' };

            for (const [stat, value] of Object.entries(itemData.stats)) {
                const name = statNames[stat] || stat;
                html += `<div class="stat-item"><span class="stat-name">${name}</span><span class="stat-value">+${value}</span></div>`;
            }
        }

        // 2. Comparison Logic (if equippable)
        if (itemData.equipSlot) {
            // Compare with FIRST hero or selected hero if logical
            const hero = this.gameManager.gameData.heroes[0]; // Default comparison
            if (hero && hero.equipment && hero.equipment[itemData.equipSlot]) {
                const equippedId = hero.equipment[itemData.equipSlot];
                const equippedItem = getItemData(equippedId);

                if (equippedItem && equippedItem.stats) {
                    html += `</div><div class="comparison-section"><span class="comparison-title">Comparando com Equipado (${hero.name}):</span>`;

                    // Compare stats
                    const allStats = new Set([...Object.keys(itemData.stats || {}), ...Object.keys(equippedItem.stats || {})]);

                    allStats.forEach(stat => {
                        const newVal = (itemData.stats?.[stat] || 0);
                        const oldVal = (equippedItem.stats?.[stat] || 0);
                        const diff = newVal - oldVal;

                        if (diff !== 0) {
                            const diffClass = diff > 0 ? 'positive' : 'negative';
                            const sign = diff > 0 ? '+' : '';
                            const statName = stat.toUpperCase();
                            html += `<div style="font-size: 0.8rem; margin-top: 4px;">${statName}: <span class="${diffClass}">${sign}${diff}</span></div>`;
                        }
                    });

                    html += '</div><div>'; // Close comparison, reopen grid context or empty div to balance
                }
            }
        }

        html += '</div>';

        // Effects & Info
        if (itemData.effects) { /** ... existing code ... */ }
        if (itemData.price) { html += `<div class="stat-item"><span class="stat-name">💰 Preço</span><span class="stat-value">${itemData.price}</span></div>`; }

        return html;
    }

    closeItemDetails() {
        const modal = this.findElement('#item-detail-modal');
        if (modal) modal.classList.add('hidden');
        this.selectedItem = null;
        this.selectedIndex = null;
        this.selectedHeroIndex = null;
    }

    renderHeroSelector(itemData) {
        const selectorContainer = this.findElement('#hero-selector');
        const selectorList = this.findElement('#hero-selector-list');

        if (!selectorContainer || !selectorList) return;

        // Only show selector for equippable items
        if (!itemData.equipSlot) {
            selectorContainer.classList.add('hidden');
            return;
        }

        selectorContainer.classList.remove('hidden');
        const heroes = this.gameManager.gameData.heroes || [];
        const classNames = {
            warrior: 'Guerreiro',
            mage: 'Mago',
            rogue: 'Ladino',
            cleric: 'Clérigo'
        };
        const classIcons = {
            warrior: '⚔️',
            mage: '🧙',
            rogue: '🗡️',
            cleric: '✝️'
        };

        // Reset selection
        this.selectedHeroIndex = null;

        // Auto-select first valid hero
        let firstValidIndex = null;

        let html = '';
        heroes.forEach((hero, index) => {
            const canEquip = canEquipItem(itemData, hero);
            if (canEquip && firstValidIndex === null) {
                firstValidIndex = index;
            }

            const equipClass = canEquip ? 'can-equip' : 'cannot-equip';
            const statusClass = canEquip ? 'valid' : 'invalid';
            const statusText = canEquip ? '✓ Pode usar' : '✗ Inválido';
            const icon = classIcons[hero.class] || '👤';
            const className = classNames[hero.class] || hero.class;

            html += `
                <div class="hero-selector-item ${equipClass}" 
                     data-hero-index="${index}"
                     data-can-equip="${canEquip}">
                    <div class="hero-selector-icon">${icon}</div>
                    <div class="hero-selector-info">
                        <div class="hero-selector-name">${hero.name}</div>
                        <div class="hero-selector-class">${className}</div>
                    </div>
                    <span class="hero-selector-status ${statusClass}">${statusText}</span>
                </div>
            `;
        });

        selectorList.innerHTML = html;

        // Auto-select first valid hero
        if (firstValidIndex !== null) {
            this.selectHero(firstValidIndex);
        }

        // Add click handlers
        selectorList.querySelectorAll('.hero-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.canEquip === 'true') {
                    this.selectHero(parseInt(item.dataset.heroIndex));
                }
            });
        });
    }

    selectHero(index) {
        this.selectedHeroIndex = index;

        // Update visual selection
        const items = this.findElement('#hero-selector-list')?.querySelectorAll('.hero-selector-item');
        if (items) {
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
        }
    }

    equipItem() {
        if (!this.selectedItem || !this.selectedItem.equipSlot) return;

        // Check if a hero is selected
        if (this.selectedHeroIndex === null) {
            eventBus.emit('showMessage', {
                text: 'Selecione um herói para equipar!',
                type: 'error'
            });
            return;
        }

        // Get selected hero
        const heroes = this.gameManager.gameData.heroes;
        const hero = heroes[this.selectedHeroIndex];

        if (!canEquipItem(this.selectedItem, hero)) {
            eventBus.emit('showMessage', {
                text: `${hero.name} não pode equipar este item!`,
                type: 'error'
            });
            return;
        }

        // Initialize equipment object if needed
        if (!hero.equipment) {
            hero.equipment = {};
        }

        // Initialize deck if needed
        if (!hero.deck) {
            hero.deck = [];
        }

        // Get previous item in this slot (to remove its card)
        const previousItemId = hero.equipment[this.selectedItem.equipSlot];
        if (previousItemId) {
            const previousItem = getItemData(previousItemId);
            if (previousItem && previousItem.generatesCard) {
                // Remove the card from deck
                this.removeCardFromDeck(hero, previousItem.generatesCard.id);
            }
        }

        // Equip the new item
        hero.equipment[this.selectedItem.equipSlot] = this.selectedItem.id;

        // Add the new item's card to deck (if it generates one)
        if (this.selectedItem.generatesCard) {
            this.addCardToDeck(hero, this.selectedItem.generatesCard);
        }

        eventBus.emit('showMessage', {
            text: `${this.selectedItem.name} equipado em ${hero.name}!`,
            type: 'success'
        });

        this.closeItemDetails();
        this.gameManager.saveGame();
    }

    /**
     * Adiciona uma carta ao deck do herói (evita duplicatas)
     */
    addCardToDeck(hero, cardData) {
        // Check if card already exists (avoid duplicates)
        const exists = hero.deck.some(card => card.id === cardData.id);
        if (exists) {
            console.log(`Card ${cardData.id} already in deck, skipping`);
            return;
        }

        // Add card to deck
        hero.deck.push({
            ...cardData,
            level: 0,
            sourceType: cardData.cardType || 'equipment'
        });

        console.log(`Added card ${cardData.name} to ${hero.name}'s deck`);
    }

    /**
     * Remove uma carta do deck do herói pelo ID
     */
    removeCardFromDeck(hero, cardId) {
        const index = hero.deck.findIndex(card => card.id === cardId);
        if (index !== -1) {
            const removed = hero.deck.splice(index, 1);
            console.log(`Removed card ${removed[0].name} from ${hero.name}'s deck`);
        }
    }

    useItem() {
        if (!this.selectedItem || this.selectedItem.category !== ItemCategory.CONSUMABLE) return;

        const inventory = this.gameManager.gameData.inventory;
        const invItem = inventory[this.selectedIndex];
        const heroes = this.gameManager.gameData.heroes;
        const hero = heroes[0]; // Use first hero for now

        // Apply effects
        if (this.selectedItem.effects) {
            if (this.selectedItem.effects.heal) {
                hero.hp = Math.min(hero.hp + this.selectedItem.effects.heal, hero.maxHp);
                eventBus.emit('showMessage', {
                    text: `${hero.name} recuperou ${this.selectedItem.effects.heal} HP!`,
                    type: 'success'
                });
            }
            if (this.selectedItem.effects.restorePA) {
                hero.pa = Math.min(hero.pa + this.selectedItem.effects.restorePA, hero.maxPa);
                eventBus.emit('showMessage', {
                    text: `${hero.name} recuperou ${this.selectedItem.effects.restorePA} PA!`,
                    type: 'success'
                });
            }
        }

        // Remove or decrease quantity
        if (invItem.quantity > 1) {
            invItem.quantity--;
        } else {
            inventory.splice(this.selectedIndex, 1);
        }

        this.closeItemDetails();
        this.renderInventory();
        this.renderCapacity();
        this.gameManager.saveGame();
    }

    discardItem() {
        if (!this.selectedItem || this.selectedItem.category === ItemCategory.QUEST) return;

        const inventory = this.gameManager.gameData.inventory;
        const invItem = inventory[this.selectedIndex];

        // Sell for half price
        const sellPrice = Math.floor((this.selectedItem.price || 0) / 2);
        this.gameManager.gameData.gold += sellPrice;

        // Remove item
        if (invItem.quantity > 1) {
            invItem.quantity--;
        } else {
            inventory.splice(this.selectedIndex, 1);
        }

        eventBus.emit('showMessage', {
            text: sellPrice > 0 ? `Vendeu ${this.selectedItem.name} por ${sellPrice} ouro!` : `Descartou ${this.selectedItem.name}`,
            type: 'info'
        });

        this.closeItemDetails();
        this.renderInventory();
        this.renderCapacity();
        this.renderGold();
        this.gameManager.saveGame();
    }
}
