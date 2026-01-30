/**
 * UIManager - Gerenciador de Interface
 * Coordena as telas e interações do usuário
 */
import { eventBus } from '../../core/EventEmitter.js';
import { GameState } from '../../core/StateManager.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { HeroesScreen } from './screens/HeroesScreen.js';
import { InventoryScreen } from './screens/InventoryScreen.js';
import { ConfigScreen } from './screens/ConfigScreen.js';
import { GMScreen } from './screens/GMScreen.js';
import { CombatScreen } from './screens/CombatScreen.js';
import { MapScreen } from './screens/MapScreen.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.screens = new Map();

        // Inicializar telas
        this.screens.set(GameState.HOME, new HomeScreen('home-screen', gameManager));
        this.screens.set(GameState.HEROES, new HeroesScreen('heroes-screen', gameManager));
        this.screens.set(GameState.INVENTORY, new InventoryScreen('inventory-screen', gameManager));
        this.screens.set(GameState.CONFIG, new ConfigScreen('config-screen', gameManager));
        this.screens.set(GameState.GM, new GMScreen('gm-screen', gameManager));
        this.screens.set(GameState.COMBAT, new CombatScreen('combat-hud', gameManager));
        this.screens.set(GameState.MAP, new MapScreen('map-screen', gameManager));

        // Setup inicial dos eventos de cada tela
        this.screens.forEach(screen => screen.setupEvents());

        // Ouvir mudanças de estado para notificar telas
        this.setupStateListeners();
    }

    setupStateListeners() {
        eventBus.on('stateChange', ({ from, to, data }) => {
            // Notificar tela anterior que vai sair
            if (from && this.screens.has(from)) {
                this.screens.get(from).onHide();
            }

            // Notificar nova tela que vai entrar
            if (to && this.screens.has(to)) {
                this.screens.get(to).onShow(data);
            }
        });
    }
}
