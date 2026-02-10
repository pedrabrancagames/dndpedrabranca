import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';
import { eventBus } from '../../core/EventEmitter.js';

export class CombatScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-pause', () => this.togglePauseMenu());

        this.bindClick('#btn-resume', () => this.togglePauseMenu());
        this.bindClick('#btn-exit-to-home', () => this.exitCombat());

        this.bindClick('#btn-pass-turn', () => this.passTurn());

        // Escape Button
        this.bindClick('#btn-escape-combat', () => this.attemptEscape());

        eventBus.on('turnStart', (unit) => this.updateTurnInfo(unit));

        // Card Hover effects for damage preview
        // We need to attach these dynamically when cards are rendered, 
        // but we can also use event delegation if container exists
        const carousel = this.findElement('#card-carousel');
        if (carousel) {
            // Mouse Enter/Leave for desktop testing
            carousel.addEventListener('mouseover', (e) => {
                const cardEl = e.target.closest('.combat-card');
                if (cardEl) this.showDamagePreview(cardEl);
            });
            carousel.addEventListener('mouseout', (e) => {
                const cardEl = e.target.closest('.combat-card');
                if (cardEl) this.hideDamagePreview();
            });

            // Touch events for mobile might need different handling (e.g. long press)
            // For now, let's rely on selection logic if implemented or just click first?
            // Actually, usually in mobile TCG, you drag or tap to select. 
            // If tap to select, we can show preview then.
        }

        eventBus.on('cardSelected', (card) => this.showDamagePreviewByCardData(card));
        eventBus.on('cardDeselected', () => this.hideDamagePreview());

        // VFX Events
        eventBus.on('combatAttack', (data) => this.handleCombatAttackVFX(data));
        eventBus.on('combatHit', (data) => this.handleCombatHitVFX(data));
        eventBus.on('combatSkill', (data) => this.handleCombatSkillVFX(data));
    }

    // ... (restante do código existente)

    // ========== VFX SYSTEM ==========

    handleCombatAttackVFX(data) {
        // Ex: { attacker, target, type: 'melee' | 'range' | 'magic' }
        const type = data.type || 'melee';

        if (type === 'melee') {
            // Animação de corte
            this.playVFX('slash-horizontal', data.target);
        } else if (type === 'range') {
            // Projétil
            this.playVFX('projectile', data.target);
        } else if (type === 'magic') {
            // Depende do elemento, mas genérico:
            this.playVFX('arcane-shield', data.attacker); // Cast effect
        }
    }

    handleCombatHitVFX(data) {
        // Ex: { target, amount, isCritical, element }
        if (data.isCritical) {
            this.shakeScreen('medium');
            this.flashScreen('white');
            this.playVFX('explosion', data.target);
        } else {
            this.shakeScreen('small');
            // Efeito de impacto simples?
        }

        // Element specific
        if (data.element === 'fire') this.playVFX('fire-aura', data.target);
        if (data.element === 'ice') this.playVFX('ice-cone', data.target);
        if (data.element === 'lightning') this.playVFX('lightning', data.target);
        if (data.element === 'holy') this.playVFX('holy-light', data.target);
    }

    handleCombatSkillVFX(data) {
        // Ex: { skillName, target }
        const skill = data.skillName.toLowerCase();

        if (skill.includes('cura') || skill.includes('heal')) {
            this.playVFX('heal-circle', data.target);
        } else if (skill.includes('fogo') || skill.includes('fire')) {
            this.playVFX('fireball', data.target);
        } else if (skill.includes('meteoro')) {
            this.playVFX('meteor', data.target);
        } else if (skill.includes('escudo') || skill.includes('shield')) {
            this.playVFX('shield', data.target);
        }
    }

    playVFX(effectName, target) {
        const overlay = document.getElementById('vfx-overlay');
        if (!overlay) return;

        const el = document.createElement('div');

        // Mapeamento de classes do CSS vfx.css
        const vfxMap = {
            'slash-horizontal': 'vfx-slash-horizontal',
            'slash-x': 'vfx-slash-x',
            'projectile': ['vfx-projectile', 'vfx-projectile-animate'],
            'fireball': ['vfx-fireball', 'vfx-fireball-animate'],
            'explosion': 'vfx-explosion',
            'meteor': ['vfx-meteor', 'vfx-meteor-fall'],
            'lightning': 'vfx-lightning',
            'ice-cone': 'vfx-ice-cone',
            'shield': 'vfx-shield',
            'arcane-shield': 'vfx-arcane-shield',
            'fire-aura': 'vfx-fire-aura',
            'heal-circle': 'vfx-heal-circle',
            'holy-light': 'vfx-holy-light'
        };

        const classes = vfxMap[effectName];
        if (!classes) return;

        if (Array.isArray(classes)) {
            el.classList.add(...classes);
        } else {
            el.classList.add(classes);
        }

        // Posicionamento
        // Se target for um elemento DOM, pegar coordenadas.
        // Se for um objeto de jogo (hero/enemy), tentar achar o elemento no DOM pelo ID.
        let targetEl = target;
        if (target && target.id) {
            // Tentar achar pelo ID do modelo 3D ou carta UI?
            // No contexto AR, talvez usar coordenadas de tela projetadas.
            // Simplificação: Centralizar se não tiver alvo específico UI
        }

        // Se tiver alvo DOM, posicionar
        if (targetEl instanceof HTMLElement) {
            const rect = targetEl.getBoundingClientRect();
            el.style.left = `${rect.left + rect.width / 2}px`;
            el.style.top = `${rect.top + rect.height / 2}px`;
            el.style.transform = 'translate(-50%, -50%)'; // Resetar transform padrão e ajustar
        } else {
            // Center screen fallback
            el.style.left = '50%';
            el.style.top = '50%';
        }

        overlay.appendChild(el);

        // Remover após animação
        setTimeout(() => {
            el.remove();
        }, 1000); // 1s de segurança, a maioria dura menos
    }

    shakeScreen(intensity = 'small') {
        const app = document.getElementById('app');
        if (!app) return;

        app.classList.remove('vfx-shake-small', 'vfx-shake-medium', 'vfx-shake-large');
        void app.offsetWidth; // Trigger reflow
        app.classList.add(`vfx-shake-${intensity}`);
    }

    flashScreen(color = 'white') {
        const overlay = document.getElementById('vfx-overlay');
        if (!overlay) return;

        const flash = document.createElement('div');
        flash.classList.add(`vfx-flash-${color}`);
        overlay.appendChild(flash);

        setTimeout(() => flash.remove(), 300);
    }

    onShow(data) {
        const firstHero = this.gameManager.gameData.heroes[0];
        if (firstHero) this.updateTurnInfo(firstHero);
    }

    updateTurnInfo(unit) {
        // Seletor correto baseado no HTML
        const turnIndicator = this.findElement('#turn-indicator');
        if (turnIndicator) {
            turnIndicator.textContent = `Turno: ${unit.name}`;
        }
        console.log('UI Updated for:', unit.name);
    }

    togglePauseMenu() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) pauseMenu.classList.toggle('hidden');
    }

    exitCombat() {
        const pauseMenu = this.findElement('#pause-menu');
        if (pauseMenu) pauseMenu.classList.add('hidden');

        if (this.gameManager.arSceneManager) {
            this.gameManager.arSceneManager.endSession();
        }

        this.gameManager.stateManager.setState(GameState.HOME);
    }

    passTurn() {
        eventBus.emit('passTurn');
    }

    attemptEscape() {
        const heroes = this.gameManager.gameData.heroes;
        // Assume first hero is leader/active for escape check
        const hero = heroes[0];

        if (this.gameManager.combatManager.isPlayerTurn()) {
            this.gameManager.combatManager.attemptEscape(hero);
        } else {
            this.gameManager.showToast('Espere seu turno para fugir!', 'warning');
        }
    }

    showDamagePreview(cardEl) {
        // This relies on card data being attached to DOM or retrieval via ID
        const cardId = cardEl.dataset.id;
        // Fetch card data... logic usually requires knowing WHICH card instance.
        // Assuming CardSystem/UI renders sets data-index
    }

    showDamagePreviewByCardData(card) {
        const previewEl = this.findElement('#damage-preview');
        const valueEl = previewEl.querySelector('.preview-value');

        if (!previewEl || !card) return;

        // Get active encounter target
        const encounter = this.gameManager.combatManager.activeEncounter;
        if (!encounter || !encounter.enemies || encounter.enemies.length === 0) return;

        // Predict on first enemy (default target)
        // In full impl, we'd check selected target
        const target = encounter.enemies[0];
        const hero = encounter.heroes[0];

        const dmg = this.gameManager.combatManager.cardSystem.getPredictedDamage(card, hero, target);

        if (dmg > 0) {
            valueEl.textContent = `-${dmg}`;
            previewEl.classList.remove('hidden', 'heal');

            // Position preview over target if possible, or center screen
            // For now, center fixed is fine via CSS
        } else if (card.heal) {
            valueEl.textContent = `+${card.heal}`;
            previewEl.classList.add('heal');
            previewEl.classList.remove('hidden');
        } else {
            this.hideDamagePreview();
        }
    }

    hideDamagePreview() {
        const previewEl = this.findElement('#damage-preview');
        if (previewEl) previewEl.classList.add('hidden');
    }

    // Override or Extend updateTurnInfo if needed, but logic seems fine.
    // However, we need to ensure Status Icons are rendered in updateHeroPanel (not shown in this file, likely in CombatManager or here?)
    // This file seems to be just the Shell. The actual rendering of HP/Cards might be in another system or missing?
    // Looking at previous view, CombatScreen seems minimal. 
    // We should implement renderStatusEffects here if we control the Hero Panel
}
