// Carga y presenta Education con estados de espera, error y contenido vacío.
import { useEffect, useState, useCallback } from 'react';
import { getEducation } from '../services/education';
import type { Education } from '../types';
export default function EducationSection({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await getEducation()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar datos'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getEducation().then(data => { if (active) { setItems(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section className="section-wrap ani-fade">
    <button className="btn btn-ghost back-btn mono" onClick={onBack}>← TERMINAL</button>
    <h2 className="section-title">EDUCACIÓN</h2>
    {loading && <div className="state-box">Cargando...</div>}
    {error && <div className="state-box"><p role="alert" className="err">{error}</p><button className="btn" onClick={load}>Reintentar</button></div>}
    {!loading && !error && <div className="grid-3">{items.map(item => <article className="panel" key={item.education_id}><h3>{item.title}</h3><p>{item.institution}</p><p className="muted">{item.start_year} — {item.end_year ?? "Actualidad"}</p><span className="badge">{item.status}</span></article>)}</div>}
    {!loading && !error && items.length === 0 && <p className="state-box muted">No hay registros.</p>}
  </section>;
}
