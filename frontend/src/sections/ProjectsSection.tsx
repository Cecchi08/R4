// Carga y presenta Projects con estados de espera, error y contenido vacío.
import { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { ProjectModal } from '../components/ProjectModal';
import type { Project } from '../types';

interface Props {
  onBack: () => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ProjectsSection({ onBack }: Props) {
  const { projects, loading, error, filterCategory, setFilterCategory, refresh } = useProjects();
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects?.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (filterCategory === 'all') return projects;
    return projects.filter((p) => p.category === filterCategory);
  }, [projects, filterCategory]);

  return (
    <section className="section-wrap materialize">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">PROYECTOS</h2>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Cargando proyectos...</span>
        </div>
      )}

      {error && (
        <div className="state-box">
          <p className="err mono">Error: {error}</p>
          <button className="btn" onClick={refresh} style={{ marginTop: 12 }}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && projects && projects.length === 0 && (
        <div className="state-box muted">No hay proyectos registrados.</div>
      )}

      {!loading && !error && projects && projects.length > 0 && (
        <>
          <div className="filter-row">
            <button
              className={`chip ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              TODOS
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="state-box muted">No hay proyectos en esta categoría.</div>
          ) : (
            <div className="grid-3">
              {filtered.map((p, index) => (
                <div
                  key={p.project_id}
                  className="card ani-fade"
                  style={{ animationDelay: `${index * 60}ms`, cursor: 'pointer' }}
                  onClick={() => setModalProject(p)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    {p.category && <span className="badge">{p.category}</span>}
                    {p.project_date && (
                      <span className="mono muted" style={{ fontSize: 11 }}>
                        {formatDate(p.project_date)}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>{p.name}</h3>
                  {p.short_description && (
                    <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
                      {p.short_description}
                    </p>
                  )}
                  {p.technologies && p.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {[...new Set(p.technologies.slice(0, 4))].map((t) => (
                        <span key={t} className="badge" style={{ fontSize: 10 }}>{t}</span>
                      ))}
                      {p.technologies.length > 4 && (
                        <span className="badge" style={{ fontSize: 10 }}>+{p.technologies.length - 4}</span>
                      )}
                    </div>
                  )}
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                    Ver detalles →
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modalProject && (
        <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
      )}
    </section>
  );
}

export default ProjectsSection;
