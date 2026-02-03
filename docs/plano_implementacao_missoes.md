# Plano de Implementação: Novo Sistema de Missões em RA

Este documento serve como checklist para acompanhar o progresso da implementação do novo sistema de missões.

## Fase 1: Dados e Nova Estrutura
- [x] Limpar `QuestDatabase.js` antigo.
- [x] Criar novo schema de `Quest` suportando múltiplos tipos (Combate, Coleta, Puzzle, Interação).
- [x] Implementar classe `MissionManager` (Singleton).
- [x] Implementar método `acceptQuest(questId)` no `MissionManager`.
- [x] Implementar método `abandonQuest(questId)` no `MissionManager`.
- [x] Implementar método `completeQuest(questId)` no `MissionManager`.

## Fase 2: UI e Fluxo de Diálogo
- [x] Criar estrutura HTML/CSS para a UI de Diálogo (`DialogueSystem`).
- [x] Implementar `DialogueSystem.js` para gerenciar exibição de textos e opções.
- [x] Adicionar suporte a múltiplos botões na UI (Aceitar, Recusar, Desistir).
- [x] Implementar lógica de estados no NPC (Ofertante vs Aguardando Retorno vs Conclusão).

## Fase 3: Integração RA e Mapa
- [x] Atualizar `MapController.js` para exibir marcadores de missões.
- [x] Modificar lógica de marcadores de NPC para **não sumirem** ao aceitar a missão.
- [x] Implementar mudança visual no marcador do NPC quando a missão está ativa.
- [x] Criar lógica para spawnar objetos de missão (inimigos, itens colecionáveis) ao aceitar.
- [x] Criar lógica para remover objetos de missão ao desistir (`abandonQuest`).
- [x] Implementar interação de RA "Clicar para Falar" com NPCs.
- [x] Implementar interação de RA "Clicar para Coletar" para itens.

## Fase 4: Tipos de Missão Específicos
- [ ] Implementar lógica específica para missões de **Combate** (rastrear kills).
- [ ] Implementar lógica específica para missões de **Coleta** (rastrear inventário/interações).
- [ ] Implementar lógica específica para missões de **Puzzle/Investigação**.

## Plano de Verificação
- [ ] **Teste de Desistência**: Aceitar missão -> Verificar NPC no mapa -> Desistir -> Verificar limpeza de objetivos.
- [ ] **Teste de Combate**: Aceitar missão -> Matar inimigos -> Concluir.
- [ ] **Teste de Coleta**: Aceitar missão -> Coletar itens em RA -> Concluir.
