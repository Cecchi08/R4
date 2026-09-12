// Solicita credenciales administrativas y muestra errores devueltos por el backend.
import { useState } from 'react';
import { useAuth } from '../hooks/authContext';
import AuthBootSequence from '../components/AuthBootSequence';

interface Props {
  onBack: () => void;
}

export default function AdminLoginSection({ onBack }: Props) {
  const { login } = useAuth();
  const [bootDone, setBootDone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const result = await login(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  };

  return (
    <section className="section-wrap">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">ACCESO ADMIN</h2>

      {!bootDone && (
        <AuthBootSequence
          lines={[
            '> Administrator access...',
            '> Verifying credentials...',
            '> Initializing secure session...',
          ]}
          onDone={() => setBootDone(true)}
        />
      )}

      {bootDone && (
        <div className="panel ani-fade auth-form-panel">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>
            <div className="form-row">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
            </div>

            {error && <p className="form-error" style={{ marginBottom: 10 }}>{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} />
                  Autenticando...
                </>
              ) : (
                '⇪ Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
