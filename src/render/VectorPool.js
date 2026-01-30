/**
 * VectorPool - Pool de vetores Three.js reutilizáveis
 * Reduz criação de Vector3 e Quaternion temporários
 */
import * as THREE from 'three';
import { ObjectPool } from './ObjectPool.js';

// Pool global de Vector3
const vector3Pool = new ObjectPool(
    () => new THREE.Vector3(),
    (v) => v.set(0, 0, 0),
    20
);

// Pool global de Quaternion
const quaternionPool = new ObjectPool(
    () => new THREE.Quaternion(),
    (q) => q.identity(),
    10
);

// Pool global de Color
const colorPool = new ObjectPool(
    () => new THREE.Color(),
    (c) => c.set(0x000000),
    10
);

// Pool global de Box3
const box3Pool = new ObjectPool(
    () => new THREE.Box3(),
    (b) => b.makeEmpty(),
    5
);

/**
 * API do VectorPool
 */
export const VectorPool = {
    /**
     * Adquire um Vector3 do pool
     * @param {number} x - Valor X inicial (opcional)
     * @param {number} y - Valor Y inicial (opcional)
     * @param {number} z - Valor Z inicial (opcional)
     * @returns {THREE.Vector3}
     */
    acquireVector3(x = 0, y = 0, z = 0) {
        const v = vector3Pool.acquire();
        return v.set(x, y, z);
    },

    /**
     * Adquire um Quaternion do pool
     * @returns {THREE.Quaternion}
     */
    acquireQuaternion() {
        return quaternionPool.acquire();
    },

    /**
     * Adquire uma Color do pool
     * @param {number} color - Cor inicial (opcional)
     * @returns {THREE.Color}
     */
    acquireColor(color = 0x000000) {
        const c = colorPool.acquire();
        return c.set(color);
    },

    /**
     * Adquire um Box3 do pool
     * @returns {THREE.Box3}
     */
    acquireBox3() {
        return box3Pool.acquire();
    },

    /**
     * Devolve um objeto ao pool apropriado
     * @param {THREE.Vector3|THREE.Quaternion|THREE.Color|THREE.Box3} obj
     */
    release(obj) {
        if (!obj) return;

        if (obj.isVector3) {
            vector3Pool.release(obj);
        } else if (obj.isQuaternion) {
            quaternionPool.release(obj);
        } else if (obj.isColor) {
            colorPool.release(obj);
        } else if (obj.isBox3) {
            box3Pool.release(obj);
        }
    },

    /**
     * Devolve múltiplos objetos ao pool
     * @param {...(THREE.Vector3|THREE.Quaternion|THREE.Color|THREE.Box3)} objs
     */
    releaseAll(...objs) {
        objs.forEach(obj => this.release(obj));
    },

    /**
     * Retorna estatísticas de todos os pools
     * @returns {Object}
     */
    getStats() {
        return {
            vector3: vector3Pool.getStats(),
            quaternion: quaternionPool.getStats(),
            color: colorPool.getStats(),
            box3: box3Pool.getStats()
        };
    }
};
