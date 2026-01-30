/**
 * AssetLoader - Carregador de Assets
 * Gerencia carregamento assíncrono de modelos 3D e dados
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { eventBus } from './EventEmitter.js';

export class AssetLoader {
    constructor() {
        this.loadedAssets = new Map();
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedCount = 0;

        // Setup GLTF Loader com Draco
        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        // Texture loader
        this.textureLoader = new THREE.TextureLoader();
    }

    /**
     * Carrega todos os assets necessários
     * @param {object} manifest - Lista de assets a carregar
     */
    async loadAll(manifest) {
        const assets = [];

        // Coletar todos os assets
        if (manifest.models) {
            manifest.models.forEach(m => assets.push({ type: 'model', ...m }));
        }
        if (manifest.textures) {
            manifest.textures.forEach(t => assets.push({ type: 'texture', ...t }));
        }
        if (manifest.json) {
            manifest.json.forEach(j => assets.push({ type: 'json', ...j }));
        }

        this.totalAssets = assets.length;
        this.loadedCount = 0;

        // Carregar em paralelo
        const promises = assets.map(asset => this.loadAsset(asset));
        await Promise.all(promises);

        console.log(`Loaded ${this.loadedCount}/${this.totalAssets} assets`);
        return this.loadedAssets;
    }

    /**
     * Carrega um asset individual
     */
    async loadAsset(asset) {
        try {
            let result;

            switch (asset.type) {
                case 'model':
                    result = await this.loadModel(asset.url);
                    break;
                case 'texture':
                    result = await this.loadTexture(asset.url);
                    break;
                case 'json':
                    result = await this.loadJSON(asset.url);
                    break;
                default:
                    console.warn(`Unknown asset type: ${asset.type}`);
                    return;
            }

            this.loadedAssets.set(asset.id || asset.url, result);
            this.loadedCount++;
            this.updateProgress();

        } catch (error) {
            console.error(`Failed to load asset: ${asset.url}`, error);
            this.loadedCount++;
            this.updateProgress();
        }
    }

    /**
     * Carrega um modelo 3D
     */
    async loadModel(url) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => resolve(gltf),
                undefined,
                (error) => reject(error)
            );
        });
    }

    /**
     * Carrega uma textura
     */
    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => resolve(texture),
                undefined,
                (error) => reject(error)
            );
        });
    }

    /**
     * Carrega um arquivo JSON
     */
    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${url}`);
        }
        return response.json();
    }

    /**
     * Atualiza o progresso de carregamento
     */
    updateProgress() {
        this.loadingProgress = this.totalAssets > 0
            ? (this.loadedCount / this.totalAssets) * 100
            : 100;

        eventBus.emit('loadingProgress', {
            progress: this.loadingProgress,
            loaded: this.loadedCount,
            total: this.totalAssets
        });
    }

    /**
     * Retorna um asset carregado
     */
    get(id) {
        return this.loadedAssets.get(id);
    }

    /**
     * Clona um modelo 3D
     */
    cloneModel(id) {
        const original = this.loadedAssets.get(id);
        if (!original || !original.scene) {
            console.warn(`Model not found: ${id}`);
            return null;
        }
        return original.scene.clone();
    }

    /**
     * Libera recursos
     */
    dispose() {
        this.loadedAssets.forEach((asset, key) => {
            if (asset.scene) {
                asset.scene.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        });
        this.loadedAssets.clear();
        this.dracoLoader.dispose();
    }
}
