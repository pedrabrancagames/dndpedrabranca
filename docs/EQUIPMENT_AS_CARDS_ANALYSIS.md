# Análise: Equipamentos como Cartas (Estilo Battlemarked)

## Status: ✅ IMPLEMENTADO

Este documento analisa a viabilidade de implementar um sistema onde **equipamentos geram cartas no deck** do herói, similar ao jogo "Demeo x D&D: Battlemarked".

**Implementação concluída em:** 05/02/2026

---

## Sistema Atual

### Como funciona hoje:

1. **Deck de Heróis**
   - Cada herói tem um array `deck[]` com cartas de habilidades
   - Cartas são pré-definidas por classe (Guerreiro, Mago, etc.)
   - Cartas têm: custo PA, dano/cura, efeitos especiais
   - Máximo de 4 cartas exibidas na mão durante combate

2. **Equipamentos**
   - Armazenados em `hero.equipment = { weapon, armor, accessory }`
   - Dão bônus de **stats base** (atk, def, mag, hp)
   - Stats são aplicados como modificadores no cálculo de dano
   - Não interferem no deck

3. **Inventário**
   - Array `gameData.inventory = [{ itemId, quantity }]`
   - Itens consumíveis (poções) são usados fora de combate
   - Não há acesso a consumíveis durante combate

---

## Sistema Proposto (Battlemarked Style)

### Mudança Principal:
**Equipar um item = Adiciona uma carta ao deck do herói**

### Exemplos:
| Item | Carta Gerada |
|------|--------------|
| Lâmina Flamejante | "Corte Flamejante" - 2 PA, 20 dano + 10 fogo |
| Cajado Arcano | "Explosão Arcana" - 2 PA, 25 dano mágico |
| Poção de Vida | "Beber Poção" - 1 PA, cura 30 HP (consumível, some após uso) |
| Anel de Proteção | "Barreira do Anel" - 1 PA, +15 defesa por 2 turnos |

---

## Análise de Compatibilidade

### ✅ **COMPATÍVEL - Sem problemas:**

1. **CardSystem.js**
   - Já suporta: damage, heal, defense, buff, dot, cleanse
   - Cartas de equipamento usam os mesmos efeitos
   - Nenhuma mudança necessária

2. **CombatHUD.js**
   - Renderiza deck do herói atual
   - Se o deck tiver mais cartas, mostra automaticamente
   - Código de seleção e uso de cartas funciona igual

3. **CardDatabase.js**
   - Estrutura de carta suporta todos os efeitos necessários
   - Pode adicionar cartas geradas dinamicamente

4. **HeroesScreen.js**
   - Já mostra deck do herói
   - Mostrará cartas de equipamento automaticamente

### ⚠️ **REQUER MUDANÇAS - Impacto Médio:**

1. **InventoryScreen.js**
   - `equipItem()` precisa:
     - Adicionar carta ao `hero.deck[]`
     - Remover carta do deck ao desequipar
   - Complexidade: Média

2. **ItemDatabase.js**
   - Cada item equipável precisa ter um campo `generatesCard`:
   ```javascript
   [ItemIDs.SWORD_FLAME]: {
       ...
       generatesCard: {
           name: 'Corte Flamejante',
           icon: '🔥',
           cost: 2,
           damage: 20,
           fireDamage: 10,
           description: 'Ataque de fogo'
       }
   }
   ```
   - Complexidade: Baixa (apenas dados)

3. **GameManager.js**
   - `createDefaultHeroes()` precisa:
     - Inicializar deck com cartas dos equipamentos iniciais
   - Complexidade: Baixa

### ⚠️ **DECISÕES DE DESIGN NECESSÁRIAS:**

1. **Cartas de Consumíveis**
   - **Opção A**: Consumíveis entram no deck e somem após uso (Battlemarked style)
   - **Opção B**: Consumíveis ficam em área separada (atual + acesso em combate)
   - **Recomendação**: Opção A é mais fiel ao Battlemarked

2. **Limite de Cartas no Deck**
   - Atualmente: Sem limite explícito
   - Com equipamentos: Pode crescer muito
   - **Recomendação**: Limitar mão a 5-6 cartas, usar scroll ou "comprar"

3. **Cartas de Classe vs Cartas de Equipamento**
   - Diferenciar visualmente? (borda diferente)
   - **Recomendação**: Sim, ajuda o jogador identificar

4. **Desequipar Item**
   - Carta some imediatamente do deck
   - Se estava na mão durante combate, some também?
   - **Recomendação**: Não permitir desequipar durante combate

---

## Pontos de Atenção (Potenciais Bugs)

### 🔴 **Crítico:**

1. **Duplicação de Cartas**
   - Se equipar o mesmo item 2x, não pode criar 2 cartas iguais
   - Solução: Verificar se carta já existe antes de adicionar

2. **Sincronização Deck ↔ Equipamento**
   - Ao carregar save game, deck precisa refletir equipamentos
   - Solução: Reconstruir cartas de equipamento no load

3. **Cartas de Consumíveis Gastas**
   - Após usar poção em combate, remover do inventário
   - Solução: Marcar carta como `consumable: true` e remover após uso

### 🟡 **Atenção:**

1. **Tamanho do Deck na UI**
   - Se herói tiver 6 cartas base + 3 equipamentos + 5 poções = 14 cartas
   - UI atual mostra 4 cartas
   - Solução: Adicionar paginação ou scroll

2. **Ordem das Cartas**
   - Cartas de equipamento devem vir depois das de classe?
   - Solução: Ordenar por tipo (classe > equipamento > consumível)

---

## Plano de Implementação

### Fase 1: ItemDatabase (Baixo Risco)
- Adicionar `generatesCard` em cada item equipável
- Nenhuma mudança funcional ainda

### Fase 2: InventoryScreen (Médio Risco)
- Modificar `equipItem()` para adicionar carta ao deck
- Adicionar `unequipItem()` com lógica de remoção

### Fase 3: CardSystem (Baixo Risco)
- Adicionar handler para `consumable: true`
- Remover carta e item do inventário após uso

### Fase 4: CombatHUD (Médio Risco)
- Ajustar renderização para deck maior
- Adicionar indicador visual para tipo de carta

### Fase 5: Game Load (Baixo Risco)
- Reconstruir cartas de equipamento ao carregar save

---

## Conclusão

### ✅ **Viabilidade: ALTA**

O sistema atual é **compatível** com a mudança proposta. Os principais sistemas (CardSystem, CombatHUD, CombatManager) não precisam de grandes alterações.

### Esforço Estimado:
- **Dados**: ~2 horas (adicionar `generatesCard` nos itens)
- **Lógica**: ~4 horas (modificar equip/unequip, consumíveis)
- **UI**: ~2 horas (ajustes visuais no deck)
- **Testes**: ~2 horas

**Total: ~10 horas de desenvolvimento**

### Riscos:
- Baixo risco de bugs críticos
- Médio risco de bugs de sincronização (deck ↔ equipamento)
- Requer decisões de design antes de implementar

---

## Próximos Passos

1. **Decisão**: Confirmar as opções de design (consumíveis, limite de mão)
2. **Implementar**: Seguir as fases acima
3. **Testar**: Cenários de equip/unequip, combate, save/load
