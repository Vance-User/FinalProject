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

// POST a new flashcard
exports.createFlashcard = async (req, res) => {
  const { question, answer } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO flashcards (question, answer) VALUES ($1, $2) RETURNING *',
      [question, answer]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating flashcard:', err.message);
    res.status(500).json({ error: err.message });
  }
};
