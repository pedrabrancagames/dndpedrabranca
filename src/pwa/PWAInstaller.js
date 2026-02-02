/**
 * PWAInstaller - Gerencia instalação e atualizações do PWA
 * Usa virtual:pwa-register para controle fino do ciclo de vida
 */
import { eventBus } from '../core/EventEmitter.js';
import { registerSW } from 'virtual:pwa-register';

export class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.updateSW = null; // Função para atualizar o SW

        this.setupEventListeners();
        this.checkInstallState();
        this.initServiceWorker();
    }

    initServiceWorker() {
        // Usa o hook do vite-plugin-pwa para gerenciar atualizações
        this.updateSW = registerSW({
            immediate: true,
            onNeedRefresh: () => {
                console.log('PWA: New content available, click on reload button to update.');
                this.showUpdatePrompt();
            },
            onOfflineReady: () => {
                console.log('PWA: Content downloaded for offline use.');
                this.showToast('Pronto para jogar offline! 📡', 'success');
            },
            onRegisteredSW(swUrl, r) {
                console.log(`PWA: Service Worker registered at: ${swUrl}`);
                if (r) {
                    setInterval(async () => {
                        if (!(!r.installing && navigator.serviceWorker.controller)) {
                            return;
                        }
                        if (r.waiting) return;
                        if (r.installing) return;

                        console.log('PWA: Checking for updates...');
                        await r.update();
                    }, 60 * 60 * 1000 /* 1 hora */);
                }
            },
        });
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
    }

    checkInstallState() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: Running in standalone mode');
        }
    }

    showInstallButton() {
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

            requestAnimationFrame(() => installBtn.classList.add('visible'));
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
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`PWA: User choice: ${outcome}`);
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    showUpdatePrompt() {
        // Cria um toast especial persistente com botão de ação
        const container = document.querySelector('.toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = 'toast info pwa-update-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span>Nova versão disponível!</span>
                <button id="pwa-refresh-btn" class="toast-action-btn">Atualizar</button>
            </div>
            <button class="toast-close-btn">✕</button>
        `;

        container.appendChild(toast);

        // Listener do botão de Atualizar
        const refreshBtn = toast.querySelector('#pwa-refresh-btn');
        refreshBtn.onclick = () => {
            if (this.updateSW) {
                this.updateSW(true); // true = reload page
            }
        };

        // Listener do botão fechar (ignora atualização por enquanto)
        const closeBtn = toast.querySelector('.toast-close-btn');
        closeBtn.onclick = () => {
            toast.remove();
        };
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
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
            indicator.querySelector('.status-text').textContent = 'Online';
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            indicator.querySelector('.status-text').textContent = 'Offline';
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
}

// Auto-inicializar singleton
let pwaInstaller = null;

export function initPWA() {
    if (!pwaInstaller) {
        pwaInstaller = new PWAInstaller();
    }
    return pwaInstaller;
}
