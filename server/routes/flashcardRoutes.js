const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcardController');

router.get('/', flashcardController.getAllFlashcards);
router.post('/', flashcardController.createFlashcard);
// Additional routes: PUT, DELETE

module.exports = router;
