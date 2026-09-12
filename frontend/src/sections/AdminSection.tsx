// Alterna entre acceso admin y gestión de contenidos según la sesión validada.
import AdminLoginSection from './AdminLoginSection';
import { useState } from 'react';
import { useAuth } from '../hooks/authContext';
import AuthBootSequence from '../components/AuthBootSequence';
import AdminEntityPanel, { type FieldDef } from '../components/AdminEntityPanel';
import type { AdminEntity } from '../services/admin';

interface Props {
  onBack: () => void;
}

type AdminTab = AdminEntity;

const TABS: { id: AdminTab; label: string; idField: string; fields: FieldDef[] }[] = [
  {
    id: 'about',
    label: 'ABOUT',
    idField: 'about_id',
    fields: [
      { key: 'full_name', label: 'Nombre completo', type: 'text', required: true },
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'interests', label: 'interests', type: 'textarea' },
      { key: 'objectives', label: 'objectives', type: 'textarea' },
      { key: 'profile', label: 'profile', type: 'textarea' },
      { key: 'technologies', label: 'technologies', type: 'textarea' },
      { key: 'additional_interest', label: 'additional_interest', type: 'textarea' },
    ],
  },
  {
    id: 'skills',
    label: 'SKILLS',
    idField: 'skill_id',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'category', label: 'Categoría', type: 'text', required: true },
      { key: 'level', label: 'Nivel (0-100)', type: 'number', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'sort_order', label: 'Orden', type: 'number' },
    ],
  },
  {
    id: 'experience',
    label: 'EXPERIENCE',
    idField: 'experience_id',
    fields: [
      { key: 'position', label: 'Puesto', type: 'text', required: true },
      { key: 'organization', label: 'Organización', type: 'text' },
      { key: 'start_date', label: 'Fecha inicio', type: 'date', required: true },
      { key: 'end_date', label: 'Fecha fin', type: 'date' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'technologies', label: 'Tecnologías', type: 'array' },
      { key: 'status', label: 'Estado', type: 'select', options: ["En vigencia","Finalizada","Pendiente"] },
      { key: 'sort_order', label: 'Orden', type: 'number' },
    ],
  },
  {
    id: 'achievements',
    label: 'ACHIEVEMENTS',
    idField: 'achievement_id',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'date', label: 'Fecha', type: 'date', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'category', label: 'Categoría', type: 'text' },
      { key: 'icon_or_image', label: 'Icono / Imagen', type: 'text' },
      { key: 'metric_value', label: 'Valor métrica', type: 'number' },
      { key: 'metric_label', label: 'Etiqueta métrica', type: 'text' },
    ],
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    idField: 'project_id',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'short_description', label: 'Descripción corta', type: 'text' },
      { key: 'full_description', label: 'Descripción completa', type: 'textarea' },
      { key: 'category', label: 'Categoría', type: 'text' },
      { key: 'technologies', label: 'Tecnologías', type: 'array' },
      { key: 'image_url', label: 'URL imagen', type: 'text' },
      { key: 'demo_url', label: 'URL demo', type: 'text' },
      { key: 'repo_url', label: 'URL repo', type: 'text' },
      { key: 'project_date', label: 'Fecha proyecto', type: 'date' },
      { key: 'status', label: 'Estado', type: 'select', options: ["Terminado","En desarrollo","Pendiente"] },
      { key: 'sort_order', label: 'Orden', type: 'number' },
    ],
  },
  {
    id: 'comments',
    label: 'COMMENTS',
    idField: 'comment_id',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'message', label: 'Mensaje', type: 'textarea', required: true },
    ],
  },
  {
    "id": "education",
    "label": "EDUCATION",
    "idField": "education_id",
    "fields": [
      {
        "key": "institution",
        "label": "Institución",
        "type": "text",
        "required": true
      },
      {
        "key": "title",
        "label": "Título",
        "type": "text",
        "required": true
      },
      {
        "key": "start_year",
        "label": "Año inicial",
        "type": "number",
        "required": true
      },
      {
        "key": "end_year",
        "label": "Año final",
        "type": "number"
      },
      {
        "key": "status",
        "label": "Estado",
        "type": "select",
        "options": [
          "En curso",
          "Finalizado",
          "Pendiente"
        ]
      }
    ]
  },
  {
    "id": "languages",
    "label": "LANGUAGES",
    "idField": "language_id",
    "fields": [
      {
        "key": "name",
        "label": "Idioma",
        "type": "text",
        "required": true
      },
      {
        "key": "level",
        "label": "Nivel",
        "type": "select",
        "options": [
          "Nativo",
          "C1",
          "C2",
          "B2",
          "B1",
          "A2",
          "A1"
        ]
      },
      {
        "key": "sort_order",
        "label": "Orden",
        "type": "number"
      }
    ]
  },
  {
    "id": "contact",
    "label": "CONTACT",
    "idField": "contact_id",
    "fields": [
      {
        "key": "email",
        "label": "Email",
        "type": "text",
        "required": true
      },
      {
        "key": "phone",
        "label": "Teléfono",
        "type": "text",
        "required": true
      },
      {
        "key": "github_url",
        "label": "GitHub",
        "type": "text",
        "required": true
      },
      {
        "key": "linkedin_url",
        "label": "LinkedIn",
        "type": "text",
        "required": true
      },
      {
        "key": "public_location",
        "label": "Ubicación",
        "type": "text",
        "required": true
      }
    ]
  },
];

export default function AdminSection({ onBack }: Props) {
  const { user, logout, loading, error } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [bootDone, setBootDone] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('about');

  const current = TABS.find((t) => t.id === activeTab)!;

  const handleLogout = async () => {
    try { await logout(); onBack(); }
    catch (err) { setLogoutError(err instanceof Error ? err.message : 'No se pudo cerrar la sesión'); }
  };

  if (loading) return <section className="section-wrap"><div className="state-box">Verificando acceso admin...</div></section>;
  if (!user) return <><AdminLoginSection onBack={onBack} />{error && <p role="alert" className="err">{error}</p>}</>;

  return (
    <section className="section-wrap admin-section">
      <div className="admin-top-bar">
        <button className="btn btn-ghost back-btn mono" onClick={onBack} aria-label="Volver a terminal">
          ← TERMINAL
        </button>
        <div className="admin-session mono">
          <span className="muted">session:</span>{' '}
          <span className="accent">{user.username}</span>{' '}
          <span className="badge">admin</span>
          <button className="btn btn-ghost" style={{ fontSize: 11, marginLeft: 8 }} onClick={() => void handleLogout()}>
            logout
          </button>
        </div>
      </div>

      <h2 className="section-title">ADMIN PANEL</h2>

      {!bootDone && (
        <AuthBootSequence
          lines={[
            '> Loading administrator panel...',
            '> Connecting to database...',
            '> Fetching records...',
            '> Rendering management interface...',
          ]}
          onDone={() => setBootDone(true)}
        />
      )}

      {logoutError && <p role="alert" className="err">{logoutError}</p>}
      {bootDone && (
        <div className="ani-fade">
          <div className="filter-row admin-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`chip ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AdminEntityPanel
            key={activeTab}
            entity={current.id}
            idField={current.idField}
            title={current.label}
            fields={current.fields}
          />
        </div>
      )}
    </section>
  );
}
