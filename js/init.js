// init.js - Inicialización y mejoras de accesibilidad

// Enfoca el área de juego al cargar
window.addEventListener('DOMContentLoaded', () => {
  const gameArea = document.getElementById('game-area');
  if (gameArea) gameArea.focus();
});
