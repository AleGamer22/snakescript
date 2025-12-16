// init.js - Inicialización y mejoras de accesibilidad

// Enfoca el área de juego al cargar
window.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  if (gameArea) gameArea.focus();
  // Mostrar controles táctiles en pantallas pequeñas
  const mobileControls = document.getElementById('mobile-controls');
  if (mobileControls && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    mobileControls.setAttribute('aria-hidden', 'false');
    mobileControls.style.display = 'flex';
  }
});
