# Guia de Desenvolvimento e Solução de Problemas em Jogos WebAR
*Documento gerado com base no projeto "D&D Pedra Branca"*

Este documento compila os principais desafios técnicos encontrados durante o desenvolvimento do RPG em Realidade Aumentada (WebAR) com Three.js e WebXR, juntamente com as soluções aplicadas.

---

## 🏗️ 1. Renderização e Interface (UI/UX)

### Problema: Elementos HTML (DOM) desalinhados no modo AR
**Sintoma:** Ao usar `CSS2DRenderer` para barras de vida (HP) sobre os inimigos, os elementos flutuantes ficavam na posição errada ou desapareciam ao entrar no modo `immersive-ar`.
**Causa:** O overlay DOM do WebXR tem limitações de sincronização com o renderizador WebGL, e o `CSS2DRenderer` depende de cálculos de projeção de tela que mudam drasticamente em VR/AR.
**Solução:** 
- **Substituir CSS2D por Sprites 3D:** Usamos `THREE.Sprite` com texturas geradas dinamicamente via HTML Canvas.
- **Técnica:** Desenhamos a barra de vida `canvas.getContext('2d')`, criamos uma `THREE.CanvasTexture` e aplicamos a um `SpriteMaterial`. O Sprite existe no espaço 3D real, garantindo alinhamento perfeito e performance superior.

### Problema: Raycasting (Clique/Toque) impreciso
**Sintoma:** Clicar nos inimigos para atacar frequentemente falhava ou selecionava o chão/fundo.
**Causa:** O `Raycaster` padrão usa a câmera de perspectiva principal. Em sessões WebXR, a câmera ativa é gerenciada pelo dispositivo (XRCamera) e suas matrizes são atualizadas de forma assíncrona.
**Solução:**
- Filtrar alvos do Raycaster apenas para `Mesh` (geometrias visíveis), ignorando sprites e helpers.
- Garantir que o `raycaster.setFromCamera` use a câmera correta ativa no momento do render (`renderer.xr.getCamera()`).

---

## 🌍 2. Posicionamento e Escala no Mundo Real

### Problema: Escala inconsistente dos modelos ("Inimigos Gigantes")
**Sintoma:** Modelos 3D importados apareciam enormes ou minúsculos em relação ao chão.
**Causa:** WebXR usa **Metros** como unidade padrão. Modelos exportados em centímetros ou polegadas ficam 100x maiores que o esperado.
**Solução:**
- Padronizar escala na importação.
- Implementar lógica de spawn relativa: `model.scale.set(0.5, 0.5, 0.5)` para criaturas médias, garantindo que tenham aprox. 1.5m de altura virtual.
- Corrigir o "Ponto Pivô" (Pivot Point) dos modelos para ficar na base (pés), não no centro geométrico, evitando que afundem no chão.

### Problema: Inimigos spawnando em locais aleatórios
**Sintoma:** Ao iniciar combate, inimigos apareciam dentro do usuário ou muito longe.
**Causa:** Falta de referência de direção da câmera no momento do spawn.
**Solução:**
- Capturar a direção do olhar (`camera.getWorldDirection`) no momento que o jogador posiciona a Arena.
- Calcular posições de spawn baseadas nessa direção, criando um semi-círculo à frente do jogador:
  ```javascript
  x = arenaX + Math.sin(angle) * distance;
  z = arenaZ + Math.cos(angle) * distance;
  enemy.lookAt(arenaCenter); // Inimigos olham para o centro
  ```

---

## ⚡ 3. Performance e Otimização Mobile

### Problema: Queda de FPS e aquecimento do dispositivo
**Sintoma:** Travamentos em sessões AR longas.
**Contexto:** AR exige processamento pesado (CV para tracking + Renderização 3D) em dispositivos passivos (celulares).
**Solução:**
- **Cache de Assets:** Implementação de Service Worker e estratégia `CacheFirst` para modelos `.glb` e texturas (validade de 90 dias).
- **Descarte de Recursos (Disposal):** Criada função `clearArena()` que percorre recursivamente objetos removidos chamando `.geometry.dispose()` e `.material.dispose()` para evitar vazamento de memória na GPU.
- **Monitoramento:** Ferramenta `PerformanceMonitor` criada para visualizar FPS e uso de memória em tempo real, permitindo identificar gargalos (ex: texturas muito grandes).
- **Sombras:** Uso de sombreamento "fake" ou simplificado (`ShadowMaterial` com opacidade baixa) em vez de cálculos de luz complexos em tempo real.

### Problema: Loading demorado de modelos
**Solução:**
- Uso de compactação **Draco** para arquivos GLTF/GLB.
- Inicialização assíncrona do `GLTFLoader` com `DRACOLoader` configurado corretamente.

---

## 🎮 4. Arquitetura de Jogo e Estado

### Problema: Perda de progresso ao sair do AR
**Sintoma:** Se o tracking fosse perdido ou o usuário saísse do modo AR, o combate reiniciava.
**Solução:**
- **GameManager Centralizado:** O estado do jogo (HP, Turnos, Inimigos vivos) reside no `CombatManager`, desacoplado da visualização (`ARSceneManager`).
- Se a visualização falha, a lógica do jogo persiste.
- Implementação de `SaveManager` com `Auto-save` (IndexedDB) a cada 30s e sistema de sincronização offline, permitindo retomar sessões.

### Problema: Sistema de Turnos rígido
**Solução:**
- Implementação de máquina de estados para turnos (`TurnManager`).
- Uso de `EventBus` (Padrão Observer) para comunicar eventos como `damageTaken`, `turnStart`, `enemyDied` entre a lógica e a UI, mantendo o código desacoplado.

---

## 📱 5. PWA e Funcionalidades Offline

### Problema: App não instalável
**Solução:**
- Geração correta de `manifest.json`.
- Handler para evento `beforeinstallprompt` para criar um botão de instalação customizado dentro da UI do jogo.

### Problema: Mapa não carrega offline
**Solução:**
- Cache específico no Workbox para tiles do OpenStreetMap (`^https://.*.tile.openstreetmap.org/.*`) com estratégia `CacheFirst` e expiração de 30 dias.

---

## 🛠️ Ferramentas Desenvolvidas
Para auxiliar no debug (crítico em mobile onde não há DevTools fácil):
1.  **WebXRDebugger:** Painel na tela mostrando suporte do dispositivo, status da sessão e logs internos.
2.  **PerformanceMonitor:** Painel de FPS e métricas de renderização.
3.  **Mock Location:** Capacidade de simular GPS no desktop para testar mecânicas de mapa sem andar na rua.

## Conclusão
O desenvolvimento WebAR exige um cuidado extremo com **Gerenciamento de Recursos** e **UI Diegética** (elementos integrados ao mundo 3D). A separação clara entre Lógica de Jogo e Renderização AR foi fundamental para a estabilidade do projeto.
