// Presenta comentarios públicos y permite publicar mensajes con validación.
import { useState, useEffect, useRef } from 'react';
import { useComments } from '../hooks/useComments';

interface Props {
  onBack: () => void;
}

type FetchPhase = 'connecting' | 'fetching' | 'processing' | 'done' | 'error';

const PHASE_LOGS: Record<FetchPhase, string> = {
  connecting: '[DB] Conectando a guestbook.db ...',
  fetching: '[DB] SELECT * FROM comments ORDER BY created_at DESC',
  processing: '[DB] Procesando filas y sanitizando datos...',
  done: '[DB] OK - Lista actualizada.',
  error: '[DB] ERROR - Fallo al recuperar datos.',
};

const PHASE_ORDER: FetchPhase[] = ['connecting', 'fetching', 'processing', 'done'];

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function GuestbookSection({ onBack }: Props) {
  const {
    comments,
    loading,
    submitting,
    error,
    submitError,
    formErrors,
    refresh,
    submit,
  } = useComments();

  const [fetchPhase, setFetchPhase] = useState<FetchPhase>('connecting');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    timersRef.current = [];

    PHASE_ORDER.forEach((phase, idx) => {
      const t1 = window.setTimeout(() => {
        setFetchPhase(phase);
        setLogLines((prev) => [...prev, PHASE_LOGS[phase]]);
      }, 300 * idx);
      timersRef.current.push(t1);

      const progressTarget = ((idx + 1) / PHASE_ORDER.length) * 100;
      const t2 = window.setTimeout(() => {
        setProgress(progressTarget);
      }, 300 * idx + 150);
      timersRef.current.push(t2);
    });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit({ name: name.trim(), message: message.trim() });
    if (ok) {
      setName('');
      setMessage('');
      void refresh();
    }
  };

  const showSequence = !error && fetchPhase !== 'done';

  return (
    <section className="section-wrap">
      <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
        ← TERMINAL
      </button>
      <h2 className="section-title">LIBRO DE VISITAS</h2>

      {showSequence && (
        <div className="panel ani-fade" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          <div style={{ marginBottom: 10 }} className="muted">
            guestbook://init
          </div>
          {logLines.map((line, i) => (
            <div
              key={i}
              className="log-line"
              style={{
                marginBottom: 4,
                animationDelay: `${i * 120}ms`,
                color: line.includes('ERROR') ? 'var(--error)' : line.includes('OK') ? 'var(--success)' : 'var(--fg)',
              }}
            >
              {line}
            </div>
          ))}
          <div className="progress-bar" style={{ opacity: 0.8 }}>
            <div style={{ width: `${progress}%`, transition: 'width .25s ease' }} />
          </div>
        </div>
      )}

      {fetchPhase === 'error' && (
        <div className="state-box">
          <p className="err mono">Error al conectar con la base de datos.</p>
          <button className="btn" onClick={refresh} style={{ marginTop: 12 }}>
            Reintentar conexión
          </button>
        </div>
      )}

      {fetchPhase === 'done' && (
        <div className="ani-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="panel">
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, marginBottom: 14, color: 'var(--accent)' }}>
              ● DEJAR UN COMENTARIO
            </h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label htmlFor="gb-name">Nombre</label>
                <input
                  id="gb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  maxLength={50}
                  autoComplete="off"
                />
                {formErrors.name && (
                  <span className="form-error">{formErrors.name}</span>
                )}
              </div>
              <div className="form-row">
                <label htmlFor="gb-message">Mensaje</label>
                <textarea
                  id="gb-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  maxLength={1000}
                />
                {formErrors.message && (
                  <span className="form-error">{formErrors.message}</span>
                )}
              </div>
              {submitError && (
                <p className="form-error" style={{ marginBottom: 10 }}>
                  {submitError}
                </p>
              )}
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} />
                    Enviando...
                  </>
                ) : (
                  '⇪ Enviar comentario'
                )}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, marginBottom: 14, color: 'var(--accent-2)' }}>
              ● COMENTARIOS ({comments ? comments.length : 0})
            </h3>

            {loading && (
              <div className="state-box">
                <div className="spinner" />
                <span className="mono">Cargando comentarios...</span>
              </div>
            )}

            {!loading && comments && comments.length === 0 && (
              <div className="state-box muted">
                No hay comentarios aún. ¡Sé el primero en dejar uno!
              </div>
            )}

            {!loading && comments && comments.length > 0 && (
              <div>
                {comments.map((c, idx) => (
                  <div
                    key={c.comment_id}
                    className="comment ani-fade"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="comment-head">
                      <span className="comment-name">{c.name}</span>
                      <span className="comment-date">{formatDate(c.created_at)}</span>
                    </div>
                    <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default GuestbookSection;
