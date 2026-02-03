# 🏗️ Arquitetura do Sistema - D&D Pedra Branca

Este documento descreve a arquitetura técnica, tecnologias utilizadas e padrões de projeto adotados no desenvolvimento do D&D Pedra Branca.

---

## 💻 Tech Stack (Tecnologias)

| Categoria | Tecnologia | Função |
|-----------|------------|--------|
| **Core** | JavaScript (ES6+) | Lógica principal do jogo. |
| **Build Tool** | Vite | Empacotamento, dev server e HMR. |
| **Renderização 3D** | Three.js | Motor gráfico para Realidade Aumentada. |
| **Mapas** | Leaflet | Renderização do mapa 2D e camadas GPS. |
| **Plataforma** | Web (PWA) | Distribuição via navegador com capacidades offline. |
| **Estilização** | CSS3 | Interface do usuário (UI) responsiva. |

---

## 📂 Estrutura do Projeto

A organização do código fonte (`src/`) segue uma arquitetura modular baseada em responsabilidades:

```
src/
├── combat/         # Lógica de combate (Turnos, Cartas, IA)
├── core/           # Gerenciamento central (GameManager, Save, Assets)
├── data/           # Bancos de dados estáticos (Items, NPCs, Quests)
├── debug/          # Ferramentas de desenvolvimento (Performance, Logs)
├── map/            # Integração com Leaflet e GPS
├── pwa/            # Service Workers e instalação PWA
├── render/         # Visualização 3D/AR (Three.js abstraction)
├── styles/         # Arquivos CSS globais e de componentes
├── systems/        # Lógica de jogo (Missões, Diálogos, Loja)
├── ui/             # Gerenciamento de Interface 2D (Menus, HUD)
└── main.js         # Ponto de entrada da aplicação
```

---

## 🧩 Componentes Chave

### 1. GameManager (`core/GameManager.js`)
O coração da aplicação. Atua como um **Singleton** que inicializa e mantém referências para todos os outros subsistemas.
-   Inicializa `StateManager`, `AssetLoader`, `ARSceneManager`, etc.
-   Gerencia o loop principal da aplicação.

### 2. ARSceneManager (`render/ARSceneManager.js`)
Abstrai a complexidade do Three.js.
-   Gerencia a cena, câmera e renderizador WebGL.
-   Controla o `spawn` de modelos 3D (inimigos, NPCs).
-   Lida com a sessão WebXR (Realidade Aumentada).

### 3. StateManager (`core/StateManager.js`)
Gerencia o estado global mutável e a persistência.
-   Grava/Lê dados no `localStorage`.
-   Mantém o inventário atual, progresso de missões e status do jogador.

### 4. CombatManager (`combat/CombatManager.js`)
Controla o fluxo da batalha.
-   Máquina de estados de combate (PlayerTurn -> Action -> EnemyTurn -> Resolution).
-   Calcula danos e aplica efeitos.

---

## 🔄 Fluxo de Dados

1.  **Input**: Usuário toca na tela ou se move (GPS).
2.  **Processamento**:
    -   Se no Mapa: `ExploreSystem` verifica proximidade de eventos.
    -   Se no Combate: `CombatManager` processa a carta jogada.
3.  **Atualização Visual**:
    -   UI 2D é atualizada via manipulação direta do DOM (em `ui/`).
    -   Cena 3D é renderizada frame a frame pelo Three.js loop.
4.  **Persistência**: Alterações críticas (loot ganho, missão completa) são salvas imediatamente via `StateManager`.

---

## 🚀 Padrões de Projeto

-   **Singleton**: Usado nos Managers principais para garantir acesso global único.
-   **Observer/EventBus**: Usado para comunicação desacoplada entre sistemas (ex: `EventEmitter.js`).
-   **Component/Entity**: (Parcialmente) Dados separados da lógica nos diretórios `data/` vs `systems/`.

---

## 🔧 Boot Process

1.  `index.html` carrega `main.js`.
2.  `main.js` instancia `GameManager`.
3.  `GameManager` inicializa sistemas em ordem de dependência.
4.  Tela de Loading é exibida enquanto `AssetLoader` baixa modelos 3D.
5.  Jogo inicia no Modo Mapa.
