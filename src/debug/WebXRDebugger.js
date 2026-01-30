/**
 * WebXRDebugger - Ferramenta de Debug para WebXR
 * Ajuda a diagnosticar problemas em AR/VR
 */
import { eventBus } from '../core/EventEmitter.js';

export class WebXRDebugger {
    constructor() {
        this.isActive = false;
        this.logs = [];
        this.maxLogs = 100;
        this.panel = null;
        this.xrInfo = {};
    }

    /**
     * Ativa/desativa o debugger
     */
    toggle() {
        this.isActive = !this.isActive;

        if (this.isActive) {
            this.createPanel();
            this.checkXRSupport();
        } else {
            this.destroyPanel();
        }

        return this.isActive;
    }

    /**
     * Cria painel de debug
     */
    createPanel() {
        if (this.panel) return;

        this.panel = document.createElement('div');
        this.panel.id = 'xr-debugger';
        this.panel.className = 'xr-debugger';
        this.panel.innerHTML = `
            <div class="xr-debug-header">
                🥽 WebXR Debug
                <button class="xr-debug-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="xr-debug-section">
                <h4>Support</h4>
                <div id="xr-support-info">Checking...</div>
            </div>
            <div class="xr-debug-section">
                <h4>Session</h4>
                <div id="xr-session-info">No active session</div>
            </div>
            <div class="xr-debug-section">
                <h4>Logs</h4>
                <div id="xr-logs" class="xr-logs"></div>
            </div>
            <div class="xr-debug-actions">
                <button onclick="window.xrDebugger?.checkXRSupport()">Refresh</button>
                <button onclick="window.xrDebugger?.clearLogs()">Clear Logs</button>
                <button onclick="window.xrDebugger?.exportLogs()">Export</button>
            </div>
        `;

        document.body.appendChild(this.panel);

        // Expor globalmente para botões
        window.xrDebugger = this;
    }

    /**
     * Destrói o painel
     */
    destroyPanel() {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    }

    /**
     * Verifica suporte a WebXR
     */
    async checkXRSupport() {
        const info = {
            xrAvailable: 'navigator.xr' in window,
            immersiveAR: false,
            immersiveVR: false,
            inlineSession: false,
            hitTest: false,
            domOverlay: false,
            anchors: false,
            lightEstimation: false
        };

        if (info.xrAvailable) {
            try {
                info.immersiveAR = await navigator.xr.isSessionSupported('immersive-ar');
                info.immersiveVR = await navigator.xr.isSessionSupported('immersive-vr');
                info.inlineSession = await navigator.xr.isSessionSupported('inline');
            } catch (e) {
                this.log('error', `XR check failed: ${e.message}`);
            }
        }

        this.xrInfo = info;
        this.updateSupportInfo();

        return info;
    }

    /**
     * Atualiza info de suporte no painel
     */
    updateSupportInfo() {
        const el = document.getElementById('xr-support-info');
        if (!el) return;

        const items = [
            { label: 'WebXR API', value: this.xrInfo.xrAvailable },
            { label: 'Immersive AR', value: this.xrInfo.immersiveAR },
            { label: 'Immersive VR', value: this.xrInfo.immersiveVR },
            { label: 'Inline Session', value: this.xrInfo.inlineSession }
        ];

        el.innerHTML = items.map(item => `
            <div class="xr-support-row">
                <span>${item.label}</span>
                <span class="${item.value ? 'supported' : 'not-supported'}">
                    ${item.value ? '✅' : '❌'}
                </span>
            </div>
        `).join('');
    }

    /**
     * Atualiza info da sessão
     */
    updateSessionInfo(session) {
        const el = document.getElementById('xr-session-info');
        if (!el) return;

        if (!session) {
            el.innerHTML = '<span class="no-session">No active session</span>';
            return;
        }

        el.innerHTML = `
            <div class="xr-session-row">Mode: ${session.mode || 'unknown'}</div>
            <div class="xr-session-row">Visibility: ${session.visibilityState}</div>
            <div class="xr-session-row">Features: ${Array.from(session.enabledFeatures || []).join(', ') || 'none'}</div>
        `;
    }

    /**
     * Adiciona log
     */
    log(type, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            data
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.updateLogsPanel();

        // Console também
        const logMethod = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log';
        console[logMethod](`[XR Debug] ${message}`, data || '');
    }

    /**
     * Atualiza painel de logs
     */
    updateLogsPanel() {
        const el = document.getElementById('xr-logs');
        if (!el) return;

        const recent = this.logs.slice(-20);
        el.innerHTML = recent.map(log => `
            <div class="xr-log-entry ${log.type}">
                <span class="xr-log-time">${log.timestamp.split('T')[1].split('.')[0]}</span>
                <span class="xr-log-msg">${log.message}</span>
            </div>
        `).join('');

        el.scrollTop = el.scrollHeight;
    }

    /**
     * Limpa logs
     */
    clearLogs() {
        this.logs = [];
        this.updateLogsPanel();
    }

    /**
     * Exporta logs como JSON
     */
    exportLogs() {
        const data = {
            xrInfo: this.xrInfo,
            logs: this.logs,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `xr_debug_${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Monitora eventos de uma sessão XR
     */
    monitorSession(session) {
        if (!session) return;

        this.log('info', 'Session started', { mode: session.mode });
        this.updateSessionInfo(session);

        session.addEventListener('end', () => {
            this.log('info', 'Session ended');
            this.updateSessionInfo(null);
        });

        session.addEventListener('visibilitychange', () => {
            this.log('info', `Visibility changed: ${session.visibilityState}`);
        });

        session.addEventListener('inputsourceschange', (e) => {
            this.log('info', `Input sources changed: +${e.added.length} -${e.removed.length}`);
        });
    }
}

// Singleton
let instance = null;

export function getWebXRDebugger() {
    if (!instance) {
        instance = new WebXRDebugger();
    }
    return instance;
}
