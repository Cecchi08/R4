// Carga y presenta Achievements con estados de espera, error y contenido vacío.
import { useState, useEffect, useRef } from 'react';
import { getAchievements } from '../services/achievements';
import type { Achievement } from '../types';

interface Props {
  onBack: () => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    const stepMs = duration / steps;
    let current = 0;

    intervalRef.current = window.setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepMs);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [value]);

  return <span className="counter-val">{display.toLocaleString('es-AR')}</span>;
}

export function AchievementsSection({ onBack }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Achievement[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAchievements();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logros');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAchievements().then(data => { if (active) { setItems(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section-wrap">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">LOGROS</h2>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Cargando logros...</span>
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

      {!loading && !error && items.length === 0 && (
        <div className="state-box muted">No hay logros registrados.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid-3">
          {items.map((a, index) => (
            <div
              key={a.achievement_id}
              className="card ani-fade"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 30 }}>{a.icon_or_image || '🏆'}</span>
                {a.category && <span className="badge">{a.category}</span>}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>{a.title}</h3>
              <p className="mono muted" style={{ fontSize: 12, marginBottom: 8 }}>
                {formatDate(a.date)}
              </p>
              {a.description && (
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 10 }}>
                  {a.description}
                </p>
              )}
              {a.metric_value !== null && a.metric_value !== undefined && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border-2)' }}>
                  <Counter value={a.metric_value} />
                  {a.metric_label && (
                    <span className="muted mono" style={{ fontSize: 12, marginLeft: 8 }}>
                      {a.metric_label}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AchievementsSection;
