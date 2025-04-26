const Flashcard = require('../models/flashcardModel');

exports.getAllFlashcards = async (req, res) => {
  const cards = await Flashcard.getAll();
  res.json(cards);
};

exports.createFlashcard = async (req, res) => {
  const { question, answer } = req.body;
  const newCard = await Flashcard.create({ question, answer });
  res.status(201).json(newCard);
};
