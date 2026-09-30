// ══════════════════════════════════════════════
//  SKILLNOVA — Environment & API Configuration
// ══════════════════════════════════════════════
// Centralised access to all VITE_ environment variables.
// Usage:  import { API_BASE_URL, apiUrl } from "@/shared/config/env";

// ── Raw env values (with sensible defaults) ─
export const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL  || "http://localhost:5000/api";
export const API_TIMEOUT   = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;
export const APP_NAME      = import.meta.env.VITE_APP_NAME      || "SkillNova";
export const APP_VERSION   = import.meta.env.VITE_APP_VERSION   || "1.0.0";
export const USE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === "true";

// ── Helpers ─────────────────────────────────

/**
 * Build a full API URL from a relative path.
 *
 * @param {string} path  – e.g. "/auth/login"
 * @returns {string}     – e.g. "http://localhost:5000/api/auth/login"
 *
 * @example
 *   const url = apiUrl("/auth/login");
 *   fetch(url, { method: "POST", body: JSON.stringify(payload) });
 */
export const apiUrl = (path) => {
  const base = API_BASE_URL.replace(/\/+$/, "");   // strip trailing slashes
  const route = path.startsWith("/") ? path : `/${path}`;
  return `${base}${route}`;
};

/**
 * Pre-configured fetch wrapper with timeout, JSON defaults, and auth token.
 *
 * @param {string}       path     – relative API path, e.g. "/users"
 * @param {RequestInit}  [options]  – standard fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 *
 * @example
 *   const res  = await apiFetch("/users");
 *   const data = await res.json();
 *
 * @example
 *   const res = await apiFetch("/auth/login", {
 *     method: "POST",
 *     body: JSON.stringify({ email, password }),
 *   });
 */
export const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API_TIMEOUT);

  // Retrieve token from localStorage (matches AuthContext key)
  const storedAuth = localStorage.getItem("skillnova.auth");
  let token = null;
  try {
    const parsed = JSON.parse(storedAuth);
    token = parsed?.token || null;
  } catch {
    // no stored auth — that's fine
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};
