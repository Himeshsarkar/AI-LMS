import { createContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "skillnova.auth";
const VALID_ROLES = new Set(["admin", "user"]);

const defaultAuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
};

const AuthContext = createContext(null);

const parseStoredAuthState = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return defaultAuthState;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return defaultAuthState;
    }

    const isLoggedIn = parsed.isLoggedIn === true;
    const token = typeof parsed.token === "string" && parsed.token.trim() ? parsed.token : null;

    const user =
      parsed.user &&
      typeof parsed.user === "object" &&
      typeof parsed.user.email === "string" &&
      VALID_ROLES.has(parsed.user.role)
        ? {
            role: parsed.user.role,
            email: parsed.user.email,
            name: typeof parsed.user.name === "string" ? parsed.user.name : null,
          }
        : null;

    if (isLoggedIn && user && token) {
      return { isLoggedIn: true, user, token };
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    return defaultAuthState;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return defaultAuthState;
  }
};

const buildMockToken = (role, email) => {
  const payload = `${role}:${email}:${Date.now()}`;
  return window.btoa(payload);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(parseStoredAuthState);

  useEffect(() => {
    if (auth.isLoggedIn && auth.user && auth.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const login = ({ role, email, name = null, token }) => {
    if (!VALID_ROLES.has(role) || typeof email !== "string" || !email.trim()) {
      return false;
    }

    setAuth({
      isLoggedIn: true,
      user: { role, email, name },
      token: typeof token === "string" && token.trim() ? token : buildMockToken(role, email),
    });

    return true;
  };

  const logout = () => {
    setAuth(defaultAuthState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      logout,
      isAdmin: auth.user?.role === "admin",
      isUser: auth.user?.role === "user",
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
