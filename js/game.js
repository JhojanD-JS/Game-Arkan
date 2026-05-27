import {
  SETTINGS,
  BALANCE,
  ORIGINAL_SETTINGS,
  ORIGINAL_BALANCE,
  POWERUP_COLORS,
  TOTAL_LEVELS,
} from "./config.js";
import { clamp, showPowerupNotification } from "./utils.js";
import { audioManager } from "./audio.js";
import {
  Sella,
  Ball,
  LevelManager,
  spawnParticleSystem,
  particlePool,
  PowerUp,
} from "./entities.js";
import {
  loadUser,
  saveUserImmediate,
  saveGameScore,
  loadLeaderboard,
  addPoints,
  updateMaxLevel,
  getSkinById,
  SKINS_CATALOG,
  purchaseSkin,
  equipSkin,
  equipSellaSkin,
} from "./data.js";

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };
}

export class ArkanoidGame {
  constructor(canvas, overlay, pauseMenu) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.overlay = overlay;
    this.pauseMenu = pauseMenu;
    this.state = "START_MENU";
    this.username = "";
    this.userData = null;
    this.shake = 0;
    this.sella = new Sella();
    this.balls = [];
    this.powerUps = [];
    this.levelManager = new LevelManager();
    this.laserActive = 0;
    this.laserCooldown = 0;
    this.laserBeamTimer = 0;
    this.currentLevel = 0;
    this.touchActive = false;
    this.lastTs = 0;
    this.pointsEarnedThisRun = 0;
    this._mouseX = null;
    this._lastLives = -1;
    this._bgGrad = null;
    this.sellaTrail = [];
    this._levelClearing = false;
    this.shieldActive = 0;
    this.magnetActive = 0;
    this.x2Active = 0;
    this.x2Multiplier = 1;
    this._cachedBallSkin = null;
    this._cachedSellaSkin = null;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.levelIntroText = "";
    this.levelCompleteAnimation = false;
    this._gradientCache = null;
    this._lastSkinId = null;
    this._levelAnimT = 0;

    this.resize();
    this.setupEvents();
    this.renderLeaderboard();
    this.showLanding();
    this.animate();
  }

  resize() {
    const frame = this.canvas.parentElement;
    const maxW = Math.min(window.innerWidth - 24, 1280);
    const maxH = Math.min(window.innerHeight - 40, 900);
    const scale = Math.min(maxW / SETTINGS.worldW, maxH / SETTINGS.worldH);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = SETTINGS.worldW * dpr;
    this.canvas.height = SETTINGS.worldH * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    frame.style.width = `${SETTINGS.worldW * scale}px`;
    frame.style.height = `${SETTINGS.worldH * scale}px`;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this._bgCache = null;
  }

  setupEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA")
        this.sella.vx = -SETTINGS.sellaSpeed;
      if (e.code === "ArrowRight" || e.code === "KeyD")
        this.sella.vx = SETTINGS.sellaSpeed;
      if (e.code === "Space") {
        e.preventDefault();
        this.onAction();
      }
      if (e.code === "KeyQ") this.tryLaser();
      if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        this.togglePause();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA" ||
        e.code === "ArrowRight" ||
        e.code === "KeyD"
      )
        this.sella.vx = 0;
    });

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.touchActive = true;
      this.handlePointerMove(e.touches[0]);
      this.onAction();
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.handlePointerMove(e.touches[0]);
    });
    this.canvas.addEventListener("touchend", () => {
      this.touchActive = false;
      this._mouseX = null;
    });
    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.touchActive) this.handlePointerMove(e);
    });
    this.canvas.addEventListener("click", () => this.onAction());

    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("resumeBtn")
      .addEventListener("click", () => this.togglePause());

    document.getElementById("pauseShopBtn").addEventListener("click", () => {
      this.togglePause();
      this.openShopFromPause();
    });

    document.getElementById("pauseMenuBtn").addEventListener("click", () => {
      this.togglePause();
      this.showLanding();
    });

    document.getElementById("muteBtn").addEventListener("click", () => {
      audioManager.toggle();
      document.getElementById("muteBtn").textContent = audioManager.muted
        ? "🔇"
        : "🔊";
    });
    document.getElementById("muteBtn").textContent = audioManager.muted
      ? "🔇"
      : "🔊";

    document.addEventListener("visibilitychange", () => {
      if (
        document.hidden &&
        (this.state === "PLAYING" || this.state === "LEVEL_INTRO")
      ) {
        if (this.state === "PLAYING") this.setState("PAUSED");
        if (this.userData) {
          saveUserImmediate(this.username, this.userData);
        }
      }
    });
  }

  handlePointerMove(pointer) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = SETTINGS.worldW / rect.width;
    let canvasX = (pointer.clientX - rect.left) * scaleX;
    canvasX = clamp(canvasX, 0, SETTINGS.worldW);
    this._mouseX = canvasX;
  }

  togglePause() {
    if (this.state !== "PLAYING" && this.state !== "PAUSED") return;
    if (this.state === "PLAYING") {
      this.state = "PAUSED";
      this.pauseMenu.classList.add("show");
    } else if (this.state === "PAUSED") {
      this.state = "PLAYING";
      this.pauseMenu.classList.remove("show");
    }
    this.updateHUD();
  }

  openShopFromPause() {
    this.renderShopUI(true);
  }

  onAction() {
    if (this.state === "START_MENU") return;
    if (this.state === "LEVEL_INTRO") {
      if (this.levelCountdownInterval) clearInterval(this.levelCountdownInterval);
      this.setState("PLAYING");
    }
    if (this.state === "PLAYING") {
      let stuckBalls = this.balls.filter((b) => b.stuck);
      for (let b of stuckBalls) {
        b.launchFromSella(this.sella);
      }
    }
    if (this.state === "SHOP_INTERMISSION") this.advanceLevel();
  }

  tryLaser() {
    if (this.state !== "PLAYING") return;
    if (this.laserActive <= 0 || this.laserCooldown > 0) return;

    this.laserBeamTimer = 0.1;
    this.laserCooldown = SETTINGS.laserCooldown;

    const bx = this.sella.x + this.sella.w / 2;
    const bricks = this.levelManager.bricks;
    let destroyed = 0;

    for (let i = bricks.length - 1; i >= 0 && destroyed < 2; i--) {
      const b = bricks[i];
      if (!b.alive || b.hp === -1) continue;

      if (bx >= b.x && bx <= b.x + b.w) {
        b.hp = 0;
        b.alive = false;
        this.levelManager.onBrickDestroyed();

        const gain = b.score * this.x2Multiplier * this.comboMultiplier;
        this.pointsEarnedThisRun += gain;
        this.userData = addPoints(this.username, this.userData, gain);

        spawnParticleSystem(bx, b.y + b.h / 2, `hsl(${b.hue},100%,65%)`, 14);
        this.addShake(5);

        if (navigator.vibrate) navigator.vibrate(50);
        destroyed++;

        if (this.levelManager.remaining === 0) {
          this.onLevelCleared();
          return;
        }
      }
    }
  }

  startGame(username, userData) {
    Object.assign(SETTINGS, ORIGINAL_SETTINGS);
    Object.assign(BALANCE, ORIGINAL_BALANCE);

    let diff = userData.difficulty || "NORMAL";
    if (diff === "EASY") {
      SETTINGS.ballSpeed *= 0.8;
      SETTINGS.sellaBaseW *= 1.3;
      BALANCE.POWERUP_DROP_CHANCE = 0.3;
    } else if (diff === "HARD") {
      SETTINGS.ballSpeed *= 1.2;
      SETTINGS.sellaBaseW *= 0.85;
      BALANCE.POWERUP_DROP_CHANCE = 0.14;
    }

    this.username = username;
    this.userData = userData;
    this.userData.totalGamesPlayed = (this.userData.totalGamesPlayed || 0) + 1;
    saveUserImmediate(username, this.userData);
    this.resetGame();
  }

  resetGame() {
    this._bgCache = null;
    this.sella = new Sella();
    this.balls = [];
    this.powerUps = [];
    this.currentLevel = Math.max(0, (this.userData.maxLevelReached || 1) - 1);
    this.laserActive = 0;
    this.laserCooldown = 0;
    this.laserBeamTimer = 0;
    this.shieldActive = 0;
    this.magnetActive = 0;
    this.x2Active = 0;
    this.x2Multiplier = 1;
    this.pointsEarnedThisRun = 0;
    this.userData.lives = BALANCE.MAX_LIVES;
    this.combo = 0;
    this.comboMultiplier = 1;
    this._lastLives = -1;
    this.sellaTrail = [];
    this._levelClearing = false;
    this.applyAmbientLight();

    this.sella.targetW = this.sella.w;
    this.levelManager.loadLevel(0);
    this.spawnBall();
    this.refreshSkinCache();
    this.startLevelIntro();
  }

  spawnBall() {
    let skin = this._cachedBallSkin || getSkinById(this.userData.equippedSkin);
    let ball = new Ball(
      this.sella.centerX,
      this.sella.y - SETTINGS.ballRadius - 1,
      0,
      -SETTINGS.ballSpeed,
      skin.ballCore,
      skin.ballTrail,
    );
    ball.stuck = true;
    this.balls.push(ball);
  }

  startLevelIntro() {
    this.state = "LEVEL_INTRO";
    const countdown = ["3", "2", "1", "¡GO!"];
    let idx = 0;

    if (this.levelCountdownInterval) clearInterval(this.levelCountdownInterval);

    this.levelCountdownInterval = setInterval(() => {
      if (this.state !== "LEVEL_INTRO") {
        clearInterval(this.levelCountdownInterval);
        return;
      }
      this.levelIntroText = countdown[idx];
      idx++;
      if (idx >= countdown.length) {
        clearInterval(this.levelCountdownInterval);
        this.setState("PLAYING");
      }
    }, 800);
  }

  advanceLevel() {
    this.userData.lives = BALANCE.MAX_LIVES;
    this.applyAmbientLight();
    this.updateHUD();

    this.currentLevel++;
    if (this.currentLevel >= TOTAL_LEVELS) {
      this.userData = updateMaxLevel(this.username, this.userData, TOTAL_LEVELS);
      saveGameScore(this.username, this.userData.points, TOTAL_LEVELS);
      saveUserImmediate(this.username, this.userData);
      this.setState("VICTORY");
      return;
    }

    this.laserActive = 0;
    this.laserCooldown = 0;
    this.laserBeamTimer = 0;
    this.shieldActive = 0;
    this.magnetActive = 0;
    this.x2Active = 0;
    this.x2Multiplier = 1;
    this.powerUps = [];

    this.userData = updateMaxLevel(this.username, this.userData, this.currentLevel + 1);
    this.levelManager.loadLevel(this.currentLevel);
    this.balls = [];
    this.spawnBall();
    this.startLevelIntro();
  }

  loseLife() {
    audioManager.playLifeLost();
    this.userData.lives--;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.applyAmbientLight();

    if (this.userData.lives <= 0) {
      saveGameScore(this.username, this.userData.points, this.currentLevel + 1);
      saveUserImmediate(this.username, this.userData);
      this.setState("GAME_OVER");
      return;
    }

    this.balls = [];
    this.spawnBall();
    this.addShake(8);
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
  }

  applyAmbientLight() {
    if (this.userData && this.userData.lives !== this._lastLives) {
      this._lastLives = this.userData.lives;
      let maxL = BALANCE.MAX_LIVES;
      let intensity = Math.max(0, (maxL - this.userData.lives) / maxL);
      document.body.style.background = `radial-gradient(circle at 20% 20%, rgba(255,61,242,${
        0.08 + intensity * 0.12
      }), transparent 40%), radial-gradient(circle at 80% 30%, rgba(0,245,255,0.08), transparent 45%), linear-gradient(145deg, #03050b, #0a1020)`;
    }
  }

  addShake(amt) {
    this.shake = clamp(this.shake + amt, 0, SETTINGS.maxShake);
  }

  onLevelCleared() {
    if (this._levelClearing) return;
    this._levelClearing = true;
    this._levelAnimT = 0;
    audioManager.playLevelComplete();

    let bonus = this.levelManager.currentLevelData?.baseScore || 100;
    this.pointsEarnedThisRun += bonus;
    this.userData = addPoints(this.username, this.userData, bonus);
    saveUserImmediate(this.username, this.userData);
    this.levelCompleteAnimation = true;

    setTimeout(() => {
      this.levelCompleteAnimation = false;
      this._levelAnimT = 0;
      this.setState("SHOP_INTERMISSION");
    }, 1500);
  }

  setState(next) {
    if (next !== "SHOP_INTERMISSION") this._levelClearing = false;
    this.state = next;

    if (next === "GAME_OVER" || next === "VICTORY") this.showEndScreen(next);
    if (next === "SHOP_INTERMISSION") this.renderShopUI(false);

    if (next === "PLAYING") {
      this.overlay.classList.remove("show");
      document.getElementById("pauseBtn").style.display = "flex";
      document.getElementById("overlayButtons").classList.remove("shop-active");
    } else {
      this.overlay.classList.add("show");
      document.getElementById("pauseBtn").style.display = "none";
    }

    if (next !== "PAUSED") this.pauseMenu.classList.remove("show");
    this.updateHUD();
  }

  showLanding() {
    this.state = "START_MENU";
    this.overlay.classList.add("show");
    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("overlayTitle").innerText = "ARKAN CYBERPUNK";
    document.getElementById("overlayText").innerHTML =
      `<span style="color: var(--neon-cyan)">⚡ ${TOTAL_LEVELS} NIVELES PROGRESIVOS ⚡</span><br><br>Ingresa tu nombre y elige dificultad`;
    document.getElementById("overlayHelp").innerHTML =
      `<input id="usernameInput" placeholder="Nombre" style="width:100%;padding:14px;border-radius:24px;border:1px solid rgba(0,245,255,.3);background:#091224;color:white;font-size:12px;font-family:'Press Start 2P',monospace;letter-spacing:1px;outline:none;margin-bottom:12px;"><br><select id="difficultySelect" style="width:100%;padding:12px;border-radius:24px;background:#091224;color:white;border:1px solid #0ff;font-family:'Press Start 2P',monospace;letter-spacing:1px;outline:none;"><option value="EASY">FÁCIL</option><option value="NORMAL" selected>NORMAL</option><option value="HARD">DIFÍCIL</option></select>`;

    const btnContainer = document.getElementById("overlayButtons");
    btnContainer.innerHTML = "";
    btnContainer.classList.remove("shop-active");

    let play = document.createElement("button");
    play.textContent = "🚀 COMENZAR AVENTURA";
    play.addEventListener("click", () => {
      let val = document.getElementById("usernameInput").value.trim().toLowerCase();
      if (!val) return alert("Nombre válido");
      let diff = document.getElementById("difficultySelect").value;
      let ud = loadUser(val, diff);
      this.startGame(val, ud);
    });
    btnContainer.append(play);
  }

  updateAllBallsSkin() {
    let skin = getSkinById(this.userData.equippedSkin);
    for (let b of this.balls) {
      b.ballCore = skin.ballCore;
      b.ballTrail = skin.ballTrail;
    }
    this.refreshSkinCache();
  }

  refreshSkinCache() {
    this._cachedBallSkin = getSkinById(this.userData?.equippedSkin || "neon");
    this._cachedSellaSkin = getSkinById(this.userData?.equippedSellaSkin || "chrome");
  }

  renderShopUI(fromPause) {
    this.overlay.classList.add("show");
    let cur = this.currentLevel + 1;
    let nxt = Math.min(cur + 1, TOTAL_LEVELS);

    document.getElementById("overlayTitle").innerText = "🎨 TIENDA DE ASPECTOS 🎨";
    document.getElementById("overlayText").innerHTML =
      `📊 NIVEL COMPLETADO: ${cur}/${TOTAL_LEVELS}<br>💰 PUNTOS: ${Math.floor(this.userData.points)}<br>🎯 SIGUIENTE NIVEL: ${nxt}`;

    const btnContainer = document.getElementById("overlayButtons");
    btnContainer.innerHTML = "";
    btnContainer.classList.add("shop-active");

    const makeGrid = (title, skins, equippedId, isSella) => {
      let section = document.createElement("div");
      section.style.cssText = "width:100%;margin-bottom:24px";

      let h = document.createElement("div");
      h.style.cssText =
        "font-size:11px;letter-spacing:2px;color:var(--neon-cyan);text-align:center;margin:0 0 14px;text-transform:uppercase;";
      h.textContent = title;
      section.appendChild(h);

      let grid = document.createElement("div");
      grid.className = "shop-grid-cosmetics";
      section.appendChild(grid);

      for (let skin of skins) {
        let owned = this.userData.ownedSkins.includes(skin.id);
        let equipped = equippedId === skin.id;
        let card = document.createElement("div");
        card.className =
          "skin-card" +
          (equipped ? " selected" : "") +
          (owned ? " owned" : " locked");

        let preview = document.createElement("div");
        if (isSella) {
          preview.style.cssText = `width:90px;height:20px;border-radius:10px;margin:14px auto 16px;background:linear-gradient(90deg,${skin.sellaGradient[0]},#ffffff,${skin.sellaGradient[1]});box-shadow:0 0 16px ${skin.sellaGlow};`;
        } else {
          preview.className = "skin-preview";
          preview.style.background = `radial-gradient(circle at 30% 30%, #fff, ${skin.sellaGradient[0]})`;
          preview.style.boxShadow = `0 0 20px ${skin.sellaGlow}`;
        }

        let nameDiv = document.createElement("div");
        nameDiv.className = "skin-name";
        nameDiv.textContent = skin.name;

        let priceDiv = document.createElement("div");
        priceDiv.className = "skin-price";
        priceDiv.textContent = owned
          ? equipped
            ? "✅ EQUIPADA"
            : "✓ YA COMPRADA"
          : `${skin.price} pts`;

        let statusDiv = document.createElement("div");
        statusDiv.className = "skin-status";

        if (!owned) {
          let buy = document.createElement("button");
          buy.textContent = "COMPRAR";
          buy.disabled = this.userData.points < skin.price;
          buy.addEventListener("click", (e) => {
            e.stopPropagation();
            let res = purchaseSkin(this.username, this.userData, skin.id);
            if (res.success) {
              this.userData = res.userData;
              this.renderShopUI(fromPause);
            } else alert(res.reason);
          });
          statusDiv.appendChild(buy);
        } else if (!equipped) {
          let eq = document.createElement("button");
          eq.textContent = "EQUIPAR";
          eq.addEventListener("click", (e) => {
            e.stopPropagation();
            let res = isSella
              ? equipSellaSkin(this.username, this.userData, skin.id)
              : equipSkin(this.username, this.userData, skin.id);
            if (res.success) {
              this.userData = res.userData;
              if (!isSella) this.updateAllBallsSkin();
              this.renderShopUI(fromPause);
            }
          });
          statusDiv.appendChild(eq);
        } else {
          let tag = document.createElement("div");
          tag.textContent = "✨ EQUIPADA ✨";
          tag.style.cssText = "color:#7CFF6B;font-size:9px;margin-top:8px;";
          statusDiv.appendChild(tag);
        }
        card.append(preview, nameDiv, priceDiv, statusDiv);
        grid.appendChild(card);
      }
      return section;
    };

    let ballSkins = SKINS_CATALOG.filter((s) => s.category === "ball");
    let sellaSkins = SKINS_CATALOG.filter((s) => s.category === "sella");

    btnContainer.appendChild(
      makeGrid("⚽ SKINS DE BOLA", ballSkins, this.userData.equippedSkin, false),
    );
    btnContainer.appendChild(
      makeGrid("🎮 SKINS DE PLATAFORMA", sellaSkins, this.userData.equippedSellaSkin || "chrome", true),
    );

    let back = document.createElement("button");
    if (fromPause) {
      back.textContent = "↩️ VOLVER AL JUEGO";
      back.className = "primary";
      back.addEventListener("click", () => {
        this.overlay.classList.remove("show");
        this.state = "PLAYING";
        this.updateHUD();
        btnContainer.classList.remove("shop-active");
      });
    } else {
      back.textContent = `⚔️ CONTINUAR AL NIVEL ${nxt} ⚔️`;
      back.className = "ghost";
      back.addEventListener("click", () => this.advanceLevel());
    }
    btnContainer.appendChild(back);
    this.refreshSkinCache();
  }

  showEndScreen(state) {
    let victory = state === "VICTORY";
    let maxLv = this.userData.maxLevelReached;

    document.getElementById("overlayTitle").innerText = victory
      ? "🏆 VICTORIA TOTAL 🏆"
      : "💀 GAME OVER 💀";
    document.getElementById("overlayText").innerHTML =
      `📊 NIVEL ALCANZADO: ${Math.min(this.currentLevel + 1, TOTAL_LEVELS)}/${TOTAL_LEVELS}<br>💰 PUNTOS TOTALES: ${Math.floor(this.userData.points)}<br>🏅 RÉCORD: Nivel ${maxLv}<br>${
        victory ? "✨ DOMINASTE EL CYBERESPACIO ✨" : "💪 REINTENTA 💪"
      }`;

    let btnContainer = document.getElementById("overlayButtons");
    btnContainer.innerHTML = "";
    btnContainer.classList.remove("shop-active");

    let restart = document.createElement("button");
    restart.textContent = "🔄 JUGAR DE NUEVO";
    restart.className = "primary";
    restart.addEventListener("click", () => {
      let fresh = loadUser(this.username, this.userData.difficulty);
      this.startGame(this.username, fresh);
    });

    let menu = document.createElement("button");
    menu.textContent = "🏠 MENÚ PRINCIPAL";
    menu.className = "secondary";
    menu.addEventListener("click", () => this.showLanding());

    btnContainer.append(restart, menu);
  }

  updateHUD() {
    let lvl = this.currentLevel + 1,
      pts = this.userData?.points || 0,
      lives = this.userData?.lives || 0,
      state = this.state;
    if (
      lvl === this._hudLvl &&
      pts === this._hudPts &&
      lives === this._hudLives &&
      state === this._hudState
    )
      return;
    this._hudLvl = lvl;
    this._hudPts = pts;
    this._hudLives = lives;
    this._hudState = state;

    function renderLives(currentLives, maxLives) {
      let str = "";
      for (let i = 0; i < maxLives; i++) {
        str += i < currentLives ? "❤️" : "🖤";
      }
      return str;
    }

    let hearts = renderLives(lives, BALANCE.MAX_LIVES);
    let names = {
      START_MENU: "MENÚ",
      LEVEL_INTRO: "INTRO",
      PLAYING: "⚡ JUEGO",
      SHOP_INTERMISSION: "🛒 TIENDA",
      GAME_OVER: "💀 GAME OVER",
      VICTORY: "🏆 VICTORIA",
      PAUSED: "⏸ PAUSA",
    };

    document.getElementById("hudLeft").innerHTML =
      `👤 ${this.username || "Jugador"} · ${hearts} · NIVEL ${Math.min(lvl, TOTAL_LEVELS)}/${TOTAL_LEVELS}`;
    document.getElementById("hudCenter").innerHTML = names[state] || state;
    document.getElementById("hudPoints").innerHTML = `${Math.floor(pts)} pts`;
  }

  renderLeaderboard() {
    let cont = document.getElementById("leaderboardContent");
    if (!cont) return;
    let scores = loadLeaderboard();
    cont.innerHTML = "";

    if (!scores.length) {
      cont.innerHTML = "<div>Sin registros</div>";
      return;
    }

    for (let i = 0; i < Math.min(5, scores.length); i++) {
      let e = scores[i];
      let row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.padding = "6px 0";
      row.style.borderBottom = "1px solid rgba(0,245,255,0.2)";
      row.innerHTML = `<span>#${i + 1} ${e.name}</span><strong>${e.score} pts</strong>`;
      cont.append(row);
    }
  }

  updateSellaTrail() {
    this.sellaTrail.unshift({
      x: this.sella.x,
      w: this.sella.w,
      y: this.sella.y,
    });
    if (this.sellaTrail.length > 8) this.sellaTrail.pop();
  }

  drawSellaTrail(ctx, skin) {
    for (let i = 0; i < this.sellaTrail.length; i++) {
      let t = this.sellaTrail[i];
      let alpha = 0.35 * (1 - i / this.sellaTrail.length);
      ctx.save();
      ctx.globalAlpha = alpha;
      let grad = ctx.createLinearGradient(t.x, t.y, t.x + t.w, t.y);
      grad.addColorStop(0, skin.sellaGradient[0]);
      grad.addColorStop(1, skin.sellaGradient[1]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(t.x, t.y, t.w, this.sella.h, 14);
      ctx.fill();
      ctx.restore();
    }
  }

  drawBackground() {
    if (!this._bgCache) {
      let off = document.createElement("canvas");
      off.width = SETTINGS.worldW;
      off.height = SETTINGS.worldH;
      let c = off.getContext("2d");
      let g = c.createLinearGradient(0, 0, 0, SETTINGS.worldH);
      g.addColorStop(0, "#04070f");
      g.addColorStop(1, "#010208");
      c.fillStyle = g;
      c.fillRect(0, 0, SETTINGS.worldW, SETTINGS.worldH);
      c.save();
      c.globalAlpha = 0.1;
      c.strokeStyle = "#00f5ff";
      for (let y = 100; y < SETTINGS.worldH; y += 40) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(SETTINGS.worldW, y);
        c.stroke();
      }
      for (let x = 0; x < SETTINGS.worldW; x += 40) {
        c.beginPath();
        c.moveTo(x, 100);
        c.lineTo(x, SETTINGS.worldH);
        c.stroke();
      }
      c.restore();
      this._bgCache = off;
    }
    this.ctx.drawImage(this._bgCache, 0, 0);
  }

  drawLaser() {
    if (this.laserBeamTimer <= 0 || this.state !== "PLAYING") return;
    let x = this.sella.centerX;
    this.ctx.save();
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "#ff3df2";
    let grad = this.ctx.createLinearGradient(x, this.sella.y, x, 80);
    grad.addColorStop(0, "rgba(255,61,242,0)");
    grad.addColorStop(0.2, "rgba(255,61,242,0.9)");
    grad.addColorStop(0.8, "rgba(0,245,255,0.9)");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(x - 5, 80, 10, this.sella.y - 80);
    this.ctx.restore();
  }

  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, SETTINGS.worldW, SETTINGS.worldH);
    let sx = (Math.random() - 0.5) * this.shake,
      sy = (Math.random() - 0.5) * this.shake;
    this.ctx.translate(sx, sy);

    this.drawBackground();

    this.ctx.strokeStyle = "rgba(0,245,255,0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(16, 76, SETTINGS.worldW - 32, SETTINGS.worldH - 92);

    this.levelManager.draw(this.ctx);

    for (let p of particlePool) if (p.active) p.draw(this.ctx);
    for (let b of this.balls) b.draw(this.ctx);
    for (let p of this.powerUps) p.draw(this.ctx);

    if (this.shieldActive > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.min(1, this.shieldActive / 2) * 0.7;
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#4488ff";
      this.ctx.strokeStyle = "#4488ff";
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(16, SETTINGS.worldH - 10);
      this.ctx.lineTo(SETTINGS.worldW - 16, SETTINGS.worldH - 10);
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.drawLaser();

    let currentSellaSkin = this._cachedSellaSkin || getSkinById("chrome");
    this.drawSellaTrail(this.ctx, currentSellaSkin);
    this.sella.draw(this.ctx, currentSellaSkin);

    if (this.state === "PLAYING" && this.balls.some((b) => b.stuck)) {
      this.ctx.globalAlpha = 0.7;
      this.ctx.font = '10px "Press Start 2P"';
      this.ctx.fillStyle = "#fff";
      this.ctx.fillText("⚡ TOCA / ESPACIO PARA LANZAR", 24, 110);
    }

    this.ctx.globalAlpha = 1;
    this.ctx.font = '12px "Press Start 2P"';
    this.ctx.fillStyle = "rgba(0,245,255,0.6)";
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      `NIVEL ${this.levelManager.getCurrentLevel()}`,
      SETTINGS.worldW - 24,
      110,
    );

    if (this.state === "LEVEL_INTRO") {
      this.ctx.fillStyle = "rgba(0,0,0,0.6)";
      this.ctx.fillRect(0, 0, SETTINGS.worldW, SETTINGS.worldH);
      
      this.ctx.fillStyle = "white";
      this.ctx.font = "32px 'Press Start 2P', monospace";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        `NIVEL ${this.currentLevel + 1}`,
        SETTINGS.worldW / 2,
        SETTINGS.worldH / 2 - 60
      );
      
      this.ctx.fillStyle = "var(--neon-cyan)";
      this.ctx.font = "16px 'Press Start 2P', monospace";
      this.ctx.fillText(
        this.levelManager.levelName || "",
        SETTINGS.worldW / 2,
        SETTINGS.worldH / 2 - 10
      );
      
      let count = Math.ceil(this.introTimer);
      if (count > 0 && count <= 3) {
        let scale = 1 + (this.introTimer % 1) * 0.5;
        this.ctx.save();
        this.ctx.translate(SETTINGS.worldW / 2, SETTINGS.worldH / 2 + 70);
        this.ctx.scale(scale, scale);
        this.ctx.fillStyle = "var(--neon-magenta)";
        this.ctx.font = "40px 'Press Start 2P', monospace";
        this.ctx.fillText(count.toString(), 0, 0);
        this.ctx.restore();
      }
    }

    if (this.levelCompleteAnimation) {
      let cx = SETTINGS.worldW / 2;
      let cy = SETTINGS.worldH / 2;
      let s = 0.5 + 0.7 * Math.min(this._levelAnimT / 1.5, 1);

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(s, s);
      this.ctx.font = '48px "Press Start 2P"';
      this.ctx.fillStyle = "#00f5ff";
      this.ctx.textAlign = "center";
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#00f5ff";
      this.ctx.fillText("NIVEL COMPLETADO", 0, 0);
      this.ctx.restore();

      let colors = ["#00f5ff", "#ff3df2", "#ffd700"];
      for (let i = 0; i < 3; i++) {
        let px = Math.random() * SETTINGS.worldW;
        spawnParticleSystem(px, 10, colors[i % colors.length], 3);
      }
    }

    if (
      this.shieldActive > 0 ||
      this.magnetActive > 0 ||
      this.x2Active > 0 ||
      this.laserActive > 0
    ) {
      let acts = [];
      if (this.shieldActive > 0)
        acts.push(`🛡️ ${Math.ceil(this.shieldActive)}s`);
      if (this.magnetActive > 0)
        acts.push(`🧲 ${Math.ceil(this.magnetActive)}s`);
      if (this.x2Active > 0) acts.push(`⭐x2 ${Math.ceil(this.x2Active)}s`);
      if (this.laserActive > 0)
        acts.push(`🔥 ${Math.ceil(this.laserActive)}s`);

      this.ctx.font = '9px "Press Start 2P"';
      this.ctx.fillStyle = "rgba(255,255,255,0.85)";
      this.ctx.textAlign = "left";
      acts.forEach((txt, i) =>
        this.ctx.fillText(txt, 24, SETTINGS.worldH - 20 - i * 18),
      );
    }
    this.ctx.restore();
  }

  updateGameplay(dt) {
    if (this._mouseX !== null) {
      this.sella.update(dt, this._mouseX);
      this._mouseX = null;
    } else {
      this.sella.update(dt);
    }

    this.updateSellaTrail();

    for (let b of this.balls) b.update(dt, this);
    for (let p of particlePool) if (p.active) p.update(dt);
    for (let i = 0; i < this.powerUps.length; i++) this.powerUps[i].update(dt);

    if (this.laserActive > 0) this.laserActive -= dt;
    if (this.laserCooldown > 0) this.laserCooldown -= dt;
    if (this.laserBeamTimer > 0) this.laserBeamTimer -= dt;

    if (this.shieldActive > 0) {
      this.shieldActive -= dt;
      if (this.shieldActive <= 0) this.shieldActive = 0;
    }
    if (this.magnetActive > 0) {
      this.magnetActive -= dt;
      if (this.magnetActive <= 0) this.magnetActive = 0;
    }
    if (this.x2Active > 0) {
      this.x2Active -= dt;
      if (this.x2Active <= 0) {
        this.x2Active = 0;
        this.x2Multiplier = 1;
      }
    }

    for (let ball of this.balls) {
      for (let brick of this.levelManager.bricks) {
        if (!brick.alive) continue;
        let cx = clamp(ball.x, brick.x, brick.x + brick.w);
        let cy = clamp(ball.y, brick.y, brick.y + brick.h);
        let dx = ball.x - cx,
          dy = ball.y - cy;

        if (dx * dx + dy * dy <= ball.r * ball.r) {
          let ol = ball.x + ball.r - brick.x,
            or = brick.x + brick.w - (ball.x - ball.r);
          let ot = ball.y + ball.r - brick.y,
            ob = brick.y + brick.h - (ball.y - ball.r);

          if (Math.min(ol, or) < Math.min(ot, ob)) {
            if (ol < or) {
              ball.vx = -Math.abs(ball.vx);
              ball.x = brick.x - ball.r;
            } else {
              ball.vx = Math.abs(ball.vx);
              ball.x = brick.x + brick.w + ball.r;
            }
          } else {
            if (ot < ob) {
              ball.vy = -Math.abs(ball.vy);
              ball.y = brick.y - ball.r;
            } else {
              ball.vy = Math.abs(ball.vy);
              ball.y = brick.y + brick.h + ball.r;
            }
          }

          let destroyed = brick.hit();
          let gain =
            (destroyed ? brick.score : 10) *
            this.x2Multiplier *
            this.comboMultiplier;

          if (destroyed) {
            audioManager.playBrickDestroyed();
            this.combo++;
            if (this.combo >= 20) this.comboMultiplier = 3;
            else if (this.combo >= 10) this.comboMultiplier = 2;
            else if (this.combo >= 5) this.comboMultiplier = 1.5;
          } else {
            audioManager.playBrickHit();
          }

          this.pointsEarnedThisRun += gain;
          this.userData = addPoints(this.username, this.userData, gain);
          spawnParticleSystem(
            ball.x,
            ball.y,
            destroyed ? `hsl(${brick.hue},100%,65%)` : "#fff",
            destroyed ? 14 : 6,
          );
          this.addShake(destroyed ? 5 : 2);

          if (destroyed) {
            this.levelManager.onBrickDestroyed();
            if (Math.random() < BALANCE.POWERUP_DROP_CHANCE) {
              let pool = [
                "EXTEND",
                "EXTEND",
                "EXTEND",
                "MULTI",
                "MULTI",
                "MULTI",
                "SLOW",
                "SLOW",
                "SLOW",
                "FIRE",
                "FIRE",
                "SHIELD",
                "SHIELD",
                "MAGNET",
                "BOMB",
                "X2",
                "LIFE",
              ];
              let type = pool[Math.floor(Math.random() * pool.length)];
              this.powerUps.push(
                new PowerUp(type, brick.x + brick.w / 2, brick.y + brick.h / 2),
              );
            }
          }
          if (this.levelManager.remaining === 0) this.onLevelCleared();
          break;
        }
      }
    }

    for (let ball of this.balls) {
      if (ball.vy > 0) {
        let hitX = Math.max(
          this.sella.x,
          Math.min(ball.x, this.sella.x + this.sella.w),
        );
        let hitY = this.sella.y;
        let dx = ball.x - hitX,
          dy = ball.y - hitY;

        if (dx * dx + dy * dy <= ball.r * ball.r) {
          ball.y = this.sella.y - ball.r - 1;
          let hitPos = (hitX - this.sella.x) / this.sella.w;
          let angle = (hitPos - 0.5) * (Math.PI / 1.2);
          let speed = Math.hypot(ball.vx, ball.vy);
          let newSpeed = clamp(speed, SETTINGS.ballSpeed, SETTINGS.ballMaxSpeed);

          ball.vx = Math.sin(angle) * newSpeed;
          ball.vy = -Math.cos(angle) * newSpeed;

          let minAngle = Math.PI / 9;
          let currentAngle = Math.atan2(ball.vy, ball.vx);
          if (Math.abs(Math.sin(currentAngle)) < Math.sin(minAngle)) {
            let sp = Math.hypot(ball.vx, ball.vy);
            currentAngle = currentAngle > 0 ? minAngle : -minAngle;
            ball.vx = Math.cos(currentAngle) * sp;
            ball.vy = Math.sin(currentAngle) * sp;
          }

          this.addShake(2.5);
          audioManager.playBouncePaddle();
          spawnParticleSystem(ball.x, ball.y, ball.ballTrail, 6);
          if (navigator.vibrate) navigator.vibrate(20);
          if (this.magnetActive > 0 && !ball.stuck) {
            ball.stuck = true;
            this.magnetActive = 0;
          }
        }
      }
    }

    for (let pu of this.powerUps) {
      if (!pu.alive) continue;
      let hit = !(
        pu.x + pu.w / 2 < this.sella.x ||
        pu.x - pu.w / 2 > this.sella.x + this.sella.w ||
        pu.y + pu.h / 2 < this.sella.y ||
        pu.y - pu.h / 2 > this.sella.y + this.sella.h
      );

      if (hit) {
        let msg = {
          EXTEND: "🟦⬅️➡️  ¡PLATAFORMA GIGANTE!  ⬅️➡️🟦",
          MULTI: "🌀🎱🎱  ¡BOLA EXTRA!  🎱🎱🌀",
          FIRE: "🔥💥⚡  ¡LÁSER ACTIVADO!  ⚡💥🔥",
          SLOW: "🐢❄️🌊  ¡BOLA EN CÁMARA LENTA!  🌊❄️🐢",
          SHIELD: "🛡️✨💫  ¡ESCUDO ACTIVADO!  💫✨🛡️",
          BOMB: "💣💥🔥  ¡BOMBA EXPLOSIVA!  🔥💥💣",
          MAGNET: "🧲⚡🎯  ¡IMÁN ACTIVADO!  🎯⚡🧲",
          X2: "⭐💰✨  ¡PUNTOS x2!  ✨💰⭐",
          LIFE: "❤️✨💖  ¡VIDA EXTRA!  💖✨❤️",
        };

        if (pu.type === "LIFE") {
          if (this.userData.lives < BALANCE.MAX_LIVES) {
            this.userData.lives++;
            this.applyAmbientLight();
            saveUserImmediate(this.username, this.userData);
            audioManager.playExtraLife();
            spawnParticleSystem(
              SETTINGS.worldW / 2,
              SETTINGS.worldH / 2,
              "#ff4466",
              20,
            );
            this.addShake(3);
            if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
            showPowerupNotification(msg["LIFE"]);
          } else {
            audioManager.playPowerUp();
            showPowerupNotification("❤️ ¡VIDAS AL MÁXIMO! ❤️");
          }
        } else {
          audioManager.playPowerUp();
          showPowerupNotification(msg[pu.type] || "POWER-UP");
        }

        if (pu.type === "EXTEND") this.sella.setBuffedWidth(true);
        if (pu.type === "MULTI") {
          let skin =
            this._cachedBallSkin || getSkinById(this.userData.equippedSkin);
          let nb = new Ball(
            pu.x,
            pu.y,
            Math.random() * 400 - 200,
            Math.random() * 200 - 300,
            skin.ballCore,
            skin.ballTrail,
          );
          nb.stuck = false;
          this.balls.push(nb);
        }
        if (pu.type === "FIRE") this.laserActive = SETTINGS.laserDuration;
        if (pu.type === "SLOW")
          for (let b of this.balls) {
            b.vx *= 0.5;
            b.vy *= 0.5;
          }
        if (pu.type === "SHIELD") this.shieldActive = BALANCE.SHIELD_USES;
        if (pu.type === "BOMB") {
          let alive = this.levelManager.bricks.filter((b) => b.alive);
          let targets = alive
            .sort(() => Math.random() - 0.5)
            .slice(0, BALANCE.BOMB_TARGETS);
          for (let br of targets) {
            br.alive = false;
            audioManager.playBrickDestroyed();
            this.levelManager.onBrickDestroyed();
            let gain = br.score * this.x2Multiplier * this.comboMultiplier;
            this.pointsEarnedThisRun += gain;
            this.userData = addPoints(this.username, this.userData, gain);
            spawnParticleSystem(
              br.x + br.w / 2,
              br.y + br.h / 2,
              `hsl(${br.hue},100%,65%)`,
              18,
            );
          }
          this.addShake(10);
          if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
          if (this.levelManager.remaining === 0) this.onLevelCleared();
        }
        if (pu.type === "MAGNET") this.magnetActive = BALANCE.MAGNET_DURATION;
        if (pu.type === "X2") {
          this.x2Active = BALANCE.X2_DURATION;
          this.x2Multiplier = 2;
        }

        spawnParticleSystem(pu.x, pu.y, POWERUP_COLORS[pu.type], 16);
        pu.cleanup();
      }
    }

    if (this.powerUps.length > 15) {
      this.powerUps = this.powerUps.filter((p) => p.alive);
    }
    const teniaBolas = this.balls.length;
    this.balls = this.balls.filter((b) => b.alive);
    if (this.balls.length === 0 && teniaBolas > 0) {
      this.loseLife();
    }
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - SETTINGS.shakeDecay * dt);
    if (this.levelCompleteAnimation) this._levelAnimT += dt;
    if (this.state === "PLAYING") this.updateGameplay(dt);
    this.updateHUD();
    this.applyAmbientLight();
  }

  animate() {
    requestAnimationFrame((ts) => {
      if (document.hidden) {
        this.lastTs = 0;
        requestAnimationFrame((ts) => this.animate());
        return;
      }
      if (!this.lastTs) this.lastTs = ts;
      let dt = Math.min(0.033, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      if (dt > 0.001 && this.state !== "PAUSED") this.update(dt);
      this.draw();
      this.animate();
    });
  }
}
