document.addEventListener('DOMContentLoaded', function() {
  // Śledzenie kliknięć w przyciski nawigacji
  const navButtons = [
    { selector: 'button[onclick="showSection(\'check-tapwater\')"]', label: 'Check Tapwater Nav' },
    { selector: 'button[onclick="showSection(\'find-stations\')"]', label: 'Find Stations Nav' },
    { selector: 'button[onclick="showSection(\'rankings\')"]', label: 'Rankings Nav' },
    { selector: 'button[onclick="showSection(\'bottled-water\')"]', label: 'Bottled Water Nav' },
    { selector: 'button[onclick="showSection(\'about\')"]', label: 'About Nav' },
    { selector: 'button[onclick="showSection(\'community\')"]', label: 'Community Nav' },
    { selector: 'button[onclick="showSection(\'aqua-bot\')"]', label: 'AquaBot Nav' },
    { selector: 'button[onclick="showSection(\'comparer\')"]', label: 'Comparer Nav' }
  ];

  navButtons.forEach(button => {
    const element = document.querySelector(button.selector);
    if (element) {
      element.addEventListener('click', function() {
        gtag('event', 'section_click', {
          'event_category': 'Navigation',
          'event_label': button.label,
          'value': 1
        });
      });
    }
  });

  // Śledzenie czasu w sekcjach (Intersection Observer)
  const sections = [
    'check-tapwater',
    'find-stations',
    'rankings',
    'bottled-water',
    'about',
    'community',
    'aqua-bot',
    'comparer'
  ];

  sections.forEach(section => {
    const element = document.querySelector(`#${section}`);
    if (element) {
      let startTime;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startTime = Date.now();
          } else if (startTime) {
            const timeSpent = (Date.now() - startTime) / 1000;
            gtag('event', 'section_time', {
              'event_category': 'Engagement',
              'event_label': section,
              'value': Math.round(timeSpent)
            });
            startTime = null;
          }
        });
      }, { threshold: 0.1 });
      observer.observe(element);
    }
  });

  // Śledzenie kliknięć w przyciski w sekcjach
  const buttons = [
    { id: 'check-kranowka-btn', label: 'Check Kranowka Button' },
    { id: 'find-station-btn', label: 'Find Station Button' },
    { id: 'show-suw-btn', label: 'Show SUW Button' },
    { id: 'show-history-btn', label: 'Show History Button' },
    { id: 'tap-water-btn', label: 'Tap Water Rankings Button' },
    { id: 'bottled-water-btn', label: 'Bottled Water Rankings Button' },
    { id: 'generate-city-ranking', label: 'Generate City Ranking Button' },
    { id: 'generate-suw-ranking', label: 'Generate SUW Ranking Button' },
    { id: 'generate-district-ranking', label: 'Generate District Ranking Button' },
    { id: 'generate-bottle-ranking', label: 'Generate Bottle Ranking Button' },
    { id: 'aqua-bot-skin-send', label: 'AquaBot Send Button' },
    { id: 'compare-btn', label: 'Compare Cities Button' },
    { id: 'goto-aquabot-from-check', label: 'AquaBot CTA from Check' },
    { id: 'goto-aquabot-from-station', label: 'AquaBot CTA from Station' },
    { id: 'back-to-stations-btn', label: 'Back to Stations from AquaBot' }
  ];

  buttons.forEach(button => {
    const element = document.querySelector(`#${button.id}`);
    if (element) {
      element.addEventListener('click', function() {
        gtag('event', 'button_click', {
          'event_category': 'Interaction',
          'event_label': button.label,
          'value': 1
        });
      });
    }
  });

  // Śledzenie formularzy
  const feedbackForm = document.querySelector('#feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function() {
      gtag('event', 'form_submit_custom', {
        'event_category': 'Form',
        'event_label': 'Feedback Form Submit',
        'value': 1
      });
    });
  }

  // Śledzenie udanych logowań
  const loginButton = document.querySelector('#login-button');
  if (loginButton) {
    loginButton.addEventListener('click', function() {
      fetch('/login', { method: 'POST' })
        .then(response => {
          if (response.ok) {
            gtag('event', 'login', {
              'event_category': 'User Actions',
              'event_label': 'Successful Login'
            });
          }
        });
    });
  }

  // Śledzenie udanych rejestracji
  const registerButton = document.querySelector('#register-button');
  if (registerButton) {
    registerButton.addEventListener('click', function() {
      fetch('/register', { method: 'POST' })
        .then(response => {
          if (response.ok) {
            gtag('event', 'sign_up', {
              'event_category': 'User Actions',
              'event_label': 'Successful Registration'
            });
          }
        });
    });
  }
});

// Legenda dropdown toggle
document.addEventListener('DOMContentLoaded', function() {
    const legendToggle = document.getElementById('legend-toggle');
    const legendContent = document.getElementById('legend-content');

    if (legendToggle && legendContent) {
        legendToggle.addEventListener('click', function() {
            if (legendContent.style.display === 'none') {
                legendContent.style.display = 'block';
                this.classList.add('active');
            } else {
                legendContent.style.display = 'none';
                this.classList.remove('active');
            }
        });
    }
});

// NOWE CTAs do AquaBota - zaktualizowane
document.addEventListener('DOMContentLoaded', function() {
    // CTA ze sekcji "Sprawdź kranówkę"
    const gotoFromCheck = document.getElementById('goto-aquabot-from-check');
    if (gotoFromCheck) {
        gotoFromCheck.onclick = function() {
            window.showSection('aqua-bot');
        };
    }

    // CTA po znalezieniu stacji - pojawia się dynamicznie
    const waterInfoObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            const waterInfo = document.getElementById('waterInfo');
            const stationCTA = document.getElementById('station-cta');
            if (waterInfo && stationCTA && waterInfo.innerHTML.trim() !== '' && waterInfo.innerHTML !== 'Proszę wpisać miasto!' && waterInfo.innerHTML !== 'Proszę wpisać ulicę!') {
                // Sprawdź czy faktycznie znaleziono stację
                if (waterInfo.innerHTML.includes('Najbliższa stacja')) {
                    stationCTA.style.display = 'block';
                }
            }
        });
    });

    const waterInfo = document.getElementById('waterInfo');
    if (waterInfo) {
        waterInfoObserver.observe(waterInfo, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
    }

    // Obsługa kliknięcia CTA ze stacji
    const gotoFromStation = document.getElementById('goto-aquabot-from-station');
    if (gotoFromStation) {
        gotoFromStation.onclick = function() {
            // Sprawdź czy dane są w localStorage
            const lastStation = localStorage.getItem('lastCheckedStation');
            if (lastStation) {
                console.log('Przechodzimy do AquaBota z danymi stacji:', lastStation);
            }
            window.showSection('aqua-bot');
        };
    }

    // Przycisk powrotu do sekcji "Znajdź stacje" z AquaBota
    const backToStations = document.getElementById('back-to-stations-btn');
    if (backToStations) {
        backToStations.onclick = function() {
            window.showSection('find-stations');
        };
    }
});