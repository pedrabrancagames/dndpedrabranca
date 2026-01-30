/**
 * EventEmitter - Sistema de Eventos Central
 * Permite comunicação desacoplada entre módulos
 */
export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * Registra um listener para um evento
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função a ser chamada
     * @returns {Function} Função para remover o listener
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);

        // Retorna função de cleanup
        return () => this.off(event, callback);
    }

    /**
     * Registra um listener que será chamado apenas uma vez
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função a ser chamada
     */
    once(event, callback) {
        const wrapper = (...args) => {
            this.off(event, wrapper);
            callback(...args);
        };
        this.on(event, wrapper);
    }

    /**
     * Remove um listener de um evento
     * @param {string} event - Nome do evento
     * @param {Function} callback - Função a ser removida
     */
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }

    /**
     * Emite um evento para todos os listeners
     * @param {string} event - Nome do evento
     * @param {...any} args - Argumentos passados para os listeners
     */
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event handler for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Remove todos os listeners de um evento ou de todos os eventos
     * @param {string} [event] - Nome do evento (opcional)
     */
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}

// Instância global do event bus
export const eventBus = new EventEmitter();
