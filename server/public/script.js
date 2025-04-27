document.addEventListener('DOMContentLoaded', function() {
  // Safe DOM element getter with error handling
  function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.error(`Element with ID '${id}' not found`);
      return null;
    }
    return el;
  }

  // Get all DOM elements safely
  const elements = {
    form: getElement('flashcard-form'),
    list: getElement('flashcard-list'),
    heading: getElement('view-all-cards'),
    studySection: document.querySelector('.study-section'),
    flashcardsSection: document.querySelector('.flashcards-section'),
    backToListBtn: getElement('back-to-list'),
    studyFront: getElement('study-front'),
    studyBack: getElement('study-back'),
    studyPrevBtn: getElement('study-prev'),
    studyNextBtn: getElement('study-next'),
    studyFlipBtn: getElement('study-flip'),
    studyCounter: document.querySelector('.study-counter'),
    cardCounter: document.querySelector('.card-counter'),
    questionInput: getElement('question'),
    answerInput: getElement('answer')
  };

  // Check for critical elements
  if (!elements.form || !elements.list) {
    showCriticalError();
    return;
  }

  let flashcards = [];
  let currentCardIndex = 0;

  // Initialize the app with error handling
  function init() {
    try {
      setupEventListeners();
      loadFlashcards();
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to initialize application');
    }
  }

  // Display critical error (missing essential elements)
  function showCriticalError() {
    document.body.innerHTML = `
      <div class="error" style="padding: 2rem; text-align: center;">
        <h2>Application Error</h2>
        <p>Critical components missing - please refresh the page</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
          Refresh Page
        </button>
      </div>
    `;
  }

  // General error display function
  function showError(message, element = elements.list) {
    if (!element) element = document.body;
    element.innerHTML = `
      <div class="error">
        <p>${message}</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }

  // Set up event listeners with protection
  function setupEventListeners() {
    try {
      // Header click
      if (elements.heading) {
        elements.heading.addEventListener('click', showAllCards);
      }

      // Form submission
      elements.form.addEventListener('submit', handleFormSubmit);

      // Study mode controls
      if (elements.backToListBtn) {
        elements.backToListBtn.addEventListener('click', showAllCards);
      }
      if (elements.studyPrevBtn) {
        elements.studyPrevBtn.addEventListener('click', showPreviousCard);
      }
      if (elements.studyNextBtn) {
        elements.studyNextBtn.addEventListener('click', showNextCard);
      }
      if (elements.studyFlipBtn) {
        elements.studyFlipBtn.addEventListener('click', flipCard);
      }

      const studyContainer = document.querySelector('.study-card-container');
      if (studyContainer) {
        studyContainer.addEventListener('click', flipCard);
      }

    } catch (error) {
      console.error('Event listener setup error:', error);
      showError('Failed to set up event listeners');
    }
  }

  function renderFlashcards() {
    try {
      if (!elements.list) {
        console.error("Flashcard list element not found");
        return;
      }

      if (!flashcards || !flashcards.length) {
        elements.list.innerHTML = '<div class="no-cards">No flashcards yet. Add one to get started!</div>';
        return;
      }

      elements.list.innerHTML = flashcards.map((card, index) => `
        <div class="flashcard-item" data-id="${card.id}">
          <div class="flashcard-content">
            <div class="flashcard-question">${escapeHtml(card.question)}</div>
            <div class="flashcard-answer" style="display: none;">${escapeHtml(card.answer)}</div>
          </div>
          <div class="flashcard-actions">
            <button class="study-btn" data-index="${index}">Study</button>
            <button class="delete-btn" data-id="${card.id}">Delete</button>
            <button class="toggle-answer-btn">Show Answer</button>
          </div>
        </div>
      `).join('');

      // Add event listeners to the new buttons
      document.querySelectorAll('.study-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentCardIndex = parseInt(e.target.dataset.index);
          showStudySection();
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
      });

      document.querySelectorAll('.toggle-answer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cardItem = e.target.closest('.flashcard-item');
          const answer = cardItem.querySelector('.flashcard-answer');
          if (answer.style.display === 'none') {
            answer.style.display = 'block';
            e.target.textContent = 'Hide Answer';
          } else {
            answer.style.display = 'none';
            e.target.textContent = 'Show Answer';
          }
        });
      });

    } catch (error) {
      console.error('Error rendering flashcards:', error);
      showError('Failed to display flashcards');
    }
  }

  // Helper function to prevent XSS
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateCounters() {
    if (elements.cardCounter) {
      elements.cardCounter.textContent = `${flashcards.length} card${flashcards.length !== 1 ? 's' : ''}`;
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const question = elements.questionInput.value.trim();
    const answer = elements.answerInput.value.trim();
    
    if (!question || !answer) {
      showError('Please fill in both question and answer fields');
      return;
    }
    
    const newCard = {
      id: Date.now().toString(),
      question,
      answer
    };
    
    flashcards.push(newCard);
    renderFlashcards();
    updateCounters();
    
    elements.form.reset();
  }

  function handleDeleteClick(e) {
    const cardId = e.target.dataset.id;
    flashcards = flashcards.filter(card => card.id !== cardId);
    renderFlashcards();
    updateCounters();
    
    // If we're in study mode and deleted the current card
    if (elements.studySection.style.display === 'block') {
      if (flashcards.length === 0) {
        showAllCards();
      } else if (currentCardIndex >= flashcards.length) {
        currentCardIndex = flashcards.length - 1;
        updateStudyCard();
      }
    }
  }

  function showAllCards() {
    if (elements.studySection) elements.studySection.style.display = 'none';
    if (elements.flashcardsSection) elements.flashcardsSection.style.display = 'block';
  }

  function showStudySection() {
    if (flashcards.length === 0) return;
    
    if (elements.flashcardsSection) elements.flashcardsSection.style.display = 'none';
    if (elements.studySection) elements.studySection.style.display = 'block';
    
    updateStudyCard();
  }

  function updateStudyCard() {
    if (!flashcards.length) return;
    
    const card = flashcards[currentCardIndex];
    if (elements.studyFront) elements.studyFront.textContent = card.question;
    if (elements.studyBack) elements.studyBack.textContent = card.answer;
    if (elements.studyCounter) {
      elements.studyCounter.textContent = `${currentCardIndex + 1}/${flashcards.length}`;
    }
    
    const studyCard = document.querySelector('.study-card');
    if (studyCard) studyCard.classList.remove('flipped');
  }

  function showNextCard() {
    if (flashcards.length === 0) return;
    
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    updateStudyCard();
  }

  function showPreviousCard() {
    if (flashcards.length === 0) return;
    
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    updateStudyCard();
  }

  function flipCard() {
    const studyCard = document.querySelector('.study-card');
    if (studyCard) studyCard.classList.toggle('flipped');
  }

  async function loadFlashcards() {
    try {
      console.log("Loading flashcards...");
      const res = await fetch('/api/flashcards');
      
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      flashcards = data;
      console.log("Flashcards loaded:", flashcards);
      
      renderFlashcards();
      updateCounters();
    } catch (error) {
      console.error('Error loading flashcards:', error);
      showError(`Failed to load flashcards: ${error.message}`);
    }
  }

  // Start the app
  init();
});