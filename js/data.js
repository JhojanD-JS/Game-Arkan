import { safeLocalStorage } from "./utils.js";
import { BALANCE } from "./config.js";

export const SKINS_CATALOG = [
  {
    id: "neon",
    name: "NEÓN",
    price: 0,
    category: "ball",
    sellaGradient: ["#0ff", "#0af"],
    sellaGlow: "#0ff",
    ballCore: "#0ff",
    ballTrail: "#0ff",
  },
  {
    id: "fire",
    name: "FUEGO",
    price: 500,
    category: "ball",
    sellaGradient: ["#ff6600", "#ff2200"],
    sellaGlow: "#ff4400",
    ballCore: "#ffaa44",
    ballTrail: "#ff4400",
  },
  {
    id: "metal",
    name: "METAL",
    price: 800,
    category: "ball",
    sellaGradient: ["#7f8c8d", "#5a6e7a"],
    sellaGlow: "#b0c4de",
    ballCore: "#ccddee",
    ballTrail: "#8899aa",
  },
  {
    id: "ghost",
    name: "FANTASMA",
    price: 1200,
    category: "ball",
    sellaGradient: ["#b266ff", "#8a2be2"],
    sellaGlow: "#ddaaff",
    ballCore: "#e0b0ff",
    ballTrail: "#b266ff",
  },
  {
    id: "plasma",
    name: "PLASMA",
    price: 1500,
    category: "ball",
    sellaGradient: ["#ff3df2", "#cc1aa0"],
    sellaGlow: "#ff88ff",
    ballCore: "#ff88ff",
    ballTrail: "#ff3df2",
  },
  {
    id: "gold",
    name: "DORADO",
    price: 2000,
    category: "ball",
    sellaGradient: ["#ffd700", "#cc9900"],
    sellaGlow: "#ffcc44",
    ballCore: "#ffb347",
    ballTrail: "#ffd700",
  },
  {
    id: "ice",
    name: "ICE",
    price: 1000,
    category: "ball",
    sellaGradient: ["#99eeff", "#0088cc"],
    sellaGlow: "#00ccff",
    ballCore: "#ccf5ff",
    ballTrail: "#00ccff",
  },
  {
    id: "lava",
    name: "LAVA",
    price: 1400,
    category: "ball",
    sellaGradient: ["#ff6600", "#cc2200"],
    sellaGlow: "#ff4400",
    ballCore: "#ffaa44",
    ballTrail: "#ff6600",
  },
  {
    id: "electric",
    name: "ELÉCTRICO",
    price: 1800,
    category: "ball",
    sellaGradient: ["#ffee00", "#ffaa00"],
    sellaGlow: "#ffe000",
    ballCore: "#ffffff",
    ballTrail: "#ffe000",
  },
  {
    id: "void",
    name: "VOID",
    price: 2200,
    category: "ball",
    sellaGradient: ["#330044", "#110022"],
    sellaGlow: "#8800cc",
    ballCore: "#9933ff",
    ballTrail: "#6600aa",
  },
  {
    id: "crystal",
    name: "CRISTAL",
    price: 3000,
    category: "ball",
    sellaGradient: ["#eeeeff", "#aabbff"],
    sellaGlow: "#ccddff",
    ballCore: "#ffffff",
    ballTrail: "#aabbff",
  },
  {
    id: "chrome",
    name: "CROMO",
    price: 900,
    category: "sella",
    sellaGradient: ["#e0e0e0", "#888888"],
    sellaGlow: "#cccccc",
    ballCore: "#cccccc",
    ballTrail: "#aaaaaa",
  },
  {
    id: "ruby",
    name: "RUBÍ",
    price: 1100,
    category: "sella",
    sellaGradient: ["#ff4444", "#880000"],
    sellaGlow: "#ff2222",
    ballCore: "#ff4444",
    ballTrail: "#cc0000",
  },
  {
    id: "emerald",
    name: "ESMERALDA",
    price: 1300,
    category: "sella",
    sellaGradient: ["#44ff44", "#005500"],
    sellaGlow: "#00ff44",
    ballCore: "#44ff44",
    ballTrail: "#009900",
  },
  {
    id: "hologram",
    name: "HOLOGRAMA",
    price: 1700,
    category: "sella",
    sellaGradient: ["#00ffcc", "#0044ff"],
    sellaGlow: "#00ffcc",
    ballCore: "#00ffcc",
    ballTrail: "#0088ff",
  },
  {
    id: "lavaplate",
    name: "LAVA PLATE",
    price: 2000,
    category: "sella",
    sellaGradient: ["#ffcc00", "#ff3300"],
    sellaGlow: "#ff6600",
    ballCore: "#ff9900",
    ballTrail: "#ff3300",
  },
  {
    id: "galaxy",
    name: "GALAXIA",
    price: 2600,
    category: "sella",
    sellaGradient: ["#4400aa", "#000033"],
    sellaGlow: "#6622cc",
    ballCore: "#aa44ff",
    ballTrail: "#4400aa",
  },
  {
    id: "hacker",
    name: "HACKER",
    price: 800,
    unlockLevel: 5,
    category: "ball",
    sellaGradient: ["#00ff00", "#003300"],
    sellaGlow: "#00ff00",
    ballCore: "#aaffaa",
    ballTrail: "#00ff00",
  },
  {
    id: "bloodmoon",
    name: "BLOOD MOON",
    price: 1500,
    unlockLevel: 10,
    category: "ball",
    sellaGradient: ["#880000", "#330000"],
    sellaGlow: "#ff0000",
    ballCore: "#ff3333",
    ballTrail: "#880000",
  },
  {
    id: "glitch",
    name: "GLITCH",
    price: 2500,
    unlockLevel: 15,
    category: "ball",
    sellaGradient: ["#00ffff", "#ff00ff"],
    sellaGlow: "#ffffff",
    ballCore: "#ffffff",
    ballTrail: "#ff00ff",
  },
  {
    id: "supreme",
    name: "SUPREME CYBERPUNK",
    price: 5000,
    unlockLevel: 20,
    category: "ball",
    sellaGradient: ["#ff0000", "#0000ff"],
    sellaGlow: "#ffff00",
    ballCore: "#ffffff",
    ballTrail: "#00ffff",
  },
];

export const THEMES_CATALOG = [
  { id: "base", name: "BASE", price: 0 },
  { id: "synthwave", name: "SYNTHWAVE", price: 1200 },
  { id: "city", name: "DISTOPÍA", price: 2000 }
];

export const PARTICLES_CATALOG = [
  { id: "rect", name: "PÍXELES", price: 0 },
  { id: "star", name: "ESTRELLAS", price: 900 },
  { id: "poly", name: "POLÍGONOS", price: 1500 }
];

const _skinMap = new Map(SKINS_CATALOG.map((s) => [s.id, s]));
const _themeMap = new Map(THEMES_CATALOG.map((t) => [t.id, t]));
const _particleMap = new Map(PARTICLES_CATALOG.map((p) => [p.id, p]));

export function getSkinById(id) {
  return _skinMap.get(id) || SKINS_CATALOG[0];
}

const generateLevels = (count) => {
  const NAMES = {
    1: "Primer Disparo",
    2: "Calentando Motores",
    3: "Zona de Pruebas",
    4: "Inicio del Caos",
    5: "Rompiendo el Hielo",
    6: "Campo Abierto",
    7: "Diamante en Bruto",
    8: "Haz lo que Puedas",
    9: "Presión Inicial",
    10: "Muro Doble",
    11: "Ascenso",
    12: "Pirámide de Poder",
    13: "Capas de Cristal",
    14: "Torre de Babel",
    15: "Lluvia de Fuego",
    16: "Muralla China",
    17: "Fortaleza",
    18: "Sin Piedad",
    19: "Bunker",
    20: "El Centinela",
    21: "Tablero Roto",
    22: "Ajedrez Mortal",
    23: "64 Cuadros",
    24: "Jaque Mate",
    25: "El Gran Tablero",
    26: "Camino Torcido",
    27: "Zigzag Eléctrico",
    28: "Sin Línea Recta",
    29: "Danza de Bloques",
    30: "Caos Ordenado",
    31: "La Cruz Negra",
    32: "Punto de No Retorno",
    33: "El Crucifijo",
    34: "Eje del Mal",
    35: "Cruce de Fuego",
    36: "Anillo Interno",
    37: "Espiral Sin Fin",
    38: "Ojo del Tifón",
    39: "Núcleo Duro",
    40: "El Núcleo",
    41: "Ondas de Choque",
    42: "Frecuencia Máxima",
    43: "Resonancia",
    44: "Código Roto",
    45: "Sistema en Caída",
    46: "Punto Final",
    47: "No Hay Escapatoria",
    48: "El Apocalipsis",
    49: "Último Bastión",
    50: "CYBER DIOS",
  };
  const ERAS = [
    { min: 1, max: 10, rows: [3, 4], maxHp: 1, holePct: 0.0 },
    { min: 11, max: 20, rows: [4, 5], maxHp: 2, holePct: 0.05 },
    { min: 21, max: 30, rows: [5, 6], maxHp: 3, holePct: 0.1 },
    { min: 31, max: 40, rows: [6, 7], maxHp: 4, holePct: 0.15 },
    { min: 41, max: 50, rows: [7, 8], maxHp: 5, holePct: 0.2 },
  ];
  const PATTERNS = [
    (r, c, rows, cols) => (r % 2 === 0 ? 1 : 2),
    (r, c, rows, cols) =>
      r > 0 && r < rows - 1 && c > 1 && c < cols - 2 ? 2 : 1,
    (r, c, rows, cols) => Math.min(r + 1, 3),
    (r, c, rows, cols) => {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) return 2;
      if (r === Math.floor(rows / 2)) return 0;
      return 1;
    },
    (r, c, rows, cols) => ((r + c) % 2 === 0 ? 3 : 1),
    (r, c, rows, cols) => (c % 2 === r % 2 ? 3 : 1),
    (r, c, rows, cols) => {
      const midR = Math.floor(rows / 2),
        midC = Math.floor(cols / 2);
      if (r === midR || c === midC) return 4;
      if ((r === 0 || r === rows - 1) && (c === 0 || c === cols - 1)) return 0;
      return 2;
    },
    (r, c, rows, cols) => {
      const ring = Math.min(r, c, rows - 1 - r, cols - 1 - c);
      return Math.min(ring + 2, 5);
    },
    (r, c, rows, cols, i) =>
      Math.min(
        Math.max(
          1,
          Math.round((Math.sin(r * 1.2) + Math.cos(c * 0.9) + 2) * 1.5),
        ),
        5,
      ),
    (r, c, rows, cols) => {
      const midC = Math.floor(cols / 2);
      let hp = Math.max(1, 5 - Math.abs(c - midC));
      if (r < 2) hp += 2;
      return Math.min(hp, 5);
    },
  ];
  const cols = 10;
  const levels = [];

  for (let i = 0; i < count; i++) {
    const levelNum = i + 1;
    const era = ERAS.find((e) => levelNum >= e.min && levelNum <= e.max);
    const patIdx = Math.floor(i / 5);
    const pattern = PATTERNS[Math.min(patIdx, PATTERNS.length - 1)];
    const posInEra = (levelNum - era.min) / (era.max - era.min || 1);
    let rows =
      era.rows[0] + Math.round(posInEra * (era.rows[1] - era.rows[0]));
    const layout = [];

    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        let hp = pattern(r, c, rows, cols, i);
        hp = Math.min(hp, era.maxHp);
        hp = Math.max(0, hp);
        
        if (hp > 0) {
          hp += Math.floor((levelNum - 1) / 4); // +1 HP cada 4 niveles
        }

        if (levelNum >= 31 && (r === 2 || r === rows - 3) && c % 3 === 0)
          hp = -1;
        if (era.holePct > 0 && r > 0 && r < rows - 1) {
          if ((r * 7 + c * 13 + i * 17) % 100 < era.holePct * 100) hp = 0;
        }
        row.push(hp);
      }
      layout.push(row);
    }
    levels.push({
      id: levelNum,
      name: NAMES[levelNum] || `Nivel ${levelNum}`,
      intro: NAMES[levelNum] || `Nivel ${levelNum}`,
      layout,
      difficulty: i / (count - 1),
      baseScore: 100 + Math.floor((i / (count - 1)) * 500),
    });
  }
  return levels;
};

export const LEVELS = generateLevels(50);

export function loadUser(username, difficulty = "NORMAL") {
  const users = JSON.parse(
    safeLocalStorage("get", "arkanoid_users_50") || "{}",
  );
  if (users[username]) {
    let u = users[username];
    if (!u.ownedThemes) {
      u.ownedThemes = ["base"];
      u.equippedTheme = "base";
    }
    if (!u.ownedParticles) {
      u.ownedParticles = ["rect"];
      u.equippedParticle = "rect";
    }
    return {
      ...u,
      username,
      isNew: false,
      difficulty: u.difficulty || "NORMAL",
    };
  }
  const newUser = {
    points: 0,
    ownedSkins: ["neon", "chrome"],
    equippedSkin: "neon",
    equippedSellaSkin: "chrome",
    ownedThemes: ["base"],
    equippedTheme: "base",
    ownedParticles: ["rect"],
    equippedParticle: "rect",
    maxLevelReached: 1,
    totalGamesPlayed: 0,
    lives: BALANCE.MAX_LIVES,
    difficulty,
  };
  users[username] = newUser;
  safeLocalStorage("set", "arkanoid_users_50", JSON.stringify(users));
  return { ...newUser, username, isNew: true };
}

export function purchaseSkin(username, userData, skinId) {
  const skin = SKINS_CATALOG.find((s) => s.id === skinId);
  if (!skin) return { success: false, reason: "Skin no existe" };
  if (userData.ownedSkins.includes(skinId))
    return { success: false, reason: "Ya posees esta skin" };
  if (skin.unlockLevel && (userData.maxLevelReached || 1) < skin.unlockLevel)
    return { success: false, reason: `Requiere Nivel ${skin.unlockLevel}` };
  if (userData.points < skin.price)
    return { success: false, reason: "Puntos insuficientes" };
  userData.points -= skin.price;
  userData.ownedSkins.push(skinId);
  saveUserImmediate(username, userData);
  return { success: true };
}

export function equipSkin(username, userData, skinId) {
  if (!userData.ownedSkins.includes(skinId))
    return { success: false, reason: "No posees esta skin" };
  userData.equippedSkin = skinId;
  saveUserImmediate(username, userData);
  return { success: true, userData };
}

export function equipSellaSkin(username, userData, skinId) {
  if (!userData.ownedSkins.includes(skinId))
    return { success: false, reason: "No posees esta skin" };
  userData.equippedSellaSkin = skinId;
  saveUserImmediate(username, userData);
  return { success: true };
}

export function purchaseTheme(username, userData, themeId) {
  const t = THEMES_CATALOG.find((s) => s.id === themeId);
  if (!t) return { success: false, reason: "Entorno no existe" };
  if (userData.ownedThemes.includes(themeId)) return { success: false, reason: "Ya lo posees" };
  if (userData.points < t.price) return { success: false, reason: "Puntos insuficientes" };
  userData.points -= t.price;
  userData.ownedThemes.push(themeId);
  saveUserImmediate(username, userData);
  return { success: true };
}

export function equipTheme(username, userData, themeId) {
  if (!userData.ownedThemes.includes(themeId)) return { success: false, reason: "No lo posees" };
  userData.equippedTheme = themeId;
  saveUserImmediate(username, userData);
  return { success: true };
}

export function purchaseParticle(username, userData, particleId) {
  const p = PARTICLES_CATALOG.find((s) => s.id === particleId);
  if (!p) return { success: false, reason: "Partícula no existe" };
  if (userData.ownedParticles.includes(particleId)) return { success: false, reason: "Ya lo posees" };
  if (userData.points < p.price) return { success: false, reason: "Puntos insuficientes" };
  userData.points -= p.price;
  userData.ownedParticles.push(particleId);
  saveUserImmediate(username, userData);
  return { success: true };
}

export function equipParticle(username, userData, particleId) {
  if (!userData.ownedParticles.includes(particleId)) return { success: false, reason: "No lo posees" };
  userData.equippedParticle = particleId;
  saveUserImmediate(username, userData);
  return { success: true, userData };
}

export function addPoints(_, userData, points) {
  userData.points = Math.round(userData.points + points);
  return userData;
}

export function updateMaxLevel(username, userData, level) {
  if (level > userData.maxLevelReached) {
    userData.maxLevelReached = level;
    saveUserImmediate(username, userData);
  }
  return userData;
}

export function saveGameScore(username, score, level) {
  let scores = JSON.parse(
    safeLocalStorage("get", "arkanoid_scores_50") || "[]",
  );
  const existing = scores.findIndex((s) => s.name === username);
  if (existing !== -1) {
    if (score > scores[existing].score)
      scores[existing] = { name: username, score, level, date: Date.now() };
  } else {
    scores.push({ name: username, score, level, date: Date.now() });
  }
  scores.sort((a, b) => b.score - a.score);
  safeLocalStorage(
    "set",
    "arkanoid_scores_50",
    JSON.stringify(scores.slice(0, 10)),
  );
}

export function loadLeaderboard() {
  return JSON.parse(safeLocalStorage("get", "arkanoid_scores_50") || "[]");
}

let pendingSaveTimeout = null;

export function scheduleSave(username, userData) {
  if (pendingSaveTimeout) clearTimeout(pendingSaveTimeout);
  pendingSaveTimeout = setTimeout(() => {
    saveUserImmediate(username, userData);
    pendingSaveTimeout = null;
  }, 500);
}

export function saveUserImmediate(username, userData) {
  const users = JSON.parse(
    safeLocalStorage("get", "arkanoid_users_50") || "{}",
  );
  users[username] = {
    points: userData.points,
    ownedSkins: userData.ownedSkins,
    equippedSkin: userData.equippedSkin,
    equippedSellaSkin: userData.equippedSellaSkin || "chrome",
    maxLevelReached: userData.maxLevelReached,
    totalGamesPlayed: userData.totalGamesPlayed,
    difficulty: userData.difficulty || "NORMAL",
  };
  safeLocalStorage("set", "arkanoid_users_50", JSON.stringify(users));
}

const syncChannel = new BroadcastChannel('arkanoid_sync');
export function initCrossTabSync(onConflictCallback) {
  syncChannel.postMessage({ type: 'PING', id: Date.now() });
  syncChannel.onmessage = (event) => {
    if (event.data.type === 'PING') {
      syncChannel.postMessage({ type: 'PONG', id: Date.now() });
    } else if (event.data.type === 'PONG') {
      if (onConflictCallback) onConflictCallback();
    }
  };
}

export function broadcastTabActive() {
    syncChannel.postMessage({ type: 'PING', id: Date.now() });
}
