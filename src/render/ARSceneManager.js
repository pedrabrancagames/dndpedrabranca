/**
 * ARSceneManager - Gerenciador de Realidade Aumentada
 * Lida com sessão WebXR, Hit Test, posicionamento e modelos 3D
 */
import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { ModelLoader } from './ModelLoader.js';
import { eventBus } from '../core/EventEmitter.js';

export class ARSceneManager extends SceneManager {
    constructor(canvasId, gameManager) {
        super(canvasId);
        this.gameManager = gameManager;
        this.modelLoader = new ModelLoader();

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

        // Config inicial do canvas
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';

        this.setupAR();
        this.setupInteraction();
        this.setupEventListeners();
    }

    setupAR() {
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    setupInteraction() {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', () => this.onSelect());
        this.scene.add(this.controller);
    }

    setupEventListeners() {
        eventBus.on('arSurfaceSelected', async (data) => {
            if (!this.arenaPlaced) {
                await this.placeArena(data.position);
            }
        });
    }

    async startSession() {
        if (this.isSessionActive) return;

        if (navigator.xr) {
            try {
                const session = await navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['hit-test'],
                    optionalFeatures: ['dom-overlay'],
                    domOverlay: { root: document.getElementById('combat-hud') }
                });

                session.addEventListener('end', () => this.onSessionEnded());

                this.renderer.xr.setReferenceSpaceType('local');
                await this.renderer.xr.setSession(session);

                this.currentSession = session;
                this.isSessionActive = true;
                this.hitTestSourceRequested = false;
                this.arenaPlaced = false;

                this.canvas.style.pointerEvents = 'auto';
                this.canvas.style.zIndex = '1';

                this.renderer.setAnimationLoop((timestamp, frame) => this.render(timestamp, frame));

                console.log('AR Session started');
                eventBus.emit('arSessionStarted');

            } catch (error) {
                console.error('Failed to start AR session:', error);
            }
        }
    }

    async endSession() {
        if (this.currentSession) {
            await this.currentSession.end();
        }
    }

    onSessionEnded() {
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        this.isSessionActive = false;
        this.currentSession = null;

        this.renderer.setAnimationLoop(null);

        // Limpar modelos spawned
        this.clearArena();

        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';

        console.log('AR Session ended');
        eventBus.emit('arSessionEnded');
    }

    clearArena() {
        this.spawnedModels.forEach(model => {
            this.scene.remove(model);
        });
        this.spawnedModels = [];
        this.arenaPlaced = false;
        this.arenaPosition = null;
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if (this.hitTestSourceRequested === false) {
                session.requestReferenceSpace('viewer').then((viewerSpace) => {
                    session.requestHitTestSource({ space: viewerSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });

                this.hitTestSourceRequested = true;
            }

            if (this.hitTestSource && !this.arenaPlaced) {
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            } else {
                this.reticle.visible = false;
            }
        }

        if (!this.renderer.xr.isPresenting) return;

        const dt = this.clock.getDelta();
        this.update(dt);
        this.renderer.render(this.scene, this.camera);
    }

    onSelect() {
        if (this.reticle.visible && !this.arenaPlaced) {
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();

            this.reticle.matrix.decompose(position, quaternion, scale);

            eventBus.emit('arSurfaceSelected', {
                matrix: this.reticle.matrix.clone(),
                position,
                quaternion
            });
        }
    }

    /**
     * Posiciona a arena de combate na superfície selecionada
     */
    async placeArena(position) {
        this.arenaPosition = position.clone();
        this.arenaPlaced = true;

        console.log('Placing arena at:', position);

        // Esconder hint de reticle
        const hint = document.getElementById('reticle-hint');
        if (hint) hint.style.display = 'none';

        // Spawnar inimigos do combate atual
        await this.spawnEnemies();

        eventBus.emit('arenaPlaced', { position });
    }

    /**
     * Spawna os inimigos do combate na cena AR
     */
    async spawnEnemies() {
        const combatManager = this.gameManager.combatManager;
        if (!combatManager || !combatManager.enemies) return;

        const enemies = combatManager.enemies;
        const spacing = 0.5; // Espaçamento entre inimigos (metros)

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const modelPath = ModelLoader.getEnemyModelPath(enemy.type || 'goblin');

            try {
                const model = await this.modelLoader.load(modelPath);

                // Posicionar em semicírculo à frente do jogador
                const angle = (Math.PI / 4) + (i * Math.PI / 4); // 45° a 135°
                const distance = 1.5; // 1.5m do centro

                const x = this.arenaPosition.x + Math.cos(angle) * distance;
                const z = this.arenaPosition.z + Math.sin(angle) * distance;

                model.position.set(x, this.arenaPosition.y, z);
                model.scale.set(0.5, 0.5, 0.5); // Escala para AR (ajustar conforme modelo)

                // Rotacionar para olhar para o centro
                model.lookAt(this.arenaPosition);

                this.scene.add(model);
                this.spawnedModels.push(model);

                // Guardar referência no objeto inimigo
                enemy.model = model;

                console.log(`Spawned ${enemy.name} at`, model.position);

            } catch (error) {
                console.error(`Failed to spawn ${enemy.name}:`, error);
            }
        }

        eventBus.emit('enemiesSpawned', { count: enemies.length });
    }
}
