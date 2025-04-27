document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const form = document.getElementById('flashcard-form');
  const list = document.getElementById('flashcard-list');
  const heading = document.getElementById('view-all-cards');
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

  // Initialize the app
  function init() {
    setupEventListeners();
    loadFlashcards();
  }

  // Set up all event listeners
  function setupEventListeners() {
    // Header click - show all cards
    heading.addEventListener('click', showAllCards);
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Study mode controls
    backToListBtn.addEventListener('click', showAllCards);
    studyPrevBtn.addEventListener('click', showPreviousCard);
    studyNextBtn.addEventListener('click', showNextCard);
    studyFlipBtn.addEventListener('click', flipCard);
    document.querySelector('.study-card-container').addEventListener('click', flipCard);
    
    // Handle delete button clicks
    document.addEventListener('click', handleDeleteClick);
  }

  // Handle delete button clicks
  async function handleDeleteClick(e) {
    if (e.target.classList.contains('delete-btn')) {
      e.stopPropagation();
      const cardId = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this flashcard?')) {
        try {
          const response = await fetch(`/api/flashcards/${cardId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete card');
          
          await loadFlashcards();
        } catch (error) {
          console.error('Error deleting card:', error);
          alert('Failed to delete card. Please try again.');
        }
      }
    }
  }

  // View control functions
  function showAllCards() {
    flashcardsSection.classList.remove('hidden');
    studySection.classList.add('hidden');
  }

  function enterStudyMode(index) {
    currentCardIndex = index;
    updateStudyCard();
    flashcardsSection.classList.add('hidden');
    studySection.classList.remove('hidden');
  }

  // Study card functions
  function updateStudyCard() {
    if (!flashcards.length) return;
    
    const card = flashcards[currentCardIndex];
    studyFront.textContent = card.question;
    studyBack.textContent = card.answer;
    studyCounter.textContent = `${currentCardIndex + 1}/${flashcards.length}`;
    document.querySelector('.study-card').classList.remove('flipped');
  }

  function showPreviousCard() {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      updateStudyCard();
    }
  }

  function showNextCard() {
    if (currentCardIndex < flashcards.length - 1) {
      currentCardIndex++;
      updateStudyCard();
    }
  }

  function flipCard() {
    document.querySelector('.study-card').classList.toggle('flipped');
  }

  // Form handling
  async function handleFormSubmit(e) {
    e.preventDefault();
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      form.reset();
      await loadFlashcards();
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card. Please try again.');
    }
  }

  // Load flashcards from server
  async function loadFlashcards() {
    try {
      console.log("Loading flashcards..."); // Debug log
      const res = await fetch('/api/flashcards');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      flashcards = await res.json();
      console.log("Flashcards loaded:", flashcards); // Debug log
      
      if (!Array.isArray(flashcards)) {
        throw new Error("Received data is not an array");
      }
      
      renderFlashcards();
      updateCounters();
    } catch (error) {
      console.error('Error loading cards:', error);
      list.innerHTML = `
        <div class="error">
          <p>Failed to load flashcards</p>
          <p>${error.message}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  // Render flashcards to DOM
  function renderFlashcards() {
    list.innerHTML = '';
    
    if (!flashcards.length) {
      list.innerHTML = '<p class="no-cards">No flashcards yet. Create one above!</p>';
      return;
    }

    flashcards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'flashcard';
      cardElement.innerHTML = `
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <h3>${card.question}</h3>
            <button class="delete-btn" data-id="${card.id}">×</button>
          </div>
          <div class="flashcard-back">
            <p>${card.answer}</p>
            <button class="delete-btn" data-id="${card.id}">×</button>
            <button class="study-btn" data-index="${index}">Study</button>
          </div>
        </div>
      `;

      cardElement.addEventListener('click', (e) => {
        // Only flip if not clicking on buttons
        if (!e.target.classList.contains('delete-btn') && !e.target.classList.contains('study-btn')) {
          cardElement.classList.toggle('flipped');
        }
      });

      // Study button handler
      const studyBtn = cardElement.querySelector('.study-btn');
      studyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enterStudyMode(index);
      });

      list.appendChild(cardElement);
    });
  }

  // Update counters
  function updateCounters() {
    if (cardCounter) {
      cardCounter.textContent = `${flashcards.length}/20`;
    }
  }

  // Start the app
  init();
});