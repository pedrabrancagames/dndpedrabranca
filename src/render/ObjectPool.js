/**
 * ObjectPool - Pool genérico de objetos reutilizáveis
 * Reduz criação/destruição de objetos e pausas de garbage collection
 */

export class ObjectPool {
    /**
     * Cria um pool de objetos
     * @param {Function} factory - Função que cria um novo objeto
     * @param {Function} reset - Função que reseta um objeto para reutilização
     * @param {number} initialSize - Quantidade inicial de objetos no pool
     */
    constructor(factory, reset, initialSize = 5) {
        this.factory = factory;
        this.reset = reset;
        this.pool = [];
        this.activeCount = 0;

        // Pré-criar objetos iniciais
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Adquire um objeto do pool (cria novo se necessário)
     * @returns {*} Objeto pronto para uso
     */
    acquire() {
        this.activeCount++;

        if (this.pool.length > 0) {
            return this.pool.pop();
        }

        // Pool vazio - criar novo objeto
        return this.factory();
    }

    /**
     * Devolve um objeto ao pool para reutilização
     * @param {*} obj - Objeto a devolver
     */
    release(obj) {
        if (!obj) return;

        this.activeCount = Math.max(0, this.activeCount - 1);

        // Resetar objeto para estado limpo
        this.reset(obj);

        // Devolver ao pool
        this.pool.push(obj);
    }

    /**
     * Limpa todos os objetos do pool
     * @param {Function} dispose - Função opcional para limpar recursos
     */
    clear(dispose = null) {
        if (dispose) {
            this.pool.forEach(obj => dispose(obj));
        }
        this.pool = [];
        this.activeCount = 0;
    }

    /**
     * Retorna estatísticas do pool
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            available: this.pool.length,
            active: this.activeCount,
            total: this.pool.length + this.activeCount
        };
    }
}
