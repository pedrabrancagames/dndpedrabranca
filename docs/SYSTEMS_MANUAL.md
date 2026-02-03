# ⚙️ Manual de Sistemas - D&D Pedra Branca

Este documento detalha o funcionamento matemático e lógico dos principais sistemas do jogo.

---

## ⚔️ Sistema de Combate

O combate é o núcleo tático do jogo. Utiliza um sistema de turnos com pontos de ação (PA).

### 1. Cálculo de Dano
O dano final é calculado da seguinte forma:

$$
\text{Dano Final} = \max(1, \text{Dano Base} + \lfloor \frac{\text{ATK Atacante}}{5} \rfloor - (\text{DEF Alvo} + \text{DEF Temp}))
$$

-   **Dano Base**: Valor impresso na carta.
-   **ATK Atacante**: Atributo de Força do herói. A cada 5 pontos de ATK, o dano aumenta em +1.
-   **DEF Alvo**: Defesa base da armadura/status do alvo (redução flat).
-   **DEF Temp**: Escudo temporário ganho por cartas (ex: "Levantar Escudo"). **Nota:** A Defesa Temporária é consumida após sofrer um ataque.

### 2. Status e Atributos
-   **HP (Vida)**: Chegando a 0, a unidade morre.
-   **PA (Pontos de Ação)**: Energia usada para jogar cartas. Recupera totalmente no início do turno.
-   **ATK (Ataque)**: Aumenta o dano físico.
-   **DEF (Defesa)**: Reduz dano recebido.
-   **MAG (Magia)**: Aumenta eficácia de feitiços (Mago/Clérigo).
-   **SPD (Velocidade)**: Define a ordem dos turnos (atualmente simplificado para Jogador -> Inimigo).

---

## 🃏 Sistema de Cartas

As cartas são as habilidades dos heróis. Elas são divididas por Raridade e Classe.

### Raridades e Cores
| Raridade | Cor | Custo Base de Upgrade |
|----------|-----|-----------------------|
| Comum | Cinza | 50 Ouro |
| Incomum | Verde | 100 Ouro |
| Rara | Azul | 200 Ouro |
| Épica | Roxo | 400 Ouro |
| Lendária | Dourado | 800 Ouro |

### Evolução de Cartas (Upgrade)
Cada carta pode ser melhorada até o **Nível 2** (começa no 0).
-   **Custos**: Ouro + Fragmentos de Alma.
-   **Fórmula de Custo**:
    -   Ouro: `Custo Base * (Nível Atual + 1)`
    -   Fragmentos: `(Nível Atual + 1) * 5`

---

## 💰 Economia

### Moedas
1.  **Ouro (Gold)**:
    -   **Uso**: Comprar itens na loja, evoluir cartas.
    -   **Fonte**: Droppado por inimigos (10-30 por kill), recompensas de missões.
2.  **Fragmentos de Alma (Soul Fragments)**:
    -   **Uso**: Recurso raro obrigatório para evoluir cartas.
    -   **Fonte**: Chance baixa de drop em inimigos normais (10-20%), garantido em Bosses.

### Inventário & Lojas
-   O inventário não tem limite de peso.
-   Itens consumíveis (poções) agrupam-se (stack) até limites específicos (ex: 10 poções).
-   Lojas são NPCs específicos no mapa. O estoque é fixo por NPC.

---

## 📈 Progressão (Level Up)

### Níveis de Herói
-   **Nível Máximo**: 15.
-   **XP**: Ganha-se XP ao derrotar inimigos. O XP é dividido igualmente entre todos os heróis do grupo.

### Tabela de XP (Resumida)
-   Nível 2: 100 XP
-   Nível 5: 850 XP
-   Nível 10: 4600 XP
-   Nível 15: 15000 XP

### Bônus de Level Up
Ao subir de nível, o herói recupera **toda a vida** e ganha atributos fixos baseados na classe:

| Classe | HP | ATK | DEF | MAG | Outros |
|--------|----|-----|-----|-----|--------|
| **Guerreiro** | +10 | +2 | +2 | 0 | - |
| **Mago** | +4 | 0 | 0 | +3 | +5 Mana |
| **Ladino** | +6 | +2 | 0 | 0 | +1 Crítico |
| **Clérigo** | +7 | 0 | +1 | +2 | - |

---

## 👹 Inimigos e Drops

Os inimigos possuem tipos que influenciam fraquezas (sistema em desenvolvimento).

| Inimigo | HP Médio | Dano Médio | XP | Drop Especial |
|---------|----------|------------|----|---------------|
| Goblin | 30 | 10 | 15 | - |
| Esqueleto | 35 | 12 | 20 | - |
| Lobo | 28 | 14 | 15 | - |
| **Rei Goblin (Boss)** | 150 | 20 | 150 | Coroa Goblin |

> **Nota**: Inimigos do tipo Boss sempre dropam Fragmentos de Alma.
