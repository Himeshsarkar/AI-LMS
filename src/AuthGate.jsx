// src/AuthGate.jsx
import { useState } from 'react';
import UserApp  from "./user/App";
import AdminApp from "./admin/App";
import Login from "./auth/pages/Login";
import useAuth from "./shared/hooks/useAuth";

const AuthGate = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  
  const [authStep, setAuthStep] = useState(isLoggedIn ? 'AUTHENTICATED' : 'LOGIN');

  const handleLoginSuccess = (userRole, email, name = null) => {
    const didLogin = login({ role: userRole, email, name });
    if (didLogin) {
      setAuthStep("AUTHENTICATED");
    }
  };

  const handleLogout = () => {
    logout();
    setAuthStep("LOGIN");
  };

  if (authStep === 'LOGIN') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (authStep === 'AUTHENTICATED' || isLoggedIn) {
    if (user?.role === "admin") return <AdminApp onLogout={handleLogout} />;
    return <UserApp onLogout={handleLogout} />;
  }

  return null;
};

export default AuthGate;