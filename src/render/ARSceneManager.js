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
import { getNPCData } from '../data/NPCDatabase.js';

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
        this.raycaster = new THREE.Raycaster();
        this.selectedEnemy = null;

        // Fila de spawn para NPCs quando a arena não está pronta
        this.pendingNPC = null;

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

        // Spawnar NPC pendente (se houver)
        if (this.pendingNPC) {
            console.log('Spawning pending NPC:', this.pendingNPC.id);
            await this.spawnNPC(this.pendingNPC.id, null, this.pendingNPC.context);
            this.pendingNPC = null;
        }

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

                // Animar entrada com delay escalonado
                // Escala base aumentada de 0.5 para 1.5 (3x) conforme feedback
                const baseScale = enemy.scale || 1.5;

                AnimationUtils.animateSpawn(model, {
                    targetScale: baseScale,
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
     * Spawna um NPC pacífico na cena
     * @param {string} npcId - ID do NPC no database
     * @param {THREE.Vector3} position - Posição relativa ao centro da arena (opcional)
     * @param {object} context - Contexto da missão (questId, objectiveId)
     */
    async spawnNPC(npcId, position = null, context = null) {
        const npcData = getNPCData(npcId);
        if (!npcData) {
            console.error(`NPC data not found: ${npcId}`);
            return;
        }

        try {
            const model = await this.modelLoader.load(npcData.model);

            // Configurar posição (padraõ: levemente à esquerda do centro)
            const spawnPos = position || new THREE.Vector3(-1, 0, 0); // Default offset

            // Ajustar para coordenadas do mundo (Arena + Offset)
            // Se a arena não estiver colocada, enfileira o spawn
            if (!this.arenaPlaced) {
                console.log('Arena not ready. Queuing NPC spawn:', npcId);
                this.pendingNPC = { id: npcId, context: context };

                // Mostrar dica para o usuário
                const hint = document.getElementById('reticle-hint');
                if (hint) {
                    hint.textContent = 'Toque em uma superfície para chamar o NPC';
                    hint.style.display = 'block';
                }
                return;
            }

            // Calcular posição real
            // Assumindo que o offset é relativo à direção da câmera
            const worldX = this.arenaPosition.x + spawnPos.x;
            const worldZ = this.arenaPosition.z + spawnPos.z;

            model.position.set(worldX, this.arenaPosition.y, worldZ);

            // Escala conforme DB
            const scale = npcData.scale || 1.0;
            model.scale.set(0, 0, 0); // Começa invisível para animação

            // Metadados para interação
            model.userData = {
                type: 'npc',
                id: npcId,
                name: npcData.name,
                context: context // Store context here
            };

            // Olhar para o jogador (câmera)
            const lookAtPos = new THREE.Vector3(
                this.arenaPosition.x - this.cameraDirection.x * 2,
                this.arenaPosition.y,
                this.arenaPosition.z - this.cameraDirection.z * 2
            );
            model.lookAt(lookAtPos);

            this.scene.add(model);
            this.spawnedModels.push(model);

            // Animar entrada
            AnimationUtils.animateSpawn(model, {
                targetScale: scale,
                delay: 0
            });

            console.log(`Spawned NPC ${npcData.name} at`, model.position);
            eventBus.emit('npcSpawned', { npc: npcData });

        } catch (error) {
            console.error(`Failed to spawn NPC ${npcId}:`, error);
        }
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
