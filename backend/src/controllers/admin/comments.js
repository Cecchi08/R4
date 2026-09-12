// Valida y persiste comments utilizando los campos definidos en schema.sql.
import pool from '../../db/index.js';
import { requireString } from '../../utils/validation.js';

function parseCommentBody(body, isUpdate = false) {
  const errors = {};
  const data = {};

  const nameErr = requireString(body.name, 'name', 2, 50);
  if (nameErr) {
    errors.name = nameErr;
  } else {
    data.name = body.name.trim();
  }

  const messageErr = requireString(body.message, 'message', 2, 1000);
  if (messageErr) {
    errors.message = messageErr;
  } else {
    data.message = body.message.trim();
  }

  if (isUpdate) {
    const id = Number(body.comment_id);
    if (!Number.isInteger(id) || id < 1) {
      errors.comment_id = 'comment_id is required and must be a positive integer';
    } else {
      data.comment_id = id;
    }
  }

  return { errors, data };
}

export const listComments = async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM comments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { errors, data } = parseCommentBody(req.body || {});
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      'INSERT INTO comments (name, message) VALUES ($1, $2) RETURNING *',
      [data.name, data.message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[admin/comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { errors, data } = parseCommentBody(req.body || {}, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const result = await pool.query(
      'UPDATE comments SET name = $2, message = $3 WHERE comment_id = $1 RETURNING *',
      [data.comment_id, data.name, data.message]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[admin/comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.body?.comment_id);
    if (!Number.isInteger(commentId) || commentId < 1) {
      return res.status(400).json({ error: 'comment_id is required and must be a positive integer' });
    }

    const result = await pool.query(
      'DELETE FROM comments WHERE comment_id = $1 RETURNING comment_id',
      [commentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ deleted: true, comment_id: commentId });
  } catch (err) {
    console.error('[admin/comments]', err.message);
    res.status(500).json({ error: 'Database operation failed' });
  }
};
