/**
 * BaseScreen - Classe base para todas as telas
 */
export class BaseScreen {
    constructor(screenId) {
        this.screenId = screenId;
        this.element = document.getElementById(screenId);

        if (!this.element) {
            console.warn(`Screen element not found: ${screenId}`);
        }
    }

    /**
     * Chamado quando a tela é mostrada
     * @param {object} data - Dados passados para a tela
     */
    onShow(data) { }

    /**
     * Chamado quando a tela é escondida
     */
    onHide() { }

    /**
     * Configura event listeners (chamado apenas uma vez na inicialização)
     */
    setupEvents() { }

    /**
     * Helper para buscar elementos dentro da tela
     */
    findElement(selector) {
        return this.element ? this.element.querySelector(selector) : null;
    }

    /**
     * Helper para bindar clicks
     */
    bindClick(selector, handler) {
        const el = this.findElement(selector);
        if (el) {
            el.addEventListener('click', handler);
        } else {
            console.warn(`Element not found for bindClick: ${selector} in ${this.screenId}`);
        }
    }
}
