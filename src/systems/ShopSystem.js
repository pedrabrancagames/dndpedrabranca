/**
 * ShopSystem - Sistema de Comércio
 * Gerencia compra e venda de itens com NPCs
 */
import { eventBus } from '../core/EventEmitter.js';
import { getNPCData } from '../data/NPCDatabase.js';
import { getItemData } from '../data/ItemDatabase.js';

export class ShopSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeShop = null; // ID do NPC atual

        // UI Elements
        this.ui = {
            overlay: document.getElementById('shop-overlay'),
            shopName: document.getElementById('shop-name'),
            playerGold: document.getElementById('shop-player-gold'),
            shopGrid: document.getElementById('shop-items-grid'),
            closeBtn: document.getElementById('btn-close-shop')
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir loja via evento (vindo do Diálogo)
        eventBus.on('openShop', ({ npcId }) => {
            this.openShop(npcId);
        });

        if (this.ui.closeBtn) {
            this.ui.closeBtn.addEventListener('click', () => this.closeShop());
        }
    }

    openShop(npcId) {
        const npcData = getNPCData(npcId);
        if (!npcData || !npcData.shopInventory) {
            console.warn(`NPC ${npcId} does not have a shop.`);
            return;
        }

        this.activeShop = npcId;
        this.updateUI(npcData);
        this.showUI(true);
    }

    closeShop() {
        this.activeShop = null;
        this.showUI(false);
        // Opcional: Reabrir diálogo ou voltar ao jogo
    }

    updateUI(npcData) {
        if (!this.ui.overlay) return;

        this.ui.shopName.textContent = `Loja de ${npcData.name}`;
        this.updateGoldDisplay();
        this.renderShopItems(npcData.shopInventory);
    }

    updateGoldDisplay() {
        const gold = this.gameManager.gameData.gold;
        this.ui.playerGold.textContent = `💰 ${gold}`;
    }

    renderShopItems(inventoryIds) {
        this.ui.shopGrid.innerHTML = '';

        inventoryIds.forEach(itemId => {
            const item = getItemData(itemId);
            if (!item) return;

            const card = document.createElement('div');
            card.className = 'shop-item-card';
            // Raridade visual
            card.classList.add(item.rarity || 'common');

            card.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-price">💰 ${item.price || 10}</div>
                </div>
                <button class="shop-buy-btn">Comprar</button>
            `;

            const buyBtn = card.querySelector('.shop-buy-btn');
            buyBtn.onclick = () => this.buyItem(itemId, item.price || 10);

            this.ui.shopGrid.appendChild(card);
        });
    }

    buyItem(itemId, price) {
        const playerGold = this.gameManager.gameData.gold;

        if (playerGold >= price) {
            // Deduzir ouro
            this.gameManager.gameData.gold -= price;

            // Adicionar item (lógica simplificada, idealmente usar InventoryManager se existisse)
            const existingItem = this.gameManager.gameData.inventory.find(i => i.itemId === itemId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.gameManager.gameData.inventory.push({ itemId, quantity: 1 });
            }

            // Feedback
            eventBus.emit('showMessage', { text: `Comprou ${itemId}!`, type: 'success' });
            this.updateGoldDisplay();

            // Salvar estado
            this.gameManager.saveGame();
        } else {
            eventBus.emit('showMessage', { text: 'Ouro insuficiente!', type: 'error' });
        }
    }

    showUI(visible) {
        if (!this.ui.overlay) {
            this.ui.overlay = document.getElementById('shop-overlay');
            if (!this.ui.overlay) return;
        }

        if (visible) {
            this.ui.overlay.classList.remove('hidden');
            this.ui.overlay.classList.add('active');
        } else {
            this.ui.overlay.classList.add('hidden');
            this.ui.overlay.classList.remove('active');
        }
    }
}
