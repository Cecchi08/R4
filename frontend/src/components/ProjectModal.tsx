// Presenta los detalles de un proyecto y cierra el diálogo con Escape o el fondo.
import { useEffect } from 'react';
import type { Project } from '../types';

interface Props {
  project: Project;
  onClose: () => void;
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

export function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <div style={{ marginBottom: 16 }}>
          {project.category && (
            <span className="badge" style={{ marginBottom: 8 }}>{project.category}</span>
          )}
          <h2 style={{ fontSize: 24, marginBottom: 4 }}>{project.name}</h2>
          {project.project_date && (
            <p className="mono muted" style={{ fontSize: 12 }}>
              {formatDate(project.project_date)}
            </p>
          )}
        </div>

        {project.image_url && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
            <img
              src={project.image_url}
              alt={project.name}
              style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {project.short_description && (
          <p style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>
            {project.short_description}
          </p>
        )}

        {project.full_description && (
          <p className="muted" style={{ lineHeight: 1.7, marginBottom: 16 }}>
            {project.full_description}
          </p>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="mono muted" style={{ fontSize: 12, marginBottom: 8 }}>TECNOLOGÍAS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[...new Set(project.technologies)].map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          </div>
        )}

        {(project.demo_url || project.repo_url) && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border-2)' }}>
            {project.demo_url && (
              <a
                className="btn"
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Demo
              </a>
            )}
            {project.repo_url && (
              <a
                className="btn btn-ghost"
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ⌘ Repositorio
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectModal;
