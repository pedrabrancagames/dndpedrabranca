# Proposta de Melhorias e Novas Funcionalidades

**Data:** 30 de Janeiro de 2026  
**Projeto:** D&D Pedra Branca - RPG WebAR  
**Versão Atual:** 1.0 MVP

---

## 1. Melhorias Técnicas

### 1.1 🔧 Refatoração de Código

| Área | Situação Atual | Proposta |
|------|----------------|----------|
| **ARSceneManager.js** | 700+ linhas em um único arquivo | Dividir em módulos: `ARSession.js`, `ARInteraction.js`, `ARVisuals.js` |
| **Animações** | Funções de easing inline | Criar `AnimationUtils.js` reutilizável |

### 1.2 ⚡ Performance

| Melhoria | Descrição | Impacto |
|----------|-----------|---------|
| **Object Pooling** | Reutilizar sprites de HP e partículas em vez de criar/destruir | -30% GC pauses |
| **Frustum Culling** | Otimização padrão do Three.js - não renderiza objetos fora da câmera mas mantém na memória (aparece instantaneamente ao voltar a câmera) | +15% FPS |
| **LOD System** | Modelos 3D com níveis de detalhe (longe = menos polígonos) | -40% draw calls |
| **Web Workers** | Mover IA de inimigos para thread separada | UI mais responsiva |

### 1.3 🛡️ Robustez

- **Error Boundaries**: Captura de erros na sessão AR para evitar travamentos
- **Retry Logic**: Reconexão automática se sessão WebXR falhar

---

## 2. Correções Prioritárias

### 2.1 📍 GPS - Localização Real do Jogador

**Problema Atual:** O mapa mostra um local genérico, não a posição real do jogador.

**Solução:**
1. Implementar solicitação de permissão de geolocalização (`navigator.geolocation`)
2. Mostrar posição real do jogador no mapa
3. Atualizar posição em tempo real enquanto o jogador anda
4. Mostrar mensagem de erro amigável se permissão for negada

```javascript
// Exemplo de implementação
navigator.geolocation.getCurrentPosition(
    (position) => {
        const { latitude, longitude } = position.coords;
        // Centralizar mapa na posição real
    },
    (error) => {
        // Mostrar mensagem de erro
    }
);
```

---

## 3. Novas Funcionalidades

### 3.1 ⚔️ Sistema de Combate

#### **Combos Visuais**
```
Arqueiro atira → Mago congela → Guerreiro quebra = COMBO SHATTER (2x dano)
```
- Feedback visual espetacular com partículas e screen shake
- Sistema de pontuação de combo (multiplicador de XP)

### 3.2 🎭 Game Master Aprimorado

| Funcionalidade | Descrição |
|----------------|-----------|
| **Voz Gravada** | Usar arquivos de áudio MP3/WAV gravados com sua voz para narrar eventos |
| **Personalidades** | Épico, Sarcástico, Misterioso (configurável) |
| **Comentários Táticos** | "Cuidado! O Orc está focando no Clérigo!" |
| **Conquistas (Achievements)** | Notificações de reconhecimento que aparecem quando o jogador faz algo especial. Exemplos: "Primeiro Sangue!" (mata primeiro inimigo), "Combo Master!" (3 ataques seguidos), "Sobrevivente!" (vence com menos de 10% HP) |

### 3.3 📍 Exploração GPS

#### **Sistema de Pontos de Interesse Dinâmicos**
- **Dungeons Temporárias**: Aparecem por 24h em locais específicos
- **Eventos Climáticos**: Chuva = mais inimigos de água
- **Eventos de Horário**: Mortos-vivos à noite, fadas ao amanhecer

#### **Facções do Bairro**
Diferentes partes do bairro são "controladas" por grupos diferentes no mundo do jogo:

| Região Real | Facção do Jogo | Benefícios |
|-------------|----------------|------------|
| Praça Central | Goblins | Missões de emboscada |
| Parque | Elfos da Floresta | Descontos em poções |
| Igreja | Ordem Sagrada | Missões de purificação |

- **Reputação**: Completar missões de uma facção aumenta sua reputação com ela
- **Benefícios**: Boa reputação = preços melhores, missões exclusivas
- **Guerras**: Facções podem estar em conflito (escolha um lado!)

### 3.4 🃏 Sistema de Cartas Expandido

#### **Cartas Raras com Efeitos Especiais**
| Raridade | Efeito Visual | Exemplo |
|----------|---------------|---------|
| Comum | Glow básico | Golpe |
| Raro | Partículas | Bola de Fogo+ |
| Épico | Animação AR | Meteoro Supremo |
| Lendário | Altera ambiente | Apocalipse (escurece tudo) |

#### **Sistema de Fusão de Cartas**
Sistema de upgrade que combina cartas iguais para criar versões mais fortes:

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐       ┌─────────────┐
│   GOLPE     │ + │   GOLPE     │ + │   GOLPE     │  →    │   GOLPE+    │
│   15 dano   │   │   15 dano   │   │   15 dano   │       │   25 dano   │
│   1 PA      │   │   1 PA      │   │   1 PA      │       │   1 PA      │
└─────────────┘   └─────────────┘   └─────────────┘       └─────────────┘
```

- **3 cartas iguais** = versão aprimorada (+dano, -custo, ou efeito extra)
- **Fragmentos de Alma** podem ser adicionados para efeitos secundários (ex: +QUEIMANDO)
- Interface visual mostrando árvore de evolução da carta

### 3.5 👥 Sistema de Heróis

#### **Especialização de Classe**
Quando um herói atinge um nível alto (ex: nível 10), ele pode "evoluir" para uma versão especializada:

```
GUERREIRO Nível 10
        │
        ├──→ PALADINO
        │    • Dano Sagrado (2x vs mortos-vivos)
        │    • Pequenas curas para aliados
        │    • Aura de proteção
        │
        └──→ BERSERKER
             • +50% dano quando HP < 30%
             • +25% chance crítico
             • Fúria (ataca 2x por turno)
```

| Herói Base | Especialização A | Especialização B |
|------------|------------------|------------------|
| Guerreiro | Paladino (Santo) | Berserker (Fúria) |
| Mago | Arquimago (Poder) | Necromante (Controle) |
| Ladino | Assassino (Crítico) | Espião (Debuffs) |
| Clérigo | Sacerdote (Cura) | Inquisidor (Dano) |

Isso adiciona profundidade e replayability - o jogador pode fazer escolhas que afetam o estilo de jogo.

### 3.6 🏪 Loja e Economia

#### **Loja Física no Mapa**
- Marcador de loja em locais reais (praças, parques)
- Inventário rotativo diário
- Descontos para membros de facção

#### **Sistema de Crafting**
- Coletar materiais de combate
- Forjar equipamentos e poções
- Receitas desbloqueáveis

### 3.7 📱 QoL (Quality of Life)

| Funcionalidade | Descrição |
|----------------|-----------|
| **Auto-Battle** | IA assume combates triviais (toggle) |
| **Skip Animações** | Acelerar combate (2x, 4x) |

---

## 4. Roadmap Sugerido

### Fase 1: Correções e Polimento (1-2 meses)
- [ ] **GPS real do jogador** (PRIORITÁRIO)
- [ ] Refatoração do ARSceneManager
- [ ] Object Pooling
- [ ] Error Boundaries
- [ ] Combos visuais básicos

### Fase 2: Profundidade (2-3 meses)
- [ ] Sistema de Fusão de Cartas
- [ ] Especialização de Classe
- [ ] Loja física no mapa
- [ ] Voz gravada do Game Master
- [ ] Sistema de Conquistas

### Fase 3: Mundo Vivo (3-4 meses)
- [ ] Sistema de Facções
- [ ] Eventos de Horário/Clima
- [ ] Dungeons Temporárias
- [ ] Sistema de Crafting

---

## 5. Priorização Final

### 🔴 Alta Prioridade (Fazer Primeiro)
1. **GPS real do jogador** - Funcionalidade core quebrada
2. Object Pooling e Performance
3. Combos Visuais
4. Voz gravada do Game Master
5. QoL: Skip Animações

### 🟡 Média Prioridade
1. Sistema de Fusão de Cartas
2. Especialização de Classe
3. Loja Física
4. Sistema de Conquistas

### 🟢 Longo Prazo
1. Sistema de Facções
2. Eventos Dinâmicos
3. Dungeons Temporárias
4. Crafting

---

## Conclusão

O projeto D&D Pedra Branca possui uma base técnica sólida. As melhorias propostas focam em:

1. **Correção do GPS** - Funcionalidade essencial para o core loop
2. **Profundidade de Progressão** - Fusão de cartas e especialização
3. **Imersão** - Voz gravada e conquistas
4. **Mundo Vivo** - Facções e eventos dinâmicos

---

> [!NOTE]
> Este documento foi revisado com base no feedback do dia 30/01/2026.
