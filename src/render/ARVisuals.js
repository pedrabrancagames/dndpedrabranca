/**
 * ARVisuals - Efeitos Visuais AR
 * Mixin para barras de HP, efeitos de dano e partículas
 * Usa Object Pooling para reutilizar sprites de HP
 */
import * as THREE from 'three';
import { HPSpritePool } from './HPSpritePool.js';
import { VectorPool } from './VectorPool.js';

// Pool global de sprites de HP (lazy initialization)
let hpSpritePool = null;

function getHPSpritePool() {
    if (!hpSpritePool) {
        hpSpritePool = new HPSpritePool(10);
    }
    return hpSpritePool;
}

/**
 * Mixin para efeitos visuais em AR
 */
export const ARVisualsMixin = {
    /**
     * Cria uma barra de HP flutuante usando sprite do pool
     * @param {Object} enemy - Dados do inimigo
     * @param {THREE.Object3D} model - Modelo 3D do inimigo
     */
    createEnemyHPBar(enemy, model) {
        // Calcular altura do modelo usando vetores do pool
        const box = VectorPool.acquireBox3();
        box.setFromObject(model);
        const worldHeight = box.max.y - box.min.y;
        VectorPool.release(box);

        // Converter para coordenadas locais
        const modelScale = model.scale.y || 1;
        const localHeight = worldHeight / modelScale;

        // Adquirir sprite do pool
        const pool = getHPSpritePool();
        const spriteData = pool.acquire();

        // Desenhar barra de HP
        this.drawHPBar(spriteData.ctx, enemy, spriteData.canvas.width, spriteData.canvas.height);
        spriteData.texture.needsUpdate = true;

        // Posicionar e anexar ao modelo
        pool.attachToModel(spriteData, model, localHeight);

        // Guardar referência com dados do inimigo
        this.enemyHPSprites.set(enemy.id, { ...spriteData, enemy });
    },

    /**
     * Desenha a barra de HP no canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {Object} enemy - Dados do inimigo
     * @param {number} width - Largura do canvas
     * @param {number} height - Altura do canvas
     */
    drawHPBar(ctx, enemy, width, height) {
        const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);

        // Limpar canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(0, 0, width, height, 6);
        ctx.fill();

        // Nome
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, width / 2, 14);

        // Barra de fundo
        const barX = 8;
        const barY = 20;
        const barWidth = width - 16;
        const barHeight = 12;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.roundRect(barX, barY, barWidth, barHeight, 4);
        ctx.fill();

        // Barra de HP
        const fillWidth = barWidth * hpPercent;
        if (fillWidth > 0) {
            // Cor baseada no HP
            let color = '#22c55e'; // Verde
            if (hpPercent <= 0.25) {
                color = '#ef4444'; // Vermelho
            } else if (hpPercent <= 0.5) {
                color = '#f59e0b'; // Amarelo
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(barX, barY, fillWidth, barHeight, 4);
            ctx.fill();
        }

        // Texto HP
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${enemy.hp}/${enemy.maxHp}`, width / 2, 42);
    },

    /**
     * Atualiza a barra de HP de um inimigo
     * @param {string} enemyId - ID do inimigo
     */
    updateEnemyHPBar(enemyId) {
        const spriteData = this.enemyHPSprites.get(enemyId);
        if (!spriteData) return;

        const { ctx, canvas, texture, enemy } = spriteData;

        // Redesenhar
        this.drawHPBar(ctx, enemy, canvas.width, canvas.height);
        texture.needsUpdate = true;

        // Se morto, esconder sprite
        if (enemy.hp <= 0) {
            spriteData.sprite.visible = false;
        }
    },

    /**
     * Limpa todos os sprites de HP (devolve ao pool)
     */
    clearEnemyLabels() {
        const pool = getHPSpritePool();

        this.enemyHPSprites.forEach((spriteData) => {
            // Devolver ao pool em vez de destruir
            pool.release(spriteData);
        });

        this.enemyHPSprites.clear();
    },

    /**
     * Flash vermelho quando inimigo toma dano
     * @param {string} targetId - ID do inimigo que tomou dano
     */
    flashDamage(targetId) {
        const enemies = this.gameManager.combatManager?.enemies || [];
        const enemy = enemies.find(e => e.id === targetId);

        if (enemy && enemy.model) {
            const model = enemy.model;

            // Flash vermelho
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Usar VectorPool para cores temporárias
                    const originalColor = VectorPool.acquireColor();
                    originalColor.copy(child.material.color);
                    child.material.color.set(0xff0000);

                    setTimeout(() => {
                        child.material.color.copy(originalColor);
                        VectorPool.release(originalColor);
                    }, 150);
                }
            });

            // Shake effect - usar vetores do pool
            const originalPos = VectorPool.acquireVector3();
            originalPos.copy(model.position);
            const shakeIntensity = 0.05;

            const shake = () => {
                model.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity;
                model.position.z = originalPos.z + (Math.random() - 0.5) * shakeIntensity;
            };

            const shakeInterval = setInterval(shake, 30);
            setTimeout(() => {
                clearInterval(shakeInterval);
                model.position.copy(originalPos);
                VectorPool.release(originalPos);
            }, 200);
        }
    }
};

/**
 * Aplica o mixin ARVisuals a uma classe
 * @param {Function} targetClass - Classe alvo
 */
export function applyARVisualsMixin(targetClass) {
    Object.keys(ARVisualsMixin).forEach(key => {
        targetClass.prototype[key] = ARVisualsMixin[key];
    });
}
