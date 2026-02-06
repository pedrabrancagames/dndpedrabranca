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
            // Goblins e Goblinoides
            'goblin': '/models/enemies/goblin.glb',
            'goblin_archer': '/models/enemies/goblin.glb',
            'goblin_shaman': '/models/enemies/goblin.glb',
            'goblin_king': '/models/enemies/goblin.glb',
            'hobgoblin': '/models/enemies/hobgoblin.glb',
            'bugbear': '/models/enemies/bugbear.glb',
            // Humanoides
            'kobold': '/models/enemies/kobold.glb',
            'bandit': '/models/enemies/bandit.glb',
            'gnoll': '/models/enemies/gnoll.glb',
            'orc': '/models/enemies/orc.glb',
            'drow': '/models/enemies/drow.glb',
            // Mortos-vivos
            'skeleton': '/models/enemies/skeleton.glb',
            'zombie': '/models/enemies/zombie.glb',
            'ghoul': '/models/enemies/ghoul.glb',
            'wight': '/models/enemies/wight.glb',
            'specter': '/models/enemies/specter.glb',
            'shadow': '/models/enemies/shadow.glb',
            'mummy': '/models/enemies/mummy.glb',
            'vampire_spawn': '/models/enemies/vampire_spawn.glb',
            'ghost': '/models/enemies/specter.glb',
            'lich': '/models/enemies/lich.glb',
            // Bestas
            'wolf': '/models/enemies/wolf.glb',
            'dire_wolf': '/models/enemies/wolf.glb',
            'werewolf': '/models/enemies/werewolf.glb',
            'giant_spider': '/models/enemies/giant_spider.glb',
            'spider': '/models/enemies/giant_spider.glb',
            'giant_rat': '/models/enemies/giant_rat.glb',
            'giant_bat': '/models/enemies/giant_bat.glb',
            'giant_snake': '/models/enemies/giant_snake.glb',
            'brown_bear': '/models/enemies/brown_bear.glb',
            'owlbear': '/models/enemies/owlbear.glb',
            // Demônios
            'imp': '/models/enemies/imp.glb',
            'quasit': '/models/enemies/quasit.glb',
            'dretch': '/models/enemies/dretch.glb',
            'balor': '/models/enemies/balor.glb',
            'demon_soldier': '/models/enemies/dretch.glb',
            // Elementais
            'fire_elemental': '/models/enemies/fire_elemental.glb',
            'water_elemental': '/models/enemies/water_elemental.glb',
            'earth_elemental': '/models/enemies/earth_elemental.glb',
            'air_elemental': '/models/enemies/air_elemental.glb',
            // Constructos
            'animated_armor': '/models/enemies/animated_armor.glb',
            'stone_golem': '/models/enemies/stone_golem.glb',
            'iron_golem': '/models/enemies/iron_golem.glb',
            // Gigantes
            'ogre': '/models/enemies/ogre.glb',
            'troll': '/models/enemies/troll.glb',
            'hill_giant': '/models/enemies/hill_giant.glb',
            'frost_giant': '/models/enemies/frost_giant.glb',
            'fire_giant': '/models/enemies/fire_giant.glb',
            'storm_giant': '/models/enemies/storm_giant.glb',
            // Aberrações
            'beholder': '/models/enemies/beholder.glb',
            'gazer': '/models/enemies/gazer.glb',
            'mind_flayer': '/models/enemies/mind_flayer.glb',
            'aboleth': '/models/enemies/Aboleth.glb',
            // Gosmas
            'gelatinous_cube': '/models/enemies/gelatinous_cube.glb',
            // Monstrosidades
            'mimic': '/models/enemies/mimic.glb',
            // Dragões
            'young_red_dragon': '/models/enemies/young_red_dragon.glb',
            'young_black_dragon': '/models/enemies/young_black_dragon.glb',
            'young_white_dragon': '/models/enemies/young_white_dragon.glb',
            // Default fallback
            'default': '/models/enemies/goblin.glb'
        };

        return modelMap[enemyType] || modelMap['default'];
    }
}
