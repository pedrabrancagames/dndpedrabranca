# PRD – RPG WebAR: Crônicas do Bairro (Versão Unificada e Expandida)

## 1. Visão Geral
**Nome do Projeto:** D&D Pedra Branca  
**Plataforma:** Navegador Mobile (Android)  
**Hospedagem:** Vercel – Plano Gratuito  
**Tecnologias-chave:** WebAR, GPS, Cartas, Turnos


**Objetivo do Produto:**  
Criar uma experiência de RPG tático por turnos em Realidade Aumentada, jogável diretamente pelo navegador, que utiliza o bairro real do jogador como mapa de exploração, misturando narrativa guiada por um Game Master virtual, combate estratégico com cartas e progressão profunda de personagens.

---

## 2. Público-Alvo
- Jogadores de RPG (D&D, Pathfinder, jogos táticos)
- Fãs de experiências AR e jogos baseados em localização
- Jogadores casuais/intermediários que buscam sessões curtas

---

## 3. Pilares de Design

1. **Imersão Local**  
   - Combates em AR no ambiente real
   - Missões ligadas a pontos reais do bairro

2. **Estratégia sem Complexidade Excessiva**  
   - Combate por turnos sem movimentação física
   - Foco em cartas, sinergias e decisões

3. **Narrativa Viva**  
   - Game Master virtual reage às ações
   - Escolhas alteram missões futuras e facções

4. **Progressão Modular**  
   - Cartas, upgrades

---

## 4. Escopo do MVP
### Incluído
- Exploração por GPS
- Combate AR por turnos
- Party fixa de 4 heróis
- Sistema de cartas com PA
- Game Master virtual (texto)
- Salvamento automático

### Fora do MVP (Roadmap)
- Multiplayer cooperativo
- Voz para o GM
- PVP
- Eventos sazonais

---

## 5. Arquitetura Técnica


### 5.1 Dispositivo de Referência
- **Modelo:** Samsung Galaxy S20 FE
- **Suporte ARCore:** ✅ Confirmado
- **Depth API:** ✅ Suportado
- **Navegador Recomendado:** Chrome Android (WebXR completo)

---

## 6. Fluxo Geral do Usuário
1. Acesso via URL
2. Tela de Splash
3. Carregamento de assets (barra de progresso)
4. Solicitação de permissões (Câmera + GPS)
5. Redirecionamento para HOME

---

## 7. Estrutura de Telas
### 7.1 Splash & Loading
- Logo do jogo
- Barra de carregamento
- Mensagens de dica/lore (opcional)

### 7.2 HOME
Botões principais:
- Combate & Exploração
- Game Master
- Heróis
- Inventário
- Configurações

---

## 8. Combate & Exploração (Mapa GPS)
- Mapa real do bairro
- Marcadores de missão
- Marcador de Loja
- Modo de Teste (clique sem proximidade física)

**Tipos de Marcadores:**
- Combate
- Evento Narrativo
- Loja
- Boss

---

## 9. Game Master Virtual
**Funções:**
- Introduzir capítulos
- Narrar missões e resultados
- Atualizar objetivos
- Reagir a sucesso ou falha

**Formato:**
- Texto (MVP)
- Áudio (futuro)

**Sugestão de Melhoria:**
- Personalidade configurável do GM (sério, épico, irônico)

---

## 10. Sistema de Heróis
### Party Fixa (1 jogador / 4 heróis)
- Guerreiro – tanque / físico
- Mago – dano mágico / controle
- Ladino – crítico / debuff
- Clérigo – cura / suporte

Cada herói possui:
- PV (Vida)
- PA (Ação)
- Deck próprio
- Progressão individual

---

## 11. Sistema de Cartas
### Regras Básicas
- 3 PA por turno
- PA não acumulável
- Cartas custam 0–3 PA

**Exemplos:**
- Ataque básico → 1 PA
- Magia forte → 2 PA
- Ultimate → 3 PA
- Passiva → 0 PA

### Fluxo de Uso
1. Jogador seleciona carta
2. Sistema entra em modo de alvo
3. Jogador toca no alvo válido
4. Ação executada

---

## 12. Sistema de Turnos
- Herói ativo destacado no HUD
- Jogador usa cartas até acabar PA
- Próximo herói
- Turno dos inimigos
- Novo round

---

## 13. Combate em Realidade Aumentada


---

## 14. HUD do Modo AR
- **Centro-esquerda:** retratos dos heróis + PV/PA
- **Inferior:** cartas em leque (carrossel)
- **Superior direito:** menu flutuante
  - Pausar
  - Reiniciar
  - Sair
  - Log de Combate

---

## 15. Sinergias e Combos (Melhoria)
- Estados elementais
- Combos no mesmo turno

**Exemplo:**
- Molhado + Gelo = Congelado

---

## 16. Progressão
### 16.1 Cartas
- Novas cartas
- Upgrade de custo/dano

### 16.2 Fragmentos de Alma
- Drop de elites e bosses
- Fundem efeitos permanentes em cartas

---

## 17. Inventário e Loja
- Itens consumíveis
- Equipamentos
- Compra e venda via marcador no mapa

---

## 18. Bestiário AR (Melhoria)
- Modelos 3D desbloqueados
- Visualização em AR livre
- Captura de screenshots

---

## 19. Salvamento e Checkpoints
- Salvamento automático

Estado salvo:
- Missão atual
- Progresso narrativo
- PV/PA
- Decks
- Inventário

---

## 20. Modo Offline (PWA)
O jogo deve funcionar mesmo em áreas sem sinal de internet durante a exploração do bairro.

### 20.1 Estratégia de Cache
- **Service Workers (Workbox):** Gerencia cache de assets e páginas
- **Cache na Instalação:**
  - Todos os arquivos HTML, CSS, JS
  - Modelos 3D (.glb) de inimigos e cenários
  - Texturas e sprites
  - Dados de missões do capítulo atual
  - Tiles do mapa da região do jogador

### 20.2 Funcionamento Offline
- **Mapa GPS:** Tiles pré-cacheados da região do bairro
- **Combate AR:** 100% offline (assets locais)
- **Narrativa:** Textos do GM pré-carregados por capítulo
- **Salvamento:** LocalStorage + IndexedDB (sincroniza quando online)

### 20.3 Sincronização
- Ao recuperar conexão:
  - Upload de progresso salvo
  - Download de novos capítulos/missões
  - Atualização de assets se necessário

---

## 21. Condições de Vitória e Falha
### Vitória
- Todos inimigos derrotados
- Ou condição narrativa atingida

### Falha
- Party incapacitada
- Retorno ao último checkpoint

---


