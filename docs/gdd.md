# Game Design Document (GDD)
## RPG WebAR: D&D Pedra Branca

**Versão:** 1.0  
**Data:** 29 de Janeiro de 2026  
**Plataforma:** WebAR (Mobile Browser - Android)  
**Dispositivo de Referência:** Samsung Galaxy S20 FE

---

## Índice
1. [Visão Geral do Jogo](#1-visão-geral-do-jogo)
2. [Core Loop](#2-core-loop)
3. [Sistema de Combate](#3-sistema-de-combate)
4. [Sistema de Heróis](#4-sistema-de-heróis)
5. [Sistema de Cartas](#5-sistema-de-cartas)
6. [Sistema de Turnos](#6-sistema-de-turnos)
7. [Realidade Aumentada](#7-realidade-aumentada)
8. [Exploração GPS](#8-exploração-gps)
9. [Game Master Virtual](#9-game-master-virtual)
10. [Progressão e Economia](#10-progressão-e-economia)
11. [Interface do Usuário](#11-interface-do-usuário)
12. [Estados de Jogo](#12-estados-de-jogo)

---

## 1. Visão Geral do Jogo

### 1.1 Conceito
RPG tático por turnos em Realidade Aumentada onde o jogador controla uma party de 4 heróis, explorando seu bairro real via GPS e enfrentando inimigos que aparecem ancorados no mundo real através da câmera do celular.

### 1.2 Pillars de Design
| Pilar | Descrição |
|-------|-----------|
| **Imersão Local** | O bairro do jogador É o mapa do jogo |
| **Estratégia Acessível** | Combate por cartas, sem complexidade excessiva |
| **Fantasia Tática** | Sensação de ser um mestre de RPG controlando heróis |
| **Sessões Curtas** | 10-15 minutos por encontro |

### 1.3 Experiência Alvo
> "Eu saio de casa, ando pelo bairro, e meu celular revela um mundo de fantasia escondido. Goblins atacam na praça, um dragão dorme no parque, e eu comando meus heróis para proteger o bairro."

---

## 2. Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│                      CORE LOOP                              │
│                                                             │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│    │ EXPLORAR │───▶│ COMBATER │───▶│PROGREDIR │            │
│    │  (GPS)   │    │   (AR)   │    │ (Cartas) │            │
│    └──────────┘    └──────────┘    └────┬─────┘            │
│         ▲                               │                   │
│         └───────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Loop Detalhado

1. **EXPLORAR** - Andar pelo bairro, descobrir missões
2. **ENCONTRAR** - Aproximar de marcador no mapa
3. **POSICIONAR** - Abrir AR, detectar superfície, spawnar inimigos
4. **COMBATER** - Turnos táticos com cartas
5. **COLETAR** - XP, ouro, cartas, fragmentos
6. **MELHORAR** - Upgrades de deck e heróis
7. **REPETIR** - Próxima missão

---

## 3. Sistema de Combate

### 3.1 Fluxo Completo de Combate

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUXO DE COMBATE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                            │
│  │ 1. ENCONTRO │  Jogador se aproxima do marcador GPS      │
│  └──────┬──────┘                                            │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ 2. SETUP AR │  Câmera abre, detecta superfície          │
│  └──────┬──────┘                                            │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │3. POSICIONAR│  Jogador toca para spawnar inimigos       │
│  └──────┬──────┘                                            │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │ 4. COMBATE  │  Turnos até vitória ou derrota            │
│  └──────┬──────┘                                            │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │5. RESULTADO │  XP, loot, narrativa                      │
│  └─────────────┘                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Fases do Combate

#### FASE 1: Encontro (Mapa GPS)
| Elemento | Descrição |
|----------|-----------|
| **Trigger** | Jogador entra no raio do marcador (50m) |
| **Modo Teste** | Clique direto no marcador (sem GPS) |
| **Transição** | Tela de loading com dica de lore |

#### FASE 2: Setup AR
| Elemento | Descrição |
|----------|-----------|
| **Abertura** | Câmera abre em modo AR |
| **Indicador** | Círculo pulsante sobre superfícies válidas |

#### FASE 3: Posicionamento
| Elemento | Descrição |
|----------|-----------|
| **Interação** | Jogador toca na superfície desejada |
| **Âncora** |
| **Spawn** | Inimigos aparecem com animação de entrada |
| **Escala** | Ajustada para parecer "tamanho real" |

#### FASE 4: Combate por Turnos
| Elemento | Descrição |
|----------|-----------|
| **Ordem** | Guerreiro → Mago → Ladino → Clérigo → Inimigos |
| **PA Reset** | 3 PA por herói no início de cada round |
| **Fim de Turno** | Manual (botão) ou automático (0 PA) |

#### FASE 5: Resultado
| Resultado | Condição | Recompensa |
|-----------|----------|------------|
| ✅ Vitória | Todos inimigos mortos | XP, Ouro, Cartas, Fragmentos |
| ❌ Derrota | Todos heróis mortos | Retorna ao checkpoint |
| 🏃 Fuga | Botão de fuga (se disponível) | Perde 50% do progresso |

---

## 4. Sistema de Heróis

### 4.1 Party Fixa

| Herói | Classe | Role | HP Base | PA | Especialidade |
|-------|--------|------|---------|----|----|
| ⚔️ | **Guerreiro** | Tanque | 120 | 3 | Dano físico, proteção |
| 🔮 | **Mago** | DPS Mágico | 60 | 3 | AoE, controle, debuffs |
| 🗡️ | **Ladino** | DPS Burst | 80 | 3 | Crítico, veneno, evasão |
| ✨ | **Clérigo** | Suporte | 90 | 3 | Cura, buffs, proteção divina |

### 4.2 Atributos de Cada Herói

```
┌─────────────────────────────────────┐
│           FICHA DO HERÓI            │
├─────────────────────────────────────┤
│  Nome: Guerreiro                    │
│  ─────────────────────────────────  │
│  HP:     ████████████████░░░░ 120   │
│  PA:     ●●●                  3     │
│  ATK:    25                         │
│  DEF:    15                         │
│  ─────────────────────────────────  │
│  Deck: 8 cartas                     │
│  Fragmentos: 2/5                    │
└─────────────────────────────────────┘
```

### 4.3 Atributos Detalhados

| Atributo | Descrição | Fórmula Base |
|----------|-----------|--------------|
| **HP** | Pontos de Vida | Classe base + (Nível × 10) |
| **PA** | Pontos de Ação por turno | Fixo: 3 |
| **ATK** | Dano base físico | Classe base + modificadores |
| **DEF** | Redução de dano | Classe base + equipamentos |
| **MAG** | Poder mágico (Mago/Clérigo) | Classe base + modificadores |
| **CRIT** | Chance de crítico (Ladino) | 10% base + modificadores |

---

## 5. Sistema de Cartas

### 5.1 Regras Básicas

| Regra | Valor |
|-------|-------|
| PA por turno | 3 (fixo) |
| PA acumula entre turnos? | ❌ Não |
| Custo de cartas | 0 a 3 PA |
| Deck por herói | 6-10 cartas |
| Mão por turno | Deck completo visível |

### 5.2 Tipos de Cartas

| Tipo | Custo Típico | Descrição | Exemplo |
|------|--------------|-----------|---------|
| **Ataque** | 1-2 PA | Causa dano direto | Golpe (1 PA): 25 de dano |
| **Habilidade** | 2-3 PA | Efeito especial | Bola de Fogo (2 PA): 40 AoE |
| **Suporte** | 1-2 PA | Buff ou cura | Cura (1 PA): +30 HP |
| **Passiva** | 0 PA | Efeito automático | Contra-Ataque: 50% refletir |
| **Ultimate** | 3 PA | Habilidade poderosa | Fúria Divina: 80 dano + cura party |

### 5.3 Anatomia de uma Carta

```
┌─────────────────────────────┐
│  ⚔️ GOLPE BRUTAL           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━  │
│                             │
│      [ILUSTRAÇÃO]           │
│                             │
│  ─────────────────────────  │
│  Causa 35 de dano físico.   │
│  Se o alvo tiver menos de   │
│  50% HP, causa crítico.     │
│  ─────────────────────────  │
│                             │
│  Custo: ●● (2 PA)           │
│  Tipo: Ataque               │
│  Classe: Guerreiro          │
└─────────────────────────────┘
```

### 5.4 Cartas Iniciais por Classe

#### ⚔️ Guerreiro
| Carta | PA | Efeito |
|-------|----|----|
| Golpe | 1 | 25 de dano físico |
| Golpe Brutal | 2 | 35 de dano, crítico se HP < 50% |
| Escudo | 0 | +20 DEF por 1 turno (passiva) |
| Provocar | 1 | Inimigo foca no Guerreiro por 2 turnos |
| Investida | 2 | 30 de dano + atordoa por 1 turno |
| Fúria | 3 | +50% ATK por 3 turnos, -20% DEF |

#### 🔮 Mago
| Carta | PA | Efeito |
|-------|----|----|
| Míssil Arcano | 1 | 20 de dano mágico |
| Bola de Fogo | 2 | 40 de dano AoE + QUEIMANDO |
| Cone de Gelo | 2 | 30 de dano + LENTO |
| Escudo Arcano | 1 | Absorve 40 de dano |
| Raio | 2 | 50 de dano, single target |
| Meteoro | 3 | 70 de dano AoE + QUEIMANDO |

#### 🗡️ Ladino
| Carta | PA | Efeito |
|-------|----|----|
| Punhalada | 1 | 20 de dano, +30% crítico |
| Golpe nas Costas | 2 | 45 de dano (ignora DEF) |
| Veneno | 1 | Aplica ENVENENADO (10 dano/turno, 3 turnos) |
| Evasão | 1 | Esquiva próximo ataque |
| Sombras | 0 | Invisível por 1 turno (passiva) |
| Execução | 3 | 100 de dano se alvo HP < 30% |

#### ✨ Clérigo
| Carta | PA | Efeito |
|-------|----|----|
| Cura Menor | 1 | +30 HP em um aliado |
| Cura em Grupo | 2 | +20 HP em toda party |
| Bênção | 1 | +15% dano para party por 2 turnos |
| Luz Sagrada | 2 | 35 de dano sagrado (2x vs mortos-vivos) |
| Purificar | 1 | Remove debuffs de um aliado |
| Ressurreição | 3 | Revive aliado com 50% HP |

### 5.5 Fluxo de Uso de Carta

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE USO DE CARTA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. VER CARTAS                                              │
│     └─ Carrossel na parte inferior da tela                  │
│                                                             │
│  2. SELECIONAR CARTA                                        │
│     └─ Toque na carta desejada                              │
│     └─ Carta se destaca, mostra preview do efeito           │
│                                                             │
│  3. VERIFICAR CUSTO                                         │
│     └─ Sistema verifica se PA >= custo                      │
│     └─ Se não, carta fica "cinza" (indisponível)            │
│                                                             │
│  4. MODO DE ALVO (se aplicável)                             │
│     └─ Alvos válidos ficam com outline brilhante            │
│     └─ Verde = aliado | Vermelho = inimigo                  │
│                                                             │
│  5. CONFIRMAR ALVO                                          │
│     └─ Toque no modelo 3D em AR                             │
│     └─ Raycasting detecta o hit                             │
│                                                             │
│  6. EXECUTAR AÇÃO                                           │
│     └─ Animação da habilidade                               │
│     └─ Números de dano/cura flutuam                         │
│     └─ PA é consumido                                       │
│                                                             │
│  7. ATUALIZAR ESTADO                                        │
│     └─ HP atualizado                                        │
│     └─ Status effects aplicados                             │
│     └─ Se inimigo morreu, animação de morte                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Sistema de Turnos

### 6.1 Ordem de Iniciativa

```
ROUND N
├── Guerreiro (PA: 3) ────────────┐
├── Mago (PA: 3) ─────────────────┤  TURNO DOS HERÓIS
├── Ladino (PA: 3) ───────────────┤  (Jogador controla)
├── Clérigo (PA: 3) ──────────────┘
│
├── Inimigo 1 ────────────────────┐
├── Inimigo 2 ────────────────────┤  TURNO DOS INIMIGOS
├── Inimigo 3 ────────────────────┘  (IA automática)
│
└── ROUND N+1 (PA reseta)
```

### 6.2 Turno do Herói

| Ação | Descrição |
|------|-----------|
| **Usar Carta** | Gasta PA, executa efeito |
| **Passar Turno** | Encerra turno do herói atual |
| **Ver Info** | Toque longo em carta/inimigo para detalhes |

### 6.3 Turno do Inimigo (IA )

| Comportamento | Prioridade |
|---------------|------------|
| **Agressivo** | Ataca herói com menor HP |
| **Tático** | Foca no Clérigo primeiro |
| **Provocado** | Obrigado a atacar quem provocou |
| **Inteligente** | Usa habilidades especiais quando disponíveis |

### 6.4 Status Effects

| Status | Ícone | Efeito | Duração |
|--------|-------|--------|---------|
| QUEIMANDO | 🔥 | 10 dano/turno | 3 turnos |
| ENVENENADO | ☠️ | 10 dano/turno | 3 turnos |
| CONGELADO | ❄️ | Perde próximo turno | 1 turno |
| LENTO | 🐌 | -1 PA no próximo turno | 1 turno |
| ATORDOADO | 💫 | Perde próximo turno | 1 turno |
| ABENÇOADO | ✨ | +15% dano | 2 turnos |
| PROTEGIDO | 🛡️ | +20 DEF | 2 turnos |
| INVISÍVEL | 👻 | Não pode ser alvo | 1 turno |

### 6.5 Combos e Sinergias

| Combo | Efeitos Combinados | Resultado |
|-------|-------------------|-----------|
| **Congelamento** | MOLHADO + GELO | CONGELADO (2 turnos) |
| **Explosão** | QUEIMANDO + ÓLEO | 50 dano extra |
| **Corrosão** | ENVENENADO + ÁCIDO | DEF reduzida a 0 |
| **Eletrocução** | MOLHADO + RAIO | Dano 2x |

---

## 7. Realidade Aumentada

### 7.1 Tecnologia

### 7.2 Fluxo de Detecção de Superfícies



### 7.3 Interação com Modelos 3D



## 8. Exploração GPS

### 8.1 Mapa do Bairro

| Elemento | Descrição |
|----------|-----------|
| **Engine** | Leaflet.js + OpenStreetMap |
| **Tiles** | Pré-cacheados para modo offline |
| **Marcadores** | Missões, lojas, eventos, bosses |
| **Jogador** | Ícone atualizado via GPS |

### 8.2 Tipos de Marcadores

| Marcador | Ícone | Descrição |
|----------|-------|-----------|
| **Combate** | ⚔️ | Encontro com inimigos |
| **Boss** | 💀 | Inimigo poderoso (fim de capítulo) |
| **Evento** | 📜 | Narrativa/escolha do jogador |
| **Loja** | 🏪 | Compra/venda de itens |
| **Tesouro** | 📦 | Loot aleatório |

### 8.3 Modo Teste

Para desenvolvimento e testes sem sair de casa:
- Clique em qualquer marcador para ativar
- Não requer proximidade física
- Toggle nas configurações

---

## 9. Game Master Virtual

### 9.1 Funções do GM

| Função | Quando | Exemplo |
|--------|--------|---------|
| **Introduzir Capítulo** | Início de arco | "Rumores de goblins na praça..." |
| **Narrar Encontro** | Antes do combate | "Três goblins surgem das sombras!" |
| **Reagir a Ações** | Durante combate | "Golpe certeiro!" |
| **Anunciar Resultado** | Fim do combate | "Vitória! Os goblins fogem..." |
| **Apresentar Escolhas** | Eventos narrativos | "Você ajuda o mercador ou ignora?" |

### 9.2 Interface do GM

```
┌─────────────────────────────────────┐
│  🎭 GAME MASTER                     │
├─────────────────────────────────────┤
│                                     │
│  "Os ventos trazem notícias         │
│   sombrias. Goblins foram vistos    │
│   perto da praça central.           │
│                                     │
│   Vocês decidem investigar?"        │
│                                     │
├─────────────────────────────────────┤
│  [Investigar]       [Ignorar]       │
└─────────────────────────────────────┘
```

### 9.3 Personalidades do GM (Futuro)

| Personalidade | Tom | Exemplo |
|---------------|-----|---------|
| **Épico** | Grandioso | "Heróis! O destino do reino está em suas mãos!" |
| **Sério** | Formal | "Três inimigos detectados. Preparar formação." |
| **Irônico** | Sarcástico | "Ah, goblins. Que original. Boa sorte." |

---

## 10. Progressão e Economia

### 10.1 Recursos

| Recurso | Obtenção | Uso |
|---------|----------|-----|
| **XP** | Combates | Subir de nível |
| **Ouro** | Loot, vendas | Comprar itens/cartas |
| **Fragmentos de Alma** | Elites/Bosses | Fundir poder em cartas |

### 10.2 Sistema de Níveis

| Nível | XP Necessário | Benefício |
|-------|---------------|-----------|
| 1 | 0 | Início do jogo |
| 2 | 100 | +10 HP para todos |
| 3 | 250 | Desbloqueia 1 carta |
| 4 | 450 | +5 ATK/MAG |
| 5 | 700 | Desbloqueia 1 carta |
| ... | ... | ... |

### 10.3 Upgrade de Cartas

```
┌─────────────────────────────────────┐
│  UPGRADE DE CARTA                   │
├─────────────────────────────────────┤
│                                     │
│  Golpe → Golpe+                     │
│                                     │
│  Antes:     Depois:                 │
│  25 dano    35 dano                 │
│  1 PA       1 PA                    │
│                                     │
│  Custo: 50 Ouro + 1 Fragmento       │
│                                     │
│  [Confirmar]      [Cancelar]        │
└─────────────────────────────────────┘
```

### 10.4 Fragmentos de Alma

Efeitos especiais que podem ser fundidos em cartas:

| Fragmento | Efeito | Drop |
|-----------|--------|------|
| **Fogo** | +QUEIMANDO ao ataque | Elite de Fogo |
| **Gelo** | +LENTO ao ataque | Elite de Gelo |
| **Vida** | +Roubo de vida 20% | Boss |
| **Crítico** | +15% chance crítico | Elite Assassino |

---

## 11. Interface do Usuário

### 11.1 Tela HOME

```
┌─────────────────────────────────────┐
│       CRÔNICAS DO BAIRRO            │
│       ══════════════════            │
│                                     │
│   ┌───────────┐  ┌───────────┐      │
│   │  ⚔️       │  │  🎭       │      │
│   │ COMBATE & │  │   GAME    │      │
│   │EXPLORAÇÃO │  │  MASTER   │      │
│   └───────────┘  └───────────┘      │
│                                     │
│   ┌───────────┐  ┌───────────┐      │
│   │  👥       │  │  🎒       │      │
│   │  HERÓIS   │  │INVENTÁRIO │      │
│   └───────────┘  └───────────┘      │
│                                     │
│          ┌───────────┐              │
│          │  ⚙️       │              │
│          │  CONFIG   │              │
│          └───────────┘              │
│                                     │
└─────────────────────────────────────┘
```

### 11.2 HUD de Combate AR

```
┌────────────────────────────────────────────────────────────┐
│  [≡]                                           [⏸️][🔄][❌]│
│                                                            │
│  ┌────┐                                                    │
│  │⚔️80│ ← Guerreiro (ativo, destacado)                    │
│  └────┘                                                    │
│  ┌────┐                                                    │
│  │🔮50│ ← Mago                                             │
│  └────┘                                                    │
│  ┌────┐                                                    │
│  │🗡️60│ ← Ladino                                           │
│  └────┘                            👹 Goblin               │
│  ┌────┐                            HP: ████████░░          │
│  │✨70│ ← Clérigo                                          │
│  └────┘                                                    │
│                                                            │
│                     👺 Orc                                 │
│                     HP: ████████████                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  PA: ●●● (3/3)                         [Passar Turno]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│   │Golpe │  │Brutal│  │Escudo│  │Provoc│  │Investi│       │
│   │ 1 PA │  │ 2 PA │  │ 0 PA │  │ 1 PA │  │ 2 PA │        │
│   └──────┘  └──────┘  └──────┘  └──────┘  └──────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 11.3 Menu de Pausa

```
┌─────────────────────────────────────┐
│          ⏸️ PAUSADO                 │
├─────────────────────────────────────┤
│                                     │
│        [▶️ Continuar]               │
│                                     │
│        [🔄 Reiniciar Combate]       │
│                                     │
│        [📜 Log de Combate]          │
│                                     │
│        [⚙️ Configurações]           │
│                                     │
│        [🚪 Sair para HOME]          │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Estados de Jogo

### 12.1 Máquina de Estados Principal

```
                        ┌──────────┐
                        │  SPLASH  │
                        └────┬─────┘
                             │
                             ▼
                        ┌──────────┐
                        │ LOADING  │
                        └────┬─────┘
                             │
                             ▼
                        ┌──────────┐
                        │PERMISSION│ (Câmera + GPS)
                        └────┬─────┘
                             │
                             ▼
                        ┌──────────┐
              ┌────────▶│   HOME   │◀────────┐
              │         └────┬─────┘         │
              │              │               │
              │    ┌─────────┼─────────┐     │
              │    ▼         ▼         ▼     │
              │ ┌──────┐ ┌──────┐ ┌──────┐   │
              │ │ MAPA │ │HERÓIS│ │INVENT│   │
              │ └──┬───┘ └──────┘ └──────┘   │
              │    │                         │
              │    ▼                         │
              │ ┌──────┐                     │
              │ │AR SET│                     │
              │ └──┬───┘                     │
              │    │                         │
              │    ▼                         │
              │ ┌──────┐                     │
              └─│COMBAT│─────────────────────┘
                └──────┘
```

### 12.2 Estados do Combate (XState)

```
COMBAT STATES
├── SETUP
│   ├── DETECTING_PLANE
│   ├── PLACING_ENEMIES
│   └── READY
│
├── PLAYER_TURN
│   ├── HERO_ACTIVE (Guerreiro|Mago|Ladino|Clérigo)
│   ├── SELECTING_CARD
│   ├── TARGETING
│   └── EXECUTING_ACTION
│
├── ENEMY_TURN
│   ├── ENEMY_THINKING
│   └── ENEMY_ACTION
│
├── ROUND_END
│   ├── APPLY_STATUS_EFFECTS
│   └── CHECK_WIN_LOSE
│
└── END
    ├── VICTORY
    ├── DEFEAT
    └── FLEE
```

---

## Anexos

### A. Bestiário (MVP)

| Inimigo | HP | ATK | Habilidade | Drop |
|---------|----|----|------------|------|
| Goblin | 30 | 10 | Nenhuma | 10 Ouro |
| Orc | 50 | 15 | Golpe Forte | 20 Ouro |
| Esqueleto | 40 | 12 | Resistência física | 15 Ouro |
| Mago Sombrio | 35 | 20 | Raio Negro | 25 Ouro |
| Lobo Gigante | 45 | 18 | Ataque duplo | 18 Ouro |
| **Goblin Chefe** (Elite) | 80 | 20 | Invocar Goblins | Fragmento |
| **Necromante** (Boss) | 150 | 25 | Reviver inimigos | Fragmento + Carta |

### B. Requisitos Técnicos

| Requisito | Mínimo |
|-----------|--------|
| Android | 10+ |
| RAM | 4GB |
| ARCore | Suportado |
| Navegador | Chrome 90+ |
| GPS | Obrigatório |
| Câmera | Obrigatória |
| Armazenamento | 200MB cache |

---

**Fim do Documento**
