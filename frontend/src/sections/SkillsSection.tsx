// Carga y presenta Skills con estados de espera, error y contenido vacío.
import { useState, useEffect } from 'react';
import { getSkills } from '../services/skills';
import type { Skill } from '../types';

interface Props {
  onBack: () => void;
}

export function SkillsSection({ onBack }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar habilidades');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getSkills().then(data => { if (active) { setSkills(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const grouped: Record<string, Skill[]> = {};
  skills.forEach((s) => {
    const cat = s.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  return (
    <section className="section-wrap">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">HABILIDADES</h2>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Cargando habilidades...</span>
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

      {!loading && !error && skills.length === 0 && (
        <div className="state-box muted">No hay habilidades registradas.</div>
      )}

      {!loading && !error && skills.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="ani-fade">
              <h3
                className="mono accent"
                style={{ fontSize: 14, marginBottom: 10, textTransform: 'uppercase' }}
              >
                {category}
              </h3>
              <div className="grid-2">
                {list.map((skill, index) => (
                  <div
                    key={skill.skill_id}
                    className="card ani-fade"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{skill.name}</span>
                      <span className="badge">{category}</span>
                    </div>
                    {skill.description && (
                      <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
                        {skill.description}
                      </p>
                    )}
                    <div className="skill-bar">
                      <span
                        style={{
                          width: `${Math.min(100, Math.max(0, skill.level))}%`,
                          animationDelay: `${index * 70 + 150}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SkillsSection;
