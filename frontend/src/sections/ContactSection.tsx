// Carga y presenta Contact con estados de espera, error y contenido vacío.
import { useCallback, useEffect, useState } from 'react';
import { getContact } from '../services/contact';
import type { Contact } from '../types';

// Publica los datos de PostgreSQL y admite estados de carga, error y tabla vacía.
export default function ContactSection({ onBack }: { onBack: () => void }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retry = useCallback(async () => {
    setLoading(true); setError(null);
    try { setContact(await getContact()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar contacto'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    getContact().then(data => { if (active) setContact(data); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar contacto'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const contacts = contact ? [
    { label: 'Email', icon: '@', value: contact.email, href: 'mailto:' + contact.email },
    { label: 'Teléfono', icon: 'TEL', value: contact.phone, href: 'tel:' + contact.phone },
    { label: 'GitHub', icon: 'GH', value: contact.github_url, href: contact.github_url },
    { label: 'LinkedIn', icon: 'IN', value: contact.linkedin_url, href: contact.linkedin_url },
  ] : [];
  return <section className="section-wrap">
    <button className="btn btn-ghost back-btn mono" onClick={onBack}>← TERMINAL</button>
    <h2 className="section-title">CONTACTO</h2>
    {loading && <div className="state-box"><div className="spinner" />Cargando contacto...</div>}
    {error && <div className="state-box"><p className="err" role="alert">{error}</p><button className="btn" onClick={retry}>Reintentar</button></div>}
    {!loading && !error && !contact && <p className="state-box muted">No hay datos de contacto publicados.</p>}
    {!loading && !error && contact && <div className="panel ani-fade"><div className="contact-list">
      {contacts.map(item => <a key={item.label} className="contact-item" href={/^(https?:|mailto:|tel:)/i.test(item.href) ? item.href : undefined}
        target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
        <span className="contact-icon">{item.icon}</span><div style={{ minWidth: 0 }}><div className="mono muted">{item.label}</div><div style={{ overflowWrap: 'anywhere' }}>{item.value}</div></div>
      </a>)}
    </div></div>}
  </section>;
}
