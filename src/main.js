/**
 * D&D Pedra Branca - Entry Point
 * RPG WebAR para navegador mobile Android
 */

import './styles/index.css';
import { GameManager } from './core/GameManager.js';
import { initPWA } from './pwa/PWAInstaller.js';

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameManager();
    game.init();

    // Inicializar PWA
    initPWA();

    // Expor globalmente para debugging
    if (import.meta.env.DEV) {
        window.game = game;
    }
});
