// backend/controllers/codeController.js
const db = require('../models/db');

// Helper: normalize incoming tags from either `tag` (string) or `tags` (array)
function normalizeTags(body) {
  if (Array.isArray(body.tags)) return body.tags;
  if (typeof body.tag === 'string' && body.tag.trim()) return [body.tag];
  return [];
}

const listSnippets = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      `SELECT s.id, s.title, s.description, s.language_name, s.created_at, s.updated_at,
              (
                SELECT GROUP_CONCAT(t.name)
                FROM snippet_tags st
                JOIN tags t ON t.id = st.tag_id
                WHERE st.snippet_id = s.id
              ) AS tag_list
       FROM snippets s
       WHERE s.user_id = ?
       ORDER BY s.updated_at DESC`,
      [userId]
    );

    const mapped = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      tag: (r.tag_list || '').split(',')[0] || null,
      language: r.language_name || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // Return array directly to match frontend expectations
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createSnippet = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, code } = req.body;
    const language_name = req.body.language_name || req.body.language || null;
    const tags = normalizeTags(req.body);
    if (!title || !code) return res.status(400).json({ message: 'Title and code required' });

    const [result] = await db.query(
      'INSERT INTO snippets (user_id, title, description, code, language_name) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description || null, code, language_name]
    );
    const snippetId = result.insertId;

    if (Array.isArray(tags)) {
      for (const t of tags) {
        const tag = (t || '').trim().toLowerCase();
        if (!tag) continue;
        const [exist] = await db.query('SELECT id FROM tags WHERE name = ?', [tag]);
        let tagId;
        if (exist.length) tagId = exist[0].id;
        else {
          const [ins] = await db.query('INSERT INTO tags (name) VALUES (?)', [tag]);
          tagId = ins.insertId;
        }
        await db.query('INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)', [snippetId, tagId]);
      }
    }

    res.json({ message: 'Snippet created', id: snippetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSnippet = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT id, user_id, title, description, code, language_name, created_at, updated_at FROM snippets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const snippet = rows[0];
    const [tagsRows] = await db.query(
      'SELECT t.name FROM tags t JOIN snippet_tags st ON st.tag_id = t.id WHERE st.snippet_id = ?',
      [id]
    );
    const tags = tagsRows.map(r => r.name);
    const firstTag = tags[0] || null;

    // Return flat object to match frontend expectations
    res.json({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      tag: firstTag,
      language: snippet.language_name || null,
      created_at: snippet.created_at,
      updated_at: snippet.updated_at,
      tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSnippet = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const { title, description, code } = req.body;
    const language_name = req.body.language_name || req.body.language || null;
    const tags = normalizeTags(req.body);
    const [rows] = await db.query('SELECT id FROM snippets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows.length) return res.status(404).json({ message: 'Not found or no permission' });

    await db.query(
      'UPDATE snippets SET title = ?, description = ?, code = ?, language_name = ? WHERE id = ?',
      [title, description || null, code, language_name, id]
    );

    await db.query('DELETE FROM snippet_tags WHERE snippet_id = ?', [id]);
    if (Array.isArray(tags)) {
      for (const t of tags) {
        const tag = (t || '').trim().toLowerCase();
        if (!tag) continue;
        const [exist] = await db.query('SELECT id FROM tags WHERE name = ?', [tag]);
        let tagId;
        if (exist.length) tagId = exist[0].id;
        else {
          const [ins] = await db.query('INSERT INTO tags (name) VALUES (?)', [tag]);
          tagId = ins.insertId;
        }
        await db.query('INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    res.json({ message: 'Snippet updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteSnippet = async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const [rows] = await db.query('SELECT id FROM snippets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows.length) return res.status(404).json({ message: 'Not found or no permission' });

    await db.query('DELETE FROM snippet_tags WHERE snippet_id = ?', [id]);
    await db.query('DELETE FROM snippets WHERE id = ?', [id]);

    res.json({ message: 'Snippet deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { listSnippets, createSnippet, getSnippet, updateSnippet, deleteSnippet };