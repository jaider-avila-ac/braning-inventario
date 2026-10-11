const PREFIX = "cache:";

export function getCached(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // Ignorar si el storage está lleno
  }
}

export function clearAllPageCache() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
