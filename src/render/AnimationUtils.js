/**
 * AnimationUtils - Utilitários de Animação
 * Funções de easing e animações reutilizáveis para cenas 3D
 */

// ===== Funções de Easing =====

/**
 * Easing com overshoot - ideal para spawn/entrada
 * @param {number} x - Progresso (0-1)
 * @returns {number} Valor com easing
 */
export function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

/**
 * Easing suave de saída
 * @param {number} x - Progresso (0-1)
 * @returns {number} Valor com easing
 */
export function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

/**
 * Easing suave de entrada
 * @param {number} x - Progresso (0-1)
 * @returns {number} Valor com easing
 */
export function easeInCubic(x) {
    return x * x * x;
}

/**
 * Easing elástico - para efeitos de bounce
 * @param {number} x - Progresso (0-1)
 * @returns {number} Valor com easing
 */
export function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

// ===== Animações de Modelo =====

/**
 * Anima a entrada de um modelo (spawn)
 * @param {THREE.Object3D} model - Modelo a animar
 * @param {Object} config - Configurações da animação
 * @param {number} config.targetScale - Escala final (default: 0.5)
 * @param {number} config.delay - Delay em ms antes de iniciar (default: 0)
 * @param {number} config.duration - Duração em ms (default: 400)
 * @param {Function} config.onComplete - Callback após animação
 */
export function animateSpawn(model, config = {}) {
    const {
        targetScale = 0.5,
        delay = 0,
        duration = 400,
        onComplete = null
    } = config;

    setTimeout(() => {
        const startTime = performance.now();
        const startY = model.position.y - 0.3;
        const targetY = model.position.y;

        model.position.y = startY;
        model.scale.set(0, 0, 0);

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing: easeOutBack para efeito de "bounce"
            const easedScale = easeOutBack(progress);
            const easedPos = easeOutCubic(progress);

            // Escala
            const scale = targetScale * easedScale;
            model.scale.set(scale, scale, scale);

            // Posição Y (subir do chão)
            model.position.y = startY + (targetY - startY) * easedPos;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };

        animate();
    }, delay);
}

/**
 * Anima a morte de um modelo
 * @param {THREE.Object3D} model - Modelo a animar
 * @param {Object} config - Configurações da animação
 * @param {number} config.duration - Duração em ms (default: 600)
 * @param {Function} config.onComplete - Callback após animação
 */
export function animateDeath(model, config = {}) {
    const {
        duration = 600,
        onComplete = null
    } = config;

    const startTime = performance.now();
    const startScale = model.scale.x;
    const startY = model.position.y;
    const startRotation = model.rotation.z;

    const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: easeInCubic para efeito de "sugar"
        const eased = easeInCubic(progress);

        // Escala diminui
        const scale = startScale * (1 - eased);
        model.scale.set(scale, scale, scale);

        // Rotaciona e cai
        model.rotation.z = startRotation + (Math.PI * 0.5) * eased;
        model.position.y = startY - 0.3 * eased;

        // Transparência (se material suportar)
        model.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = 1 - eased;
            }
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete();
        }
    };

    animate();
}
