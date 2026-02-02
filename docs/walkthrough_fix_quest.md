# Walkthrough - Correção de Bugs de Missão e NPC

## Problemas Resolvidos

1.  **Spawn Indesejado de Inimigos**: Ao interagir com o NPC Prefeito, goblins estavam aparecendo na cena AR.
2.  **Bloqueio de Progresso**: A missão "A Ameaça Goblin" exigia 5 abates, mas o encontro gerava apenas ~4 inimigos, impedindo o jogador de reportar o sucesso ao NPC.

## Alterações Realizadas

### 1. Limpeza de Inimigos (`CombatManager.js` e `GameManager.js`)
Implementado método `clearEnemies()` no `CombatManager` e adicionada chamada explícita no `GameManager` antes de iniciar interações com NPCs. Isso garante que a lista de inimigos esteja vazia e previne spawns residuais.

```javascript
// src/core/GameManager.js
if (data.isNPC) {
    console.log('Starting NPC Interaction:', data.npcId);
    this.combatManager.clearEnemies(); // Bugfix
    this.arSceneManager.startSession();
    // ...
}
```

### 2. Ajuste de Requisitos da Quest (`QuestDatabase.js`)
Reduzida a quantidade necessária de goblins derrotados de 5 para 3. Isso garante que um único encontro de combate seja suficiente para cumprir o objetivo e liberar o diálogo com o Prefeito.

```javascript
// src/data/QuestDatabase.js
{ 
    id: 'kill_goblins', 
    type: ObjectiveType.KILL, 
    description: 'Derrotar goblins', 
    target: 'goblin', 
    progress: 0, 
    required: 3 // Reduzido de 5
}
```

## Como Testar
1. Aceite a missão "A Ameaça Goblin".
2. Vá ao marcador de combate (espada) e vença a batalha.
3. Vá ao marcador de diálogo (Prefeito).
4. **Resultado Esperado**: A cena AR abrirá apenas com o Prefeito (sem goblins) e o diálogo de conclusão prosseguirá normalmente.
