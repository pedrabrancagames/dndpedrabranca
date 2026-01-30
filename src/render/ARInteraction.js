/**
 * ARInteraction - Sistema de Interação AR
 * Mixin para raycasting e seleção de inimigos
 */
import * as THREE from 'three';
import { eventBus } from '../core/EventEmitter.js';

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
            // Posicionar arena
            const position = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3();

            this.reticle.matrix.decompose(position, quaternion, scale);

            // Capturar direção da câmera XR
            const xrCamera = this.renderer.xr.getCamera();
            const cameraPos = new THREE.Vector3();
            xrCamera.getWorldPosition(cameraPos);

            // Direção do jogador para o reticle
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
    },

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

        // Configurar camera para raycast em sprites
        const xrCamera = this.renderer.xr.getCamera();
        this.raycaster.camera = xrCamera;
        this.raycaster.set(controllerPos, controllerDir);

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

            this.selectEnemy(target);
        }
    },

    /**
     * Seleciona um inimigo e destaca visualmente
     * @param {THREE.Object3D} model - Modelo do inimigo
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
    },

    /**
     * Destaca ou remove destaque de um modelo
     * @param {THREE.Object3D} model - Modelo a destacar
     * @param {boolean} highlight - Se deve destacar ou remover
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
