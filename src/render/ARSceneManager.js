/**
 * ARSceneManager - Gerenciador de Realidade Aumentada
 * Lida com sessão WebXR, Hit Test e posicionamento
 */
import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { eventBus } from '../core/EventEmitter.js';

export class ARSceneManager extends SceneManager {
    constructor(canvasId, gameManager) {
        super(canvasId);
        this.gameManager = gameManager;

        this.reticle = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;

        this.isSessionActive = false;
        this.controller = null;
        this.currentSession = null;

        // Config inicial do canvas para não bloquear UI
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';

        this.setupAR();
        this.setupInteraction();
    }

    setupAR() {
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
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

                // Ativar interação no canvas
                this.canvas.style.pointerEvents = 'auto';
                this.canvas.style.zIndex = '1'; // Abaixo do HUD (z-index 100+), mas visível

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

        // Resetar canvas
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';

        console.log('AR Session ended');
        eventBus.emit('arSessionEnded');
    }

    render(timestamp, frame) {
        if (frame) {
            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const session = this.renderer.xr.getSession();

            if (this.hitTestSourceRequested === false) {
                session.requestReferenceSpace('viewer').then((referenceSpace) => {
                    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                        this.hitTestSource = source;
                    });
                });

                this.hitTestSourceRequested = true;
            }

            if (this.hitTestSource) {
                const hitTestResults = frame.getHitTestResults(this.hitTestSource);

                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                } else {
                    this.reticle.visible = false;
                }
            }
        }

        if (!this.renderer.xr.isPresenting) return;

        const dt = this.clock.getDelta();
        this.update(dt);
        this.renderer.render(this.scene, this.camera);
    }

    onSelect() {
        if (this.reticle.visible) {
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
}
