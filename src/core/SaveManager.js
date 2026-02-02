/**
 * SaveManager - Sistema de Salvamento
 * Gerencia persistência de dados via LocalStorage e IndexedDB
 */

const STORAGE_KEY = 'dnd_pedra_branca';
const DB_NAME = 'dnd_pedra_branca_db';
const DB_VERSION = 1;
const AUTO_SAVE_INTERVAL = 30000; // 30 segundos
const SYNC_QUEUE_KEY = 'dnd_sync_queue';


const SCHEMA_VERSION = '0.1.1';

// Schema padrão para validação e auto-reparo
const DEFAULT_SCHEMA = {
    heroes: [],
    inventory: [],
    gold: 0,
    fragments: 0,
    currentMission: null,
    chapter: 1,
    quests: { active: [], completed: [], progress: {} },
    eventLog: [],
    reputation: 0,
    version: SCHEMA_VERSION
};

export class SaveManager {
    constructor() {
        this.db = null;
        this.isReady = false;
        this.autoSaveTimer = null;
        this.pendingSync = [];
        this.lastSaveTime = 0;
    }

    /**
     * Inicializa o sistema de salvamento
     */
    async init() {
        try {
            await this.initIndexedDB();
            this.isReady = true;
            this.loadPendingSync();
            console.log('SaveManager initialized');
        } catch (error) {
            console.warn('IndexedDB not available, falling back to LocalStorage only');
            this.isReady = true;
        }
    }

    /**
     * Inicializa o IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para estado do jogo
                if (!db.objectStoreNames.contains('gameState')) {
                    db.createObjectStore('gameState', { keyPath: 'id' });
                }

                // Store para assets offline
                if (!db.objectStoreNames.contains('assets')) {
                    db.createObjectStore('assets', { keyPath: 'url' });
                }
            };
        });
    }

    /**
     * Salva o estado do jogo
     * @param {object} state - Estado a ser salvo
     */
    async save(state) {
        const data = {
            ...state,
            savedAt: Date.now(),
            version: SCHEMA_VERSION
        };

        // Salvar no LocalStorage (rápido, para dados pequenos)
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('LocalStorage save failed:', error);
        }

        // Salvar no IndexedDB (para dados maiores)
        if (this.db) {
            try {
                await this.saveToIndexedDB('gameState', { id: 'main', ...data });
            } catch (error) {
                console.error('IndexedDB save failed:', error);
            }
        }
    }

    /**
     * Carrega o estado do jogo
     * @returns {object|null} Estado carregado ou null
     */
    async load() {
        let rawData = null;

        // 1. Tentar IndexedDB primeiro
        if (this.db) {
            try {
                rawData = await this.loadFromIndexedDB('gameState', 'main');
            } catch (error) {
                console.warn('IndexedDB load failed:', error);
            }
        }

        // 2. Fallback para LocalStorage
        if (!rawData) {
            try {
                const lsData = localStorage.getItem(STORAGE_KEY);
                if (lsData) rawData = JSON.parse(lsData);
            } catch (error) {
                console.error('LocalStorage load failed:', error);
            }
        }

        if (!rawData) return null;

        // 3. Validação e Migração
        try {
            const validatedData = this.validateAndMigrate(rawData);
            return validatedData;
        } catch (error) {
            console.error('Save data corrupted or invalid:', error);
            // Em caso de corrupção crítica, retornar null forçará um New Game (seguro)
            // ou poderíamos retornar um backup. Por enquanto, fail-safe é null.
            return null;
        }
    }

    /**
     * Valida e migra os dados salvos
     */
    validateAndMigrate(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid save data format');
        }

        // Verificar versão
        let currentData = { ...data };

        // Migração simples (se houver versões futuras, isso cresce)
        if (!currentData.version) {
            console.warn('Save data missing version. Assuming legacy (0.0.1). Migrating...');
            currentData.version = '0.0.1';
            // Exemplo de migração: garantir campos novos
            currentData = this.migrateSave(currentData);
        } else if (currentData.version !== SCHEMA_VERSION) {
            console.log(`Migrating save from ${currentData.version} to ${SCHEMA_VERSION}`);
            currentData = this.migrateSave(currentData);
        }

        // Validação de Schema (Auto-reparo)
        // Garante que campos obrigatórios existam, usando defaults se necessário
        const sanitized = {
            ...DEFAULT_SCHEMA, // Base defaults
            ...currentData     // Sobrescreve com dados salvos
        };

        // Verificações profundas críticas
        if (!Array.isArray(sanitized.heroes)) sanitized.heroes = [];
        if (!Array.isArray(sanitized.inventory)) sanitized.inventory = [];
        if (typeof sanitized.gold !== 'number') sanitized.gold = 0;

        return sanitized;
    }

    /**
     * Lógica de migração de versões
     */
    migrateSave(data) {
        // Exemplo: Se versão < 0.1.0, adicionar campo 'fragments'
        // Por enquanto, apenas atualiza a versão e garante campos novos do schema default
        // A mesclagem com DEFAULT_SCHEMA no validate já cuida de campos novos faltantes

        data.version = SCHEMA_VERSION;
        return data;
    }


    /**
     * Verifica se existe save
     */
    hasSave() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    /**
     * Deleta o save
     */
    async deleteSave() {
        localStorage.removeItem(STORAGE_KEY);

        if (this.db) {
            try {
                await this.deleteFromIndexedDB('gameState', 'main');
            } catch (error) {
                console.warn('IndexedDB delete failed:', error);
            }
        }
    }

    /**
     * Salva no IndexedDB
     */
    async saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Carrega do IndexedDB
     */
    async loadFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Deleta do IndexedDB
     */
    async deleteFromIndexedDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Inicia auto-save periódico
     */
    startAutoSave(gameManager) {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(async () => {
            if (gameManager?.gameData) {
                await this.save(gameManager.gameData);
                this.lastSaveTime = Date.now();
                console.log('Auto-save completed');
            }
        }, AUTO_SAVE_INTERVAL);
    }

    /**
     * Para auto-save
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Carrega sincronizações pendentes
     */
    loadPendingSync() {
        try {
            const data = localStorage.getItem(SYNC_QUEUE_KEY);
            this.pendingSync = data ? JSON.parse(data) : [];
        } catch {
            this.pendingSync = [];
        }
    }

    /**
     * Adiciona item à fila de sincronização
     */
    addToSyncQueue(action) {
        this.pendingSync.push({
            ...action,
            timestamp: Date.now()
        });

        try {
            localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.pendingSync));
        } catch (error) {
            console.error('Failed to save sync queue:', error);
        }
    }

    /**
     * Processa sincronização pendente quando online
     */
    async processSyncQueue() {
        if (!navigator.onLine || this.pendingSync.length === 0) {
            return { processed: 0 };
        }

        let processed = 0;
        const failed = [];

        for (const action of this.pendingSync) {
            try {
                // Aqui seria implementada a sincronização com backend
                // Por enquanto, apenas limpa a fila
                processed++;
            } catch {
                failed.push(action);
            }
        }

        this.pendingSync = failed;
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.pendingSync));

        return { processed, remaining: failed.length };
    }

    /**
     * Exporta save como JSON (para backup)
     */
    async exportSave() {
        const data = await this.load();
        if (!data) return null;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `dnd_pedra_branca_save_${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Importa save de JSON
     */
    async importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    await this.save(data);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid save file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Retorna estatísticas do save
     */
    getSaveStats() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return null;

            const parsed = JSON.parse(data);
            return {
                savedAt: parsed.savedAt,
                version: parsed.version,
                size: new Blob([data]).size,
                hasPendingSync: this.pendingSync.length > 0,
                pendingSyncCount: this.pendingSync.length
            };
        } catch {
            return null;
        }
    }
}
