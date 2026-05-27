# Arkanoid Cyberpunk 🚀

¡Bienvenido a **Arkanoid Cyberpunk**! Una reimaginación moderna y vibrante del clásico juego de romper ladrillos, construido enteramente con tecnologías web estándar (HTML5, CSS3, Vanilla JavaScript) y diseñado con una estética Neón/Cyberpunk espectacular.

## ✨ Características Principales

- **50 Niveles Únicos:** Generados de forma algorítmica con patrones incrementales de dificultad. ¡Enfréntate al nivel 50 "CYBER DIOS"!
- **Motor Físico Personalizado:** Física de rebotes suave y precisa, con soporte nativo para monitores Retina/High-DPI (escalado dinámico a 60fps).
- **Aceleración por Hardware:** Animaciones e interfaz fluidas optimizadas para GPU mediante transformaciones CSS3D.
- **Tienda de Cosméticos (Skins):** Gana puntos destruyendo bloques y personaliza tu Bola y tu Plataforma con más de 15 aspectos increíbles (Fuego, Fantasma, Plasma, Galaxia, etc).
- **Sistema de Audio Procedural:** Todo el sonido (rebotes, explosiones de bloques, power-ups) está generado matemáticamente mediante la **Web Audio API**. ¡Cero archivos .mp3 externos!
- **Protección Cross-Tab:** El juego detecta si abres múltiples pestañas simultáneamente para evitar la corrupción de tus partidas guardadas.
- **Power-Ups Dinámicos:** Multi-bolas, Láser, Ralentización, Imán, Bomba expansiva, y Escudos.

## 🛠️ Estructura del Código (Modular)

El código ha sido refactorizado usando ES Modules para máxima escalabilidad:

- `/js/main.js` - Punto de entrada que inicializa el juego.
- `/js/game.js` - Bucle central del juego, renderizado y físicas (`requestAnimationFrame`).
- `/js/entities.js` - Entidades del mundo: Bola, Plataforma, Ladrillos y Partículas.
- `/js/data.js` - Sistema de almacenamiento, tienda, niveles y seguridad de pestañas.
- `/js/audio.js` - Sintetizador de audio en tiempo real.
- `/js/config.js` - Constantes, balanceo de dificultad y colores.
- `/js/utils.js` - Utilidades matemáticas y de localStorage.

## 🚀 Cómo Jugar (Importante)

Debido a que el proyecto utiliza **ES Modules** (`import/export`), los navegadores modernos requieren que el juego se ejecute a través de un servidor HTTP por motivos de seguridad (CORS). **No puedes simplemente hacer doble clic en `index.html`.**

### Instrucciones de instalación local:

1. **Si usas VS Code:**
   - Instala la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
   - Haz clic derecho sobre el archivo `index.html` y selecciona **"Open with Live Server"**.

2. **Si usas Node.js:**
   - Abre la terminal en la carpeta del proyecto.
   - Ejecuta `npx serve` o `npx http-server`.
   - Abre `http://localhost:3000` (o el puerto indicado) en tu navegador.

## 🎮 Controles

- **Flechas Izquierda / Derecha** (o `A` / `D`) para mover la plataforma.
- **Espacio** para lanzar la bola (o soltarla cuando tienes el poder del Imán).
- **Tecla Q** para disparar cuando tienes el poder Láser activo.
- **Tecla P** o **Escape** para Pausar el juego.
- **Ratón / Táctil:** Arrastra el dedo o el cursor en la pantalla para mover la plataforma rápidamente.

---
*Desarrollado con pasión. ¡Destruye el código y domina el cyberespacio!*
