/**
 * DialogueSystem - Sistema de Gerenciamento de Diálogos
 * Controla o fluxo de conversas, opções e eventos
 */
import { eventBus } from '../core/EventEmitter.js';
import { getDialogue } from '../data/DialogueDatabase.js'; // Ensure this path is correct relative to src/systems
import { getNPCData } from '../data/NPCDatabase.js';     // Ensure this path is correct
import { getQuestData } from '../data/QuestDatabase.js';

export class DialogueSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
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
            console.log('Dialogue Requested for:', data.npcId, 'Context:', data.context);
            this.startDialogueForNPC(data.npcId, data.context);
        });
    }

    /**
     * Inicia o diálogo associado a um NPC
     */
    /**
     * Inicia o diálogo associado a um NPC
     * @param {string} npcId
     * @param {object} context - Contexto opcional (questId, objectiveId, etc)
     */
    startDialogueForNPC(npcId, context = null) {
        let dialogueId = null;

        // 1. Tentar determinar diálogo pelo contexto da quest
        if (context && context.questId && context.objectiveId) {
            // VERIFICAÇÃO DE PRÉ-REQUISITOS (SEQUENCIAL)
            if (this.gameManager && this.gameManager.progressionSystem) {
                const canProceed = this.gameManager.progressionSystem.checkQuestPrerequisites(context.questId, context.objectiveId);
                if (!canProceed) {
                    // Se não cumpriu requisitos anteriores, tenta achar um diálogo de "espera"
                    // ou mostra uma mensagem genérica
                    console.log('Prerequisites not met for:', context.objectiveId);

                    // Tentar diálogo específico de "bloqueado"
                    const lockedId = `${npcId}_${context.questId}_${context.objectiveId}_blocked`;
                    if (getDialogue(lockedId)) {
                        this.currentNPCId = npcId;
                        this.startDialogue(lockedId);
                        return;
                    }

                    // Fallback: Diálogo genérico de "Não está pronto"
                    this.startGenericDialogue(npcId, "Preciso que você termine suas tarefas antes de falarmos sobre isso.", "Entendido");
                    return;
                }
            }

            // Convenção: npcId_questId_objectiveId
            const specificId = `${npcId}_${context.questId}_${context.objectiveId}`;
            if (getDialogue(specificId)) {
                dialogueId = specificId;
            }
        }

        // 2. Fallback para diálogo padrão do NPC
        if (!dialogueId) {
            const npcData = getNPCData(npcId);
            if (npcData) {
                dialogueId = npcData.dialogueId;
            }
        }

        if (!dialogueId) {
            console.warn(`No dialogue found for NPC: ${npcId} with context:`, context);
            return;
        }

        this.currentNPCId = npcId;
        this.startDialogue(dialogueId);
    }

    /**
     * Inicia um diálogo construído dinamicamente
     */
    startGenericDialogue(npcId, text, optionText) {
        this.currentNPCId = npcId;
        this.activeDialogue = {
            start: {
                text: text,
                speaker: npcId === 'mayor' ? 'Prefeito Magnus' : 'NPC', // Simples mapeamento ou pegar do DB
                options: [{ text: optionText, next: '_exit' }],
                isEnd: true
            }
        };
        this.showUI(true);
        this.displayNode('start');
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

            case 'COMPLETE_QUEST':
                console.log('Completing quest via dialogue:', payload);
                // Emitir evento para o GameMaster completar a quest
                eventBus.emit('combat:victory', {
                    questId: payload, // Ex: 'deliver_letter'
                    // Para quests de entrega, geralmente não precisa de objectiveId específico se for a quest toda,
                    // mas podemos passar um genérico ou o sistema de quest lida com isso.
                    // Assumindo que payload é 'quest_id' ou 'quest_id:objective_id'
                });
                // Alternativa mais direta para o GameMaster:
                eventBus.emit('questCompleted', { questId: payload });
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
