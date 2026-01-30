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

export class GameManager {
    constructor() {
        this.stateManager = new StateManager();
        this.saveManager = new SaveManager();
        this.assetLoader = new AssetLoader();
        this.mapManager = new MapManager(this);
        this.combatManager = new CombatManager(this);

        // Inicializado após DOM
        this.arSceneManager = null;

        this.gameData = {
            heroes: [],
            inventory: [],
            gold: 0,
            currentMission: null,
            chapter: 1,
            testMode: true
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
        // ... mantido igual (simplificado aqui para economizar tokens, 
        // mas na prática vou reescrever tudo para garantir integridade)
        this.gameData = {
            heroes: this.createDefaultHeroes(),
            inventory: [],
            gold: 100,
            currentMission: null,
            chapter: 1,
            testMode: true
        };
    }

    createDefaultHeroes() {
        // Mesma lógica anterior, mantendo código completo
        return [
            { id: 'warrior', name: 'Guerreiro', class: 'warrior', icon: '⚔️', hp: 120, maxHp: 120, pa: 3, maxPa: 3, atk: 25, def: 15, level: 1, xp: 0, deck: ['golpe', 'golpe_brutal', 'escudo', 'provocar', 'investida', 'furia'] },
            { id: 'mage', name: 'Mago', class: 'mage', icon: '🔮', hp: 60, maxHp: 60, pa: 3, maxPa: 3, atk: 10, mag: 30, def: 5, level: 1, xp: 0, deck: ['missil_arcano', 'bola_de_fogo', 'cone_de_gelo', 'escudo_arcano', 'raio', 'meteoro'] },
            { id: 'rogue', name: 'Ladino', class: 'rogue', icon: '🗡️', hp: 80, maxHp: 80, pa: 3, maxPa: 3, atk: 20, def: 8, crit: 15, level: 1, xp: 0, deck: ['punhalada', 'golpe_nas_costas', 'veneno', 'evasao', 'sombras', 'execucao'] },
            { id: 'cleric', name: 'Clérigo', class: 'cleric', icon: '✨', hp: 90, maxHp: 90, pa: 3, maxPa: 3, atk: 15, mag: 25, def: 10, level: 1, xp: 0, deck: ['cura_menor', 'cura_em_grupo', 'bencao', 'luz_sagrada', 'purificar', 'ressurreicao'] }
        ];
    }

    async loadEssentialAssets() { await this.delay(500); }

    setupEventListeners() {
        eventBus.on('loadingProgress', ({ progress }) => this.updateLoadingProgress(progress));

        eventBus.on('stateChange', ({ from, to, data }) => {
            if (from && from !== GameState.SPLASH) this.saveGame();

            // Iniciar combate
            if (to === GameState.COMBAT && data && data.missionId) {
                this.combatManager.startEncounter(data.missionId);
                // Iniciar AR Session
                this.arSceneManager.startSession();
            }
        });
    }

    async saveGame() { await this.saveManager.save(this.gameData); }
    updateLoadingProgress(percent) { const el = document.getElementById('loading-progress'); if (el) el.style.width = `${percent}%`; }
    updateLoadingText(text) { const el = document.getElementById('loading-text'); if (el) el.textContent = text; }
    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}
