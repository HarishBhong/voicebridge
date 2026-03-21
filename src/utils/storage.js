export const getStoredValue = (key, fallbackValue) => {
  if (typeof window === "undefined") return fallbackValue;

  const rawValue = window.localStorage.getItem(key);
  if (rawValue === null) return fallbackValue;

  try {
    return JSON.parse(rawValue);
  } catch {
    return rawValue;
  }
};

export const setStoredValue = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removeStoredValue = (key) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};
