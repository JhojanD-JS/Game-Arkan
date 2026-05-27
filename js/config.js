export const TOTAL_LEVELS = 50;
export const BALANCE = {
  POWERUP_DROP_CHANCE: 0.22,
  SHIELD_USES: 8,
  MAGNET_DURATION: 6,
  X2_DURATION: 10,
  BOMB_TARGETS: 6,
  TRAIL_LENGTH: 7,
  EXTEND_TIMEOUT: 10,
  MAX_LIVES: 5,
};
export const ORIGINAL_BALANCE = { ...BALANCE };

export const SETTINGS = {
  worldW: 1280,
  worldH: 800,
  topHUD: 76,
  ballRadius: 9,
  sellaY: 730,
  sellaH: 18,
  sellaBaseW: 140,
  sellaMaxW: 240,
  sellaSpeed: 950,
  ballSpeed: 530,
  ballMaxSpeed: 820,
  laserDuration: 3,
  laserCooldown: 0.22,
  shakeDecay: 18,
  maxShake: 14,
};
export const ORIGINAL_SETTINGS = { ...SETTINGS };

export const POWERUP_COLORS = {
  EXTEND: "#00f5ff",
  MULTI: "#ff3df2",
  FIRE: "#ff8c42",
  SLOW: "#7CFF6B",
  SHIELD: "#4488ff",
  BOMB: "#ff2244",
  MAGNET: "#ffcc00",
  X2: "#ff66ff",
  LIFE: "#ff4466",
};

export const POWERUP_ICONS = {
  EXTEND: "⬅➡",
  MULTI: "🎱",
  FIRE: "🔥",
  SLOW: "🐢",
  SHIELD: "🛡",
  BOMB: "💣",
  MAGNET: "🧲",
  X2: "x2",
  LIFE: "❤️",
};
