/**
 * ARInteraction - Sistema de Interação AR
 * Mixin para raycasting e seleção de inimigos
 * Usa VectorPool para vetores temporários
 */
import * as THREE from 'three';
import { eventBus } from '../core/EventEmitter.js';
import { VectorPool } from './VectorPool.js';

/**
 * Mixin para interação e seleção em AR
 */
export const ARInteractionMixin = {
    /**
     * Configura o controller XR para interação
     */
    setupInteraction() {
        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', () => this.onSelect());
        this.scene.add(this.controller);
    },

    /**
     * Handler de seleção (tap na tela em AR)
     */
    onSelect() {
        if (this.reticle.visible && !this.arenaPlaced) {
            // Usar vetores do pool para decomposição de matriz
            const position = VectorPool.acquireVector3();
            const quaternion = VectorPool.acquireQuaternion();
            const scale = VectorPool.acquireVector3();

            this.reticle.matrix.decompose(position, quaternion, scale);

            // Capturar direção da câmera XR
            const xrCamera = this.renderer.xr.getCamera();
            const cameraPos = VectorPool.acquireVector3();
            xrCamera.getWorldPosition(cameraPos);

            // Direção do jogador para o reticle
            const direction = VectorPool.acquireVector3();
            direction.subVectors(position, cameraPos).normalize();
            direction.y = 0; // Manter no plano horizontal

            // Emitir evento com cópias dos vetores (pool será liberado)
            eventBus.emit('arSurfaceSelected', {
                matrix: this.reticle.matrix.clone(),
                position: position.clone(),
                quaternion: quaternion.clone(),
                cameraDirection: direction.clone()
            });

            // Devolver vetores ao pool
            VectorPool.releaseAll(position, quaternion, scale, cameraPos, direction);

        } else if (this.arenaPlaced) {
            // Tentar selecionar objeto (Inimigo ou NPC)
            this.trySelectObject();
        }
    },

    /**
     * Tenta selecionar um objeto interativo (Inimigo/NPC) via raycast
     */
    trySelectObject() {
        if (this.spawnedModels.length === 0) return;

        // Usar vetores do pool
        const controllerPos = VectorPool.acquireVector3();
        const controllerDir = VectorPool.acquireVector3(0, 0, -1);

        this.controller.getWorldPosition(controllerPos);
        controllerDir.applyQuaternion(this.controller.quaternion);

        // Configurar camera para raycast em sprites
        const xrCamera = this.renderer.xr.getCamera();
        this.raycaster.camera = xrCamera;
        this.raycaster.set(controllerPos, controllerDir);

        // Devolver vetores ao pool
        VectorPool.releaseAll(controllerPos, controllerDir);

        // Filtrar apenas meshes, ignorando sprites (barras de HP)
        const meshesToCheck = [];
        this.spawnedModels.forEach(model => {
            model.traverse(child => {
                if (child.isMesh) {
                    meshesToCheck.push(child);
                }
            });
        });

        // Checar interseção apenas com meshes
        const intersects = this.raycaster.intersectObjects(meshesToCheck, false);

        if (intersects.length > 0) {
            // Encontrar o modelo raiz
            let target = intersects[0].object;
            while (target.parent && !this.spawnedModels.includes(target)) {
                target = target.parent;
            }

            this.handleObjectSelection(target);
        }
    },

    /**
     * Processa a seleção de um objeto
     */
    handleObjectSelection(model) {
        // Desselecionar anterior
        if (this.selectedEnemy) {
            this.highlightModel(this.selectedEnemy, false);
        }

        this.selectedEnemy = model; // Mantemos o nome da var, mas pode ser NPC
        const isNPC = model.userData?.type === 'npc';
        const isCollection = model.userData?.type === 'collection';

        // Highlight com cor diferente
        const highlightColor = isNPC ? 0x00ff00 : (isCollection ? 0xffff00 : 0xff4444);
        this.highlightModel(model, true, highlightColor);

        if (isNPC) {
            console.log(`Selected NPC: ${model.userData.name}`);
            eventBus.emit('npcSelected', {
                npcId: model.userData.id,
                model: model,
                context: model.userData.context
            });
        } else if (isCollection) {
            console.log(`Selected Collection Item: ${model.userData.name}`);
            eventBus.emit('collectionItemSelected', {
                itemId: model.userData.id,
                model: model,
                context: model.userData.context
            });
        } else {
            // Lógica antiga de inimigo
            const enemies = this.gameManager.combatManager?.enemies || [];
            const enemy = enemies.find(e => e.model === model);

            if (enemy) {
                console.log(`Selected enemy: ${enemy.name}`);
                eventBus.emit('enemySelected', { enemy, model });
            }
        }
    },

    /**
     * Destaca ou remove destaque de um modelo
     * @param {THREE.Object3D} model - Modelo a destacar
     * @param {boolean} highlight - Se deve destacar ou remover
     */
    highlightModel(model, highlight, color = 0xff4444) {
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (highlight) {
                    child.material._originalEmissive = child.material.emissive?.clone();
                    child.material.emissive = new THREE.Color(color);
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
};

/**
 * Aplica o mixin ARInteraction a uma classe
 * @param {Function} targetClass - Classe alvo
 */
export function applyARInteractionMixin(targetClass) {
    Object.keys(ARInteractionMixin).forEach(key => {
        targetClass.prototype[key] = ARInteractionMixin[key];
    });
}
