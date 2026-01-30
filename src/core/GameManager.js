/**
 * GameManager - Orquestrador Principal do Jogo
 * Inicializa subsistemas e coordena o fluxo do jogo
 */

import { eventBus } from './EventEmitter.js';
import { StateManager, GameState } from './StateManager.js';
import { SaveManager } from './SaveManager.js';
import { AssetLoader } from './AssetLoader.js';

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

        // Referências para outros managers (serão criados depois)
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
            // Mostrar splash
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
                // Novo jogo - inicializar dados padrão
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

            // Configurar UI
            this.setupUI();
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
            testMode: true // Modo teste ativo por padrão para desenvolvimento
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
        // Por enquanto, apenas simular carregamento
        // Assets reais serão carregados conforme necessário
        await this.delay(500);
    }

    /**
     * Configura event listeners globais
     */
    setupEventListeners() {
        // Progresso de carregamento
        eventBus.on('loadingProgress', ({ progress }) => {
            this.updateLoadingProgress(progress);
        });

        // Mudança de estado
        eventBus.on('stateChange', ({ to }) => {
            // Auto-save ao sair de certas telas
            if (to === GameState.HOME) {
                this.saveGame();
            }
        });
    }

    /**
     * Configura a UI
     */
    setupUI() {
        // Botões do menu HOME
        this.bindButton('btn-combat', () => this.stateManager.setState(GameState.MAP));
        this.bindButton('btn-gm', () => this.showGM());
        this.bindButton('btn-heroes', () => this.showHeroes());
        this.bindButton('btn-inventory', () => this.stateManager.setState(GameState.INVENTORY));
        this.bindButton('btn-config', () => this.showConfig());

        // Botões de voltar
        this.bindButton('btn-map-back', () => this.stateManager.setState(GameState.HOME));
        this.bindButton('btn-heroes-back', () => this.stateManager.setState(GameState.HOME));
        this.bindButton('btn-inventory-back', () => this.stateManager.setState(GameState.HOME));
        this.bindButton('btn-config-back', () => this.stateManager.setState(GameState.HOME));
        this.bindButton('btn-gm-back', () => this.stateManager.setState(GameState.HOME));

        // Toggle de modo teste
        const testModeToggle = document.getElementById('toggle-test-mode');
        if (testModeToggle) {
            testModeToggle.checked = this.gameData.testMode;
            testModeToggle.addEventListener('change', (e) => {
                this.gameData.testMode = e.target.checked;
                this.saveGame();
            });
        }

        // Botões do HUD de combate
        this.bindButton('btn-pause', () => this.togglePause());
        this.bindButton('btn-exit-combat', () => this.exitCombat());
        this.bindButton('btn-resume', () => this.togglePause());
        this.bindButton('btn-exit-to-home', () => this.exitCombat());
        this.bindButton('btn-pass-turn', () => this.passTurn());
    }

    /**
     * Bind seguro de botão
     */
    bindButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    }

    /**
     * Mostra a tela de heróis
     */
    showHeroes() {
        this.stateManager.setState(GameState.HEROES);
        this.renderHeroes();
    }

    /**
     * Renderiza os heróis na grid
     */
    renderHeroes() {
        const grid = document.getElementById('heroes-grid');
        if (!grid) return;

        grid.innerHTML = this.gameData.heroes.map(hero => `
      <div class="hero-card ${hero.class}">
        <div class="hero-icon">${hero.icon}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-class">Nível ${hero.level}</div>
        <div class="stat-bar hp">
          <div class="fill" style="width: ${(hero.hp / hero.maxHp) * 100}%"></div>
        </div>
        <div class="stat-label">HP: ${hero.hp}/${hero.maxHp}</div>
      </div>
    `).join('');
    }

    /**
     * Mostra tela de configurações
     */
    showConfig() {
        this.stateManager.setState(GameState.CONFIG);

        // Atualizar toggle de modo teste
        const testModeToggle = document.getElementById('toggle-test-mode');
        if (testModeToggle) {
            testModeToggle.checked = this.gameData.testMode;
        }
    }

    /**
     * Mostra o Game Master
     */
    showGM() {
        this.stateManager.setState(GameState.GM);

        const gmText = document.getElementById('gm-text');
        if (gmText) {
            gmText.textContent = 'Bem-vindo, aventureiro! Rumores sombrios ecoam pelas ruas do bairro. ' +
                'Goblins foram avistados nas proximidades. Você está pronto para investigar?';
        }

        const gmActions = document.getElementById('gm-actions');
        if (gmActions) {
            gmActions.innerHTML = `
        <button onclick="game.stateManager.setState('map')">Investigar</button>
        <button onclick="game.stateManager.setState('home')">Voltar</button>
      `;
        }
    }

    /**
     * Toggle do menu de pausa
     */
    togglePause() {
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.toggle('hidden');
        }
    }

    /**
     * Sai do combate
     */
    exitCombat() {
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
        this.stateManager.setState(GameState.HOME);
    }

    /**
     * Passa o turno
     */
    passTurn() {
        eventBus.emit('passTurn');
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
