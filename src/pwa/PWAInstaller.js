/**
 * PWAInstaller - Gerencia instalação do PWA
 * Mostra prompt de instalação e status offline
 */
import { eventBus } from '../core/EventEmitter.js';

export class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;

        this.setupEventListeners();
        this.checkInstallState();
    }

    setupEventListeners() {
        // Capturar evento de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            console.log('PWA: Install prompt ready');
        });

        // App instalado
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showToast('App instalado com sucesso! 🎮', 'success');
            console.log('PWA: App installed');
        });

        // Status de conexão
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineStatus();
            this.showToast('Conexão restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineStatus();
            this.showToast('Modo offline ativado', 'warning');
        });

        // Service Worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showToast('Nova versão disponível! Recarregando...', 'info');
                setTimeout(() => window.location.reload(), 1500);
            });
        }
    }

    checkInstallState() {
        // Verificar se já está instalado (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA: Running in standalone mode');
        }

        // iOS Safari
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: Running on iOS standalone');
        }
    }

    showInstallButton() {
        // Criar botão se não existir
        let installBtn = document.getElementById('pwa-install-btn');

        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'pwa-install-btn';
            installBtn.innerHTML = `
                <span class="install-icon">📲</span>
                <span class="install-text">Instalar App</span>
            `;
            installBtn.onclick = () => this.promptInstall();
            document.body.appendChild(installBtn);

            // Animar entrada
            requestAnimationFrame(() => {
                installBtn.classList.add('visible');
            });
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.remove('visible');
            setTimeout(() => installBtn.remove(), 300);
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('PWA: No install prompt available');
            return;
        }

        // Mostrar prompt nativo
        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`PWA: User choice: ${outcome}`);

        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    updateOnlineStatus() {
        const indicator = document.getElementById('online-indicator');

        if (!indicator) {
            this.createOnlineIndicator();
            return;
        }

        if (this.isOnline) {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
        }
    }

    createOnlineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'online-indicator';
        indicator.className = `online-indicator ${this.isOnline ? 'online' : 'offline'}`;
        indicator.innerHTML = `
            <span class="status-dot"></span>
            <span class="status-text">${this.isOnline ? 'Online' : 'Offline'}</span>
        `;
        document.body.appendChild(indicator);
    }

    showToast(message, type = 'info') {
        eventBus.emit('showMessage', { text: message, type });
    }

    /**
     * Verifica se o app pode funcionar offline
     */
    async checkOfflineReady() {
        if (!('caches' in window)) return false;

        try {
            const cacheNames = await caches.keys();
            return cacheNames.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Força atualização do Service Worker
     */
    async forceUpdate() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                this.showToast('Verificando atualizações...', 'info');
            }
        }
    }
}

// Auto-inicializar
let pwaInstaller = null;

export function initPWA() {
    if (!pwaInstaller) {
        pwaInstaller = new PWAInstaller();
    }
    return pwaInstaller;
}
