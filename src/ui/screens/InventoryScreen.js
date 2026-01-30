import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class InventoryScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-inventory-back', () => this.gameManager.stateManager.setState(GameState.HOME));
    }

    onShow() {
        this.renderInventory();
    }

    renderInventory() {
        const grid = this.findElement('#inventory-grid');
        if (!grid) return;

        const items = this.gameManager.gameData.inventory || [];
        const totalSlots = 16; // 4x4 grid

        // Preencher com itens reais + slots vazios
        let html = '';

        for (let i = 0; i < totalSlots; i++) {
            const item = items[i];
            if (item) {
                html += `
                <div class="inventory-slot has-item">
                    <div class="item-icon">${item.icon || '📦'}</div>
                </div>
            `;
            } else {
                html += `<div class="inventory-slot empty"></div>`;
            }
        }

        grid.innerHTML = html;
    }
}
