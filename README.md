GitHub Pages deployment notes:

# Snake Moderno (2025)

> ¡Juega al clásico Snake con un diseño moderno, responsivo y accesible!

Global leaderboard (optional)
--------------------------------
This project supports an optional global leaderboard using Firebase Firestore. To enable:

1. Create a Firebase project at https://console.firebase.google.com and add a Web App.
2. Enable Firestore (in test mode while developing).
3. Copy your Firebase config and create `js/global-config.js` with:

```js
window.GLOBAL_LEADERBOARD_CONFIG = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	storageBucket: "...",
	messagingSenderId: "...",
	appId: "..."
};
```

4. The game will detect the config and show a "Enviar puntuación global" button in the game over modal. Use the "Cargar leaderboard global" button to fetch top scores.

Note: Firestore rules in production should be configured to prevent abuse; for testing you can use open rules but secure the DB before going public.
## Características
- Interfaz moderna y responsiva (CSS Grid/Flexbox, dark mode, mobile friendly)
- Accesibilidad mejorada (etiquetas ARIA, navegación por teclado, enfoque automático)
- Soporte para controles táctiles en móviles
- Animaciones suaves para la serpiente y la comida
- Selección de temas y dificultad
- Código modular y fácil de mantener (ES6+)

## Cómo jugar
1. Abre `Snake.html` en tu navegador.
2. Usa las flechas del teclado (o desliza en móvil) para mover la serpiente.
3. Cambia el tema o la dificultad desde la barra superior.
4. ¡Disfruta y trata de superar tu puntuación!

## Estructura del proyecto
- `Snake.html`: Página principal del juego.
- `css/modern-snake.css`: Estilos modernos y responsivos.
- `js/snake.js`: Lógica del juego (moderna, accesible, móvil).
- `js/init.js`: Inicialización y mejoras de accesibilidad.

## Créditos
Basado en el clásico de Patrick Gillespie, rediseñado y modernizado por AlejandroMA22 y mejoras automáticas de GitHub Copilot.
