/**
 * ModelLoader - Carregador de Modelos 3D
 * Gerencia carregamento, cache e clonagem de modelos GLB com Draco
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
    constructor() {
        // Configurar DRACOLoader (necessário para modelos comprimidos)
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(this.dracoLoader);

        this.cache = new Map();
        this.loadingPromises = new Map();
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
            // Goblins
            'goblin': '/models/enemies/goblin.glb',
            'goblin_archer': '/models/enemies/goblin.glb',
            'goblin_shaman': '/models/enemies/goblin.glb',
            'goblin_king': '/models/enemies/goblin_king.glb',
            // Undead
            'skeleton': '/models/enemies/skeleton.glb',
            'zombie': '/models/enemies/zombie.glb',
            'ghost': '/models/enemies/ghost.glb',
            'lich': '/models/enemies/lich.glb',
            // Beasts
            'wolf': '/models/enemies/wolf.glb',
            'dire_wolf': '/models/enemies/wolf.glb',
            'spider': '/models/enemies/spider.glb',
            // Demons
            'imp': '/models/enemies/imp.glb',
            'demon_soldier': '/models/enemies/demon.glb',
            // Default fallback
            'default': '/models/enemies/goblin.glb'
        };

        return modelMap[enemyType] || modelMap['default'];
    }
}
