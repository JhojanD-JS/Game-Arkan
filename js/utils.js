export function safeLocalStorage(action, key, value) {
  try {
    if (action === "get") return localStorage.getItem(key);
    else if (action === "set") {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (e) {
    console.warn("localStorage error:", e);
    return action === "get" ? null : false;
  }
  return null;
}

export function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  return {
    r: parseInt(h[0] + h[1], 16),
    g: parseInt(h[2] + h[3], 16),
    b: parseInt(h[4] + h[5], 16),
  };
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let _notifEl = null;

export function showPowerupNotification(msg) {
  if (!_notifEl) _notifEl = document.getElementById("powerupNotification");
  if (!_notifEl) return;
  if (window.notifTimeout) clearTimeout(window.notifTimeout);
  _notifEl.textContent = msg;
  _notifEl.classList.add("show");
  window.notifTimeout = setTimeout(
    () => _notifEl.classList.remove("show"),
    3000,
  );
}
