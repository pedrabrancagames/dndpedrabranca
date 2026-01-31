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
        this.updateInterval = 2000;

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

            // Iniciar tracking se tiver permissão ou modo teste
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
        if ('geolocation' in navigator) {
            // Tentar obter posição inicial
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.updatePosition(pos.coords);
                    console.log('GPS: Posição inicial obtida');
                },
                (err) => {
                    console.warn('GPS: Erro ao obter posição inicial:', err.message);
                    // Só usar padrão se NÃO tivermos nenhuma posição ainda
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
        } else {
            console.warn('Geolocation not supported, using default position');
            this.setDefaultPosition();
        }
    }

    /**
     * Define posição padrão quando GPS não está disponível
     */
    setDefaultPosition() {
        // Posição padrão (São Paulo - pode ser ajustado)
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
        }

        // Centralizar mapa suavemente se estiver seguindo
        // this.map.panTo([latitude, longitude]);

        // Verificar proximidade de missões
        this.checkProximity();
        eventBus.emit('gps:update', { lat: latitude, lng: longitude });
    }



    /**
     * Verifica proximidade dos marcadores
     */
    checkProximity() {
        // TODO: Implementar lógica de triggers
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
     * Verifica se o jogador está próximo de uma posição
     */
    isNearby(lat, lng, threshold = 0.0005) {
        if (!this.currentPosition) return false;
        const dLat = Math.abs(this.currentPosition.lat - lat);
        const dLng = Math.abs(this.currentPosition.lng - lng);
        return dLat < threshold && dLng < threshold;
    }

    /**
     * Remove um marcador específico pelo ID
     */
    /**
     * Remove um marcador específico pelo ID
     */
    removeMissionMarker(missionId) {
        if (!this.markersLayer) return;

        this.markersLayer.eachLayer((layer) => {
            if (layer.missionId === missionId) {
                this.markersLayer.removeLayer(layer);
            }
        });
    }

    /**
     * Gerencia o clique no marcador baseado no tipo
     */
    handleMarkerClick(mission) {
        console.log('Marcador clicado:', mission);

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
            // Simular diálogo e completar
            const { eventBus } = require('../core/EventEmitter.js');
            eventBus.emit('showMessage', {
                text: `💬 Conversando com ${mission.target}...`,
                type: 'info'
            });

            setTimeout(() => {
                eventBus.emit('combat:victory', {
                    missionId: mission.id,
                    questId: mission.questId,
                    objectiveId: mission.objectiveId,
                    target: mission.target,
                    enemiesKilled: 1 // Hack para contar progresso
                });
            }, 1500);
        }
        // EXPLORAÇÃO
        else if (mission.objectiveType === 'explore' || mission.type === 'explore' || mission.type === 'collect') {
            // Simular exploração e completar
            const { eventBus } = require('../core/EventEmitter.js');
            eventBus.emit('showMessage', {
                text: `🔍 Explorando a área...`,
                type: 'info'
            });

            setTimeout(() => {
                eventBus.emit('combat:victory', {
                    missionId: mission.id,
                    questId: mission.questId,
                    objectiveId: mission.objectiveId,
                    target: mission.target,
                    enemiesKilled: 1
                });
            }, 1500);
        }
    }
}

