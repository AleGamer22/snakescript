// snake.js - Modern Snake Game Logic
// Mejora: Accesibilidad, animaciones, soporte móvil, ES6+

class SnakeGame {
  constructor(gameArea, mode = 75) {
    this.gameArea = gameArea;
    this.mode = mode;
    this.gridSize = 20;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: -1 };
    this.food = this.randomFood();
    this.score = 0;
    this.running = false;
    this.interval = null;
    this.touchStart = null;
    this.init();
  }

  init() {
    this.gameArea.innerHTML = '';
    this.gameArea.setAttribute('aria-live', 'polite');
    this.createGrid();
    this.draw();
    this.bindEvents();
    this.start();
  }

  createGrid() {
    this.grid = [];
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

  draw() {
    // Clear all
    for (let row of this.grid) for (let cell of row) cell.className = 'cell';
    // Draw snake
    for (let i = 0; i < this.snake.length; i++) {
      const { x, y } = this.snake[i];
      if (this.grid[y] && this.grid[y][x]) {
        this.grid[y][x].className = i === 0 ? 'cell snake-head' : 'cell snake-body';
      }
    }
    // Draw food
    const { x, y } = this.food;
    if (this.grid[y] && this.grid[y][x]) {
      this.grid[y][x].className = 'cell food';
    }
  }

  randomFood() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.gridSize);
      y = Math.floor(Math.random() * this.gridSize);
    } while (this.snake.some(s => s.x === x && s.y === y));
    return { x, y };
  }

  start() {
    this.running = true;
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.step(), this.mode);
  }

  step() {
    if (!this.running) return;
    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
    // Check collision
    if (
      head.x < 0 || head.x >= this.gridSize ||
      head.y < 0 || head.y >= this.gridSize ||
      this.snake.some(s => s.x === head.x && s.y === head.y)
    ) {
      this.gameOver();
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.randomFood();
    } else {
      this.snake.pop();
    }
    this.draw();
  }

  gameOver() {
    this.running = false;
    clearInterval(this.interval);
    alert('¡Juego terminado! Puntuación: ' + this.score);
    this.reset();
  }

  reset() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: -1 };
    this.food = this.randomFood();
    this.score = 0;
    this.start();
  }

  bindEvents() {
    // Teclado
    window.addEventListener('keydown', e => {
      const key = e.key;
      if (key === 'ArrowUp' && this.direction.y !== 1) this.direction = { x: 0, y: -1 };
      else if (key === 'ArrowDown' && this.direction.y !== -1) this.direction = { x: 0, y: 1 };
      else if (key === 'ArrowLeft' && this.direction.x !== 1) this.direction = { x: -1, y: 0 };
      else if (key === 'ArrowRight' && this.direction.x !== -1) this.direction = { x: 1, y: 0 };
    });
    // Touch
    this.gameArea.addEventListener('touchstart', e => {
      if (e.touches.length === 1) this.touchStart = e.touches[0];
    });
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
  }
}

// Inicialización automática
window.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  const modeSelect = document.getElementById('mode-select');
  let game = new SnakeGame(gameArea, Number(modeSelect.value));
  modeSelect.addEventListener('change', e => {
    game.mode = Number(e.target.value);
    game.reset();
  });
});

// Estilos dinámicos para snake y food
const style = document.createElement('style');
style.innerHTML = `
  .cell { background: transparent; transition: background 0.1s; }
  .snake-head { background: #00ff99; border-radius: 40%; }
  .snake-body { background: #00cc66; border-radius: 30%; }
  .food { background: #ff3366; border-radius: 50%; box-shadow: 0 0 8px #ff3366; }
`;
document.head.appendChild(style);
