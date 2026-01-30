/**
 * HPSpritePool - Pool de sprites de barra de HP
 * Reutiliza sprites, canvas e texturas em vez de criar/destruir
 */
import * as THREE from 'three';

/**
 * Dados de um sprite de HP no pool
 * @typedef {Object} HPSpriteData
 * @property {THREE.Sprite} sprite - Sprite 3D
 * @property {HTMLCanvasElement} canvas - Canvas para desenho
 * @property {CanvasRenderingContext2D} ctx - Contexto 2D
 * @property {THREE.CanvasTexture} texture - Textura do canvas
 * @property {THREE.SpriteMaterial} material - Material do sprite
 */

export class HPSpritePool {
    /**
     * Cria um pool de sprites de HP
     * @param {number} initialSize - Quantidade inicial de sprites
     */
    constructor(initialSize = 5) {
        /** @type {HPSpriteData[]} */
        this.pool = [];
        this.activeCount = 0;

        // Pré-criar sprites iniciais
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this._createSprite());
        }
    }

    /**
     * Cria um novo sprite com todos os componentes
     * @returns {HPSpriteData}
     * @private
     */
    _createSprite() {
        // Canvas para desenho da barra
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 48;

        const ctx = canvas.getContext('2d');

        // Textura baseada no canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Material do sprite
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        // Sprite 3D
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.5, 0.18, 1);
        sprite.renderOrder = 999;
        sprite.visible = false; // Começa invisível

        return { sprite, canvas, ctx, texture, material };
    }

    /**
     * Adquire um sprite do pool
     * @returns {HPSpriteData}
     */
    acquire() {
        this.activeCount++;

        if (this.pool.length > 0) {
            const data = this.pool.pop();
            data.sprite.visible = true;
            return data;
        }

        // Pool vazio - criar novo
        const data = this._createSprite();
        data.sprite.visible = true;
        return data;
    }

    /**
     * Devolve um sprite ao pool
     * @param {HPSpriteData} data - Dados do sprite
     */
    release(data) {
        if (!data) return;

        this.activeCount = Math.max(0, this.activeCount - 1);

        // Remover do parent se estiver na cena
        if (data.sprite.parent) {
            data.sprite.parent.remove(data.sprite);
        }

        // Resetar estado
        data.sprite.visible = false;
        data.sprite.position.set(0, 0, 0);

        // Limpar canvas
        data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.texture.needsUpdate = true;

        // Devolver ao pool
        this.pool.push(data);
    }

    /**
     * Configura um sprite para um inimigo específico
     * @param {HPSpriteData} data - Dados do sprite
     * @param {THREE.Object3D} model - Modelo do inimigo
     * @param {number} localHeight - Altura local para posicionar
     */
    attachToModel(data, model, localHeight) {
        data.sprite.position.set(0, localHeight + 0.3, 0);
        model.add(data.sprite);
        data.sprite.visible = true;
    }

    /**
     * Limpa o pool e libera recursos
     */
    dispose() {
        // Limpar ativos
        this.pool.forEach(data => {
            data.texture.dispose();
            data.material.dispose();
        });
        this.pool = [];
        this.activeCount = 0;
    }

    /**
     * Retorna estatísticas do pool
     * @returns {Object}
     */
    getStats() {
        return {
            available: this.pool.length,
            active: this.activeCount,
            total: this.pool.length + this.activeCount
        };
    }
}
