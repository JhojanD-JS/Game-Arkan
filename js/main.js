import { ArkanoidGame } from "./game.js";
import { initAudioEvents } from "./audio.js";
import { initCrossTabSync, broadcastTabActive } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  initAudioEvents();
  
  const game = new ArkanoidGame(
    document.getElementById("gameCanvas"),
    document.getElementById("overlay"),
    document.getElementById("pauseMenu"),
  );

  initCrossTabSync(() => {
    alert("¡Juego pausado! Tienes Arkanoid Cyberpunk abierto en otra pestaña activa.");
    if (game.state === "PLAYING") {
      game.togglePause();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        broadcastTabActive();
    }
  });
});
