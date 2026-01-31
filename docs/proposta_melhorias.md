# Proposta de Melhorias de UI/UX - D&D Pedra Branca

Este documento detalha as melhorias propostas para as telas de Inventário, Heróis e Game Master, visando aumentar a imersão e a usabilidade do jogo.

---

## 1. Tela de Inventário (`InventoryScreen`)

### Estado Atual
- Grid 4x4 simples.
- Itens exibidos apenas com ícones.
- Sem detalhes, descrições ou categorias.

### Melhorias Propostas

1.  **Categorização por Abas**:
    - Implementar sistema de filtros: `Todos`, `Armas`, `Armaduras`, `Consumíveis` e `Itens de Quest`.
    - Facilita a navegação quando o jogador tiver muitos itens.

2.  **Visual "Raridade"**:
    - Adicionar bordas/fundos coloridos baseados na raridade do item (Comum: Cinza, Incomum: Verde, Raro: Azul, Épico: Roxo, Lendário: Dourado).
    - Adicionar efeitos sutis de brilho para itens raros+.
    - *Já existe `CardRarity` no código, podemos reutilizar para itens.*

3.  **Painel de Detalhes (Inspector)**:
    - Ao clicar em um item, abrir um painel lateral (ou modal) mostrando:
        - Nome completo.
        - Descrição narrativa ("lore").
        - Atributos (+5 Dano, Cura 20 HP).
        - Botões de Ação: `Equipar`, `Usar`, `Descartar`.

4.  **Capacidade e Peso (Opcional)**:
    - Barra de progresso visual mostrando a capacidade da mochila (ex: 12/20 slots ocupados).

5.  **[NOVO] Sistema de Crafting/Fusão**:
    - Permitir combinar itens para criar novos (ex: 3 Poções Menores → 1 Poção Grande).
    - Integração visual com efeitos de "forja" ou "alquimia".

---

## 2. Tela de Heróis (`HeroesScreen`)

### Estado Atual
- Lista de cards com HP, PA e Nível.
- Layout funcional mas básico.

### Melhorias Propostas

1.  **Visual "Carta de RPG"**:
    - Transformar os cards em algo semelhante a cartas de TCG (Magic/Hearthstone) ou fichas de D&D simplificadas.
    - Arte do personagem em destaque.

2.  **Paper Doll (Boneco de Equipamento)**:
    - Ao selecionar um herói, exibir os slots de equipamento visualmente (Cabeça, Torso, Mão Principal, Mão Secundária, Acessório).
    - Permitir clicar no slot para trocar o equipamento diretamente.

3.  **Aba de Habilidades/Magias**:
    - Listar as habilidades disponíveis do herói com ícones, custo de PA e descrição do efeito.
    - Indicador visual de "Cooldown" se aplicável.
    - *Integrar com `CardDatabase` para mostrar o deck do herói.*

4.  **Barra de Experiência**:
    - Visualizar progresso para o próximo nível (XP atual / XP necessário).

5.  **[NOVO] Sistema de Upgrade de Cartas**:
    - Dentro da ficha do herói, mostrar suas cartas e permitir upgrades.
    - Usar o sistema de `getUpgradeCost()` já existente para exibir custo em Ouro e Fragmentos.
    - Visual de "antes/depois" mostrando os stats da carta no nível atual vs. próximo nível.

6.  **[NOVO] Seleção de Deck Ativo**:
    - Permitir ao jogador escolher quais cartas o herói levará para combate.
    - Limite de cartas no deck (ex: 6 cartas ativas).

---

## 3. Tela de Game Master (`GMScreen`)

### Estado Atual
- Texto estático de boas-vindas.
- Botões simples gerados via JS.

### Melhorias Propostas

1.  **Hub de Missões (Quest Log)**:
    - Visualizar lista de "Missões Ativas" e "Missões Concluídas".
    - Detalhes de objetivos e recompensas.
    - *Integrar com `ChapterIntros` para mostrar progresso na história principal.*

2.  **Sistema de Rumores**:
    - Quadro de avisos com pistas locais baseadas na geolocalização.

3.  **Log de Eventos**:
    - Histórico resumido das últimas ações.

4.  **[NOVO] Eventos de Exploração**:
    - Utilizar `ExplorationEvents` (já existente no código) para gerar eventos interativos.
    - O jogador recebe escolhas ("Ajudar o viajante" / "Ignorar") com consequências (reputação, ouro, XP).
    - Visual de "carta de evento" ou "pergaminho".

5.  **[NOVO] Sistema de Reputação**:
    - Barra de reputação do jogador na cidade.
    - Afeta preços de lojas, diálogos de NPCs e missões disponíveis.

*(A interação direta com NPCs foi movida para o Modo AR, veja item 5)*

---

## 4. Melhorias Gerais de UX

- **Transições Animadas**: Suavizar a entrada e saída das telas.
- **Feedback Sonoro**: Sons de UI para feedback tátil/auditivo.
- **Design Responsivo**: Otimização para toque em mobile.
- **[NOVO] Tema Visual por Capítulo**: Alterar cores/fundo da UI conforme o capítulo atual (Goblins: Verde escuro, Mortos-vivos: Roxo, Demônios: Vermelho).
- **[NOVO] Notificações In-Game**: Toast/banners para eventos importantes (Item raro obtido, Level up, Nova missão).

---

## 5. Modo de Interação com NPCs em AR

Esta funcionalidade visa trazer os personagens do universo do jogo para o mundo real, aumentando drasticamente a imersão.

### Fluxo de Usuário
1.  **Descoberta**: Jogador vê um ícone de NPC no mapa (GPS). Ao se aproximar, botão "Interagir" habilita.
2.  **Posicionamento (AR)**:
    - O jogo entra em modo AR (câmera).
    - O jogador vê um retículo de mira (como no combate) para escolher uma superfície plana.
    - Ao clicar, o modelo 3D do NPC surge com uma animação (ex: teleporte, fumaça ou caminhando até o ponto).
3.  **Diálogo**:
    - Ao clicar no NPC posicionado, inicia-se o modo de conversa.
    - A câmera foca ou mantém o NPC enquadrado.
    - **UI de Diálogo**: Uma caixa de texto estilizada aparece na parte inferior da tela (estilo RPGs modernos ou Visual Novels), sobreposta à visão da câmera.
    - **Opções de Resposta**: Botões de escolha aparecem para o jogador responder.

### Requisitos Técnicos
- Reutilizar `ARSceneManager` e lógica de *Raycasting* existente no sistema de combate para posicionar o NPC.
- Criar novo estado `GameState.NPC_INTERACTION`.
- Sistema de Árvore de Diálogos (JSON) vinculado ao ID do NPC.
- Animações básicas para o NPC (Idle, Talking, Gestures).

### [NOVO] Funcionalidades Extras de NPCs
- **Comerciantes em AR**: NPCs podem abrir uma loja. O jogador vê o NPC e ao lado uma "vitrine" flutuante com itens à venda.
- **Missões via NPC**: NPCs entregam e completam missões diretamente no modo AR (efeito de "missão aceita" com partículas).
- **Memória de Encontros**: NPCs lembram de interações anteriores ("Olá de novo, aventureiro!").

---

## 6. [NOVO] Sistema de Progressão Geolocalizada

Aproveitar ao máximo a proposta de AR/GPS:

1.  **Territórios e Zonas**:
    - Dividir o mapa em zonas temáticas (Floresta: Bestas, Cemitério: Mortos-vivos).
    - Cada zona tem inimigos, NPCs e recursos específicos.

2.  **Pontos de Interesse (POIs)**:
    - Locais específicos no mundo real (praças, parques) se tornam "santuários", "lojas" ou "masmorras".
    - Utilizar `ExplorationEvents` para gerar eventos dinâmicos nesses pontos.

3.  **Clima e Hora do Dia**:
    - Integrar com API de clima/hora real.
    - À noite: mais mortos-vivos aparecem.
    - Chovendo: NPCs se escondem, novos itens surgem.

---

## Próximos Passos

1.  Priorizar as funcionalidades por impacto vs. esforço.
2.  Criar mockups visuais das telas propostas.
3.  Definir estrutura de dados para Quests, NPCs e Diálogos.

---

*Documento atualizado em: 30/01/2025*
