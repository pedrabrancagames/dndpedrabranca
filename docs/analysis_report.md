# Análise Técnica do Projeto: DnD Demeo AR

Este relatório detalha a stack tecnológica e a implementação do sistema de combate em Realidade Aumentada (AR) encontrado no projeto, com o objetivo de servir como guia para replicação em projetos futuros.

## 1. Stack Tecnológica

O projeto utiliza uma arquitetura "Vanilla" moderna, sem frameworks de UI pesados (como React ou Vue) para o runtime principal, garantindo alta performance para o renderLoop do 3D.

| Componente | Tecnologia | Detalhes |
|------------|------------|----------|
| **Linguagem** | JavaScript (ES6+) | Módulos ES (import/export). |
| **Bundler** | Vite | Build tool rápida para desenvolvimento e produção. |
| **3D Engine** | Three.js | Biblioteca padrão para renderização 3D na web. |
| **AR** | WebXR Device API | Implementação nativa via Three.js (`renderer.xr`). Não usa frameworks externos como 8th Wall ou A-Frame. |
| **UI** | HTML5 + CSS3 | Interface sobreposta via DOM Overlay. |
| **Formatos 3D** | GLTF/GLB | Com compressão Draco para carregamento rápido. |

---

## 2. Implementação do Sistema de Combate em AR

O sistema é dividido em três camadas principais que se comunicam via eventos: **Game Loop (Main)**, **Lógica de Jogo (CombatManager)** e **Renderização (ARSceneManager)**.

### A. Fluxo de Inicialização e Sessão AR

A lógica reside principalmente em `src/render/ARSceneManager.js` e `src/main.js`.

1.  **Detecção de Suporte**:
    *   O sistema verifica `navigator.xr.isSessionSupported('immersive-ar')` antes de oferecer a opção.
2.  **Solicitação de Sessão**:
    *   É solicitada uma sessão do tipo `immersive-ar`.
    *   **Feature Chave**: `dom-overlay`. Isso permite que a `div#combat-hud` (HTML normal) continue visível e interativa *sobre* a câmera do celular.
    ```javascript
    // Exemplo simplificado da implementação encontrada
    navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'], // Para detectar chão
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.getElementById('combat-hud') }
    });
    ```
3.  **Loop de Renderização**:
    *   Substitui o `requestAnimationFrame` padrão pelo `renderer.setAnimationLoop` do Three.js, que coordena com a taxa de atualização do dispositivo XR.

### B. Posicionamento de Inimigos (Hit Test)

O sistema não usa marcadores (QR Codes). Ele usa detecção de plano (Hit Test).

1.  **Reticle (Mira)**:
    *   Um anel 3D (`this.reticle`) é desenhado na cena.
    *   A cada frame, o sistema faz um "Hit Test" contra o mundo real. Se detectar uma superfície, o anel é posicionado e orientado nela.
2.  **Posicionamento (Placement)**:
    *   Ao tocar na tela (evento `select` do controller XR), o sistema captura a posição atual do Reticle.
    *   O grupo de inimigos é instanciado relativo a esse ponto (ponto 0,0,0 local do grupo).

### C. Interação e Raycasting

Como clicar em objetos 3D numa tela de celular em AR?

1.  **Raycaster Integrado**:
    *   A classe usa `this.renderer.xr.getController(0)` para obter a "mão" (ou a posição do toque na tela em visualizadores handheld).
    *   Um `THREE.Raycaster` é alinhado com a posição do controle/câmera para detectar interseções com as malhas (meshes) dos inimigos.
2.  **Sistema "Gaze" (Olhar)**:
    *   Além do toque, existe um sistema passivo (`checkGaze`). Se o usuário mantiver o dispositivo apontado para um inimigo por 500ms, o sistema dispara um evento de "inspeção", mostrando stats do inimigo na UI.

### D. Interface Flutuante (World Space UI)

Alguns elementos de UI não estão no HTML, mas sim dentro da cena 3D (barras de vida, nomes).

1.  **Sprites 3D**:
    *   As barras de vida e nomes são `THREE.Sprite` ou `THREE.Mesh` planos.
    *   **Dynamic Texture**: Os textos são desenhados em um `<canvas>` 2D invisível, que vira textura para o objeto 3D. Isso permite alterar números de vida sem carregar novas imagens.
    *   **Billboard**: Os objetos têm lógica para estarem sempre virados para a câmera (`lookAt(camera)`), garantindo legibilidade de qualquer ângulo.

### E. Arquitetura de Eventos

O `CombatManager.js` não sabe que está em AR. Ele apenas gerencia números e estados.

1.  **CombatManager** diz: "Goblin recebeu 5 de dano".
    *   Emite evento `ataqueInimigo`.
2.  **Main.js** ouve e repassa.
3.  **ARSceneManager** executa visual:
    *   Busca o mesh do Goblin pelo ID.
    *   Pisca o material de vermelho (Flash Effect).
    *   Instancia partículas de sangue/dano no local do mesh.
    *   Atualiza a textura da barra de vida 3D.

## Resumo para Replicação

Para replicar este sistema em seus projetos:

1.  **Use Vite + Three.js**: É a combinação mais leve e moderna.
2.  **Abstraia a Cena**: Crie classes separadas para Cena Normal (`SceneManager`) e Cena AR (`ARSceneManager`) que respondam aos mesmos métodos/eventos.
3.  **Use DOM Overlay**: Essencial para fazer interfaces de RPG complexas (botões, inventário) sem ter que recriar tudo em Canvas 3D.
4.  **Hit-Test API**: Use para posicionar o "tabuleiro" do jogo no chão.
5.  **Canvas Textures**: Use para criar labels e barras de vida performáticas dentro do mundo 3D.

Esta arquitetura é robusta, performática e modular, permitindo que a mesma lógica de jogo funcione tanto no PC (navegador) quanto no Celular (AR).
