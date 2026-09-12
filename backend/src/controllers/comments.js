// Consulta comments y entrega JSON compatible con los servicios del frontend.
import pool from '../db/index.js';

export const listComments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { name, message } = req.body || {};
    const errors = {};

    if (name === undefined || name === null || typeof name !== 'string') {
      errors.name = 'name is required and must be a string';
    } else {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 50) {
        errors.name = 'name must be between 2 and 50 characters';
      }
    }

    if (message === undefined || message === null || typeof message !== 'string') {
      errors.message = 'message is required and must be a string';
    } else {
      const trimmedMessage = message.trim();
      if (trimmedMessage.length < 2 || trimmedMessage.length > 1000) {
        errors.message = 'message must be between 2 and 1000 characters';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      'INSERT INTO comments (name, message) VALUES ($1, $2) RETURNING *',
      [name.trim(), message.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
