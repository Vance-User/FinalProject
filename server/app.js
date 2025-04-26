const express = require('express');
const cors = require('cors');
const path = require('path');
const flashcardRoutes = require('./routes/flashcardRoutes');
require('dotenv').config();

const app = express(); // ✅ define app first

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/flashcards', flashcardRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Flashcard API!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
