/**
 * SceneManager - Gerenciador de Cena 3D Base
 * Configura Three.js, luzes e câmera padrão
 */
import * as THREE from 'three';

export class SceneManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.clock = new THREE.Clock();
        this.mixers = [];

        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupLights();
        this.setupResize();
    }

    setupRenderer() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            // Bloquear resize durante XR para evitar crash WebGL
            if (this.renderer.xr.isPresenting) return;

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    add(object) { this.scene.add(object); }
    remove(object) { this.scene.remove(object); }

    update(dt) {
        this.mixers.forEach(mixer => mixer.update(dt));
    }
}
