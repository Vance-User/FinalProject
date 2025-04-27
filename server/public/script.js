const form = document.getElementById('flashcard-form');
const list = document.getElementById('flashcard-list');
const viewAllCardsBtn = document.getElementById('view-all-cards');
const studySection = document.querySelector('.study-section');
const flashcardsSection = document.querySelector('.flashcards-section');
const backToListBtn = document.getElementById('back-to-list');
const studyFront = document.getElementById('study-front');
const studyBack = document.getElementById('study-back');
const studyPrevBtn = document.getElementById('study-prev');
const studyNextBtn = document.getElementById('study-next');
const studyFlipBtn = document.getElementById('study-flip');
const studyCounter = document.querySelector('.study-counter');
const cardCounter = document.querySelector('.card-counter');

let flashcards = [];
let currentCardIndex = 0;

// Debug function
function debug(message, data = null) {
  console.log(`[DEBUG] ${message}`, data || '');
}

// Toggle between list view and study view
function toggleView() {
  flashcardsSection.classList.toggle('hidden');
  studySection.classList.toggle('hidden');
}

// Initialize study mode with a specific card
function initStudyMode(index) {
  currentCardIndex = index;
  updateStudyCard();
  toggleView();
}

// Update the study card display
function updateStudyCard() {
  if (flashcards.length === 0) return;

  const card = flashcards[currentCardIndex];
  studyFront.textContent = card.question;
  studyBack.textContent = card.answer;
  studyCounter.textContent = `${currentCardIndex + 1}/${flashcards.length}`;
  
  // Reset card flip state
  document.querySelector('.study-card').classList.remove('flipped');
}

// Event listeners
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
    await loadFlashcards();
  } catch (error) {
    debug('Error creating card:', error);
    alert('Failed to create card. Check console for details.');
  }
});

viewAllCardsBtn.addEventListener('click', () => {
  flashcardsSection.classList.remove('hidden');
  studySection.classList.add('hidden');
});

backToListBtn.addEventListener('click', toggleView);

studyPrevBtn.addEventListener('click', () => {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateStudyCard();
  }
});

studyNextBtn.addEventListener('click', () => {
  if (currentCardIndex < flashcards.length - 1) {
    currentCardIndex++;
    updateStudyCard();
  }
});

studyFlipBtn.addEventListener('click', () => {
  document.querySelector('.study-card').classList.toggle('flipped');
});

document.querySelector('.study-card-container').addEventListener('click', () => {
  document.querySelector('.study-card').classList.toggle('flipped');
});

async function loadFlashcards() {
  try {
    const res = await fetch('/api/flashcards');

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    flashcards = await res.json();
    debug('Loaded cards:', flashcards);

    list.innerHTML = '';
    if (flashcards.length === 0) {
      list.innerHTML = '<p class="no-cards">No flashcards yet. Create one above!</p>';
      return;
    }

    flashcards.forEach((card, index) => {
      const div = document.createElement('div');
      div.className = 'flashcard';
      div.innerHTML = `
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <h3>${card.question}</h3>
          </div>
          <div class="flashcard-back">
            <p>${card.answer}</p>
          </div>
        </div>
      `;

      div.addEventListener('click', () => {
        div.classList.toggle('flipped');
      });

      // Double click to enter study mode with this card
      div.addEventListener('dblclick', () => {
        initStudyMode(index);
      });

      list.appendChild(div);
    });

    // Update counter
    if (cardCounter) {
      cardCounter.textContent = `${flashcards.length}/20`;
    }
  } catch (error) {
    debug('Error loading cards:', error);
    list.innerHTML = '<p class="error">Failed to load flashcards. Please try again.</p>';
  }
}

// Initial load
loadFlashcards();