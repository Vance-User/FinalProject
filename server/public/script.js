// DOM Elements
const form = document.getElementById('flashcard-form');
const list = document.getElementById('flashcard-list');

// Flashcard Viewer Elements (only used on flashcards.html)
const flashcardEl = document.getElementById('flashcard');
const frontEl = document.getElementById('front');
const backEl = document.getElementById('back');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const flipBtn = document.getElementById('flipBtn');
const progressEl = document.getElementById('progress');

// Shared State
let flashcards = [];
let currentIndex = 0;
let showingQuestion = true;

// Debug Utility
function debug(message, data = null) {
  console.log(`[DEBUG] ${message}`, data || '');
}

// Form Submission Handler
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = document.getElementById('question').value;
  const answer = document.getElementById('answer').value;

  if (!question.trim() || !answer.trim()) {
    alert('Please enter both question and answer');
    return;
  }

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
    
    // If we're on the viewer page, refresh those flashcards too
    if (window.location.pathname.includes('flashcards.html')) {
      await fetchFlashcards();
    }
  } catch (error) {
    debug('Error creating card:', error);
    alert('Failed to create card. Please check console for details.');
  }
});

// Main Flashcards Loader
async function loadFlashcards() {
  try {
    const res = await fetch('/api/flashcards');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    flashcards = await res.json();
    debug('Loaded cards:', flashcards);

    // Update list view (if on index.html)
    if (list) {
      list.innerHTML = '';
      
      if (flashcards.length === 0) {
        list.innerHTML = '<p class="no-cards">No flashcards yet. Create one above!</p>';
        return;
      }

      // Add "View All" link at the top
      const viewAllLink = document.createElement('a');
      viewAllLink.href = 'flashcards.html';
      viewAllLink.className = 'view-all-link';
      viewAllLink.textContent = 'View Flashcards in Full Screen';
      list.appendChild(viewAllLink);

      // Add flashcards to list
      flashcards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'flashcard';
        div.innerHTML = `
          <h3>${card.question}</h3>
          <p>${card.answer}</p>
        `;
        div.addEventListener('click', () => {
          div.classList.toggle('flipped');
        });
        list.appendChild(div);
      });

      // Update counter if exists
      const counter = document.querySelector('.card-counter');
      if (counter) {
        counter.textContent = `${flashcards.length} cards`;
      }
    }

    // Update viewer (if on flashcards.html)
    if (flashcardEl) {
      if (flashcards.length > 0) {
        displayFlashcard();
      } else {
        frontEl.textContent = "No flashcards available";
        backEl.textContent = "Create some flashcards first!";
        disableControls();
      }
    }
  } catch (error) {
    debug('Error loading cards:', error);
    if (list) {
      list.innerHTML = '<p class="error">Failed to load flashcards. Please try again.</p>';
    }
    if (frontEl) {
      frontEl.textContent = "Error loading flashcards";
      backEl.textContent = "Please try again later";
      disableControls();
    }
  }
}

// Flashcard Viewer Functions
function initFlashcardViewer() {
  if (!flashcardEl) return;
  
  fetchFlashcards();
  setupEventListeners();
}

async function fetchFlashcards() {
  try {
    const response = await fetch('/api/flashcards');
    if (!response.ok) throw new Error('Network response was not ok');
    
    flashcards = await response.json();
    
    if (flashcards.length > 0) {
      currentIndex = 0;
      showingQuestion = true;
      displayFlashcard();
    } else {
      frontEl.textContent = "No flashcards available";
      backEl.textContent = "Create some flashcards first!";
      disableControls();
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    frontEl.textContent = "Error loading flashcards";
    backEl.textContent = "Please try again later";
    disableControls();
  }
}

function displayFlashcard() {
  const card = flashcards[currentIndex];
  frontEl.textContent = card.question || "No question available";
  backEl.textContent = card.answer || "No answer available";
  
  // Reset to show question when changing cards
  if (!showingQuestion) {
    flashcardEl.classList.remove('flipped');
    showingQuestion = true;
  }
  
  updateProgress();
}

function updateProgress() {
  if (progressEl) {
    progressEl.textContent = `${currentIndex + 1} / ${flashcards.length}`;
  }
}

function disableControls() {
  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = true;
  if (flipBtn) flipBtn.disabled = true;
}

function setupEventListeners() {
  if (!flashcardEl) return;
  
  // Click on card to flip
  flashcardEl.addEventListener('click', flipCard);
  
  // Button controls
  if (flipBtn) flipBtn.addEventListener('click', flipCard);
  if (prevBtn) prevBtn.addEventListener('click', showPreviousCard);
  if (nextBtn) nextBtn.addEventListener('click', showNextCard);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!flashcards.length) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        showPreviousCard();
        break;
      case 'ArrowRight':
        showNextCard();
        break;
      case ' ':
      case 'Enter':
        flipCard();
        break;
    }
  });
}

function flipCard() {
  if (!flashcards.length) return;
  
  flashcardEl.classList.toggle('flipped');
  showingQuestion = !showingQuestion;
}

function showPreviousCard() {
  if (flashcards.length === 0) return;
  
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  showingQuestion = true;
  displayFlashcard();
}

function showNextCard() {
  if (flashcards.length === 0) return;
  
  currentIndex = (currentIndex + 1) % flashcards.length;
  showingQuestion = true;
  displayFlashcard();
}

// Initialize appropriate functionality based on current page
document.addEventListener('DOMContentLoaded', () => {
  loadFlashcards(); // Always load flashcards
  
  // Initialize viewer if on flashcards.html
  if (window.location.pathname.includes('flashcards.html')) {
    initFlashcardViewer();
  }
});