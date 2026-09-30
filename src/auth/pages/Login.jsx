import { useState } from 'react';
import './auth.css';

const DEFAULT_USERS = [
  { name: 'Demo User', email: 'user@skillnova.com', password: 'password123', role: 'user' },
  { name: 'Demo Admin', email: 'admin@skillnova.com', password: 'password123', role: 'admin' },
];

const getStoredUsers = () => {
  const stored = localStorage.getItem('mockUsers');
  if (!stored) {
    localStorage.setItem('mockUsers', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('mockUsers', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const merged = [...parsed];
    for (const def of DEFAULT_USERS) {
      if (!merged.some((u) => u.email === def.email && u.role === def.role)) {
        merged.push(def);
      }
    }
    localStorage.setItem('mockUsers', JSON.stringify(merged));
    return merged;
  } catch {
    localStorage.setItem('mockUsers', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
};

const Login = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fillDemoCredentials = (demoRole) => {
    const demo = DEFAULT_USERS.find((u) => u.role === demoRole);
    if (demo) {
      setRole(demo.role);
      setEmail(demo.email);
      setPassword(demo.password);
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};

    if (isRegistering && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const storedUsers = getStoredUsers();

      if (isRegistering) {
        if (storedUsers.some((u) => u.email === email)) {
          setErrors({ form: 'An account with this email already exists' });
          setIsLoading(false);
          return;
        }

        // Save new user
        const newUser = { name, email, password, role };
        localStorage.setItem('mockUsers', JSON.stringify([...storedUsers, newUser]));
        localStorage.setItem("user", JSON.stringify({ email: email, role: newUser.role }));

        setIsLoading(false);
        onLoginSuccess(role, email, name);
      } else {
        const mockUser = storedUsers.find(
          (u) => u.email === email && u.password === password && u.role === role
        );

        if (mockUser) {
          localStorage.setItem("user", JSON.stringify({ email: email, role: mockUser.role }));
          setIsLoading(false);
          onLoginSuccess(mockUser.role, mockUser.email, mockUser.name);
        } else {
          setIsLoading(false);
          setErrors({ form: 'Invalid credentials or role mismatch' });
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrors({ form: 'An error occurred during authentication' });
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isRegistering ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="auth-subtitle">
          {isRegistering
            ? 'Sign up to get started with SkillNova.'
            : 'Sign in to your SkillNova account to continue.'}
        </p>

        {!isRegistering && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '8px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Demo Credentials (Click to fill)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoCredentials('user')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: role === 'user' ? 'rgba(0, 190, 163, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${role === 'user' ? '#00bea3' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  color: role === 'user' ? '#5eead4' : '#e5e7eb',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                👤 User
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: role === 'admin' ? 'rgba(255, 109, 52, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${role === 'admin' ? '#ff6d34' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  color: role === 'admin' ? '#fdba74' : '#e5e7eb',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label className="auth-label">Select Role</label>
            <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#d1d5db' }}>
                <input
                  type="radio"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  style={{ accentColor: '#ff6d34' }}
                />
                User
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#d1d5db' }}>
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  style={{ accentColor: '#ff6d34' }}
                />
                Admin
              </label>
            </div>
          </div>

          {isRegistering && (
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              {errors.name && <span className="auth-error">{errors.name}</span>}
            </div>
          )}

          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          {errors.form && (
            <div className="auth-form-group">
              <span className="auth-error" style={{ textAlign: 'center', display: 'block' }}>
                {errors.form}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading
              ? (isRegistering ? 'Signing Up...' : 'Signing In...')
              : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "14px", color: "#9ca3af", marginTop: "24px" }}>
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={isLoading ? undefined : toggleMode}
            style={{
              color: "#ff6d34",
              cursor: isLoading ? "default" : "pointer",
              fontWeight: "600",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isRegistering ? 'Sign in' : 'Sign up'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
