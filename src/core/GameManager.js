/**
 * GameManager - Orquestrador Principal do Jogo
 * Inicializa subsistemas e coordena o fluxo do jogo
 */

import { eventBus } from './EventEmitter.js';
import { StateManager, GameState } from './StateManager.js';
import { SaveManager } from './SaveManager.js';
import { AssetLoader } from './AssetLoader.js';
import { UIManager } from '../ui/UIManager.js';
import { MapManager } from '../map/MapManager.js';
import { CombatManager } from '../combat/CombatManager.js';
import { ARSceneManager } from '../render/ARSceneManager.js';
import { CombatHUD } from '../ui/CombatHUD.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { GameMaster } from '../systems/GameMaster.js';

export class GameManager {
    constructor() {
        this.stateManager = new StateManager();
        this.saveManager = new SaveManager();
        this.assetLoader = new AssetLoader();
        this.mapManager = new MapManager(this);
        this.combatManager = new CombatManager(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.gameMaster = new GameMaster(this);

        // Inicializado após DOM
        this.arSceneManager = null;
        this.combatHUD = null;

        this.gameData = {
            heroes: [],
            inventory: [],
            gold: 100,
            fragments: 0,
            currentMission: null,
            chapter: 1
        };

        this.uiManager = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            this.updateLoadingText('Inicializando...');
            await this.saveManager.init();

            const savedData = await this.saveManager.load();
            if (savedData) this.gameData = { ...this.gameData, ...savedData };
            else this.initNewGame();

            await this.loadEssentialAssets();
            this.setupEventListeners();

            // Managers dependentes de DOM
            this.arSceneManager = new ARSceneManager('three-canvas', this);
            this.combatHUD = new CombatHUD(this);
            this.uiManager = new UIManager(this);

            this.updateLoadingText('Pronto!');
            await this.delay(500);

            this.stateManager.setState(GameState.HOME);
            this.isInitialized = true;

            console.log('🎮 Game initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }

    initNewGame() {
        this.gameData = {
            heroes: this.createDefaultHeroes(),
            inventory: [
                { itemId: 'sword_basic', quantity: 1 },
                { itemId: 'armor_leather', quantity: 1 },
                { itemId: 'potion_health_small', quantity: 5 },
                { itemId: 'potion_health_medium', quantity: 2 },
                { itemId: 'staff_arcane', quantity: 1 },
                { itemId: 'sword_flame', quantity: 1 },
                { itemId: 'dagger_shadow', quantity: 1 },
                { itemId: 'ring_protection', quantity: 1 },
                { itemId: 'letter_sealed', quantity: 1 }
            ],
            gold: 100,
            fragments: 50,
            currentMission: null,
            chapter: 1
        };
    }

    createDefaultHeroes() {
        return [
            {
                id: 'warrior', name: 'Guerreiro', class: 'warrior', icon: '⚔️',
                hp: 120, maxHp: 120, pa: 3, maxPa: 3, atk: 25, def: 15, level: 1, xp: 0,
                deck: [
                    { name: 'Golpe', icon: '⚔️', cost: 1, damage: 15, description: 'Ataque básico' },
                    { name: 'Golpe Brutal', icon: '💥', cost: 2, damage: 30, description: '+30 dano' },
                    { name: 'Escudo', icon: '🛡️', cost: 1, defense: 10, description: '+10 defesa' },
                    { name: 'Investida', icon: '🏃', cost: 2, damage: 25, description: 'Avança e ataca' }
                ]
            },
            {
                id: 'mage', name: 'Mago', class: 'mage', icon: '🔮',
                hp: 60, maxHp: 60, pa: 3, maxPa: 3, atk: 10, mag: 30, def: 5, level: 1, xp: 0,
                deck: [
                    { name: 'Míssil Arcano', icon: '✨', cost: 1, damage: 20, description: 'Projétil mágico' },
                    { name: 'Bola de Fogo', icon: '🔥', cost: 2, damage: 40, aoe: true, description: 'Ataque em área' },
                    { name: 'Raio', icon: '⚡', cost: 2, damage: 35, description: 'Ataque elétrico' },
                    { name: 'Escudo Arcano', icon: '🔮', cost: 1, defense: 15, description: 'Barreira mágica' }
                ]
            },
            {
                id: 'rogue', name: 'Ladino', class: 'rogue', icon: '🗡️',
                hp: 80, maxHp: 80, pa: 3, maxPa: 3, atk: 20, def: 8, crit: 15, level: 1, xp: 0,
                deck: [
                    { name: 'Punhalada', icon: '🗡️', cost: 1, damage: 18, description: 'Ataque rápido' },
                    { name: 'Golpe Furtivo', icon: '👤', cost: 2, damage: 45, description: 'Crítico garantido' },
                    { name: 'Veneno', icon: '☠️', cost: 1, dot: 5, duration: 3, description: '5 dano/turno' },
                    { name: 'Evasão', icon: '💨', cost: 1, dodge: true, description: 'Esquiva próximo ataque' }
                ]
            },
            {
                id: 'cleric', name: 'Clérigo', class: 'cleric', icon: '✨',
                hp: 90, maxHp: 90, pa: 3, maxPa: 3, atk: 15, mag: 25, def: 10, level: 1, xp: 0,
                deck: [
                    { name: 'Cura Menor', icon: '💚', cost: 1, heal: 20, description: 'Cura 20 HP' },
                    { name: 'Luz Sagrada', icon: '☀️', cost: 2, damage: 25, description: 'Dano sagrado' },
                    { name: 'Bênção', icon: '🙏', cost: 1, buff: { atk: 5 }, description: '+5 ataque' },
                    { name: 'Purificar', icon: '💫', cost: 1, cleanse: true, description: 'Remove debuffs' }
                ]
            }
        ];
    }

    async loadEssentialAssets() { await this.delay(500); }

    setupEventListeners() {
        eventBus.on('loadingProgress', ({ progress }) => this.updateLoadingProgress(progress));

        eventBus.on('stateChange', ({ from, to, data }) => {
            if (from && from !== GameState.SPLASH) this.saveGame();

            // Iniciar combate
            if (to === GameState.COMBAT && data && data.missionId) {
                // BUGFIX: Passar o objeto 'data' completo para preservar questId e objectiveId
                this.combatManager.startEncounter(data);
                this.arSceneManager.startSession();
            }
        });

        // Toast messages
        eventBus.on('showMessage', ({ text, type }) => this.showToast(text, type));
    }

    showToast(text, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = text;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    async saveGame() { await this.saveManager.save(this.gameData); }
    updateLoadingProgress(percent) { const el = document.getElementById('loading-progress'); if (el) el.style.width = `${percent}%`; }
    updateLoadingText(text) { const el = document.getElementById('loading-text'); if (el) el.textContent = text; }
    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}
