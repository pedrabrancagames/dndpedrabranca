/**
 * GameManager - Orquestrador Principal do Jogo
 * Inicializa subsistemas e coordena o fluxo do jogo
 */

import { eventBus } from './EventEmitter.js';
import { StateManager, GameState } from './StateManager.js';
import { SaveManager } from './SaveManager.js';
import { AssetLoader } from './AssetLoader.js';
import { UIManager } from '../ui/UIManager.js';

export class GameManager {
    constructor() {
        // Subsistemas
        this.stateManager = new StateManager();
        this.saveManager = new SaveManager();
        this.assetLoader = new AssetLoader();

        // Estado do jogo
        this.gameData = {
            heroes: [],
            inventory: [],
            gold: 0,
            currentMission: null,
            chapter: 1,
            testMode: false
        };

        // UI Manager (será inicializado após o DOM estar pronto e subsistemas)
        this.uiManager = null;

        // Referências para outros managers
        this.combatManager = null;
        this.mapManager = null;
        this.arSceneManager = null;

        this.isInitialized = false;
    }

    /**
     * Inicializa o jogo
     */
    async init() {
        console.log('🎮 Initializing D&D Pedra Branca...');

        try {
            // Mostrar splash (ainda manual pois UIManager não tá pronto)
            this.updateLoadingText('Inicializando...');

            // Inicializar save system
            await this.saveManager.init();
            this.updateLoadingProgress(10);
            this.updateLoadingText('Carregando dados...');

            // Carregar save existente
            const savedData = await this.saveManager.load();
            if (savedData) {
                this.gameData = { ...this.gameData, ...savedData };
                console.log('Save loaded');
            } else {
                this.initNewGame();
            }
            this.updateLoadingProgress(30);

            // Carregar assets essenciais
            this.updateLoadingText('Carregando recursos...');
            await this.loadEssentialAssets();
            this.updateLoadingProgress(80);

            // Configurar event listeners
            this.setupEventListeners();
            this.updateLoadingProgress(90);

            // Configurar UI Manager
            this.uiManager = new UIManager(this);
            this.updateLoadingProgress(100);
            this.updateLoadingText('Pronto!');

            // Aguardar um momento para mostrar 100%
            await this.delay(500);

            // Ir para HOME
            this.stateManager.setState(GameState.HOME);
            this.isInitialized = true;

            console.log('🎮 Game initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.updateLoadingText('Erro ao carregar. Recarregue a página.');
        }
    }

    /**
     * Inicializa dados de um novo jogo
     */
    initNewGame() {
        this.gameData = {
            heroes: this.createDefaultHeroes(),
            inventory: [],
            gold: 100,
            currentMission: null,
            chapter: 1,
            testMode: true
        };
    }

    /**
     * Cria os heróis padrão
     */
    createDefaultHeroes() {
        return [
            {
                id: 'warrior',
                name: 'Guerreiro',
                class: 'warrior',
                icon: '⚔️',
                hp: 120,
                maxHp: 120,
                pa: 3,
                maxPa: 3,
                atk: 25,
                def: 15,
                level: 1,
                xp: 0,
                deck: ['golpe', 'golpe_brutal', 'escudo', 'provocar', 'investida', 'furia']
            },
            {
                id: 'mage',
                name: 'Mago',
                class: 'mage',
                icon: '🔮',
                hp: 60,
                maxHp: 60,
                pa: 3,
                maxPa: 3,
                atk: 10,
                mag: 30,
                def: 5,
                level: 1,
                xp: 0,
                deck: ['missil_arcano', 'bola_de_fogo', 'cone_de_gelo', 'escudo_arcano', 'raio', 'meteoro']
            },
            {
                id: 'rogue',
                name: 'Ladino',
                class: 'rogue',
                icon: '🗡️',
                hp: 80,
                maxHp: 80,
                pa: 3,
                maxPa: 3,
                atk: 20,
                def: 8,
                crit: 15,
                level: 1,
                xp: 0,
                deck: ['punhalada', 'golpe_nas_costas', 'veneno', 'evasao', 'sombras', 'execucao']
            },
            {
                id: 'cleric',
                name: 'Clérigo',
                class: 'cleric',
                icon: '✨',
                hp: 90,
                maxHp: 90,
                pa: 3,
                maxPa: 3,
                atk: 15,
                mag: 25,
                def: 10,
                level: 1,
                xp: 0,
                deck: ['cura_menor', 'cura_em_grupo', 'bencao', 'luz_sagrada', 'purificar', 'ressurreicao']
            }
        ];
    }

    /**
     * Carrega assets essenciais
     */
    async loadEssentialAssets() {
        await this.delay(500);
    }

    /**
     * Configura event listeners globais
     */
    setupEventListeners() {
        eventBus.on('loadingProgress', ({ progress }) => {
            this.updateLoadingProgress(progress);
        });

        eventBus.on('stateChange', ({ from, to }) => {
            if (from && (from !== GameState.SPLASH && from !== GameState.LOADING)) {
                this.saveGame();
            }
        });
    }

    /**
     * Salva o jogo
     */
    async saveGame() {
        await this.saveManager.save(this.gameData);
        console.log('Game saved');
    }

    /**
     * Atualiza a barra de progresso
     */
    updateLoadingProgress(percent) {
        const progressBar = document.getElementById('loading-progress');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
    }

    /**
     * Atualiza o texto de carregamento
     */
    updateLoadingText(text) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Utilitário de delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
