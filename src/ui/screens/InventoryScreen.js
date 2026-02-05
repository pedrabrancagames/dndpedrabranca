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

        if (this.currentFilter === 'all') {
            return inventory;
        }

        return inventory.filter(invItem => {
            const itemData = getItemData(invItem.itemId);
            return itemData && itemData.category === this.currentFilter;
        });
    }

    renderInventory() {
        const grid = this.findElement('#inventory-grid');
        if (!grid) return;

        const inventory = this.gameManager.gameData.inventory || [];
        const filteredItems = this.getFilteredItems();
        const totalSlots = this.currentFilter === 'all' ? this.maxSlots : Math.max(filteredItems.length, 8);

        let html = '';

        for (let i = 0; i < totalSlots; i++) {
            const invItem = this.currentFilter === 'all' ? inventory[i] : filteredItems[i];

            if (invItem) {
                const itemData = getItemData(invItem.itemId);
                if (itemData) {
                    const rarityClass = itemData.rarity;
                    const originalIndex = this.currentFilter === 'all' ? i : inventory.indexOf(invItem);

                    html += `
                        <div class="inventory-slot has-item ${rarityClass}" 
                             data-index="${originalIndex}"
                             data-rarity="${rarityClass}">
                            <div class="item-icon">${itemData.icon || '📦'}</div>
                            ${invItem.quantity > 1 ? `<span class="item-quantity">${invItem.quantity}</span>` : ''}
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

        // Render stats
        if (statsEl) {
            statsEl.innerHTML = this.renderStats(itemData);
        }

        // Show/hide action buttons based on item type
        if (equipBtn) {
            equipBtn.classList.toggle('hidden', !itemData.equipSlot);
        }
        if (useBtn) {
            useBtn.classList.toggle('hidden', itemData.category !== ItemCategory.CONSUMABLE);
        }
        if (discardBtn) {
            discardBtn.classList.toggle('hidden', itemData.category === ItemCategory.QUEST);
        }

        // Render hero selector if item is equippable
        this.renderHeroSelector(itemData);

        // Show modal
        if (modal) modal.classList.remove('hidden');
    }

    renderStats(itemData) {
        let html = '<div class="stats-grid">';

        if (itemData.stats) {
            const statNames = {
                atk: '⚔️ Ataque',
                def: '🛡️ Defesa',
                mag: '✨ Magia',
                crit: '💥 Crítico',
                maxHp: '❤️ HP Máximo',
                fireDamage: '🔥 Dano de Fogo',
                holyDamage: '☀️ Dano Sagrado'
            };

            for (const [stat, value] of Object.entries(itemData.stats)) {
                const name = statNames[stat] || stat;
                html += `<div class="stat-item"><span class="stat-name">${name}</span><span class="stat-value">+${value}</span></div>`;
            }
        }

        if (itemData.effects) {
            if (itemData.effects.heal) {
                html += `<div class="stat-item"><span class="stat-name">💚 Cura</span><span class="stat-value">${itemData.effects.heal} HP</span></div>`;
            }
            if (itemData.effects.restorePA) {
                html += `<div class="stat-item"><span class="stat-name">🔋 Restaura PA</span><span class="stat-value">+${itemData.effects.restorePA}</span></div>`;
            }
        }

        if (itemData.price) {
            html += `<div class="stat-item"><span class="stat-name">💰 Preço</span><span class="stat-value">${itemData.price} ouro</span></div>`;
        }

        if (itemData.classRestriction) {
            const classNames = {
                warrior: 'Guerreiro',
                mage: 'Mago',
                rogue: 'Ladino',
                cleric: 'Clérigo'
            };
            const classes = itemData.classRestriction.map(c => classNames[c] || c).join(', ');
            html += `<div class="stat-item class-restriction"><span class="stat-name">🔒 Apenas</span><span class="stat-value">${classes}</span></div>`;
        }

        html += '</div>';
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
            const icon = classIcons[hero.classId] || '👤';
            const className = classNames[hero.classId] || hero.classId;

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

        // Equip the item
        hero.equipment[this.selectedItem.equipSlot] = this.selectedItem.id;

        eventBus.emit('showMessage', {
            text: `${this.selectedItem.name} equipado em ${hero.name}!`,
            type: 'success'
        });

        this.closeItemDetails();
        this.gameManager.saveGame();
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
