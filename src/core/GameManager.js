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
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { missionManager } from '../systems/MissionManager.js'; // Singleton
import { ItemIDs, HeroIDs, EventNames, NPCIDs, ToastTypes } from '../data/GameConstants.js';

export class GameManager {
    constructor() {
        this.stateManager = new StateManager();
        this.saveManager = new SaveManager();
        this.assetLoader = new AssetLoader();
        this.mapManager = new MapManager(this);
        this.combatManager = new CombatManager(this);
        this.progressionSystem = new ProgressionSystem(this);
        this.gameMaster = new GameMaster(this);
        this.missionManager = missionManager; // Link singleton
        this.missionManager.init(this); // Initialize with reference


        // Inicializado após DOM
        this.arSceneManager = null;
        this.combatHUD = null;
        this.dialogueSystem = null;
        this.shopSystem = null;

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

            // Iniciar auto-save
            this.saveManager.startAutoSave(this);

            await this.loadEssentialAssets();
            this.setupEventListeners();

            // Managers dependentes de DOM
            this.arSceneManager = new ARSceneManager('three-canvas', this);
            this.combatHUD = new CombatHUD(this);
            this.dialogueSystem = new DialogueSystem(this);
            this.shopSystem = new ShopSystem(this);
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
                { itemId: ItemIDs.SWORD_BASIC, quantity: 1 },
                { itemId: ItemIDs.ARMOR_LEATHER, quantity: 1 },
                { itemId: ItemIDs.POTION_HEALTH_SMALL, quantity: 5 },
                { itemId: ItemIDs.POTION_HEALTH_MEDIUM, quantity: 2 },
                { itemId: ItemIDs.STAFF_ARCANE, quantity: 1 },
                { itemId: ItemIDs.SWORD_FLAME, quantity: 1 },
                { itemId: ItemIDs.DAGGER_SHADOW, quantity: 1 },
                { itemId: ItemIDs.RING_PROTECTION, quantity: 1 },
                { itemId: ItemIDs.LETTER_SEALED, quantity: 1 }
            ],
            gold: 100,
            fragments: 50,
            currentMission: null,
            chapter: 1,
            quests: {
                active: [],
                completed: [],
                progress: {},
                markerPositions: {}
            }
        };
    }

    createDefaultHeroes() {
        return [
            {
                id: HeroIDs.WARRIOR, name: 'Guerreiro', class: HeroIDs.WARRIOR, icon: '⚔️',
                hp: 120, maxHp: 120, pa: 3, maxPa: 3, atk: 25, def: 15, level: 1, xp: 0,
                deck: [
                    { name: 'Golpe', icon: '⚔️', cost: 1, damage: 15, description: 'Ataque básico' },
                    { name: 'Golpe Brutal', icon: '💥', cost: 2, damage: 30, description: '+30 dano' },
                    { name: 'Escudo', icon: '🛡️', cost: 1, defense: 10, description: '+10 defesa' },
                    { name: 'Investida', icon: '🏃', cost: 2, damage: 25, description: 'Avança e ataca' }
                ]
            },
            {
                id: HeroIDs.MAGE, name: 'Mago', class: HeroIDs.MAGE, icon: '🔮',
                hp: 60, maxHp: 60, pa: 3, maxPa: 3, atk: 10, mag: 30, def: 5, level: 1, xp: 0,
                deck: [
                    { name: 'Míssil Arcano', icon: '✨', cost: 1, damage: 20, description: 'Projétil mágico' },
                    { name: 'Bola de Fogo', icon: '🔥', cost: 2, damage: 40, aoe: true, description: 'Ataque em área' },
                    { name: 'Raio', icon: '⚡', cost: 2, damage: 35, description: 'Ataque elétrico' },
                    { name: 'Escudo Arcano', icon: '🔮', cost: 1, defense: 15, description: 'Barreira mágica' }
                ]
            },
            {
                id: HeroIDs.ROGUE, name: 'Ladino', class: HeroIDs.ROGUE, icon: '🗡️',
                hp: 80, maxHp: 80, pa: 3, maxPa: 3, atk: 20, def: 8, crit: 15, level: 1, xp: 0,
                deck: [
                    { name: 'Punhalada', icon: '🗡️', cost: 1, damage: 18, description: 'Ataque rápido' },
                    { name: 'Golpe Furtivo', icon: '👤', cost: 2, damage: 45, description: 'Crítico garantido' },
                    { name: 'Veneno', icon: '☠️', cost: 1, dot: 5, duration: 3, description: '5 dano/turno' },
                    { name: 'Evasão', icon: '💨', cost: 1, dodge: true, description: 'Esquiva próximo ataque' }
                ]
            },
            {
                id: HeroIDs.CLERIC, name: 'Clérigo', class: HeroIDs.CLERIC, icon: '✨',
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
        eventBus.on(EventNames.LOADING_PROGRESS, ({ progress }) => this.updateLoadingProgress(progress));

        eventBus.on(EventNames.STATE_CHANGE, ({ from, to, data }) => {
            if (from && from !== GameState.SPLASH) this.saveGame();

            // Iniciar combate ou interação AR
            if (to === GameState.COMBAT && data && data.missionId) {
                if (data.isNPC) {
                    console.log('Starting NPC Interaction:', data.npcId);
                    this.combatManager.clearEnemies();
                    // Passar dados para renderizar NPC
                    this.arSceneManager.startSession();
                    // Pequeno delay para garantir que a sessão AR iniciou antes de spawnar
                    setTimeout(() => {
                        // Passar o objeto 'data' inteiro como contexto (contém questId, objectiveId, etc)
                        this.arSceneManager.spawnNPC(data.npcId || NPCIDs.MAYOR, null, data);
                    }, 1000);
                } else if (data.isCollection) {
                    console.log('Starting Collection:', data.target);
                    this.combatManager.clearEnemies();
                    this.arSceneManager.startSession();
                    setTimeout(() => {
                        this.arSceneManager.spawnCollectionItem(data.target, data.modelPath, null, data);
                    }, 1000);
                } else if (data.isPuzzle) {
                    console.log('Starting Puzzle:', data.puzzleData);
                    this.combatManager.clearEnemies();
                    this.arSceneManager.startSession();
                    setTimeout(() => {
                        this.arSceneManager.spawnPuzzleElements(data.puzzleData, data);
                    }, 1000);
                } else {
                    // BUGFIX: Passar o objeto 'data' completo
                    this.combatManager.startEncounter(data);
                    this.arSceneManager.startSession();
                }
            }
        });

        // Evento de item coletado em AR
        eventBus.on('collectionItemSelected', ({ itemId, model, context }) => {
            console.log('Item collected:', itemId);
            this.showToast('Item coletado! +1', ToastTypes.SUCCESS);

            // Animar saída (ex: subir e sumir)
            if (model) {
                // Pequena animação manual ou via AnimationUtils se tivesse support
                // Por enquanto removemos logo após um delay
            }

            // Atualizar progresso
            if (context) {
                // Disparar evento de vitoria para reusar lógica do MapScreen (que ouve combat:victory)
                // Ou chamar missionManager diretamente. MapScreen ouve 'combat:victory'.
                // Vamos simular 'combat:victory' para manter consistência com MapScreen update
                eventBus.emit('combat:victory', {
                    missionId: context.missionId,
                    questId: context.questId,
                    objectiveId: context.objectiveId,
                    enemiesKilled: 1
                });
            }

            // Encerrar sessão após breve delay
            setTimeout(() => {
                this.arSceneManager.endSession();
                this.stateManager.setState(GameState.MAP);
            }, 1500);
        });

        // Evento de Puzzle Resolvido
        eventBus.on('puzzleSolved', ({ context }) => {
            console.log('Puzzle Solved!', context);
            this.showToast('Enigma Resolvido! ✨', ToastTypes.SUCCESS);

            if (context) {
                eventBus.emit('combat:victory', {
                    missionId: context.missionId,
                    questId: context.questId,
                    objectiveId: context.objectiveId,
                    enemiesKilled: 1 // Workaround para contar progresso de 1
                });
            }

            setTimeout(() => {
                this.arSceneManager.endSession();
                this.stateManager.setState(GameState.MAP);
            }, 2000);
        });

        // Toast messages
        eventBus.on(EventNames.SHOW_MESSAGE, ({ text, type }) => this.showToast(text, type));

        // Sair do modo AR ao terminar diálogo
        eventBus.on(EventNames.DIALOGUE_ENDED, () => {
            if (this.stateManager.isState(GameState.COMBAT)) {
                console.log('Dialogue ended. Exiting AR session...');
                this.arSceneManager.endSession();
                this.stateManager.setState(GameState.MAP);
            }
        });

        // Tratamento de fim de sessão AR (ex: botão voltar do navegador ou erro)
        eventBus.on(EventNames.AR_SESSION_ENDED, () => {
            console.log('AR Session Ended - Verifying State...');

            // Se o jogo achar que ainda está em COMBBATE, mas a sessão acabou
            // devemos voltar para uma tela segura (Mapa)
            if (this.stateManager.isState(GameState.COMBAT)) {
                console.warn('AR Session ended abruptly during combat. Returning to Map.');
                this.stateManager.setState(GameState.MAP);
                this.showToast('Modo AR finalizado', ToastTypes.INFO);
            }
        });

        // Auto-save em visibilitychange e pagehide
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveGame();
                console.log('App hidden: Game saved');
            }
        });

        window.addEventListener('pagehide', () => {
            this.saveGame();
        });
    }

    showToast(text, type = ToastTypes.INFO) {
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
