import { SETTINGS, BALANCE, POWERUP_COLORS, POWERUP_ICONS } from "./config.js";
import { hexToRgb, clamp } from "./utils.js";
import { audioManager } from "./audio.js";
import { LEVELS } from "./data.js";

const PARTICLE_POOL_SIZE = 200;
export let particlePool = [];
let particleIndex = 0;

class PoolParticle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 1;
    this.color = "";
    this.size = 0;
    this.shape = "circle";
    this.rot = 0;
    this.vRot = 0;
  }
  init(x, y, vx, vy, life, color, size, shape = "circle") {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.shape = shape;
    this.rot = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 10;
  }
  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.shape === "rect") {
      this.vy += 800 * dt; // Gravity
      this.rot += this.vRot * dt;
    } else {
      this.vy *= 0.98;
    }
    this.vx *= 0.98;
    if (this.life <= 0) this.active = false;
  }
  draw(ctx) {
    if (!this.active) return;
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    if (this.shape === "rect") {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        this.size * (this.life / this.maxLife + 0.4),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

for (let i = 0; i < PARTICLE_POOL_SIZE; i++)
  particlePool.push(new PoolParticle());

function getParticle() {
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particleIndex = (particleIndex + 1) % PARTICLE_POOL_SIZE;
    if (!particlePool[particleIndex].active) return particlePool[particleIndex];
  }
  return null;
}

export function spawnParticleSystem(x, y, color, count = 12) {
  count = Math.min(count, 12);
  for (let i = 0; i < count; i++) {
    const p = getParticle();
    if (!p) break;
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 220;
    p.init(
      x,
      y,
      Math.cos(a) * s,
      Math.sin(a) * s,
      0.3 + Math.random() * 0.4,
      color,
      2 + Math.random() * 3,
      "circle"
    );
  }
}

export function spawnBlockFragments(x, y, w, h, color) {
  let count = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const p = getParticle();
    if (!p) break;
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const vx = (Math.random() - 0.5) * 300;
    const vy = -50 - Math.random() * 250;
    p.init(
      px,
      py,
      vx,
      vy,
      0.6 + Math.random() * 0.5,
      color,
      4 + Math.random() * 6,
      "rect"
    );
  }
}

export class Sella {
  constructor() {
    this.x = (SETTINGS.worldW - SETTINGS.sellaBaseW) / 2;
    this.y = SETTINGS.sellaY;
    this.w = SETTINGS.sellaBaseW;
    this.baseW = SETTINGS.sellaBaseW;
    this.targetW = SETTINGS.sellaBaseW;
    this.h = SETTINGS.sellaH;
    this.vx = 0;
  }

  setBuffedWidth(active) {
    this.targetW = active ? SETTINGS.sellaMaxW : this.baseW;
  }

  update(dt, targetX = null) {
    if (targetX !== null) {
      let desired = targetX - this.w / 2;
      this.x +=
        (clamp(desired, 24, SETTINGS.worldW - this.w - 24) - this.x) * 18 * dt;
    } else {
      this.x += this.vx * dt;
    }
    this.x = clamp(this.x, 24, SETTINGS.worldW - this.w - 24);
    this.w += (this.targetW - this.w) * 12 * dt;
  }

  get centerX() {
    return this.x + this.w / 2;
  }

  draw(ctx, skin) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = skin.sellaGlow;
    ctx.beginPath();
    ctx.roundRect(this.x - 3, this.y - 3, this.w + 6, this.h + 6, 16);
    ctx.fill();
    ctx.globalAlpha = 1;

    const grad = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x + this.w,
      this.y,
    );
    grad.addColorStop(0, skin.sellaGradient[0]);
    grad.addColorStop(0.5, "#ffffff");
    grad.addColorStop(1, skin.sellaGradient[1]);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.w, this.h, 14);
    ctx.fill();
    ctx.strokeStyle = skin.sellaGlow;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

export class Ball {
  constructor(x, y, vx, vy, ballCore, ballTrail) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = SETTINGS.ballRadius;
    this.stuck = true;
    this.alive = true;
    this.ballCore = ballCore;
    this.ballTrail = ballTrail;
    this.trail = [];
    this._cachedGrad = null;
    this._cachedColor = null;
    this._trailColor = null;
    this._trailRgb = { r: 255, g: 255, b: 255 };
  }

  launchFromSella(sella) {
    this.stuck = false;
    this.y = sella.y - this.r - 1;
    this.x = sella.centerX;
    this.vx = Math.random() * 300 - 150;
    this.vy = -SETTINGS.ballSpeed;
  }

  update(dt, game) {
    if (this.stuck) {
      this.x = game.sella.centerX;
      this.y = game.sella.y - this.r - 1;
      return;
    }
    let sp = Math.hypot(this.vx, this.vy);
    const minSpeed = SETTINGS.ballSpeed * 0.4;
    if (sp < minSpeed) {
      sp = minSpeed;
      let angle = Math.atan2(this.vy, this.vx);
      if (isNaN(angle) || (this.vx === 0 && this.vy === 0)) angle = Math.PI / 4;
      this.vx = Math.cos(angle) * sp;
      this.vy = Math.sin(angle) * sp;
    } else if (sp > SETTINGS.ballMaxSpeed) {
      this.vx *= SETTINGS.ballMaxSpeed / sp;
      this.vy *= SETTINGS.ballMaxSpeed / sp;
    }

    if (Math.abs(this.vy) < sp * 0.15) {
      this.vy = (this.vy >= 0 ? 1 : -1) * sp * 0.15;
      let newAngle = Math.atan2(this.vy, this.vx);
      this.vx = Math.cos(newAngle) * sp;
    }

    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > BALANCE.TRAIL_LENGTH) this.trail.pop();

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x - this.r < 16) {
      this.x = 16 + this.r;
      this.vx *= -1;
      game.addShake(1.2);
      audioManager.playBounceWall();
    }
    if (this.x + this.r > SETTINGS.worldW - 16) {
      this.x = SETTINGS.worldW - 16 - this.r;
      this.vx *= -1;
      game.addShake(1.2);
      audioManager.playBounceWall();
    }
    if (this.y - this.r < 78) {
      this.y = 78 + this.r;
      this.vy *= -1;
      game.addShake(0.8);
      audioManager.playBounceWall();
    }
    if (this.y - this.r > SETTINGS.worldH + 50) {
      if (game.shieldActive > 0) {
        this.y = SETTINGS.worldH - this.r - 10;
        this.vy = -Math.abs(this.vy);
        game.shieldActive -= 2;
        game.addShake(4);
        spawnParticleSystem(this.x, this.y, "#4488ff", 14);
        if (navigator.vibrate) navigator.vibrate(40);
        audioManager.playBounceWall();
      } else {
        this.alive = false;
      }
    }
  }

  draw(ctx) {
    if (this.ballTrail !== this._trailColor) {
      this._trailRgb = hexToRgb(this.ballTrail);
      this._trailColor = this.ballTrail;
    }
    const rgb = this._trailRgb;

    for (let i = 0; i < this.trail.length; i++) {
      let p = this.trail[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, this.r * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${
        0.5 * (1 - i / this.trail.length)
      })`;
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.beginPath();
    ctx.arc(0, 0, this.r + 4, 0, Math.PI * 2);
    ctx.fillStyle = this.ballTrail + "33";
    ctx.fill();

    if (this.ballCore !== this._cachedColor || !this._cachedGrad) {
      this._cachedColor = this.ballCore;
      const grad = ctx.createRadialGradient(-3, -3, 3, 0, 0, this.r * 1.5);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(1, this.ballCore);
      this._cachedGrad = grad;
    }

    ctx.fillStyle = this._cachedGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Brick {
  constructor(x, y, w, h, hp, row, col, diff) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
    this.score = 50 * hp;
    this.hue = (row * 37 + col * 19 + diff * 360) % 360;
    
    this.cracks = [];
    let numCracks = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numCracks; i++) {
      let angle = Math.random() * Math.PI * 2;
      let line = [];
      let points = 3 + Math.floor(Math.random() * 2);
      let rMax = Math.max(w, h) / 1.2;
      for (let p = 1; p <= points; p++) {
        let radius = (rMax / points) * p;
        let pAngle = angle + (Math.random() - 0.5) * 0.8;
        line.push({
           x: Math.cos(pAngle) * radius,
           y: Math.sin(pAngle) * radius
        });
      }
      this.cracks.push(line);
    }
  }

  hit() {
    if (this.hp === -1) return false;
    this.hp--;
    if (this.hp <= 0) this.alive = false;
    return !this.alive;
  }

  draw(ctx) {
    if (!this.alive) return;
    if (this.hp === -1) {
      ctx.fillStyle = "#888888";
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = "#aaa";
      ctx.strokeRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
      return;
    }
    
    let ratio = Math.max(0.2, this.hp / this.maxHp);
    ctx.fillStyle = `hsla(${this.hue},85%,${40 + 25 * ratio}%,${0.5 + 0.35 * ratio})`;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = `hsla(${this.hue},100%,${60 + 15 * ratio}%,0.9)`;
    ctx.strokeRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
    
    ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.15 * ratio})`;
    ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 4);
    
    if (this.hp < this.maxHp && this.hp !== -1) {
      let dmgRatio = 1 - (this.hp / this.maxHp);
      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      
      ctx.beginPath();
      for (let line of this.cracks) {
        let drawPoints = Math.ceil(line.length * dmgRatio);
        if (drawPoints > 0) {
          ctx.moveTo(0, 0);
          for (let i = 0; i < drawPoints; i++) {
            ctx.lineTo(line[i].x, line[i].y);
          }
        }
      }
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.beginPath();
      for (let line of this.cracks) {
        let drawPoints = Math.ceil(line.length * dmgRatio);
        if (drawPoints > 0) {
          ctx.moveTo(0, 0);
          for (let i = 0; i < drawPoints; i++) {
            ctx.lineTo(line[i].x, line[i].y);
          }
        }
      }
      ctx.strokeStyle = `hsla(${this.hue}, 100%, 80%, 0.8)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
    
    if (this.hp > 1) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.hp, this.x + this.w / 2, this.y + this.h / 2 + 1);
      ctx.fillStyle = "white";
      ctx.fillText(this.hp, this.x + this.w / 2, this.y + this.h / 2);
    }
  }
}

export class PowerUp {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 30;
    this.speed = 160;
    this.alive = true;
    this.pulse = 0;
  }

  update(dt) {
    this.y += this.speed * dt;
    this.pulse += dt * 7;
    if (this.y > SETTINGS.worldH + 60) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    let s = 1 + Math.sin(this.pulse) * 0.12;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);

    let color = POWERUP_COLORS[this.type];

    if (this.type === "LIFE") {
      let radio = 22 + Math.sin(this.pulse) * 4;
      ctx.fillStyle = "#ff446622";
      ctx.beginPath();
      ctx.arc(0, 0, radio, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = color + "55";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-15, -15, 30, 30, 10);
    ctx.fill();

    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText(POWERUP_ICONS[this.type] || "?", 0, 5);

    ctx.restore();
  }

  cleanup() {
    this.alive = false;
  }
}

export class LevelManager {
  constructor() {
    this.bricks = [];
    this.remaining = 0;
    this.currentIndex = 0;
    this.currentLevelData = null;
  }

  loadLevel(idx) {
    this.currentIndex = idx;
    this.currentLevelData = LEVELS[idx];
    this.bricks = [];

    const lvl = this.currentLevelData;
    const rows = lvl.layout.length;
    const cols = lvl.layout[0].length;
    const areaX = 90,
      areaY = 120,
      areaW = SETTINGS.worldW - 180,
      gap = 10;
    const brickW = (areaW - gap * (cols - 1)) / cols;
    const brickH = 46;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let token = lvl.layout[r][c];
        if (token === 0 || token === "0") continue;
        let hp = typeof token === "number" ? token : parseInt(token, 10) || 1;
        this.bricks.push(
          new Brick(
            areaX + c * (brickW + gap),
            areaY + r * (brickH + gap),
            brickW,
            brickH,
            hp,
            r,
            c,
            lvl.difficulty,
          ),
        );
      }
    }
    this.remaining = this.bricks.length;
  }

  onBrickDestroyed() {
    this.remaining--;
  }
  draw(ctx) {
    for (let b of this.bricks) b.draw(ctx);
  }
  getCurrentLevel() {
    return this.currentIndex + 1;
  }
}
