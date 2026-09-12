// Gestiona formularios CRUD a partir de campos permitidos; los IDs son sólo de lectura.
import { useCallback, useEffect, useState } from 'react';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminUpdate,
  type AdminEntity,
} from '../services/admin';
import { ApiError } from '../services/api';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'array' | 'select';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

interface AdminEntityPanelProps {
  entity: AdminEntity;
  idField: string;
  title: string;
  fields: FieldDef[];
}

type RecordData = Record<string, unknown>;

function recordToForm(record: RecordData, fields: FieldDef[]): RecordData {
  const form: RecordData = {};
  for (const field of fields) {
    const val = record[field.key];
    if (field.type === 'array') {
      form[field.key] = Array.isArray(val) ? val.join(', ') : '';
    } else if (field.type === 'date' && typeof val === 'string') {
      form[field.key] = val.slice(0, 10);
    } else if (val === null || val === undefined) {
      form[field.key] = '';
    } else {
      form[field.key] = val;
    }
  }
  return form;
}

function formToPayload(form: RecordData, fields: FieldDef[]): RecordData {
  const payload: RecordData = {};
  for (const field of fields) {
    const raw = form[field.key];
    if (field.type === 'array') {
      payload[field.key] =
        typeof raw === 'string'
          ? raw.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
    } else if (field.type === 'number') {
      payload[field.key] = raw === '' || raw === null ? null : Number(raw);
    } else if (raw === '' || raw === null || raw === undefined) {
      payload[field.key] = null;
    } else {
      payload[field.key] = typeof raw === 'string' ? raw.trim() : raw;
    }
  }
  return payload;
}

export default function AdminEntityPanel({
  entity,
  idField,
  title,
  fields,
}: AdminEntityPanelProps) {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState<RecordData>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [crudPhase, setCrudPhase] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminList<RecordData>(entity);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading records');
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    let active = true;
    adminList<RecordData>(entity).then(data => { if (active) { setRecords(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entity]);

  const openCreate = () => {
    const empty: RecordData = {};
    fields.forEach((f) => {
      empty[f.key] = f.options?.[0] ?? (f.key === 'sort_order' ? 0 : '');
    });
    setForm(empty);
    setEditId(null);
    setMode('create');
    setFieldErrors({});
    setSuccessMsg(null);
  };

  const openEdit = (record: RecordData) => {
    setForm(recordToForm(record, fields));
    setEditId(Number(record[idField]));
    setMode('edit');
    setFieldErrors({});
    setSuccessMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setSuccessMsg(null);
    setCrudPhase(mode === 'create' ? '> Creating record...' : '> Updating record...');

    const payload = formToPayload(form, fields);

    try {
      if (mode === 'create') {
        await adminCreate(entity, payload);
        setSuccessMsg('Registro creado correctamente.');
      } else if (editId !== null) {
        await adminUpdate(entity, { ...payload, [idField]: editId });
        setSuccessMsg('Registro actualizado correctamente.');
      }
      setMode('list');
      setCrudPhase(null);
      await loadRecords();
    } catch (err) {
      setCrudPhase(null);
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
      }
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setCrudPhase('> Deleting record...');
    setError(null);
    try {
      await adminDelete(entity, idField, id);
      setSuccessMsg('Registro eliminado.');
      setConfirmDeleteId(null);
      setCrudPhase(null);
      await loadRecords();
    } catch (err) {
      setCrudPhase(null);
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const summaryField = fields[0]?.key ?? idField;

  return (
    <div className="admin-entity-panel">
      <div className="admin-entity-header">
        <h3 className="mono accent" style={{ fontSize: 14 }}>● {title}</h3>
        {mode === 'list' && (
          <button className="btn" onClick={openCreate} style={{ fontSize: 12 }}>
            + Nuevo
          </button>
        )}
        {mode !== 'list' && (
          <button className="btn btn-ghost" onClick={() => setMode('list')} style={{ fontSize: 12 }}>
            ← Volver al listado
          </button>
        )}
      </div>

      {crudPhase && (
        <div className="mono muted" style={{ fontSize: 12, marginBottom: 8 }}>{crudPhase}</div>
      )}
      {successMsg && <p className="ok mono" style={{ fontSize: 12, marginBottom: 8 }}>{successMsg}</p>}
      {error && (
        <p className="err mono" style={{ fontSize: 12, marginBottom: 8 }}>
          {error}
          <button className="btn btn-ghost" style={{ marginLeft: 8, fontSize: 11 }} onClick={() => setError(null)}>
            ✕
          </button>
        </p>
      )}

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span className="mono">Fetching records...</span>
        </div>
      )}

      {!loading && mode === 'list' && records.length === 0 && (
        <div className="state-box muted">No hay registros.</div>
      )}

      {!loading && mode === 'list' && records.length > 0 && (
        <div className="admin-record-list">
          {records.map((record) => {
            const id = Number(record[idField]);
            return (
              <div key={id} className="admin-record-row card">
                <div className="admin-record-info">
                  <span className="mono muted" style={{ fontSize: 11 }}>ID: {id}</span>
                  <span style={{ fontSize: 14 }}>
                    {String(record[summaryField] ?? '—')}
                  </span>
                </div>
                <div className="admin-record-actions">
                  <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => openEdit(record)}>
                    Editar
                  </button>
                  {confirmDeleteId === id ? (
                    <>
                      <button
                        className="btn"
                        style={{ fontSize: 11, borderColor: 'var(--error)', color: 'var(--error)' }}
                        disabled={deletingId === id}
                        onClick={() => void handleDelete(id)}
                      >
                        {deletingId === id ? 'Eliminando...' : 'Confirmar'}
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11 }}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 11, color: 'var(--error)' }}
                      onClick={() => setConfirmDeleteId(id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && mode !== 'list' && (
        <form className="panel admin-form ani-fade" onSubmit={handleSave} noValidate>
          {mode === 'edit' && editId !== null && (
            <div className="form-row">
              <label>ID (solo lectura)</label>
              <input type="text" value={editId} readOnly disabled className="readonly-field" />
            </div>
          )}
          {fields.map((field) => (
            <div className="form-row" key={field.key}>
              <label htmlFor={`${entity}-${field.key}`}>
                {field.label}
                {field.required && ' *'}
              </label>
              {field.type === 'select' ? (
                <select id={`${entity}-${field.key}`} value={String(form[field.key] ?? '')} disabled={saving}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}>
                  <option value="" disabled>Seleccionar</option>
                  {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={`${entity}-${field.key}`}
                  rows={4}
                  value={String(form[field.key] ?? '')}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  disabled={saving}
                />
              ) : (
                <input
                  id={`${entity}-${field.key}`}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={String(form[field.key] ?? '')}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]:
                        field.type === 'number' ? e.target.value : e.target.value,
                    }))
                  }
                  disabled={saving}
                />
              )}
              {fieldErrors[field.key] && (
                <span className="form-error">{fieldErrors[field.key]}</span>
              )}
              {field.type === 'array' && (
                <span className="muted" style={{ fontSize: 11 }}>Separar valores con comas</span>
              )}
            </div>
          ))}
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Guardando...' : mode === 'create' ? 'Crear registro' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  );
}
