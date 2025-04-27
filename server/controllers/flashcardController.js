const db = require('../db');

// GET all flashcards
exports.getAllFlashcards = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM flashcards ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching flashcards:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET single flashcard
exports.getFlashcard = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM flashcards WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching flashcard:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST a new flashcard
exports.createFlashcard = async (req, res) => {
  const { question, answer } = req.body;
  
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO flashcards (question, answer) VALUES ($1, $2) RETURNING *',
      [question, answer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating flashcard:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT/update a flashcard
exports.updateFlashcard = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const result = await db.query(
      'UPDATE flashcards SET question = $1, answer = $2 WHERE id = $3 RETURNING *',
      [question, answer, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating flashcard:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// DELETE a flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM flashcards WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (err) {
    console.error('Error deleting flashcard:', err.message);
    res.status(500).json({ error: err.message });
  }
};