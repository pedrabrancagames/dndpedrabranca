# 🎮 Game Design - D&D Pedra Branca

Este documento detalha as mecânicas, sistemas e o funcionamento interno do jogo.

---

## 🔄 Core Loop (Ciclo Principal)

O ciclo principal do jogo consiste em quatro fases:
1.  **Exploração**: O jogador move-se no mundo real para encontrar Pontos de Interesse (POIs) no mapa virtual.
2.  **Encontro**: Interação com NPCs ou início de combate com inimigos.
3.  **Resolução**: Vencer o combate (AR) ou completar o diálogo/missão.
4.  **Recompensa & Evolução**: Ganho de XP, Ouro e Itens. Melhoria do personagem.

---

## 🛠️ Sistemas Principais

### 1. Sistema de Mapeamento (GPS)
Responsável por traduzir a localização real do jogador para o mundo do jogo.
-   **Tecnologia**: Leaflet.
-   **Funcionamento**: Gera eventos (`ExplorationEvents`) procedurais ou fixos baseados na coordenada geográfica.
-   **Interação**: O jogador deve estar dentro de um raio de interação (ex: 20-50 metros) para ativar o evento.

### 2. Sistema de Combate (AR + Cartas)
Um híbrido de RPG por turnos e jogo de cartas colecionáveis (TCG), visualizado em Realidade Aumentada.
-   **Turnos**: Jogador e Inimigo alternam ações.
-   **Recurso**: Energia (AP) recarrega a cada turno. Cartas custam AP.
-   **Mecânica de Cartas**:
    -   **Ataque**: Dano direto ou em área.
    -   **Defesa**: Escudos e redução de dano.
    -   **Utilitário**: Cura, buffs, debuffs.
-   **Inimigos (IA)**: Possuem comportamentos definidos em `EnemyAI.js` (ex: Aggressive, Defensive, Healer).

### 3. Sistema de Missões e Narrativa
-   **Missões**: Gerenciadas pelo `MissionManager`. Podem ser de "Matar X inimigos", "Falar com NPC Y" ou "Coletar Item Z".
-   **Diálogos**: Sistema de árvore de diálogos (`DialogueSystem`) que permite escolhas.
-   **NPCs**: Personagens persistentes (`NPCDatabase`) que oferecem missões e lore.

### 4. Economia e Inventário
-   **Moeda**: Ouro (Gold).
-   **Lojas**: `ShopSystem` permite compra e venda de itens.
-   **Itens**: Consumíveis (poções), Equipamentos e Itens de Missão (`ItemDatabase`).

---

## 📊 Estrutura de Dados

### Entidades
Tudo no jogo é gerenciado por Managers que acessam Databases estáticos (JSON/JS Objects).

-   `GameManager`: Orquestrador central.
-   `StateManager`: Mantém o save (persistência local via `localStorage`).
-   `CardDatabase`: Definições de todas as cartas jogáveis.
-   `QuestDatabase`: Definições das missões disponíveis.

---

## 🎲 Balanceamento

O jogo escala a dificuldade dos inimigos com base na distância do ponto inicial ou nível do jogador (a definir na implementação final). Atualmente, inimigos possuem status fixos definidos em `EnemyDatabase`.
