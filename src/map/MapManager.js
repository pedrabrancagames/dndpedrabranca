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
     * Inicia o rastreamento GPS
     */
    startTracking() {
        if (this.gameManager.gameData.testMode) {
            this.startTestMode();
            return;
        }

        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                (pos) => this.updatePosition(pos.coords),
                (err) => console.error('GPS Error:', err),
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
        } else {
            console.error('Geolocation not supported');
        }
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
    }

    /**
     * Modo Teste: Posição fake
     */
    startTestMode() {
        console.log('Starting GPS Test Mode');
        // Posição fake inicial (Parque Ibirapuera para teste, ou 0,0)
        const startPos = { latitude: -23.5874, longitude: -46.6576 };
        this.updatePosition(startPos);

        // Simular movimento aleatório simples
        setInterval(() => {
            if (!this.currentPosition) return;
            const lat = this.currentPosition.lat + (Math.random() - 0.5) * 0.0001;
            const lng = this.currentPosition.lng + (Math.random() - 0.5) * 0.0001;
            this.updatePosition({ latitude: lat, longitude: lng });
        }, 3000);
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

        marker.on('click', () => {
            // Se estiver perto ou modo teste
            this.gameManager.stateManager.setState('combat', { missionId: mission.id });
        });
    }
}
