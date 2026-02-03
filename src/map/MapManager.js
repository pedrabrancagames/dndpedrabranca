/**
 * MapManager - Gerenciador do Mapa GPS
 * Integração com Leaflet.js e Geolocalização
 */
import L from 'leaflet';
import { eventBus } from '../core/EventEmitter.js';

export class MapManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.map = null;
        this.playerMarker = null;
        this.markersLayer = null;
        this.watchId = null;

        // Configurações
        this.defaultZoom = 18;

        // Estado
        this.currentPosition = null;
        this.isMapReady = false;
    }

    /**
     * Inicializa o mapa
     * @param {string} containerId - ID do elemento container
     */
    init(containerId) {
        if (this.map) return;

        // Ícone customizado para o jogador
        this.playerIcon = L.divIcon({
            className: 'player-marker',
            html: '<div class="marker-pulse"></div><div class="marker-center"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        try {
            this.map = L.map(containerId, {
                zoomControl: false,
                attributionControl: false
            }).setView([0, 0], this.defaultZoom);

            // Tiles do OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                className: 'map-tiles'
            }).addTo(this.map);

            this.markersLayer = L.layerGroup().addTo(this.map);
            this.isMapReady = true;

            // Iniciar tracking sempre
            this.startTracking();

            console.log('MapManager initialized');
        } catch (error) {
            console.error('Failed to init map:', error);
        }
    }

    /**
     * Inicia o rastreamento GPS - sempre usa localização real
     */
    startTracking() {
        if (this.watchId) return; // Já está rastreando

        if ('geolocation' in navigator) {
            // Tentar obter posição inicial rapidamente
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.updatePosition(pos.coords);
                    console.log('GPS: Posição inicial obtida');
                },
                (err) => {
                    console.warn('GPS: Erro ao obter posição inicial:', err.message);
                    // Só usar padrão se ainda não tivermos posição NENHUMA
                    if (!this.currentPosition) {
                        this.setDefaultPosition();
                    }
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );

            // Monitorar posição continuamente
            this.watchId = navigator.geolocation.watchPosition(
                (pos) => this.updatePosition(pos.coords),
                (err) => console.warn('GPS tracking error:', err.message),
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
            );
            console.log('GPS: Tracking iniciado');
        } else {
            console.warn('Geolocation not supported');
            if (!this.currentPosition) {
                this.setDefaultPosition();
            }
        }
    }

    /**
     * Para o rastreamento GPS para economizar bateria
     */
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            console.log('GPS: Tracking pausado');
        }
    }

    /**
     * Define posição padrão quando GPS não está disponível
     */
    setDefaultPosition() {
        // Posição padrão (São Paulo) apenas como fallback último recurso
        console.log('Usando posição padrão (GPS falhou)');
        const defaultPos = { latitude: -23.5505, longitude: -46.6333 };
        this.updatePosition(defaultPos);
    }

    /**
     * Atualiza posição do jogador
     */
    updatePosition(coords) {
        const { latitude, longitude } = coords;
        this.currentPosition = { lat: latitude, lng: longitude };

        if (!this.map) return;

        // Atualizar ou criar marcador do jogador
        if (!this.playerMarker) {
            this.playerMarker = L.marker([latitude, longitude], {
                icon: this.playerIcon
            }).addTo(this.map);
            this.map.setView([latitude, longitude], this.defaultZoom);
        } else {
            this.playerMarker.setLatLng([latitude, longitude]);
            // Opcional: Centralizar mapa se o jogador sair muito do centro?
            // this.map.panTo([latitude, longitude]);
        }

        eventBus.emit('gps:update', { lat: latitude, lng: longitude });
    }

    /**
     * Adiciona um marcador de missão ao mapa
     */
    addMissionMarker(mission) {
        if (!this.map) return;

        const icon = L.divIcon({
            className: `mission-marker ${mission.type}`,
            html: `<span>${mission.icon}</span>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        const marker = L.marker([mission.lat, mission.lng], { icon })
            .addTo(this.markersLayer)
            .bindPopup(`<b>${mission.title}</b><br>${mission.description}`);

        // Armazenar referência para remoção posterior
        marker.missionId = mission.id;

        marker.on('click', () => {
            this.handleMarkerClick(mission);
        });

        return marker;
    }

    /**
     * Gerencia o clique no marcador baseado no tipo
     */
    handleMarkerClick(mission) {
        console.log('Marcador clicado:', mission);

        // VERIFICAÇÃO DE PRÉ-REQUISITOS
        if (mission.questId && mission.objectiveId) {
            const canProceed = this.gameManager.progressionSystem.checkQuestPrerequisites(mission.questId, mission.objectiveId);

            if (!canProceed) {
                eventBus.emit('showMessage', {
                    text: '⚠️ Complete os objetivos anteriores primeiro!',
                    type: 'warning'
                });

                // Se for NPC, ainda permitimos abrir para ele dar o diálogo de bloqueio
                // Se for combate ou coleta, bloqueamos aqui mesmo
                const isNPC = mission.objectiveType === 'talk' || mission.type === 'npc' || mission.objectiveType === 'deliver';
                if (!isNPC) {
                    return;
                }
                // Se for NPC, continua para cair no DialogueSystem que tem o texto específico
            }
        }

        // COMBATE
        if (mission.objectiveType === 'kill' || mission.type === 'combat') {
            this.gameManager.stateManager.setState('combat', {
                missionId: mission.id,
                questId: mission.questId,
                objectiveId: mission.objectiveId,
                objectiveType: mission.objectiveType,
                target: mission.target
            });
        }
        // NPC / DIÁLOGO
        else if (mission.objectiveType === 'talk' || mission.type === 'npc' || mission.objectiveType === 'deliver') {
            this.gameManager.stateManager.setState('combat', {
                missionId: mission.id,
                questId: mission.questId,
                objectiveId: mission.objectiveId,
                target: mission.target,
                isNPC: true,
                target: mission.target,
                isNPC: true,
                npcId: mission.targetId || (mission.target ? mission.target.toLowerCase().replace(/\s+/g, '_') : 'unknown'),
                // Passar contexto da quest se disponível (para iniciar diálogos de missões disponíveis)
                questId: mission.questId
            });
        }
        // PUZZLE
        else if (mission.objectiveType === 'interact' || mission.type === 'puzzle') {
            const questData = this.gameManager.missionManager.getQuestById(mission.questId);
            // Encontrar o objetivo específico para pegar os dados do puzzle
            const objective = questData.objectives.find(o => o.id === mission.objectiveId);

            this.gameManager.stateManager.setState('combat', {
                missionId: mission.id,
                questId: mission.questId,
                objectiveId: mission.objectiveId,
                isPuzzle: true,
                puzzleData: objective ? objective.puzzleData : null
            });
        }
        // EXPLORAÇÃO / COLETA / COLETA
        else if (mission.objectiveType === 'explore' || mission.type === 'explore' || mission.type === 'collect') {
            this.gameManager.stateManager.setState('combat', {
                missionId: mission.id,
                questId: mission.questId,
                objectiveId: mission.objectiveId,
                target: mission.target,
                isCollection: true,
                // Mapear modelo baseado no target (ex: moon_herb -> herb.glb)
                modelPath: mission.target === 'moon_herb' ? '/models/items/herb.glb' : '/models/items/bag.glb'
            });
        }
    }

    /**
     * Remove um marcador específico pelo ID ou Quest ID
     */
    removeMissionMarker(id) {
        if (!this.markersLayer) return;

        this.markersLayer.eachLayer((layer) => {
            // Remove se for match exato de ID ou se o ID conter o questId (ex: quest_deliver_letter...)
            if (layer.missionId === id || (layer.missionId && layer.missionId.includes(id))) {
                console.log(`Removing marker: ${layer.missionId}`);
                this.markersLayer.removeLayer(layer);
            }
        });
    }
}
