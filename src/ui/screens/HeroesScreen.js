import { BaseScreen } from './BaseScreen.js';
import { GameState } from '../../core/StateManager.js';

export class HeroesScreen extends BaseScreen {
    constructor(screenId, gameManager) {
        super(screenId);
        this.gameManager = gameManager;
    }

    setupEvents() {
        this.bindClick('#btn-heroes-back', () => this.gameManager.stateManager.setState(GameState.HOME));
    }

    onShow() {
        this.renderHeroes();
    }

    renderHeroes() {
        const grid = this.findElement('#heroes-grid');
        if (!grid) return;

        const heroes = this.gameManager.gameData.heroes;

        grid.innerHTML = heroes.map(hero => `
      <div class="hero-card ${hero.class}">
        <div class="hero-icon">${hero.icon}</div>
        <div class="hero-name">${hero.name}</div>
        <div class="hero-class">Nível ${hero.level}</div>
        <div class="stat-bar hp">
          <div class="fill" style="width: ${(hero.hp / hero.maxHp) * 100}%"></div>
        </div>
        <div class="stat-label">HP: ${hero.hp}/${hero.maxHp}</div>
        <div class="stat-bar pa">
          <div class="fill" style="width: 100%"></div>
        </div>
        <div class="stat-label">PA: ${hero.pa}/${hero.maxPa}</div>
      </div>
    `).join('');
    }
}
