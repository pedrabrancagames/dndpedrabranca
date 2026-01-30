/**
 * PerformanceMonitor - Monitor de Performance em Tempo Real
 * Exibe FPS, memória e métricas do WebXR
 */
import { eventBus } from '../core/EventEmitter.js';

export class PerformanceMonitor {
    constructor() {
        this.enabled = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.metrics = {
            fps: 0,
            avgFps: 0,
            memory: 0,
            drawCalls: 0,
            triangles: 0,
            textures: 0
        };

        this.fpsHistory = [];
        this.maxHistory = 60;

        this.panel = null;
    }

    /**
     * Ativa/desativa o monitor
     */
    toggle() {
        this.enabled = !this.enabled;

        if (this.enabled) {
            this.createPanel();
            this.startMonitoring();
        } else {
            this.destroyPanel();
        }

        return this.enabled;
    }

    /**
     * Cria o painel de exibição
     */
    createPanel() {
        if (this.panel) return;

        this.panel = document.createElement('div');
        this.panel.id = 'perf-monitor';
        this.panel.className = 'perf-monitor';
        this.panel.innerHTML = `
            <div class="perf-header">📊 Performance</div>
            <div class="perf-row">
                <span class="perf-label">FPS:</span>
                <span class="perf-value" id="perf-fps">--</span>
            </div>
            <div class="perf-row">
                <span class="perf-label">Avg FPS:</span>
                <span class="perf-value" id="perf-avg-fps">--</span>
            </div>
            <div class="perf-row">
                <span class="perf-label">Memory:</span>
                <span class="perf-value" id="perf-memory">--</span>
            </div>
            <div class="perf-row">
                <span class="perf-label">Draw Calls:</span>
                <span class="perf-value" id="perf-draws">--</span>
            </div>
            <div class="perf-row">
                <span class="perf-label">Triangles:</span>
                <span class="perf-value" id="perf-triangles">--</span>
            </div>
            <div class="perf-bar">
                <div class="perf-bar-fill" id="perf-bar-fill"></div>
            </div>
        `;

        document.body.appendChild(this.panel);
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
     * Inicia o monitoramento
     */
    startMonitoring() {
        const update = () => {
            if (!this.enabled) return;

            this.frameCount++;
            const now = performance.now();
            const delta = now - this.lastTime;

            if (delta >= 1000) {
                this.metrics.fps = Math.round((this.frameCount / delta) * 1000);
                this.frameCount = 0;
                this.lastTime = now;

                // Histórico para média
                this.fpsHistory.push(this.metrics.fps);
                if (this.fpsHistory.length > this.maxHistory) {
                    this.fpsHistory.shift();
                }

                this.metrics.avgFps = Math.round(
                    this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
                );

                // Memória (se disponível)
                if (performance.memory) {
                    this.metrics.memory = Math.round(
                        performance.memory.usedJSHeapSize / (1024 * 1024)
                    );
                }

                this.updatePanel();
            }

            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }

    /**
     * Atualiza métricas do renderer Three.js
     */
    updateRendererMetrics(renderer) {
        if (!renderer?.info) return;

        this.metrics.drawCalls = renderer.info.render.calls;
        this.metrics.triangles = renderer.info.render.triangles;
        this.metrics.textures = renderer.info.memory?.textures || 0;
    }

    /**
     * Atualiza o painel visual
     */
    updatePanel() {
        if (!this.panel) return;

        const fpsEl = document.getElementById('perf-fps');
        const avgFpsEl = document.getElementById('perf-avg-fps');
        const memEl = document.getElementById('perf-memory');
        const drawsEl = document.getElementById('perf-draws');
        const trianglesEl = document.getElementById('perf-triangles');
        const barEl = document.getElementById('perf-bar-fill');

        if (fpsEl) {
            fpsEl.textContent = this.metrics.fps;
            fpsEl.className = `perf-value ${this.getFPSClass(this.metrics.fps)}`;
        }
        if (avgFpsEl) avgFpsEl.textContent = this.metrics.avgFps;
        if (memEl) memEl.textContent = `${this.metrics.memory} MB`;
        if (drawsEl) drawsEl.textContent = this.metrics.drawCalls;
        if (trianglesEl) trianglesEl.textContent = this.formatNumber(this.metrics.triangles);

        if (barEl) {
            const percent = Math.min(100, (this.metrics.fps / 60) * 100);
            barEl.style.width = `${percent}%`;
            barEl.className = `perf-bar-fill ${this.getFPSClass(this.metrics.fps)}`;
        }
    }

    /**
     * Retorna classe CSS baseado no FPS
     */
    getFPSClass(fps) {
        if (fps >= 55) return 'good';
        if (fps >= 30) return 'warning';
        return 'bad';
    }

    /**
     * Formata número grande
     */
    formatNumber(num) {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }

    /**
     * Log de performance para debugging
     */
    logMetrics() {
        console.table({
            'FPS': this.metrics.fps,
            'Avg FPS': this.metrics.avgFps,
            'Memory (MB)': this.metrics.memory,
            'Draw Calls': this.metrics.drawCalls,
            'Triangles': this.metrics.triangles,
            'Textures': this.metrics.textures
        });
    }

    /**
     * Marca início de uma operação para medir tempo
     */
    startMeasure(name) {
        performance.mark(`${name}-start`);
    }

    /**
     * Marca fim e retorna duração
     */
    endMeasure(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const entries = performance.getEntriesByName(name);
        const duration = entries[entries.length - 1]?.duration || 0;

        // Limpar marcas
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);

        return duration;
    }
}

// Singleton
let instance = null;

export function getPerformanceMonitor() {
    if (!instance) {
        instance = new PerformanceMonitor();
    }
    return instance;
}
