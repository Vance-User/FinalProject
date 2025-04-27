/*
const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');
const db = require('../db');


router.get('/', flashcardController.getAllFlashcards);
router.post('/', flashcardController.createFlashcard);
// Additional routes: PUT, DELETE

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');

// GET all flashcards
router.get('/', flashcardController.getAllFlashcards);

// GET single flashcard
router.get('/:id', flashcardController.getFlashcard);

// POST create flashcard
router.post('/', flashcardController.createFlashcard);

// PUT update flashcard
router.put('/:id', flashcardController.updateFlashcard);

// DELETE flashcard
router.delete('/:id', flashcardController.deleteFlashcard);

module.exports = router;