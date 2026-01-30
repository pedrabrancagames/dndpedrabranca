/**
 * ARSceneManager - Gerenciador de Realidade Aumentada
 * Classe orquestradora que compõe módulos especializados
 * 
 * Módulos:
 * - ARSession: Ciclo de vida da sessão WebXR
 * - ARInteraction: Raycasting e seleção de inimigos
 * - ARVisuals: Barras de HP e efeitos visuais
 * - AnimationUtils: Funções de easing e animações
 */
import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { ModelLoader } from './ModelLoader.js';
import { eventBus } from '../core/EventEmitter.js';

// Mixins
import { applyARSessionMixin } from './ARSession.js';
import { applyARInteractionMixin } from './ARInteraction.js';
import { applyARVisualsMixin } from './ARVisuals.js';

// Animações
import * as AnimationUtils from './AnimationUtils.js';

export class ARSceneManager extends SceneManager {
    constructor(canvasId, gameManager) {
        super(canvasId);
        this.gameManager = gameManager;
        this.modelLoader = new ModelLoader();

        // Sprites de HP (3D nativo)
        this.enemyHPSprites = new Map();

        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;

        this.isSessionActive = false;
        this.controller = null;
        this.currentSession = null;

        // Modelos spawned na cena
        this.spawnedModels = [];
        this.arenaPlaced = false;
        this.arenaPosition = null;
        this.cameraDirection = null;

        // Raycaster para seleção de inimigos
        this.raycaster = new THREE.Raycaster();
        this.selectedEnemy = null;

        // Config inicial do canvas
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';

        // Flag para controlar renderização
        this.canRender = false;

        this.setupAR();
        this.setupInteraction();
        this.setupEventListeners();
    }

    /**
     * Configura listeners de eventos do sistema
     */
    setupEventListeners() {
        eventBus.on('arSurfaceSelected', async (data) => {
            if (!this.arenaPlaced) {
                await this.placeArena(data.position, data.cameraDirection);
            }
        });

        // Feedback visual de dano
        eventBus.on('damageTaken', ({ targetId, amount }) => {
            this.flashDamage(targetId);
            this.updateEnemyHPBar(targetId);
        });

        // Animação de morte
        eventBus.on('enemyDied', ({ enemyId }) => {
            this.playDeathAnimation(enemyId);
        });
    }

    /**
     * Limpa a arena e todos os modelos
     */
    clearArena() {
        this.spawnedModels.forEach(model => {
            this.scene.remove(model);
        });
        this.spawnedModels = [];
        this.arenaPlaced = false;
        this.arenaPosition = null;
        this.selectedEnemy = null;
        this.clearEnemyLabels();
    }

    /**
     * Posiciona a arena de combate na superfície selecionada
     * @param {THREE.Vector3} position - Posição da arena
     * @param {THREE.Vector3} cameraDirection - Direção da câmera
     */
    async placeArena(position, cameraDirection) {
        this.arenaPosition = position.clone();
        this.cameraDirection = cameraDirection || new THREE.Vector3(0, 0, -1);
        this.arenaPlaced = true;

        console.log('Placing arena at:', position, 'direction:', this.cameraDirection);

        // Esconder hint de reticle
        const hint = document.getElementById('reticle-hint');
        if (hint) hint.style.display = 'none';

        // Spawnar inimigos do combate atual
        await this.spawnEnemies();

        eventBus.emit('arenaPlaced', { position });
    }

    /**
     * Spawna os inimigos do combate na cena AR
     * Posiciona em arco na direção que o usuário estava olhando
     */
    async spawnEnemies() {
        const combatManager = this.gameManager.combatManager;
        if (!combatManager || !combatManager.enemies) return;

        const enemies = combatManager.enemies;
        const numEnemies = enemies.length;

        // Calcular ângulo base a partir da direção da câmera
        const baseAngle = Math.atan2(this.cameraDirection.x, this.cameraDirection.z);

        // Espalhar inimigos em arco de 60° (30° para cada lado)
        const spreadAngle = Math.PI / 3;
        const startAngle = baseAngle - spreadAngle / 2;
        const angleStep = numEnemies > 1 ? spreadAngle / (numEnemies - 1) : 0;

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const modelPath = ModelLoader.getEnemyModelPath(enemy.type || 'goblin');

            try {
                const model = await this.modelLoader.load(modelPath);

                // Calcular posição baseada na direção da câmera
                const angle = numEnemies === 1 ? baseAngle : startAngle + (i * angleStep);
                const distance = 1.5;

                const x = this.arenaPosition.x + Math.sin(angle) * distance;
                const z = this.arenaPosition.z + Math.cos(angle) * distance;

                model.position.set(x, this.arenaPosition.y, z);

                // Iniciar com escala 0 para animação
                model.scale.set(0, 0, 0);

                // Rotacionar para olhar para o jogador
                const lookAtPos = new THREE.Vector3(
                    this.arenaPosition.x - this.cameraDirection.x,
                    this.arenaPosition.y,
                    this.arenaPosition.z - this.cameraDirection.z
                );
                model.lookAt(lookAtPos);

                this.scene.add(model);
                this.spawnedModels.push(model);

                // Guardar referência no objeto inimigo
                enemy.model = model;

                // Criar barra de HP flutuante (após animação)
                setTimeout(() => {
                    this.createEnemyHPBar(enemy, model);
                }, 500);

                // Animar entrada com delay escalonado (usando AnimationUtils)
                AnimationUtils.animateSpawn(model, {
                    targetScale: 0.5,
                    delay: i * 200
                });

                console.log(`Spawned ${enemy.name} at`, model.position);

            } catch (error) {
                console.error(`Failed to spawn ${enemy.name}:`, error);
            }
        }

        eventBus.emit('enemiesSpawned', { count: enemies.length });
    }

    /**
     * Executa animação de morte para um inimigo
     * @param {string} enemyId - ID do inimigo
     */
    playDeathAnimation(enemyId) {
        // Encontrar inimigo pelo ID
        const enemy = this.gameManager.combatManager.enemies.find(e => e.id === enemyId);
        if (!enemy?.model) return;

        // Esconder barra de HP
        const spriteData = this.enemyHPSprites.get(enemyId);
        if (spriteData) {
            spriteData.sprite.visible = false;
        }

        // Animar morte usando AnimationUtils
        AnimationUtils.animateDeath(enemy.model, {
            onComplete: () => {
                this.scene.remove(enemy.model);
                const index = this.spawnedModels.indexOf(enemy.model);
                if (index > -1) {
                    this.spawnedModels.splice(index, 1);
                }
            }
        });
    }
}

// Aplicar mixins para injetar funcionalidades
applyARSessionMixin(ARSceneManager);
applyARInteractionMixin(ARSceneManager);
applyARVisualsMixin(ARSceneManager);
