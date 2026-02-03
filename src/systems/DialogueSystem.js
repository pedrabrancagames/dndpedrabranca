/**
 * DialogueSystem - Sistema de Gerenciamento de Diálogos
 * Controla o fluxo de conversas, opções e interações de missão
 */
import { eventBus } from '../core/EventEmitter.js';
import { getQuestData, QuestDatabase, QuestStatus } from '../data/QuestDatabase.js';
import { missionManager } from './MissionManager.js';

export class DialogueSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeQuestId = null;
        this.currentNPCId = null;

        // UI Elements
        this.ui = {
            overlay: document.getElementById('dialogue-overlay'),
            speakerName: document.getElementById('dialogue-speaker'),
            text: document.getElementById('dialogue-text'),
            optionsContainer: document.getElementById('dialogue-options'),
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Iniciar diálogo quando NPC é selecionado
        eventBus.on('npcSelected', (data) => {
            console.log('Dialogue Requested for:', data.npcId);
            this.startDialogueForNPC(data.npcId);
        });
    }

    /**
     * Inicia o diálogo associado a um NPC
     * Verifica se o NPC tem quests associadas e qual o estado delas
     */
    startDialogueForNPC(npcId) {
        this.currentNPCId = npcId;

        // 1. Verificar se este NPC tem alguma quest ativa ou disponível
        // Simplificação: vamos varrer o DB para achar quests deste NPC (giverId)
        // Em um projeto maior, o NPC teria uma lista de quests nele.

        // QuestDatabase e QuestStatus já importados no topo

        let targetQuest = null;
        let dialogueType = 'default'; // 'offer', 'active', 'completed', 'default'

        const allQuests = Object.values(QuestDatabase);

        // Prioridade: Completar > Ativa > Oferecer

        // A. Verificar Completas (Prontas para entregar)
        const activeQuests = missionManager.getActiveQuests();
        const readyToComplete = activeQuests.find(qState => {
            const qDef = QuestDatabase[qState.id];
            return qDef && qDef.giverId === npcId && missionManager.canComplete(qState.id);
        });

        if (readyToComplete) {
            targetQuest = QuestDatabase[readyToComplete.id];
            dialogueType = 'completed';
        } else {
            // B. Verificar Ativas (Em progresso)
            const inProgress = activeQuests.find(qState => {
                const qDef = QuestDatabase[qState.id];
                return qDef && qDef.giverId === npcId;
            });

            if (inProgress) {
                targetQuest = QuestDatabase[inProgress.id];
                dialogueType = 'active';
            } else {
                // C. Verificar Disponíveis (Novas)
                // TODO: Verificar requisitos de nível aqui se necessário
                const available = allQuests.find(q =>
                    q.giverId === npcId &&
                    missionManager.getQuestState(q.id) === QuestStatus.AVAILABLE
                );

                if (available) {
                    targetQuest = available;
                    dialogueType = 'offer';
                }
            }
        }

        if (targetQuest && targetQuest.dialogue && targetQuest.dialogue[dialogueType]) {
            this.activeQuestId = targetQuest.id;
            this.showDialogueNode(targetQuest.dialogue[dialogueType], npcId);
        } else {
            // Fallback: Diálogo genérico
            this.showGenericDialogue(npcId, "Saudações, viajante.");
        }
    }

    showDialogueNode(nodeData, speakerId) {
        this.showUI(true);

        // Configurar Texto e Speaker
        // Mapeamento simples de ID -> Nome (num jogo real estaria no DB de NPCs)
        const speakerNames = {
            'mayor': 'Prefeito Magnus',
            'healer': 'Curandeira Elara',
            'guard': 'Guarda'
        };

        this.ui.speakerName.textContent = speakerNames[speakerId] || 'NPC';
        this.ui.text.textContent = nodeData.text;

        // Renderizar Opções
        this.renderOptions(nodeData.options);
    }

    showGenericDialogue(speakerId, text) {
        this.showUI(true);
        this.ui.speakerName.textContent = 'NPC';
        this.ui.text.textContent = text;

        this.renderOptions([
            { text: "Até logo.", action: 'close' }
        ]);
    }

    renderOptions(options) {
        this.ui.optionsContainer.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'dialogue-option-btn';
            btn.textContent = opt.text;

            // Estilizar botões baseado na ação (accept, refuse, abandon)
            if (opt.action === 'accept') btn.classList.add('accept');
            if (opt.action === 'refuse' || opt.action === 'abandon') btn.classList.add('refuse');

            btn.onclick = () => this.handleAction(opt.action);

            this.ui.optionsContainer.appendChild(btn);
        });
    }

    handleAction(action) {
        console.log(`Action selected: ${action}`);

        switch (action) {
            case 'accept':
                if (this.activeQuestId) {
                    missionManager.acceptQuest(this.activeQuestId);
                    // Feedback visual pode ser um Toast notification
                    console.log("Mission Accepted!");
                }
                this.endDialogue();
                break;

            case 'abandon':
                if (this.activeQuestId) {
                    missionManager.abandonQuest(this.activeQuestId);
                    console.log("Mission Abandoned!");
                }
                this.endDialogue();
                break;

            case 'complete':
                if (this.activeQuestId) {
                    missionManager.completeQuest(this.activeQuestId);
                    console.log("Mission Completed!");
                }
                this.endDialogue();
                break;

            case 'refuse':
            case 'close':
            default:
                this.endDialogue();
                break;
        }
    }

    endDialogue() {
        this.showUI(false);
        this.currentNPCId = null;
        this.activeQuestId = null;
        eventBus.emit('dialogueEnded');
    }

    showUI(visible) {
        if (visible) {
            this.ui.overlay.classList.remove('hidden');
            this.ui.overlay.style.display = 'flex';
        } else {
            this.ui.overlay.classList.add('hidden');
            this.ui.overlay.style.display = 'none';
        }
    }
}
