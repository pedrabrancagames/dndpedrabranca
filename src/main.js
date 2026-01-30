/**
 * D&D Pedra Branca - Entry Point
 * RPG WebAR para navegador mobile Android
 */

import './styles/index.css';
import { GameManager } from './core/GameManager.js';
import { initPWA } from './pwa/PWAInstaller.js';
import { getPerformanceMonitor } from './debug/PerformanceMonitor.js';
import { getWebXRDebugger } from './debug/WebXRDebugger.js';

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameManager();
    game.init();

    // Inicializar PWA
    initPWA();

    // Expor globalmente para debugging
    if (import.meta.env.DEV) {
        window.game = game;

        // Ferramentas de debug
        window.perfMonitor = getPerformanceMonitor();
        window.xrDebugger = getWebXRDebugger();

        // Atalhos de teclado para debug
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P = Performance Monitor
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                window.perfMonitor.toggle();
                console.log('Performance Monitor:', window.perfMonitor.enabled ? 'ON' : 'OFF');
            }
            // Ctrl+Shift+X = WebXR Debugger
            if (e.ctrlKey && e.shiftKey && e.key === 'X') {
                window.xrDebugger.toggle();
                console.log('WebXR Debugger:', window.xrDebugger.isActive ? 'ON' : 'OFF');
            }
        });

        console.log('🔧 Debug Mode: Ctrl+Shift+P = Perf | Ctrl+Shift+X = XR');
    }
});
