/**
 * ARSceneManager - Gerenciador de Realidade Aumentada
 * Lida com sessão WebXR, Hit Test, posicionamento, modelos 3D e interação
 */
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { SceneManager } from './SceneManager.js';
import { ModelLoader } from './ModelLoader.js';
import { eventBus } from '../core/EventEmitter.js';

export class ARSceneManager extends SceneManager {
    constructor(canvasId, gameManager) {
        super(canvasId);
        this.gameManager = gameManager;
        this.modelLoader = new ModelLoader();

        // Renderer para labels HTML (barras de HP)
        this.labelRenderer = null;
        this.enemyLabels = new Map();

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
        this.cameraDirection = null; // Direção que o usuário estava olhando ao posicionar

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

    setupAR() {
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        // Configurar CSS2DRenderer para labels HTML
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.labelRenderer.domElement.style.left = '0';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.id = 'enemy-labels';
        document.body.appendChild(this.labelRenderer.domElement);
    }

    setupInteraction() {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', () => this.onSelect());
        this.scene.add(this.controller);
    }

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
                this.canRender = false; // Apenas renderizar dentro do XR frame

                this.canvas.style.pointerEvents = 'auto';
                this.canvas.style.zIndex = '1';

                // Usar setAnimationLoop do XR - isso garante render apenas dentro do frame callback
                this.renderer.setAnimationLoop((timestamp, frame) => {
                    if (frame) {
                        this.canRender = true;
                        this.render(timestamp, frame);
                    }
                });

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
        this.canRender = false;

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
        this.selectedEnemy = null;
        this.clearEnemyLabels();
    }

    render(timestamp, frame) {
        // Só renderizar se tiver frame XR válido
        if (!frame || !this.canRender) return;

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

        const dt = this.clock.getDelta();
        this.update(dt);
        this.renderer.render(this.scene, this.camera);

        // Renderizar labels de HP
        if (this.labelRenderer && this.arenaPlaced) {
            this.labelRenderer.render(this.scene, this.camera);
        }
    }

    onSelect() {
        if (this.reticle.visible && !this.arenaPlaced) {
            // Posicionar arena
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();

            this.reticle.matrix.decompose(position, quaternion, scale);

            // Capturar direção da câmera XR (onde o usuário está olhando)
            const xrCamera = this.renderer.xr.getCamera();
            const cameraPos = new THREE.Vector3();
            xrCamera.getWorldPosition(cameraPos);

            // Direção do jogador para o reticle (para onde ele está olhando)
            const direction = new THREE.Vector3().subVectors(position, cameraPos).normalize();
            direction.y = 0; // Manter no plano horizontal

            eventBus.emit('arSurfaceSelected', {
                matrix: this.reticle.matrix.clone(),
                position,
                quaternion,
                cameraDirection: direction
            });
        } else if (this.arenaPlaced) {
            // Tentar selecionar inimigo
            this.trySelectEnemy();
        }
    }

    /**
     * Tenta selecionar um inimigo via raycast do controller
     */
    trySelectEnemy() {
        if (this.spawnedModels.length === 0) return;

        // Pegar posição do controller
        const controllerPos = new THREE.Vector3();
        const controllerDir = new THREE.Vector3(0, 0, -1);

        this.controller.getWorldPosition(controllerPos);
        controllerDir.applyQuaternion(this.controller.quaternion);

        this.raycaster.set(controllerPos, controllerDir);

        // Checar interseção com modelos
        const intersects = this.raycaster.intersectObjects(this.spawnedModels, true);

        if (intersects.length > 0) {
            // Encontrar o modelo raiz (pai do mesh intersectado)
            let target = intersects[0].object;
            while (target.parent && !this.spawnedModels.includes(target)) {
                target = target.parent;
            }

            this.selectEnemy(target);
        }
    }

    /**
     * Seleciona um inimigo e destaca visualmente
     */
    selectEnemy(model) {
        // Desselecionar anterior
        if (this.selectedEnemy) {
            this.highlightModel(this.selectedEnemy, false);
        }

        this.selectedEnemy = model;
        this.highlightModel(model, true);

        // Encontrar dados do inimigo
        const enemies = this.gameManager.combatManager?.enemies || [];
        const enemy = enemies.find(e => e.model === model);

        if (enemy) {
            console.log(`Selected enemy: ${enemy.name}`);
            eventBus.emit('enemySelected', { enemy, model });
        }
    }

    /**
     * Destaca ou remove destaque de um modelo
     */
    highlightModel(model, highlight) {
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (highlight) {
                    child.material._originalEmissive = child.material.emissive?.clone();
                    child.material.emissive = new THREE.Color(0xff4444);
                    child.material.emissiveIntensity = 0.5;
                } else {
                    if (child.material._originalEmissive) {
                        child.material.emissive = child.material._originalEmissive;
                    } else {
                        child.material.emissive = new THREE.Color(0x000000);
                    }
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }

    /**
     * Flash vermelho quando inimigo toma dano
     */
    flashDamage(targetId) {
        const enemies = this.gameManager.combatManager?.enemies || [];
        const enemy = enemies.find(e => e.id === targetId);

        if (enemy && enemy.model) {
            const model = enemy.model;

            // Flash vermelho
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const originalColor = child.material.color.clone();
                    child.material.color.set(0xff0000);

                    setTimeout(() => {
                        child.material.color.copy(originalColor);
                    }, 150);
                }
            });

            // Shake effect
            const originalPos = model.position.clone();
            const shakeIntensity = 0.05;

            const shake = () => {
                model.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity;
                model.position.z = originalPos.z + (Math.random() - 0.5) * shakeIntensity;
            };

            const shakeInterval = setInterval(shake, 30);
            setTimeout(() => {
                clearInterval(shakeInterval);
                model.position.copy(originalPos);
            }, 200);
        }
    }

    /**
     * Posiciona a arena de combate na superfície selecionada
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
        const spreadAngle = Math.PI / 3; // 60 graus total
        const startAngle = baseAngle - spreadAngle / 2;
        const angleStep = numEnemies > 1 ? spreadAngle / (numEnemies - 1) : 0;

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            const modelPath = ModelLoader.getEnemyModelPath(enemy.type || 'goblin');

            try {
                const model = await this.modelLoader.load(modelPath);

                // Calcular posição baseada na direção da câmera
                const angle = numEnemies === 1 ? baseAngle : startAngle + (i * angleStep);
                const distance = 1.5; // 1.5m do ponto de arena

                const x = this.arenaPosition.x + Math.sin(angle) * distance;
                const z = this.arenaPosition.z + Math.cos(angle) * distance;

                model.position.set(x, this.arenaPosition.y, z);
                model.scale.set(0.5, 0.5, 0.5);

                // Rotacionar para olhar para o jogador (direção oposta)
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

                // Criar barra de HP flutuante
                this.createEnemyHPBar(enemy, model);

                console.log(`Spawned ${enemy.name} at`, model.position);

            } catch (error) {
                console.error(`Failed to spawn ${enemy.name}:`, error);
            }
        }

        eventBus.emit('enemiesSpawned', { count: enemies.length });
    }

    /**
     * Cria uma barra de HP flutuante para um inimigo
     */
    createEnemyHPBar(enemy, model) {
        // Container da label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'enemy-hp-label';
        labelDiv.innerHTML = `
            <div class="enemy-name">${enemy.name}</div>
            <div class="enemy-hp-bar-container">
                <div class="enemy-hp-fill" style="width: 100%"></div>
            </div>
            <div class="enemy-hp-text">${enemy.hp}/${enemy.maxHp}</div>
        `;

        // Criar objeto CSS2D
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 0.8, 0); // Acima do modelo
        model.add(label);

        // Guardar referência
        this.enemyLabels.set(enemy.id, { label, element: labelDiv, enemy });
    }

    /**
     * Atualiza a barra de HP de um inimigo
     */
    updateEnemyHPBar(enemyId) {
        const labelData = this.enemyLabels.get(enemyId);
        if (!labelData) return;

        const { element, enemy } = labelData;
        const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

        const fill = element.querySelector('.enemy-hp-fill');
        const text = element.querySelector('.enemy-hp-text');

        if (fill) {
            fill.style.width = `${hpPercent}%`;

            // Mudar cor baseado no HP
            if (hpPercent <= 25) {
                fill.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
            } else if (hpPercent <= 50) {
                fill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            }
        }

        if (text) {
            text.textContent = `${enemy.hp}/${enemy.maxHp}`;
        }

        // Se morto, esconder
        if (enemy.hp <= 0) {
            element.style.display = 'none';
        }
    }

    /**
     * Limpa todas as labels de HP
     */
    clearEnemyLabels() {
        this.enemyLabels.forEach(({ label }) => {
            if (label.parent) {
                label.parent.remove(label);
            }
        });
        this.enemyLabels.clear();
    }
}
