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
        this.particlePool = new VFXPool(() => this.createParticle(), 50);
        this.slashPool = new VFXPool(() => this.createSlashElement(), 10);

        // Registrar no eventBus
        eventBus.on('cardPlayed', (data) => this.onCardPlayed(data));
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

            // Mago
            'mage_missil': () => this.playProjectileEffect(source, target, { color: '#a855f7' }),
            'mage_fireball': () => this.playFireballEffect(source, target),
            'mage_raio': () => this.playLightningEffect(target),
            'mage_escudo': () => this.playArcaneShieldEffect(source),

            // Ladino
            'rogue_punhalada': () => this.playSlashEffect(target, { color: '#94a3b8', duration: 150 }),
            'rogue_furtivo': () => this.playSneakAttackEffect(target),
            'rogue_veneno': () => this.playPoisonEffect(target),
            'rogue_evasao': () => this.playDodgeEffect(source),

            // Clérigo
            'cleric_cura': () => this.playHealEffect(source),
            'cleric_luz': () => this.playHolyLightEffect(target),
            'cleric_bencao': () => this.playBlessEffect(source),
            'cleric_purificar': () => this.playPurifyEffect(source)
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
        slash.className = 'vfx-slash vfx-slash-horizontal';

        // Posição central na tela (combate é overlay)
        slash.style.left = '50%';
        slash.style.top = '50%';

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

            setTimeout(() => this.slashPool.release(slash), 300);
        }, 100);

        // Screen shake
        this.screenShake(300);
    }

    // ===== EFEITOS DE PROJÉTIL =====

    playProjectileEffect(source, target, options = {}) {
        const { color = '#a855f7' } = options;
        const projectile = document.createElement('div');
        projectile.className = 'vfx-projectile';
        projectile.style.setProperty('--projectile-color', color);
        this.container.appendChild(projectile);

        // Animar do canto inferior ao centro
        projectile.style.left = '20%';
        projectile.style.bottom = '30%';

        requestAnimationFrame(() => {
            projectile.classList.add('vfx-projectile-animate');
        });

        setTimeout(() => {
            projectile.remove();
            // Flash no impacto
            this.flashScreen(color, 100);
        }, 400);
    }

    playFireballEffect(source, target) {
        // Projétil de fogo
        const fireball = document.createElement('div');
        fireball.className = 'vfx-fireball';
        this.container.appendChild(fireball);

        fireball.style.left = '20%';
        fireball.style.bottom = '30%';

        requestAnimationFrame(() => {
            fireball.classList.add('vfx-fireball-animate');
        });

        // Explosão após impacto
        setTimeout(() => {
            fireball.remove();
            this.playExplosionEffect({ color1: '#f97316', color2: '#ef4444' });
        }, 300);
    }

    // ===== EFEITOS DE EXPLOSÃO =====

    playExplosionEffect(options = {}) {
        const { color1 = '#f97316', color2 = '#ef4444' } = options;

        const explosion = document.createElement('div');
        explosion.className = 'vfx-explosion';
        explosion.style.setProperty('--explosion-color1', color1);
        explosion.style.setProperty('--explosion-color2', color2);
        this.container.appendChild(explosion);

        // Partículas
        this.spawnParticles(20, {
            colors: [color1, color2, '#fbbf24'],
            spread: 100,
            duration: 600
        });

        // Screen shake
        this.screenShake(500);

        setTimeout(() => explosion.remove(), 600);
    }

    playMeteorEffect(target) {
        // Sombra crescente
        const shadow = document.createElement('div');
        shadow.className = 'vfx-meteor-shadow';
        this.container.appendChild(shadow);

        // Meteoro descendo
        const meteor = document.createElement('div');
        meteor.className = 'vfx-meteor';
        this.container.appendChild(meteor);

        // Animação sequencial
        setTimeout(() => {
            meteor.classList.add('vfx-meteor-fall');
        }, 100);

        setTimeout(() => {
            shadow.remove();
            meteor.remove();
            this.playExplosionEffect({ color1: '#f97316', color2: '#0f172a' });
            this.spawnParticles(30, {
                colors: ['#f97316', '#fbbf24', '#ffffff'],
                spread: 150,
                duration: 800
            });
        }, 500);
    }

    // ===== EFEITOS DE RAIO =====

    playLightningEffect(target) {
        const lightning = document.createElement('div');
        lightning.className = 'vfx-lightning';
        this.container.appendChild(lightning);

        // Flash branco
        this.flashScreen('#ffffff', 150);

        setTimeout(() => lightning.remove(), 300);
    }

    // ===== EFEITOS DE GELO =====

    playIceEffect(target) {
        const ice = document.createElement('div');
        ice.className = 'vfx-ice-cone';
        this.container.appendChild(ice);

        // Partículas de gelo
        this.spawnParticles(15, {
            colors: ['#06b6d4', '#22d3ee', '#ffffff'],
            spread: 80,
            duration: 400
        });

        setTimeout(() => ice.remove(), 400);
    }

    // ===== EFEITOS DE ESCUDO/AURA =====

    playShieldEffect(source) {
        const shield = document.createElement('div');
        shield.className = 'vfx-shield';
        this.container.appendChild(shield);

        setTimeout(() => shield.remove(), 600);
    }

    playArcaneShieldEffect(source) {
        const shield = document.createElement('div');
        shield.className = 'vfx-arcane-shield';
        this.container.appendChild(shield);

        setTimeout(() => shield.remove(), 500);
    }

    playFireAuraEffect(source) {
        const aura = document.createElement('div');
        aura.className = 'vfx-fire-aura';
        this.container.appendChild(aura);

        // Fogo persiste por um tempo
        setTimeout(() => aura.remove(), 1500);
    }

    playTauntEffect(source) {
        const taunt = document.createElement('div');
        taunt.className = 'vfx-taunt';
        this.container.appendChild(taunt);

        setTimeout(() => taunt.remove(), 500);
    }

    // ===== EFEITOS DE CURA =====

    playHealEffect(target) {
        this.spawnParticles(12, {
            colors: ['#22c55e', '#86efac', '#4ade80'],
            spread: 60,
            duration: 500,
            direction: 'up'
        });

        this.flashScreen('#22c55e', 200);
    }

    playGroupHealEffect(source) {
        const circle = document.createElement('div');
        circle.className = 'vfx-heal-circle';
        this.container.appendChild(circle);

        this.spawnParticles(25, {
            colors: ['#22c55e', '#fef3c7', '#86efac'],
            spread: 120,
            duration: 600,
            direction: 'up'
        });

        setTimeout(() => circle.remove(), 600);
    }

    playHolyLightEffect(target) {
        const light = document.createElement('div');
        light.className = 'vfx-holy-light';
        this.container.appendChild(light);

        this.flashScreen('#fbbf24', 300);

        setTimeout(() => light.remove(), 500);
    }

    playBlessEffect(source) {
        const bless = document.createElement('div');
        bless.className = 'vfx-bless';
        this.container.appendChild(bless);

        this.spawnParticles(10, {
            colors: ['#fbbf24', '#fffbeb'],
            spread: 50,
            duration: 400,
            direction: 'orbit'
        });

        setTimeout(() => bless.remove(), 500);
    }

    playPurifyEffect(source) {
        const purify = document.createElement('div');
        purify.className = 'vfx-purify';
        this.container.appendChild(purify);

        // Partículas escuras sendo expelidas
        this.spawnParticles(8, {
            colors: ['#64748b', '#475569', '#334155'],
            spread: 80,
            duration: 400,
            direction: 'out'
        });

        this.flashScreen('#ffffff', 200);

        setTimeout(() => purify.remove(), 400);
    }

    playResurrectEffect(source) {
        // Pilar de luz
        const pillar = document.createElement('div');
        pillar.className = 'vfx-resurrect-pillar';
        this.container.appendChild(pillar);

        // Asas de anjo
        setTimeout(() => {
            const wings = document.createElement('div');
            wings.className = 'vfx-angel-wings';
            this.container.appendChild(wings);
            setTimeout(() => wings.remove(), 600);
        }, 400);

        // Partículas douradas
        this.spawnParticles(30, {
            colors: ['#fbbf24', '#ffffff', '#fef3c7'],
            spread: 100,
            duration: 800,
            direction: 'up'
        });

        this.flashScreen('#fbbf24', 400);

        setTimeout(() => pillar.remove(), 800);
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
        const poison = document.createElement('div');
        poison.className = 'vfx-poison-cloud';
        this.container.appendChild(poison);

        this.spawnParticles(10, {
            colors: ['#22c55e', '#4ade80'],
            spread: 40,
            duration: 500,
            style: 'bubble'
        });

        setTimeout(() => poison.remove(), 800);
    }

    playDodgeEffect(source) {
        const dodge = document.createElement('div');
        dodge.className = 'vfx-dodge';
        this.container.appendChild(dodge);

        setTimeout(() => dodge.remove(), 300);
    }

    playStealthEffect(source) {
        const stealth = document.createElement('div');
        stealth.className = 'vfx-stealth';
        this.container.appendChild(stealth);

        setTimeout(() => stealth.remove(), 500);
    }

    playExecuteEffect(target) {
        // Escurece tela
        const darken = document.createElement('div');
        darken.className = 'vfx-darken';
        this.container.appendChild(darken);

        setTimeout(() => {
            darken.remove();
            // Slash massivo
            const slash = document.createElement('div');
            slash.className = 'vfx-execute-slash';
            this.container.appendChild(slash);

            this.flashScreen('#ffffff', 300);
            setTimeout(() => slash.remove(), 400);
        }, 200);
    }

    playChargeEffect(source, target) {
        const charge = document.createElement('div');
        charge.className = 'vfx-charge';
        this.container.appendChild(charge);

        setTimeout(() => {
            charge.remove();
            this.flashScreen('#ffffff', 150);
        }, 300);
    }

    // ===== UTILIDADES =====

    spawnParticles(count, options = {}) {
        const {
            colors = ['#ffffff'],
            spread = 50,
            duration = 400,
            direction = 'random',
            style = 'normal'
        } = options;

        for (let i = 0; i < count; i++) {
            const particle = this.particlePool.acquire();
            particle.style.display = 'block';

            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 6px ${color}`;

            // Posição inicial central
            particle.style.left = '50%';
            particle.style.top = '50%';

            // Direção da animação
            let tx, ty;
            switch (direction) {
                case 'up':
                    tx = (Math.random() - 0.5) * spread;
                    ty = -spread - Math.random() * spread;
                    break;
                case 'out':
                    const angle = Math.random() * Math.PI * 2;
                    tx = Math.cos(angle) * spread;
                    ty = Math.sin(angle) * spread;
                    break;
                default:
                    tx = (Math.random() - 0.5) * spread * 2;
                    ty = (Math.random() - 0.5) * spread * 2;
            }

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);

            if (style === 'bubble') {
                particle.style.borderRadius = '50%';
                particle.style.width = '8px';
                particle.style.height = '8px';
            }

            particle.classList.add('vfx-particle-animate');

            setTimeout(() => {
                particle.classList.remove('vfx-particle-animate');
                this.particlePool.release(particle);
            }, duration);
        }
    }

    flashScreen(color, duration) {
        const flash = document.createElement('div');
        flash.className = 'vfx-screen-flash';
        flash.style.backgroundColor = color;
        this.container.appendChild(flash);

        setTimeout(() => flash.remove(), duration);
    }

    screenShake(duration = 300) {
        const gameContainer = document.querySelector('.game-container') || document.body;
        gameContainer.classList.add('vfx-shake');
        setTimeout(() => gameContainer.classList.remove('vfx-shake'), duration);
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
