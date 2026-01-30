/**
 * ARVisuals - Efeitos Visuais AR
 * Mixin para barras de HP, efeitos de dano e partículas
 */
import * as THREE from 'three';

/**
 * Mixin para efeitos visuais em AR
 */
export const ARVisualsMixin = {
    /**
     * Cria uma barra de HP flutuante usando Sprite 3D
     * @param {Object} enemy - Dados do inimigo
     * @param {THREE.Object3D} model - Modelo 3D do inimigo
     */
    createEnemyHPBar(enemy, model) {
        // Calcular altura do modelo no espaço do mundo
        const box = new THREE.Box3().setFromObject(model);
        const worldHeight = box.max.y - box.min.y;

        // Converter para coordenadas locais
        const modelScale = model.scale.y || 1;
        const localHeight = worldHeight / modelScale;

        // Criar canvas para desenhar a barra
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 48;

        const ctx = canvas.getContext('2d');
        this.drawHPBar(ctx, enemy, canvas.width, canvas.height);

        // Criar textura e sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.5, 0.18, 1);

        // Posicionar acima da cabeça do modelo em coordenadas locais
        sprite.position.set(0, localHeight + 0.3, 0);
        sprite.renderOrder = 999;

        model.add(sprite);

        // Guardar referência
        this.enemyHPSprites.set(enemy.id, { sprite, canvas, ctx, texture, enemy });
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
     * Limpa todos os sprites de HP
     */
    clearEnemyLabels() {
        this.enemyHPSprites.forEach(({ sprite }) => {
            if (sprite.parent) {
                sprite.parent.remove(sprite);
            }
            sprite.material.map?.dispose();
            sprite.material.dispose();
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
                    const originalColor = child.material.color.clone();
                    child.material.color.set(0xff0000);

                    setTimeout(() => {
                        child.material.color.copy(originalColor);
                    }, 150);
                }
            });

            // Shake effect
            const originalPos = model.position.clone();
            const shakeIntensity = 0.05;

            const shake = () => {
                model.position.x = originalPos.x + (Math.random() - 0.5) * shakeIntensity;
                model.position.z = originalPos.z + (Math.random() - 0.5) * shakeIntensity;
            };

            const shakeInterval = setInterval(shake, 30);
            setTimeout(() => {
                clearInterval(shakeInterval);
                model.position.copy(originalPos);
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
