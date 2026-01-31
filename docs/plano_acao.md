# Plano de Ação - Melhorias UI/UX D&D Pedra Branca

## Fase 1: Fundamentos (Semana 1-2) ✅

### 1.1 Inventário Básico ✅
- [x] Criar estrutura de dados para itens (`ItemDatabase.js`)
- [x] Implementar categorias (Armas, Armaduras, Consumíveis, Quest)
- [x] Adicionar visual de raridade (bordas coloridas)
- [x] Criar modal de detalhes do item
- [x] Implementar ações: Equipar, Usar, Descartar

### 1.2 Heróis - Upgrade de Cartas ✅
- [x] Criar UI de visualização do deck do herói
- [x] Integrar `CardDatabase` com a tela de heróis
- [x] Implementar upgrade de cartas (usar `getUpgradeCost()`)
- [x] Adicionar barra de XP/progresso de nível

---

## Fase 2: Game Master & Narrativa (Semana 3-4)

### 2.1 Hub de Missões
- [ ] Criar estrutura de dados para Quests (`QuestDatabase.js`)
- [ ] Implementar UI de Quest Log (Ativas/Concluídas)
- [ ] Exibir objetivos e recompensas

### 2.2 Eventos de Exploração
- [ ] Integrar `ExplorationEvents` com a tela GM
- [ ] Criar UI de escolhas (estilo pergaminho/carta)
- [ ] Implementar consequências das escolhas

### 2.3 Log de Eventos
- [ ] Criar sistema de histórico de ações
- [ ] Exibir últimos 10 eventos na tela GM

---

## Fase 3: NPCs em Realidade Aumentada (Semana 5-7)

### 3.1 Infraestrutura AR para NPCs
- [ ] Criar `NPCDatabase.js` (modelos 3D, diálogos, posição GPS)
- [ ] Adicionar estado `GameState.NPC_INTERACTION`
- [ ] Reutilizar `ARSceneManager` para posicionar NPCs
- [ ] Implementar detecção de clique no modelo 3D do NPC

### 3.2 Sistema de Diálogo
- [ ] Criar estrutura de árvore de diálogos (JSON)
- [ ] Implementar UI de caixa de diálogo (estilo Visual Novel)
- [ ] Adicionar opções de resposta do jogador
- [ ] Implementar memória de encontros anteriores

### 3.3 Comerciantes em AR
- [ ] Criar UI de loja flutuante ao lado do NPC
- [ ] Integrar com sistema de inventário e ouro

---

## Fase 4: Progressão Geolocalizada (Semana 8-10)

### 4.1 Zonas e Territórios
- [ ] Definir zonas no mapa (Floresta, Cemitério, Cidade)
- [ ] Vincular tipos de inimigos/NPCs às zonas
- [ ] Implementar visual de zona no mapa

### 4.2 Pontos de Interesse (POIs)
- [ ] Criar sistema de POIs (santuários, lojas, masmorras)
- [ ] Vincular eventos a POIs específicos
- [ ] Notificar jogador ao se aproximar de um POI

### 4.3 Clima e Hora (Opcional)
- [ ] Integrar API de clima/hora
- [ ] Alterar spawn de inimigos baseado em hora do dia

---

## Fase 5: UX & Polimento (Semana 11-12)

### 5.1 Animações e Transições
- [ ] Adicionar transições suaves entre telas (fade/slide)
- [ ] Implementar micro-animações nos botões

### 5.2 Feedback Sonoro
- [ ] Adicionar sons de UI (clique, equipar, abrir menu)
- [ ] Sons de notificação para eventos importantes

### 5.3 Tema Visual por Capítulo
- [ ] Criar paletas de cores por capítulo
- [ ] Alterar fundo/cores da UI dinamicamente

### 5.4 Notificações In-Game
- [ ] Criar componente de Toast/Banner
- [ ] Notificar: Item raro, Level up, Nova missão

---

## Prioridade de Implementação

| Prioridade | Funcionalidade | Impacto | Esforço |
|------------|----------------|---------|---------|
| 🔴 Alta | Inventário com Detalhes | Alto | Médio |
| 🔴 Alta | NPCs em AR (Diálogo) | Muito Alto | Alto |
| 🟡 Média | Hub de Missões | Alto | Médio |
| 🟡 Média | Upgrade de Cartas | Médio | Médio |
| 🟢 Baixa | Clima/Hora do Dia | Baixo | Alto |
| 🟢 Baixa | Tema por Capítulo | Médio | Baixo |

---

*Atualizado em: 30/01/2025*
