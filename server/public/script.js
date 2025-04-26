/*const form = document.getElementById('flashcard-form');
const list = document.getElementById('flashcard-list');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = document.getElementById('question').value;
  const answer = document.getElementById('answer').value;

  await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });

  form.reset();
  loadFlashcards();
});

async function loadFlashcards() {
  const res = await fetch('/api/flashcards');
  const cards = await res.json();

  list.innerHTML = '';
  cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerHTML = `
      <h3>${card.question}</h3>
      <p>${card.answer}</p>
    `;
    list.appendChild(div);
  });
}

loadFlashcards();
*/
const form = document.getElementById('flashcard-form');
const list = document.getElementById('flashcard-list');

// Add debug function
function debug(message, data = null) {
  console.log(`[DEBUG] ${message}`, data || '');
  // Optional: Show error to user in UI
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = document.getElementById('question').value;
  const answer = document.getElementById('answer').value;

  try {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    debug('Card created successfully');
    form.reset();
    await loadFlashcards(); // Wait for reload to complete
  } catch (error) {
    debug('Error creating card:', error);
    alert('Failed to create card. Check console for details.');
  }
});

async function loadFlashcards() {
  try {
    const res = await fetch('/api/flashcards');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const cards = await res.json();
    debug('Loaded cards:', cards);

    list.innerHTML = '';
    if (cards.length === 0) {
      list.innerHTML = '<p class="no-cards">No flashcards yet. Create one above!</p>';
      return;
    }

    cards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'flashcard';
      div.innerHTML = `
        <h3>${card.question}</h3>
        <p>${card.answer}</p>
      `;
      // Add click to flip functionality
      div.addEventListener('click', () => {
        div.classList.toggle('flipped');
      });
      list.appendChild(div);
    });

    // Update counter
    const counter = document.querySelector('.card-counter');
    if (counter) {
      counter.textContent = `${cards.length}/20`;
    }
  } catch (error) {
    debug('Error loading cards:', error);
    list.innerHTML = '<p class="error">Failed to load flashcards. Please try again.</p>';
  }
}

// Initial load
loadFlashcards();