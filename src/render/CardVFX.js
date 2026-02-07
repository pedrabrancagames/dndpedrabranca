/**
 * CardVFX - Sistema de Efeitos Visuais para Cartas
 * Gerencia efeitos visuais quando cartas são jogadas
 * Usa CSS + Canvas 2D para performance otimizada
 */
import { eventBus } from '../core/EventEmitter.js';

// Pool de elementos para reutilização
class VFXPool {
    constructor(createElement, maxSize = 20) {
        this.pool = [];
        this.createElement = createElement;
        this.maxSize = maxSize;
    }

    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createElement();
    }

    release(element) {
        if (this.pool.length < this.maxSize) {
            element.style.display = 'none';
            this.pool.push(element);
        } else {
            element.remove();
        }
    }
}

/**
 * Sistema principal de VFX para cartas
 */
export class CardVFXSystem {
    constructor() {
        this.container = null;
        this.particlePool = null;
        this.slashPool = null;
        this.init();
    }

    init() {
        // Container VFX - deve estar DENTRO de #app para funcionar com DOM Overlay do WebXR
        this.container = document.getElementById('vfx-overlay');
        if (!this.container) {
            // Fallback: criar dinamicamente dentro de #app
            this.container = document.createElement('div');
            this.container.id = 'vfx-overlay';
            const app = document.getElementById('app') || document.body;
            app.appendChild(this.container);
        }

        // Pools de elementos
        this.particlePool = new VFXPool(() => this.createParticle(), 80); // Aumentado para 80
        this.slashPool = new VFXPool(() => this.createSlashElement(), 15);

        // Registrar no eventBus
        eventBus.on('cardPlayed', (data) => this.onCardPlayed(data));

        console.log('[VFX] System initialized via CardVFX.js (VFX 2.0)');
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'vfx-particle';
        this.container.appendChild(particle);
        return particle;
    }

    createSlashElement() {
        const slash = document.createElement('div');
        slash.className = 'vfx-slash';
        this.container.appendChild(slash);
        return slash;
    }

    // ===== UTILITÁRIOS VISUAIS =====

    /**
     * Treme a tela (na verdade, o container do jogo)
     * @param {string|number} intensity - 'small', 'medium', 'large' ou duração em ms (legado)
     */
    screenShake(intensity = 'medium') {
        const app = document.getElementById('app');
        if (!app) return;

        // Suporte a legado (se for número, converte para medium com duração customizada, mas CSS handle duration)
        // Para simplificar, mapeamos números para intensities
        if (typeof intensity === 'number') {
            if (intensity < 200) intensity = 'small';
            else if (intensity < 400) intensity = 'medium';
            else intensity = 'large';
        }

        // Remover classes anteriores
        app.classList.remove('vfx-shake-small', 'vfx-shake-medium', 'vfx-shake-large');

        // Forçar reflow
        void app.offsetWidth;

        // Adicionar nova classe
        app.classList.add(`vfx-shake-${intensity}`);

        // Remover após animação (max 500ms definidos no CSS)
        setTimeout(() => {
            app.classList.remove(`vfx-shake-${intensity}`);
        }, 500);
    }

    /**
     * Pisca a tela com cor
     */
    flashScreen(color = '#ffffff', duration = 200) {
        const flash = document.createElement('div');
        flash.className = 'vfx-flash-white';
        // Se cor for diferente de branco, aplicamos style
        if (color !== '#ffffff' && color !== 'white') {
            flash.style.backgroundColor = color;
            flash.style.mixBlendMode = 'normal'; // Reset blend mode para cores
            flash.style.opacity = '0.5';
        }

        const parent = document.getElementById('app') || document.body;
        parent.appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, duration);
    }

    /**
     * Cria explosão de partículas (Unificado)
     * Suporta:
     * 1. spawnParticles(x, y, color, count, type) - Nova
     * 2. spawnParticles(count, options) - Legado/Existente
     */
    spawnParticles(arg1, arg2, arg3, arg4, arg5) {
        let x, y, color, count, type;
        let options = {};

        // Detectar assinatura
        if (typeof arg1 === 'number' && (typeof arg2 === 'object' || arg2 === undefined)) {
            // Assinatura Legado: (count, options)
            count = arg1;
            options = arg2 || {};
            x = '50%'; // Padrão centro
            y = '50%';
            // Se colors for array, pegamos um aleatório ou o primeiro para base
            color = options.colors ? options.colors[0] : '#ffffff';

            // Mapear opções legadas para tipos novos
            if (options.direction === 'up') type = 'float';
            else if (options.style === 'bubble') type = 'float';
            else type = 'explode';
        } else {
            // Assinatura Nova: (x, y, color, count, type)
            x = arg1;
            y = arg2;
            color = arg3;
            count = arg4 || 20;
            type = arg5 || 'explode';

            options = {
                colors: [color],
                spread: 100,
                duration: 600
            };
        }

        for (let i = 0; i < count; i++) {
            const p = this.particlePool.acquire();

            // Escolher cor aleatória se houver lista
            const pColor = options.colors ? options.colors[Math.floor(Math.random() * options.colors.length)] : color;

            // Reset
            p.style.animation = 'none';
            p.offsetHeight; // Reflow
            p.style.animation = '';

            // Configuração
            p.style.display = 'block';
            p.style.color = pColor;
            p.style.backgroundColor = pColor;
            p.style.boxShadow = `0 0 6px ${pColor}`; // Glow

            p.style.left = typeof x === 'number' ? `${x}px` : x;
            p.style.top = typeof y === 'number' ? `${y}px` : y;

            // Variação aleatória
            const spread = options.spread || 120; // Aumentado spread padrão
            const angle = Math.random() * 360;
            const dist = 30 + Math.random() * spread;
            let tx, ty;

            if (options.direction === 'up' || type === 'float') {
                tx = (Math.random() - 0.5) * spread;
                ty = -dist - 50;
                type = 'float'; // Forçar tipo float
            } else if (options.direction === 'out') {
                tx = Math.cos(angle * Math.PI / 180) * dist;
                ty = Math.sin(angle * Math.PI / 180) * dist;
            } else if (options.direction === 'orbit') {
                tx = Math.cos(angle * Math.PI / 180) * 80;
                ty = Math.sin(angle * Math.PI / 180) * 80;
            } else {
                // Explode padrão
                tx = Math.cos(angle * Math.PI / 180) * dist;
                ty = Math.sin(angle * Math.PI / 180) * dist;
            }

            const rot = Math.random() * 360;

            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);
            p.style.setProperty('--rot', `${rot}deg`);

            // Tipo de animação
            let animClass = 'vfx-particle-animate';
            if (type === 'explode') animClass = 'vfx-particle-explode';
            if (type === 'float') animClass = 'vfx-particle-float';

            p.className = `vfx-particle ${animClass}`;

            // Tamanho aleatório
            const size = 4 + Math.random() * 6;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            if (options.style === 'bubble') p.style.borderRadius = '50%';

            const duration = options.duration || 600;
            setTimeout(() => {
                this.particlePool.release(p);
            }, duration);
        }
    }

    /**
     * Handler principal - determina qual efeito executar
     */
    onCardPlayed(data) {
        const { card, source, target } = data;

        // Mapear carta para efeito - IDs baseados no GameManager.js
        const effectMap = {
            // Guerreiro
            'warrior_golpe': () => this.playSlashEffect(target, { color: '#e5e7eb' }),
            'warrior_brutal': () => this.playDoubleSlashEffect(target),
            'warrior_escudo': () => this.playShieldEffect(source),
            'warrior_investida': () => this.playChargeEffect(source, target),
            'warrior_furia': () => this.playFireAuraEffect(source),
            'warrior_provocar': () => this.playTauntEffect(source),

            // Mago
            'mage_missil': () => this.playProjectileEffect(source, target, { color: '#a855f7' }),
            'mage_fireball': () => this.playFireballEffect(source, target),
            'mage_raio': () => this.playLightningEffect(target),
            'mage_escudo': () => this.playArcaneShieldEffect(source),
            'mage_gelo': () => this.playIceEffect(target),
            'mage_meteoro': () => this.playMeteorEffect(target),

            // Ladino
            'rogue_punhalada': () => this.playSlashEffect(target, { color: '#94a3b8', duration: 150 }),
            'rogue_furtivo': () => this.playSneakAttackEffect(target),
            'rogue_veneno': () => this.playPoisonEffect(target),
            'rogue_evasao': () => this.playDodgeEffect(source),
            'rogue_stealth': () => this.playStealthEffect(source),
            'rogue_execucao': () => this.playExecuteEffect(target),

            // Clérigo
            'cleric_cura': () => this.playHealEffect(source),
            'cleric_luz': () => this.playHolyLightEffect(target),
            'cleric_bencao': () => this.playBlessEffect(source),
            'cleric_purificar': () => this.playPurifyEffect(source),
            'cleric_grupo': () => this.playGroupHealEffect(source),
            'cleric_ressuscitar': () => this.playResurrectEffect(target)
        };

        const effect = effectMap[card.id];
        if (effect) {
            effect();
        } else {
            console.warn('[VFX] No effect mapped for card:', card.id);
        }
    }

    // ===== EFEITOS DE SLASH =====

    playSlashEffect(target, options = {}) {
        const { color = '#e5e7eb', duration = 300 } = options;
        const slash = this.slashPool.acquire();

        // Reset para reiniciar animação
        slash.style.animation = 'none';
        slash.offsetHeight; // Force reflow
        slash.style.animation = '';

        slash.style.display = 'block';
        slash.style.setProperty('--slash-color', color);

        // Rotação aleatória leve
        const rot = Math.random() * 20 - 10;
        slash.style.setProperty('--rot', `${rot}deg`);

        slash.className = 'vfx-slash vfx-slash-horizontal';

        // Posição central na tela (combate é overlay)
        slash.style.left = '50%';
        slash.style.top = '50%';

        // Partículas na direção do corte (VFX 2.0)
        this.spawnParticles('50%', '50%', color, 20, 'explode');

        setTimeout(() => {
            this.slashPool.release(slash);
        }, duration);
    }

    playDoubleSlashEffect(target) {
        // Primeiro slash
        this.playSlashEffect(target, { color: '#fbbf24' });

        // Segundo slash (X diagonal) com delay
        setTimeout(() => {
            const slash = this.slashPool.acquire();
            slash.style.display = 'block';
            slash.style.setProperty('--slash-color', '#fbbf24');
            slash.className = 'vfx-slash vfx-slash-x';
            slash.style.left = '50%';
            slash.style.top = '50%';

            // Partículas extras para o crítico
            this.spawnParticles('50%', '50%', '#fbbf24', 40, 'explode');

            setTimeout(() => this.slashPool.release(slash), 350);
        }, 150);

        // Impacto visual (VFX 2.0)
        setTimeout(() => {
            this.screenShake('medium');
            this.flashScreen();
        }, 300);
    }

    // ===== EFEITOS DE PROJÉTIL =====

    playProjectileEffect(source, target, options = {}) {
        const { color = '#a855f7' } = options;
        const projectile = document.createElement('div');
        projectile.className = 'vfx-projectile';
        projectile.style.setProperty('--projectile-color', color);
        // Fallback estilo se CSS não existir
        projectile.style.position = 'absolute';
        projectile.style.width = '12px';
        projectile.style.height = '12px';
        projectile.style.borderRadius = '50%';
        projectile.style.backgroundColor = color;
        projectile.style.boxShadow = `0 0 10px ${color}`;

        this.container.appendChild(projectile);

        // Animar do canto inferior ao centro
        projectile.style.left = '20%';
        projectile.style.bottom = '30%';
        projectile.style.transition = 'all 0.4s ease-in';

        requestAnimationFrame(() => {
            projectile.style.left = '50%';
            projectile.style.bottom = '50%';
        });

        setTimeout(() => {
            projectile.remove();
            // Flash no impacto + partículas (VFX 2.0)
            this.flashScreen(color, 100);
            this.spawnParticles('50%', '50%', color, 25, 'explode');
        }, 400);
    }

    playFireballEffect(source, target) {
        // Projétil de fogo
        const fireball = document.createElement('div');
        fireball.className = 'vfx-fireball';
        // Estilos inline para garantir
        fireball.style.position = 'absolute';
        fireball.style.width = '30px';
        fireball.style.height = '30px';
        fireball.style.borderRadius = '50%';
        fireball.style.backgroundColor = '#f97316';
        fireball.style.boxShadow = '0 0 20px #ef4444';

        this.container.appendChild(fireball);

        fireball.style.left = '20%';
        fireball.style.bottom = '30%';
        fireball.style.transition = 'all 0.3s ease-in';

        requestAnimationFrame(() => {
            fireball.style.left = '50%';
            fireball.style.bottom = '50%';
            fireball.style.transform = 'scale(2)';
        });

        // Explosão após impacto
        setTimeout(() => {
            fireball.remove();
            this.playExplosionEffect({ color1: '#f97316', color2: '#ef4444' });

            // Impacto massivo (VFX 2.0)
            this.screenShake('large');
            this.flashScreen('#fff7ed', 200);
        }, 300);
    }

    // ===== EFEITOS DE EXPLOSÃO =====

    playExplosionEffect(options = {}) {
        const { color1 = '#f97316', color2 = '#ef4444' } = options;

        const explosion = document.createElement('div');
        explosion.className = 'vfx-explosion';
        // Podemos adicionar classe CSS específica ou confiar nas partículas
        this.container.appendChild(explosion);

        // Partículas massivas
        this.spawnParticles(40, {
            colors: [color1, color2, '#fbbf24'],
            spread: 150,
            duration: 800
        });

        // Screen shake
        this.screenShake('large');

        setTimeout(() => explosion.remove(), 600);
    }

    playMeteorEffect(target) {
        // Sombra crescente
        const shadow = document.createElement('div');
        shadow.className = 'vfx-meteor-shadow';
        shadow.style.position = 'absolute';
        shadow.style.left = '50%';
        shadow.style.top = '60%';
        shadow.style.width = '10px';
        shadow.style.height = '5px';
        shadow.style.backgroundColor = 'rgba(0,0,0,0.5)';
        shadow.style.borderRadius = '50%';
        shadow.style.transition = 'all 0.5s ease-in';
        shadow.style.transform = 'translate(-50%, -50%)';

        this.container.appendChild(shadow);

        // Meteoro descendo
        const meteor = document.createElement('div');
        meteor.className = 'vfx-meteor';
        meteor.style.position = 'absolute';
        meteor.style.left = '50%';
        meteor.style.top = '-10%';
        meteor.style.width = '60px';
        meteor.style.height = '60px';
        meteor.style.backgroundColor = '#f97316';
        meteor.style.borderRadius = '50%';
        meteor.style.boxShadow = '0 0 30px #f97316';
        meteor.style.transition = 'all 0.5s ease-in';
        meteor.style.transform = 'translate(-50%, -50%)';

        this.container.appendChild(meteor);

        // Animação sequencial
        setTimeout(() => {
            shadow.style.width = '200px';
            shadow.style.height = '20px';
            shadow.style.opacity = '0.8';
            meteor.style.top = '50%';
        }, 50);

        setTimeout(() => {
            shadow.remove();
            meteor.remove();

            // Explosão ÉPICA
            this.playExplosionEffect({ color1: '#f97316', color2: '#7c2d12' });

            this.spawnParticles(50, {
                colors: ['#f97316', '#fbbf24', '#ffffff', '#7c2d12'],
                spread: 250,
                duration: 1000
            });

            this.screenShake('large');
            this.flashScreen('#ffffff', 300);

        }, 550);
    }

    // ===== EFEITOS DE RAIO =====

    playLightningEffect(target) {
        // Flash branco instantâneo
        this.flashScreen('#ffffff', 150);
        this.screenShake('medium');

        // Partículas elétricas
        this.spawnParticles('50%', '50%', '#facc15', 35, 'explode');
    }

    // ===== EFEITOS DE GELO =====

    playIceEffect(target) {
        const ice = document.createElement('div');
        ice.className = 'vfx-ice-cone';
        this.container.appendChild(ice);

        // Partículas de gelo
        this.spawnParticles(25, {
            colors: ['#06b6d4', '#22d3ee', '#ffffff'],
            spread: 120,
            duration: 500
        });

        setTimeout(() => ice.remove(), 400);
    }

    // ===== EFEITOS DE ESCUDO/AURA =====

    playShieldEffect(source) {
        // Escudo de partículas flutuantes
        this.spawnParticles(20, {
            colors: ['#3b82f6', '#60a5fa', '#ffffff'],
            spread: 60,
            duration: 800,
            direction: 'up',
            style: 'bubble'
        });
    }

    playArcaneShieldEffect(source) {
        this.spawnParticles(20, {
            colors: ['#8b5cf6', '#a78bfa', '#ffffff'],
            spread: 60,
            duration: 800,
            direction: 'orbit'
        });
    }

    playFireAuraEffect(source) {
        // Fogo contínuo (loop curto de partículas)
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.spawnParticles(10, {
                    colors: ['#f97316', '#ef4444', '#fbbf24'],
                    spread: 80,
                    duration: 600,
                    direction: 'up'
                });
            }, i * 200);
        }
    }

    playTauntEffect(source) {
        this.screenShake('small');
        this.spawnParticles(15, {
            colors: ['#dc2626', '#b91c1c'],
            spread: 100,
            duration: 500
        });
    }

    // ===== EFEITOS DE CURA =====

    playHealEffect(target) {
        this.spawnParticles(20, {
            colors: ['#22c55e', '#86efac', '#4ade80'],
            spread: 80,
            duration: 800,
            direction: 'up',
            style: 'bubble'
        });

        this.flashScreen('#22c55e', 200);
    }

    playGroupHealEffect(source) {
        this.spawnParticles(40, {
            colors: ['#22c55e', '#fef3c7', '#86efac'],
            spread: 200,
            duration: 1000,
            direction: 'up'
        });

        this.flashScreen('#86efac', 300);
    }

    playHolyLightEffect(target) {
        this.flashScreen('#fbbf24', 300);

        // Raio de luz (partículas caindo ou subindo muito rápido)
        this.spawnParticles(30, {
            colors: ['#fbbf24', '#ffffff'],
            spread: 40,
            duration: 600,
            direction: 'up'
        });
    }

    playBlessEffect(source) {
        this.spawnParticles(15, {
            colors: ['#fbbf24', '#fffbeb'],
            spread: 80,
            duration: 600,
            direction: 'orbit'
        });
    }

    playPurifyEffect(source) {
        // Partículas escuras sendo expelidas
        this.spawnParticles(15, {
            colors: ['#64748b', '#475569', '#334155'],
            spread: 100,
            duration: 500,
            direction: 'out'
        });

        this.flashScreen('#ffffff', 200);
    }

    playResurrectEffect(source) {
        // Efeito épico
        this.spawnParticles(50, {
            colors: ['#fbbf24', '#ffffff', '#fef3c7'],
            spread: 150,
            duration: 1200,
            direction: 'up'
        });

        this.flashScreen('#fbbf24', 600);
        this.screenShake('medium');
    }

    // ===== EFEITOS DE LADINO =====

    playSneakAttackEffect(target) {
        // Sombras envolvem
        const shadow = document.createElement('div');
        shadow.className = 'vfx-shadow-wrap';
        this.container.appendChild(shadow);

        setTimeout(() => {
            shadow.remove();
            // Múltiplos slashes
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.playSlashEffect(target, { color: '#1e1b4b', duration: 150 });
                }, i * 100);
            }
            // Flash crítico
            setTimeout(() => this.flashScreen('#fbbf24', 200), 300);
        }, 200);
    }

    playPoisonEffect(target) {
        this.spawnParticles(20, {
            colors: ['#22c55e', '#4ade80', '#166534'],
            spread: 60,
            duration: 800,
            style: 'bubble'
        });
    }

    playDodgeEffect(source) {
        // Rastro fantasma
        this.spawnParticles(10, {
            colors: ['#94a3b8', '#ffffff'],
            spread: 50,
            duration: 400,
            direction: 'out'
        });
    }

    playStealthEffect(source) {
        // Fumaça negra
        this.spawnParticles(20, {
            colors: ['#0f172a', '#1e293b'],
            spread: 80,
            duration: 800,
            direction: 'up'
        });
    }

    playExecuteEffect(target) {
        // Escurece tela
        const darken = document.createElement('div');
        darken.className = 'vfx-darken';
        darken.style.position = 'fixed';
        darken.style.inset = '0';
        darken.style.backgroundColor = 'rgba(0,0,0,0.7)';
        darken.style.zIndex = '9501';
        darken.style.transition = 'opacity 0.2s';
        this.container.appendChild(darken);

        setTimeout(() => {
            darken.remove();
            // Slash massivo vermelho
            const slash = this.slashPool.acquire();
            slash.style.display = 'block';
            slash.className = 'vfx-slash vfx-slash-horizontal';
            slash.style.setProperty('--slash-color', '#dc2626');
            slash.style.width = '400px';
            slash.style.height = '10px';
            slash.style.left = '50%';
            slash.style.top = '50%';

            this.spawnParticles('50%', '50%', '#dc2626', 50, 'explode');

            this.flashScreen('#ffffff', 300);
            this.screenShake('large');

            setTimeout(() => this.slashPool.release(slash), 300);
        }, 200);
    }

    playChargeEffect(source, target) {
        this.screenShake('small');
        this.spawnParticles('50%', '50%', '#a855f7', 25, 'explode');
    }
}

// Singleton para acesso global
let vfxInstance = null;

export function getCardVFX() {
    if (!vfxInstance) {
        vfxInstance = new CardVFXSystem();
    }
    return vfxInstance;
}
