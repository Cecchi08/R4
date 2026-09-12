// Carga y presenta Experience con estados de espera, error y contenido vacío.
import { useState, useEffect } from 'react';
import { getExperience } from '../services/experience';
import type { Experience } from '../types';

interface Props {
  onBack: () => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Actualidad';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ExperienceSection({ onBack }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Experience[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExperience();
      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.start_date).getTime();
        const db = new Date(b.start_date).getTime();
        return db - da;
      });
      setItems(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar experiencia');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getExperience().then(data => { if (active) { setItems(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section-wrap">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">EXPERIENCIA</h2>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Cargando experiencia...</span>
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
        <div className="state-box muted">No hay experiencia registrada.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="timeline">
          {items.map((exp, index) => (
            <div
              key={exp.experience_id}
              className="tl-item ani-fade"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 17, marginBottom: 2 }}>{exp.position}</h3>
                  {exp.organization && (
                    <p className="accent" style={{ marginBottom: 4 }}>{exp.organization}</p>
                  )}
                </div>
                <span className="badge mono">
                  {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                </span>
              </div>
              {exp.description && (
                <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                  {exp.description}
                </p>
              )}
              {exp.technologies && exp.technologies.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {[...new Set(exp.technologies)].map((tech) => (
                    <span key={tech} className="badge">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ExperienceSection;
