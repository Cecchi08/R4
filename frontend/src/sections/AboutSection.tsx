// Carga y presenta About con estados de espera, error y contenido vacío.
import { useState, useEffect, useCallback } from 'react';
import { getAbout } from '../services/about';
import type { About } from '../types';

interface AboutSectionProps {
  onBack: () => void;
}

export default function AboutSection({ onBack }: AboutSectionProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<About | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const about = await getAbout();
      setData(about);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de About');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAbout().then(data => { if (active) { setData(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section-wrap ani-fade">
      <button
        type="button"
        className="btn btn-ghost back-btn mono"
        onClick={onBack}
        aria-label="Volver a terminal"
      >
        ← TERMINAL
      </button>
      <h2 className="section-title mono">SOBRE MÍ / ABOUT</h2>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Cargando about...</span>
        </div>
      )}

      {error && (
        <div className="state-box">
          <p className="err mono">Error: {error}</p>
          <button className="btn" onClick={fetchData} style={{ marginTop: 12 }}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="state-box muted">No hay datos de About registrados.</div>
      )}

      {!loading && !error && data && (
        <article
          className="panel ani-fade"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '';
          }}
          style={{ transition: 'border-color .25s ease' }}
        >
          <header style={{ marginBottom: 18 }}>
            <div
              className="mono muted"
              style={{ fontSize: 12, marginBottom: 6, letterSpacing: '.5px' }}
            >
              // profile.full_name
            </div>
            <h1
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                marginBottom: 4,
              }}
            >
              {data.full_name}
            </h1>
            {data.title && (
              <p
                style={{
                  fontSize: 17,
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-mono)',
                  opacity: 0.9,
                }}
              >
                {data.title}
              </p>
            )}
          </header>

          {data.profile && (
            <div style={{ marginBottom: 16 }}>
              <div className="mono accent" style={{ fontSize: 12, marginBottom: 6 }}>
                {'// profile'}
              </div>
              <p style={{ lineHeight: 1.7, fontSize: 15 }}>{data.profile}</p>
            </div>
          )}

          {data.description && (
            <div style={{ marginBottom: 16 }}>
              <div className="mono accent" style={{ fontSize: 12, marginBottom: 6 }}>
                {'// description'}
              </div>
              <p style={{ lineHeight: 1.7, fontSize: 15, color: 'var(--fg)', opacity: 0.92 }}>
                {data.description}
              </p>
            </div>
          )}

          {data.additional_interest && (
            <div
              style={{
                marginTop: 18,
                padding: '12px 14px',
                borderLeft: '3px solid var(--accent-2)',
                background: 'var(--bg)',
                borderRadius: '0 6px 6px 0',
              }}
            >
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', marginBottom: 4 }}>
                {'// additional_interest'}
              </div>
              <p style={{ lineHeight: 1.6, fontSize: 14, color: 'var(--muted)' }}>
                {data.additional_interest}
              </p>
            </div>
          )}

          {(['interests', 'objectives', 'technologies'] as const).map(field => data[field] && (
            <div key={field} style={{ marginTop: 16 }}><h3 className="accent mono">{field}</h3><p>{data[field]}</p></div>
          ))}
        </article>
      )}
    </section>
  );
}
