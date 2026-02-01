/**
 * DialogueSystem - Sistema de Gerenciamento de Diálogos
 * Controla o fluxo de conversas, opções e eventos
 */
import { eventBus } from '../core/EventEmitter.js';
import { getDialogue } from '../data/DialogueDatabase.js'; // Ensure this path is correct relative to src/systems
import { getNPCData } from '../data/NPCDatabase.js';     // Ensure this path is correct
// import { getQuestData } from '../data/QuestDatabase.js'; // Future use

export class DialogueSystem {
    constructor() {
        this.activeDialogue = null;
        this.currentNodeId = null;
        this.currentNPCId = null;

        // UI Elements
        this.ui = {
            overlay: document.getElementById('dialogue-overlay'),
            speakerName: document.getElementById('dialogue-speaker'),
            text: document.getElementById('dialogue-text'),
            optionsContainer: document.getElementById('dialogue-options'),
            // Portrait/image if added later
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Iniciar diálogo quando NPC é selecionado
        eventBus.on('npcSelected', (data) => {
            this.startDialogueForNPC(data.npcId);
        });
    }

    /**
     * Inicia o diálogo associado a um NPC
     */
    startDialogueForNPC(npcId) {
        const npcData = getNPCData(npcId);
        if (!npcData || !npcData.dialogueId) {
            console.warn(`No dialogue found for NPC: ${npcId}`);
            return;
        }

        this.currentNPCId = npcId;
        this.startDialogue(npcData.dialogueId);
    }

    /**
     * Carrega e exibe um diálogo específico
     */
    startDialogue(dialogueId) {
        const dialogueData = getDialogue(dialogueId);
        if (!dialogueData) {
            console.error(`Dialogue ID not found: ${dialogueId}`);
            return;
        }

        this.activeDialogue = dialogueData;
        this.currentNodeId = 'start';

        this.showUI(true);
        this.displayNode('start');

        eventBus.emit('dialogueStarted', { dialogueId });
    }

    /**
     * Exibe um nó específico do diálogo atual
     */
    displayNode(nodeId) {
        if (!this.activeDialogue || !this.activeDialogue[nodeId]) {
            console.error(`Node not found: ${nodeId}`);
            this.endDialogue();
            return;
        }

        const node = this.activeDialogue[nodeId];
        this.currentNodeId = nodeId;

        // Atualizar Texto
        if (this.ui.speakerName) this.ui.speakerName.textContent = node.speaker || '???';
        if (this.ui.text) this.ui.text.textContent = node.text;

        // Renderizar Opções
        this.renderOptions(node.options || []);

        // Processar Ações do Nó (se tiver)
        if (node.action) {
            this.handleAction(node.action);
        }

        // Se for nó final, encerrar após clique (gerenciado nas opções ou clique na tela)
        if (node.isEnd) {
            // Se não tiver options, adicionar opção "Sair" padrão
            if (!node.options || node.options.length === 0) {
                this.renderOptions([{ text: "Sair", next: "_exit" }]);
            }
        }
    }

    /**
     * Renderiza os botões de opção
     */
    renderOptions(options) {
        if (!this.ui.optionsContainer) return;

        this.ui.optionsContainer.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-option-btn';
            btn.textContent = option.text;

            btn.addEventListener('click', () => {
                this.selectOption(option);
            });

            this.ui.optionsContainer.appendChild(btn);
        });
    }

    /**
     * Processa a seleção de uma opção
     */
    selectOption(option) {
        // Processar ação da opção
        if (option.action) {
            this.handleAction(option.action);
        }

        // Navegacao
        if (option.next === '_exit' || option.next === 'end') {
            this.endDialogue();
        } else if (option.next) {
            this.displayNode(option.next);
        } else {
            this.endDialogue();
        }
    }

    /**
     * Gerencia ações especiais (Quests, Loja, etc)
     */
    handleAction(actionString) {
        console.log(`Dialogue Action: ${actionString}`);

        const [actionType, payload] = actionString.split(':');

        switch (actionType) {
            case 'START_QUEST':
                eventBus.emit('questStarted', { questId: payload });
                // TODO: Adicionar notificação visual
                break;

            case 'OPEN_SHOP':
                this.endDialogue(); // Fecha diálogo para abrir loja
                eventBus.emit('openShop', { npcId: this.currentNPCId });
                break;

            default:
                console.warn(`Unknown dialogue action: ${actionType}`);
        }
    }

    /**
     * Encerra o diálogo e esconde a UI
     */
    endDialogue() {
        this.activeDialogue = null;
        this.currentNodeId = null;
        this.currentNPCId = null;
        this.showUI(false);
        eventBus.emit('dialogueEnded');
    }

    /**
     * Mostra/Esconde a UI
     */
    showUI(visible) {
        if (!this.ui.overlay) {
            // Tentar buscar elementos novamente caso o DOM tenha mudado
            this.ui.overlay = document.getElementById('dialogue-overlay');
            if (!this.ui.overlay) return;
        }

        if (visible) {
            this.ui.overlay.style.display = 'flex'; // ou 'block' dependendo do CSS
            this.ui.overlay.classList.remove('hidden');
        } else {
            this.ui.overlay.style.display = 'none';
            this.ui.overlay.classList.add('hidden');
        }
    }
}
