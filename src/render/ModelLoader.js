/**
 * ModelLoader - Carregador de Modelos 3D
 * Gerencia carregamento, cache e clonagem de modelos GLB
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
    constructor() {
        this.loader = new GLTFLoader();
        this.cache = new Map(); // modelPath -> gltf
        this.loadingPromises = new Map(); // para evitar carregar duplicado
    }

    /**
     * Carrega um modelo GLB (com cache)
     * @param {string} path - Caminho do modelo (ex: '/models/enemies/goblin.glb')
     * @returns {Promise<THREE.Group>} Clone do modelo carregado
     */
    async load(path) {
        // Se já está em cache, retornar clone
        if (this.cache.has(path)) {
            return this.cloneModel(this.cache.get(path));
        }

        // Se já está carregando, aguardar
        if (this.loadingPromises.has(path)) {
            await this.loadingPromises.get(path);
            return this.cloneModel(this.cache.get(path));
        }

        // Carregar novo
        const loadPromise = new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.cache.set(path, gltf);
                    console.log(`Model loaded: ${path}`);
                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback (opcional)
                },
                (error) => {
                    console.error(`Failed to load model: ${path}`, error);
                    reject(error);
                }
            );
        });

        this.loadingPromises.set(path, loadPromise);
        await loadPromise;
        this.loadingPromises.delete(path);

        return this.cloneModel(this.cache.get(path));
    }

    /**
     * Clona um modelo GLTF (para permitir múltiplas instâncias)
     */
    cloneModel(gltf) {
        const clone = gltf.scene.clone();

        // Clonar materiais para evitar compartilhamento
        clone.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone();
            }
        });

        return clone;
    }

    /**
     * Pré-carrega uma lista de modelos
     */
    async preload(paths) {
        const promises = paths.map(path => this.load(path));
        await Promise.all(promises);
        console.log(`Preloaded ${paths.length} models`);
    }

    /**
     * Retorna o caminho do modelo baseado no tipo de inimigo
     */
    static getEnemyModelPath(enemyType) {
        const modelMap = {
            'goblin': '/models/enemies/goblin.glb',
            'goblin_archer': '/models/enemies/goblin.glb', // Mesmo modelo, pode trocar depois
            'orc': '/models/enemies/orc.glb',
            'skeleton': '/models/enemies/skeleton.glb',
            'zombie': '/models/enemies/zombie.glb',
            'wolf': '/models/enemies/wolf.glb',
            'spider': '/models/enemies/giant_spider.glb',
            'dragon': '/models/enemies/young_red_dragon.glb',
            'default': '/models/enemies/goblin.glb'
        };

        return modelMap[enemyType] || modelMap['default'];
    }
}
