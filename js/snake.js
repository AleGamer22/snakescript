// snake.js - Enhanced Modern Snake Game
class SnakeGame {
  constructor(gameArea, mode = 75) {
    this.gameArea = gameArea;
    this.mode = mode; // milliseconds per step
    this.gridSize = 20;
    this.snake = [{ x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) }];
    this.direction = { x: 0, y: -1 };
    this.food = null;
    this.score = 0;
    this.level = 1;
    this.running = false;
    this.interval = null;
    this.touchStart = null;
    this.muted = false;
    this.obstacles = [];
    this.powerUps = [];
    this.highscoresKey = 'snake_highscores_v1';
    this.loadHighscore();
    this.createGrid();
    this.spawnFood();
    this.bindUI();
    this.start();
  }

  createGrid() {
    this.gameArea.innerHTML = '';
    this.grid = [];
    this.gameArea.setAttribute('aria-live', 'polite');
    for (let y = 0; y < this.gridSize; y++) {
      const row = [];
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.width = cell.style.height = `${100 / this.gridSize}%`;
        cell.setAttribute('role', 'presentation');
        this.gameArea.appendChild(cell);
        row.push(cell);
      }
      this.grid.push(row);
    }
    this.gameArea.style.display = 'grid';
    this.gameArea.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;
    this.gameArea.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
  }

  bindUI() {
    // DOM references
    this.scoreEl = document.getElementById('score');
    this.highscoreEl = document.getElementById('highscore');
    this.levelEl = document.getElementById('level');
    this.pauseBtn = document.getElementById('pause-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.muteBtn = document.getElementById('mute-btn');
    this.scoresBtn = document.getElementById('scores-btn');
    this.overlay = document.getElementById('overlay');
    this.modalScore = document.getElementById('modal-score');
    this.modalRestart = document.getElementById('modal-restart');
    this.modalClose = document.getElementById('modal-close');
    this.playerName = document.getElementById('player-name');
    this.saveScoreBtn = document.getElementById('save-score-btn');
    this.highscoresList = document.getElementById('highscores-list');
    this.modeSelect = document.getElementById('mode-select');

    // Buttons
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.restartBtn.addEventListener('click', () => this.reset(true));
    this.muteBtn.addEventListener('click', () => { this.muted = !this.muted; this.muteBtn.textContent = this.muted ? '🔈' : '🔊'; });
    this.scoresBtn.addEventListener('click', () => this.showHighscores());
    this.modalRestart.addEventListener('click', () => { this.hideOverlay(); this.reset(true); });
    this.modalClose.addEventListener('click', () => this.hideOverlay());
    this.saveScoreBtn.addEventListener('click', () => this.saveHighscoreFromModal());
    this.modeSelect.addEventListener('change', e => { this.updateSpeed(Number(e.target.value)); });

    // Keyboard
    window.addEventListener('keydown', e => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' && this.direction.y !== 1) this.direction = { x: 0, y: -1 };
      else if (e.key === 'ArrowDown' && this.direction.y !== -1) this.direction = { x: 0, y: 1 };
      else if (e.key === 'ArrowLeft' && this.direction.x !== 1) this.direction = { x: -1, y: 0 };
      else if (e.key === 'ArrowRight' && this.direction.x !== -1) this.direction = { x: 1, y: 0 };
      else if (e.key === ' ' || e.key === 'Spacebar') this.togglePause();
    });

    // Touch gestures
    this.gameArea.addEventListener('touchstart', e => { if (e.touches.length === 1) this.touchStart = e.touches[0]; });
    this.gameArea.addEventListener('touchend', e => {
      if (!this.touchStart) return;
      const dx = e.changedTouches[0].clientX - this.touchStart.clientX;
      const dy = e.changedTouches[0].clientY - this.touchStart.clientY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && this.direction.x !== -1) this.direction = { x: 1, y: 0 };
        else if (dx < 0 && this.direction.x !== 1) this.direction = { x: -1, y: 0 };
      } else {
        if (dy > 0 && this.direction.y !== -1) this.direction = { x: 0, y: 1 };
        else if (dy < 0 && this.direction.y !== 1) this.direction = { x: 0, y: -1 };
      }
      this.touchStart = null;
    });

    // Mobile controls
    const mvButtons = document.querySelectorAll('#mobile-controls [data-dir]');
    mvButtons.forEach(btn => btn.addEventListener('click', e => {
      const dir = btn.dataset.dir;
      if (dir === 'up' && this.direction.y !== 1) this.direction = { x: 0, y: -1 };
      if (dir === 'down' && this.direction.y !== -1) this.direction = { x: 0, y: 1 };
      if (dir === 'left' && this.direction.x !== 1) this.direction = { x: -1, y: 0 };
      if (dir === 'right' && this.direction.x !== -1) this.direction = { x: 1, y: 0 };
    }));

    // initial UI
    this.updateHUD();
    this.renderHighscores();
  }

  updateSpeed(ms) {
    this.mode = ms;
    if (this.running) this.start();
  }

  start() {
    this.running = true;
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.step(), this.mode);
  }

  togglePause() {
    this.running = !this.running;
    if (this.running) { this.start(); this.pauseBtn.textContent = 'Pausar'; }
    else { clearInterval(this.interval); this.pauseBtn.textContent = 'Reanudar'; }
  }

  step() {
    if (!this.running) return;
    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    // Collision with walls or self or obstacles
    if (
      head.x < 0 || head.x >= this.gridSize ||
      head.y < 0 || head.y >= this.gridSize ||
      this.snake.some(s => s.x === head.x && s.y === head.y) ||
      this.obstacles.some(o => o.x === head.x && o.y === head.y)
    ) {
      this.onGameOver();
      return;
    }
    this.snake.unshift(head);

    // Power-up collection
    const puIndex = this.powerUps.findIndex(p => p.x === head.x && p.y === head.y);
    if (puIndex >= 0) {
      const pu = this.powerUps.splice(puIndex, 1)[0];
      if (pu.type === 'grow') this.score += 3;
      if (pu.type === 'slow') { this.updateSpeed(Math.min(200, this.mode + 40)); }
      this.playSound(440, 0.06);
    }

    // Food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += this.food.points || 1;
      this.playSound(880, 0.08);
      // Occasionally spawn special food or power-up
      if (Math.random() < 0.12) this.spawnPowerUp();
      if (Math.random() < 0.18) this.spawnObstacle();
      this.spawnFood();
      // Level up by score
      const newLevel = Math.floor(this.score / 5) + 1;
      if (newLevel > this.level) { this.level = newLevel; this.updateSpeed(Math.max(30, this.mode - 6)); }
    } else {
      this.snake.pop();
    }

    this.draw();
    this.updateHUD();
  }

  draw() {
    for (let row of this.grid) for (let cell of row) cell.className = 'cell';
    // Obstacles
    for (const ob of this.obstacles) if (this.grid[ob.y] && this.grid[ob.y][ob.x]) this.grid[ob.y][ob.x].className = 'cell obstacle';
    // Power-ups
    for (const pu of this.powerUps) if (this.grid[pu.y] && this.grid[pu.y][pu.x]) this.grid[pu.y][pu.x].className = 'cell food special';
    // Food
    if (this.food && this.grid[this.food.y] && this.grid[this.food.y][this.food.x]) {
      const cls = this.food.special ? 'cell food special' : 'cell food';
      this.grid[this.food.y][this.food.x].className = cls;
    }
    // Snake
    for (let i = 0; i < this.snake.length; i++) {
      const { x, y } = this.snake[i];
      if (this.grid[y] && this.grid[y][x]) {
        this.grid[y][x].className = i === 0 ? 'cell snake-head' : 'cell snake-body';
      }
    }
  }

  spawnFood() {
    let x, y, attempts = 0;
    do {
      x = Math.floor(Math.random() * this.gridSize);
      y = Math.floor(Math.random() * this.gridSize);
      attempts++;
    } while ((this.snake.some(s => s.x === x && s.y === y) || this.obstacles.some(o => o.x === x && o.y === y)) && attempts < 200);
    this.food = { x, y, points: Math.random() < 0.12 ? 3 : 1, special: Math.random() < 0.12 };
  }

  spawnPowerUp() {
    let x = Math.floor(Math.random() * this.gridSize);
    let y = Math.floor(Math.random() * this.gridSize);
    if (this.snake.some(s => s.x === x && s.y === y) || (this.food && this.food.x === x && this.food.y === y)) return;
    this.powerUps.push({ x, y, type: Math.random() < 0.5 ? 'grow' : 'slow' });
  }

  spawnObstacle() {
    let x = Math.floor(Math.random() * this.gridSize);
    let y = Math.floor(Math.random() * this.gridSize);
    if (this.snake.some(s => s.x === x && s.y === y) || (this.food && this.food.x === x && this.food.y === y)) return;
    this.obstacles.push({ x, y });
  }

  onGameOver() {
    this.running = false;
    clearInterval(this.interval);
    this.playSound(120, 0.2);
    // show modal overlay
    document.getElementById('modal-score').textContent = this.score;
    this.overlay.setAttribute('aria-hidden', 'false');
    this.overlay.style.opacity = 1;
    this.updateHUD();
  }

  hideOverlay() { this.overlay.setAttribute('aria-hidden', 'true'); this.overlay.style.opacity = 0; }

  reset(fullReset = false) {
    this.snake = [{ x: Math.floor(this.gridSize / 2), y: Math.floor(this.gridSize / 2) }];
    this.direction = { x: 0, y: -1 };
    this.score = 0;
    this.level = 1;
    this.obstacles = [];
    this.powerUps = [];
    this.spawnFood();
    this.updateHUD();
    if (fullReset) {
      this.hideOverlay();
      this.start();
    }
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.highscoreEl) this.highscoreEl.textContent = this.highscore || 0;
    if (this.levelEl) this.levelEl.textContent = this.level;
  }

  playSound(freq = 440, time = 0.05) {
    if (this.muted) return;
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0.03;
      o.connect(g); g.connect(this.audioCtx.destination);
      o.start();
      o.stop(this.audioCtx.currentTime + time);
    } catch (e) { /* ignore */ }
  }

  loadHighscore() {
    try {
      const raw = localStorage.getItem(this.highscoresKey);
      this.highscores = raw ? JSON.parse(raw) : [];
      this.highscore = this.highscores.length ? this.highscores[0].score : 0;
    } catch (e) { this.highscores = []; this.highscore = 0; }
  }

  saveHighscoreFromModal() {
    const name = (this.playerName.value || 'Anónimo').trim().substring(0,12);
    this.highscores.push({ name, score: this.score, date: new Date().toISOString() });
    this.highscores.sort((a,b) => b.score - a.score);
    this.highscores = this.highscores.slice(0,10);
    localStorage.setItem(this.highscoresKey, JSON.stringify(this.highscores));
    this.loadHighscore();
    this.renderHighscores();
    this.hideOverlay();
    this.reset(true);
  }

  renderHighscores() {
    if (!this.highscoresList) return;
    this.highscoresList.innerHTML = '';
    for (let i=0;i<(this.highscores.length || 0);i++) {
      const it = this.highscores[i];
      const li = document.createElement('li');
      li.textContent = `${it.name} — ${it.score}`;
      this.highscoresList.appendChild(li);
    }
    if (this.highscoreEl) this.highscoreEl.textContent = this.highscore || 0;
  }

  showHighscores() {
    this.renderHighscores();
    this.overlay.setAttribute('aria-hidden','false');
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  const modeSelect = document.getElementById('mode-select');
  const game = new SnakeGame(gameArea, Number(modeSelect.value));
  modeSelect.addEventListener('change', e => game.updateSpeed(Number(e.target.value)));
  // Global leaderboard integration (Firebase) - optional
  (async function attachGlobalLeaderboard() {
    const fetchBtn = document.getElementById('fetch-global');
    const submitBtn = document.getElementById('submit-global');
    const globalList = document.getElementById('global-highscores-list');
    const status = document.getElementById('global-status');
    if (!fetchBtn || !globalList) return;

    // Helper: render list
    function renderGlobal(items) {
      globalList.innerHTML = '';
      (items || []).forEach(it => {
        const li = document.createElement('li');
        li.textContent = `${it.name} — ${it.score}`;
        globalList.appendChild(li);
      });
    }

    // If user provided a Firebase config in `window.GLOBAL_LEADERBOARD_CONFIG`, initialize SDK
    async function loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => res();
        s.onerror = () => rej(new Error('Failed to load ' + src));
        document.head.appendChild(s);
      });
    }

    async function initFirebaseIfNeeded() {
      if (!window.GLOBAL_LEADERBOARD_CONFIG) return false;
      if (window.__globalLeaderboardInit) return true;
      try {
        await loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js');
        const cfg = window.GLOBAL_LEADERBOARD_CONFIG;
        window.__firebaseApp = firebase.initializeApp(cfg);
        window.__firestore = firebase.firestore();
        window.__globalLeaderboardInit = true;
        return true;
      } catch (e) {
        console.warn('Firebase init failed', e);
        return false;
      }
    }

    async function fetchGlobal() {
      status.textContent = 'Cargando...';
      if (!await initFirebaseIfNeeded()) { status.textContent = 'Global leaderboard no configurado.'; return; }
      try {
        const col = await window.__firestore.collection('snake_scores').orderBy('score','desc').limit(10).get();
        const items = [];
        col.forEach(doc => items.push(doc.data()));
        renderGlobal(items);
        status.textContent = 'Últimos cargados.';
      } catch (e) { status.textContent = 'Error cargando leaderboard.'; console.error(e); }
    }

    async function submitGlobal() {
      status.textContent = 'Enviando...';
      if (!await initFirebaseIfNeeded()) { status.textContent = 'Global leaderboard no configurado.'; return; }
      try {
        const name = (document.getElementById('player-name').value || 'Anónimo').substring(0,12);
        const score = game.score || 0;
        await window.__firestore.collection('snake_scores').add({ name, score, date: new Date() });
        status.textContent = 'Puntuación enviada. Actualizando...';
        await fetchGlobal();
      } catch (e) { status.textContent = 'Error al enviar puntuación.'; console.error(e); }
    }

    fetchBtn.addEventListener('click', fetchGlobal);
    submitBtn.addEventListener('click', submitGlobal);

    // If config is present, show submit button
    if (window.GLOBAL_LEADERBOARD_CONFIG) submitBtn.style.display = 'inline-block';
  })();
});
