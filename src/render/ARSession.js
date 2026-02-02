/**
 * ARSession - Gerenciamento de Sessão WebXR
 * Mixin responsável pelo ciclo de vida da sessão AR
 */
import * as THREE from 'three';
import { eventBus } from '../core/EventEmitter.js';
import { EventNames } from '../data/GameConstants.js';

/**
 * Mixin para gerenciamento de sessão WebXR AR
 * Adiciona métodos de sessão a uma classe base
 */
export const ARSessionMixin = {
    /**
     * Configura o reticle para hit testing
     */
    setupAR() {
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0x00ff88 })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    },

    /**
     * Inicia uma sessão AR imersiva
     */
    async startSession() {
        if (this.isSessionActive) return;

        if (navigator.xr) {
            try {
                const session = await navigator.xr.requestSession('immersive-ar', {
                    requiredFeatures: ['hit-test'],
                    optionalFeatures: ['dom-overlay'],
                    domOverlay: { root: document.getElementById('app') }
                });

                session.addEventListener('end', () => this.onSessionEnded());

                this.renderer.xr.setReferenceSpaceType('local');
                await this.renderer.xr.setSession(session);

                this.currentSession = session;
                this.isSessionActive = true;
                this.hitTestSourceRequested = false;
                this.arenaPlaced = false;
                this.canRender = false;

                this.canvas.style.pointerEvents = 'auto';
                this.canvas.style.zIndex = '1';

                // Usar setAnimationLoop do XR
                this.renderer.setAnimationLoop((timestamp, frame) => {
                    if (frame) {
                        this.canRender = true;
                        this.render(timestamp, frame);
                    }
                });

                console.log('AR Session started');
                eventBus.emit(EventNames.AR_SESSION_STARTED);

            } catch (error) {
                console.error('Failed to start AR session:', error);
            }
        }
    },

    /**
     * Finaliza a sessão AR atual
     */
    async endSession() {
        if (this.currentSession) {
            await this.currentSession.end();
        }
    },

    /**
     * Handler chamado quando sessão termina
     */
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
        eventBus.emit(EventNames.AR_SESSION_ENDED);
    },

    /**
     * Loop de renderização AR com hit testing
     */
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
    }
};

/**
 * Aplica o mixin ARSession a uma classe
 * @param {Function} targetClass - Classe alvo
 */
export function applyARSessionMixin(targetClass) {
    Object.keys(ARSessionMixin).forEach(key => {
        targetClass.prototype[key] = ARSessionMixin[key];
    });
}
