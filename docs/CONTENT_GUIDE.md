# 🎨 Guia de Criação de Conteúdo

Este guia explica como adicionar novos conteúdos (Itens, Inimigos, Missões) ao D&D Pedra Branca sem precisar alterar a lógica central do jogo.

---

## 🗡️ Adicionando Novos Itens

Os itens estão definidos em `src/data/ItemDatabase.js`.

### Passos:
1.  Adicione um ID único em `GameConstants.js` (ou use uma string direta, mas constantes são recomendadas).
2.  Adicione a entrada no objeto `ItemDatabase`:

```javascript
[ItemIDs.NOVO_ITEM]: {
    id: ItemIDs.NOVO_ITEM,
    name: 'Nome do Item',
    icon: '🔮', // Emoji ou caminho de imagem
    category: ItemCategory.WEAPON, // WEAPON, ARMOR, CONSUMABLE, etc.
    rarity: CardRarity.RARE,
    description: 'Descrição que aparece para o jogador.',
    stats: { atk: 10, mag: 5 }, // Atributos
    equipSlot: 'mainHand', // Onde equipa? (mainHand, torso, accessory)
    price: 100 // Valor em ouro
}
```

---

## 👹 Adicionando Novos Inimigos

Inimigos estão em `src/data/EnemyDatabase.js`.

### Estrutura do Inimigo:
```javascript
enemy_id: {
    name: 'Goblin Ladino',
    model: 'goblin.glb', // Nome do arquivo GLB em public/models/
    stats: {
        hp: 50,
        atk: 8,
        def: 2
    },
    behavior: 'aggressive', // Define a IA em CombatManager
    rewards: {
        xp: 20,
        gold: { min: 5, max: 15 },
        drops: ['potion_small'] // IDs de itens que podem dropar
    }
}
```

> **Nota**: Para adicionar o modelo 3D, coloque o arquivo `.glb` ou `.gltf` na pasta `public/models/`.

---

## 📜 Criando Novas Missões

Missões são definidas em `src/data/QuestDatabase.js`.

### Estrutura da Quest:
```javascript
quest_id: {
    title: 'Limpar a Caverna',
    description: 'Derrote 5 esqueletos na caverna norte.',
    giver: 'npc_prefeito', // ID do NPC que dá a missão
    objectives: [
        { type: 'kill', target: 'skeleton', count: 5 }
    ],
    rewards: {
        xp: 100,
        gold: 50,
        items: ['sword_iron']
    },
    requirements: {
        level: 2, // Nível mínimo
        quest: 'quest_anterior_id' // Pré-requisito
    }
}
```
