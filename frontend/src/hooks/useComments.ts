// Carga y publica comentarios, separando errores de lectura y de envío.
import { useState, useEffect, useCallback } from 'react';
import { getComments, createComment } from '../services/comments.js';
import type { Comment } from '../types/index.js';

interface ValidationErrors {
  name?: string;
  message?: string;
}

export function useComments() {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      setComments(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getComments().then(data => { if (active) { setComments(data); setError(null); } })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Error al cargar datos'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const validateForm = useCallback(({ name, message }: { name: string; message: string }): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!name || name.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (name.length < 2 || name.length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    }

    if (!message || message.trim().length === 0) {
      errors.message = 'Message is required';
    } else if (message.length < 2 || message.length > 1000) {
      errors.message = 'Message must be between 2 and 1000 characters';
    }

    return errors;
  }, []);

  const submit = useCallback(async ({ name, message }: { name: string; message: string }): Promise<boolean> => {
    const errors = validateForm({ name, message });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }

    setFormErrors({});
    setSubmitting(true);
    setSubmitError(null);

    try {
      const newComment = await createComment({ name, message });
      setComments((prev) => (prev ? [newComment, ...prev] : [newComment]));
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit comment');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validateForm]);

  return {
    comments,
    loading,
    submitting,
    error,
    submitError,
    formErrors,
    refresh,
    submit,
  };
}
