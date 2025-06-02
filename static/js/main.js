import { setUsername, fetchUserStats, togglePremium, logout, suggestCities, suggestBottles, selectBottle } from '/static/js/utils.js';
import { fetchPosts, addPost, addComment, togglePostComments, markPostAsSolved } from '/static/js/community.js';
import { generateRanking, generateSUWRanking, generateDistrictRanking, submitUserRating, generateBottleRanking, displayUserBottleRankings } from '/static/js/ranking.js';
import { checkWater, findWaterStation, displayHistory, waterStations, showAllSUW, showAllMeasurementPoints } from '/static/js/waterAnalysis.js';
import { toggleQuiz, checkQuizSkin, checkQuizWellbeing } from '/static/js/quiz.js';
import { startAquaBot } from '/static/js/aquaBot.js';

export let currentUser = localStorage.getItem('username') || null;
export let remindersActive = false;
export let reminderInterval = null;
export let alertsActive = false;
export let alertCity = '';
export let lastCheckedData = {};

window.onload = function() {
    try {
        // Ukrywanie sekcji
        const compareSection = Array.from(document.querySelectorAll('section h2'))
            .find(h2 => h2.textContent.includes("Porównaj wody świata"))?.closest('section');
        if (compareSection) compareSection.style.display = 'none';
        const userRankingsSection = Array.from(document.querySelectorAll('section h2'))
            .find(h2 => h2.textContent.includes("Ranking wód według użytkowników"))?.closest('section');
        if (userRankingsSection) userRankingsSection.style.display = 'none';

        // Inicjalizacja użytkownika
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            currentUser = savedUsername;
            const loginBox = document.getElementById('login-box');
            const postForm = document.getElementById('post-form');
            const userInfo = document.getElementById('user-info');
            const currentUsername = document.getElementById('current-username');
            if (loginBox && postForm && userInfo && currentUsername) {
                loginBox.style.display = 'none';
                postForm.style.display = 'block';
                userInfo.style.display = 'block';
                currentUsername.textContent = savedUsername;
                fetchUserStats();
                fetchPosts();
            }
        }

        // Inicjalizacja mapy
        const mapElement = document.getElementById('map');
        if (mapElement && typeof L !== 'undefined') {
            try {
                window.map = L.map('map', { center: [52.7325, 15.2369], zoom: 12 });
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(window.map);
                console.log('Mapa zainicjalizowana poprawnie');
            } catch (error) {
                console.error('Błąd podczas inicjalizacji mapy Leaflet:', error);
            }
        } else {
            console.warn('Mapa nie została zainicjalizowana: brak elementu #map lub biblioteki Leaflet');
        }

        // Event listener dla dropdownu rankingParameter
        const rankingParameter = document.getElementById('rankingParameter');
        if (rankingParameter) {
            rankingParameter.addEventListener('change', () => {
                generateRanking(rankingParameter.value);
            });
        }

        // Logowanie i przypisywanie event listenerów
        const elements = {
            'city': document.getElementById('city'),
            'check-kranowka-btn': document.getElementById('check-kranowka-btn'),
            'city-premium': document.getElementById('city-premium'),
            'find-station-btn': document.getElementById('find-station-btn'),
            'show-suw-btn': document.getElementById('show-suw-btn'),
            'show-points-btn': document.getElementById('show-points-btn'),
            'show-history-btn': document.getElementById('show-history-btn'),
            'ranking-miast-btn2': document.getElementById('ranking-miast-btn2'),
            'ranking-suw-btn2': document.getElementById('ranking-suw-btn2'),
            'ranking-district-btn': document.getElementById('ranking-district-btn'),
            'request-data-btn': document.getElementById('request-data-btn'),
            'city-for-suw-ranking': document.getElementById('city-for-suw-ranking'),
            'quiz-skin-btn': document.getElementById('quiz-skin-btn'),
            'quiz-wellbeing-btn': document.getElementById('quiz-wellbeing-btn'),
            'check-skin-quiz-btn': document.getElementById('check-skin-quiz-btn'),
            'check-wellbeing-quiz-btn': document.getElementById('check-wellbeing-quiz-btn'),
            'login-btn': document.getElementById('login-btn'),
            'toggle-premium': document.getElementById('toggle-premium'),
            'logout': document.getElementById('logout'),
            'add-post-btn': document.getElementById('add-post-btn'),
            'post-filter': document.getElementById('post-filter'),
            'post-sort': document.getElementById('post-sort'),
            'submit-rating-btn': document.getElementById('submit-rating-btn'),
            'toggle-reminders': document.getElementById('toggle-reminders'),
            'alert-city': document.getElementById('alert-city'),
            'toggle-alerts': document.getElementById('toggle-alerts'),
            'bottle': document.getElementById('bottle'),
            'ranking-bottles-btn': document.getElementById('ranking-bottles-btn'),
            'check-butelkowana-btn': document.getElementById('check-butelkowana-btn')
        };
        for (const [id, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element o ID '${id}' nie został znaleziony`);
            }
        }

        if (elements['city']) elements['city'].addEventListener('keyup', (e) => suggestCities(e.target.value));
        if (elements['check-kranowka-btn']) {
            elements['check-kranowka-btn'].addEventListener('click', () => {
                checkWater('city');
                showNormsSection();
            });
        }
        if (elements['city-premium']) elements['city-premium'].addEventListener('keyup', (e) => suggestCities(e.target.value, 'city-premium'));
        if (elements['find-station-btn']) elements['find-station-btn'].addEventListener('click', findWaterStation);
        if (elements['show-suw-btn']) elements['show-suw-btn'].addEventListener('click', showAllSUW);
        if (elements['show-points-btn']) elements['show-points-btn'].addEventListener('click', showAllMeasurementPoints);
        if (elements['show-history-btn']) elements['show-history-btn'].addEventListener('click', () => displayHistory(document.getElementById('city-premium').value));
        if (elements['ranking-miast-btn2']) elements['ranking-miast-btn2'].addEventListener('click', () => {
            const parameter = document.getElementById('rankingParameter2').value;
            generateRanking(parameter);
        });
        if (elements['ranking-suw-btn2']) elements['ranking-suw-btn2'].addEventListener('click', () => {
            const city = document.getElementById('city-for-suw-ranking').value;
            generateSUWRanking(city, document.getElementById('rankingParameter2').value);
        });
        if (elements['ranking-district-btn']) elements['ranking-district-btn'].addEventListener('click', () => {
            const city = document.getElementById('city-for-suw-ranking').value;
            generateDistrictRanking(city, document.getElementById('rankingParameter2').value);
        });
        if (elements['request-data-btn']) elements['request-data-btn'].addEventListener('click', () => {
            const city = document.getElementById('city-premium').value;
            const missingParams = ['ołów', 'rtęć'];
            const email = getWaterUtilityEmail(city);
            const subject = 'Prośba o dodanie parametrów do raportów o jakości wody';
            const body = `Szanowni Państwo,\n\nJako mieszkaniec ${city} proszę o dodanie do publicznych raportów o jakości wody informacji o następujących parametrach: ${missingParams.join(', ')}.\n\nZ poważaniem,\n[Twoje imię]`;
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
        if (elements['city-for-suw-ranking']) elements['city-for-suw-ranking'].addEventListener('keyup', (e) => suggestCities(e.target.value, 'city-for-suw-ranking'));
        if (elements['quiz-skin-btn']) elements['quiz-skin-btn'].addEventListener('click', () => toggleQuiz('skin'));
        if (elements['quiz-wellbeing-btn']) elements['quiz-wellbeing-btn'].addEventListener('click', () => toggleQuiz('wellbeing'));
        if (elements['check-skin-quiz-btn']) elements['check-skin-quiz-btn'].addEventListener('click', checkQuizSkin);
        if (elements['check-wellbeing-quiz-btn']) elements['check-wellbeing-quiz-btn'].addEventListener('click', checkQuizWellbeing);
        if (elements['login-btn']) elements['login-btn'].addEventListener('click', setUsername);
        if (elements['toggle-premium']) elements['toggle-premium'].addEventListener('click', togglePremium);
        if (elements['logout']) elements['logout'].addEventListener('click', logout);
        if (elements['add-post-btn']) elements['add-post-btn'].addEventListener('click', addPost);
        if (elements['post-filter']) elements['post-filter'].addEventListener('change', fetchPosts);
        if (elements['post-sort']) elements['post-sort'].addEventListener('change', fetchPosts);
        if (elements['submit-rating-btn']) elements['submit-rating-btn'].addEventListener('click', submitUserRating);
        if (elements['toggle-reminders']) elements['toggle-reminders'].addEventListener('click', () => {
            alert('Funkcja przypomnień nie jest jeszcze zaimplementowana.');
        });
        if (elements['alert-city']) elements['alert-city'].addEventListener('keyup', (e) => suggestCities(e.target.value, 'alert-city'));
        if (elements['toggle-alerts']) elements['toggle-alerts'].addEventListener('click', toggleAlerts);
        if (elements['bottle']) elements['bottle'].addEventListener('keyup', (e) => suggestBottles(e.target.value));
        if (elements['ranking-bottles-btn']) elements['ranking-bottles-btn'].addEventListener('click', () => {
            const parameter = document.getElementById('bottleRankingParameter').value;
            generateBottleRanking(parameter);
        });
        if (elements['check-butelkowana-btn']) {
            elements['check-butelkowana-btn'].addEventListener('click', () => checkWater('bottle'));
        }

        // Wczytaj ustawienia alertów
        if (localStorage.getItem('alertsActive') === 'true') {
            const city = localStorage.getItem('alertCity');
            if (city) {
                document.getElementById('alert-city').value = city;
                toggleAlerts();
            }
        }
    } catch (error) {
        console.error('Błąd inicjalizacji:', error);
        alert('Wystąpił błąd podczas ładowania strony. Sprawdź konsolę (F12).');
    }
};

export function checkWaterChanges() {
    try {
        if (!alertsActive || !alertCity || !waterStations[alertCity]) return;
        const currentData = waterStations[alertCity].average;
        let changes = [];

        if (lastCheckedData[alertCity]) {
            if (parseFloat(currentData.twardosc) !== parseFloat(lastCheckedData[alertCity].twardosc)) {
                changes.push(`Twardość w ${alertCity} zmieniła się na ${currentData.twardosc} mg/l!`);
            }
            if (parseFloat(currentData.pH) !== parseFloat(lastCheckedData[alertCity].pH)) {
                changes.push(`pH w ${alertCity} zmieniło się na ${currentData.pH}!`);
            }
            if (parseFloat(currentData.azotany) !== parseFloat(lastCheckedData[alertCity].azotany)) {
                changes.push(`Azotany w ${alertCity} zmieniły się na ${currentData.azotany} mg/l!`);
            }
        }

        lastCheckedData[alertCity] = { ...currentData };

        if (changes.length > 0) {
            alert(changes.join('\n'));
        }
    } catch (error) {
        console.error('Błąd w checkWaterChanges:', error);
    }
}

export function toggleAlerts() {
    try {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!isPremium) {
            alert('Funkcja dostępna tylko dla użytkowników Premium! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }
        const city = document.getElementById('alert-city').value.trim();
        const statusDiv = document.getElementById('alert-status');
        const toggleButton = document.getElementById('toggle-alerts');

        if (!city || !waterStations[city]) {
            alert('Proszę wpisać prawidłowe miasto!');
            return;
        }

        if (!alertsActive) {
            alertCity = city;
            alertsActive = true;
            toggleButton.textContent = 'Wyłącz alerty';
            statusDiv.textContent = `Alerty włączone dla ${alertCity}`;
            localStorage.setItem('alertsActive', 'true');
            localStorage.setItem('alertCity', alertCity);
            lastCheckedData[alertCity] = { ...waterStations[alertCity].average };
            setTimeout(checkWaterChanges, 2000);
        } else {
            alertsActive = false;
            alertCity = '';
            toggleButton.textContent = 'Włącz alerty';
            statusDiv.textContent = 'Alerty wyłączone';
            localStorage.setItem('alertsActive', 'false');
            localStorage.removeItem('alertCity');
        }
    } catch (error) {
        console.error('Błąd w toggleAlerts:', error);
        alert('Wystąpił błąd w alertach. Sprawdź konsolę (F12).');
    }
}
// Funkcja wyświetlająca sekcję norm po wybraniu miasta
export function showNormsSection() {
    try {
        const normsSection = document.getElementById('norms-section');
        if (normsSection) {
            normsSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Błąd w showNormsSection:', error);
    }
}

// Funkcja obsługująca głosowanie
export function submitVote() {
    try {
        const selectedNorm = document.querySelector('input[name="norms"]:checked');
        if (!selectedNorm) {
            alert('Wybierz jedną opcję!');
            return;
        }

        // Pobierz aktualne głosy z localStorage
        let votes = JSON.parse(localStorage.getItem('normsVotes')) || {
            polish: 0,
            who: 0,
            eu: 0
        };

        // Zwiększ licznik dla wybranej normy
        votes[selectedNorm.value]++;
        localStorage.setItem('normsVotes', JSON.stringify(votes));
        console.log('Zapisano głos:', votes); // Debugowanie

        // Aktualizuj wyniki
        updateVoteResults();
    } catch (error) {
        console.error('Błąd w submitVote:', error);
        alert('Wystąpił błąd podczas głosowania. Sprawdź konsolę (F12).');
    }
}

// Funkcja aktualizująca wyniki głosowania
export function updateVoteResults() {
    try {
        const votes = JSON.parse(localStorage.getItem('normsVotes')) || {
            polish: 0,
            who: 0,
            eu: 0
        };
        const voteResults = document.getElementById('vote-results');
        if (voteResults) {
            voteResults.innerText = `Polskie: ${votes.polish} głosów, WHO: ${votes.who} głosów, EU: ${votes.eu} głosów`;
            console.log('Wyniki głosowania:', votes); // Debugowanie
        }
    } catch (error) {
        console.error('Błąd w updateVoteResults:', error);
    }
}

// Ustaw funkcje w globalnym zakresie
window.submitVote = submitVote;
window.updateVoteResults = updateVoteResults;

// Inicjalizacja wyników głosowania przy ładowaniu strony
document.addEventListener('DOMContentLoaded', updateVoteResults);

// Funkcja do pobierania maila wodociągów (placeholder – uzupełnij prawdziwe maile)
function getWaterUtilityEmail(city) {
    const emailMap = {
        'Łódź': 'kontakt@zwik.lodz.pl',
        'Bydgoszcz': 'kontakt@wodociagi.bydgoszcz.pl',
        'Toruń': 'kontakt@wodociagi.torun.pl',
        'Zielona Góra': 'kontakt@zwik.zgora.pl',
        'Grudziądz': 'kontakt@wodociagi.grudziadz.pl',
        // Dodaj inne miasta
    };
    return emailMap[city] || `kontakt@wodociagi-${city.toLowerCase()}.pl`; // Fallback
}


// ... (Twój istniejący kod main.js) ...

// Dodaj to na dole pliku, po wszystkich funkcjach
document.addEventListener('DOMContentLoaded', () => {
    const requestButton = document.getElementById('request-data-btn');
    if (requestButton) {
        console.log('Przycisk request-data-btn znaleziony'); // Debug
        requestButton.addEventListener('click', () => {
            console.log('Kliknięto przycisk request-data-btn'); // Debug
            const city = document.getElementById('city-premium').value;
            if (!city) {
                alert('Wpisz miasto, aby wysłać prośbę do wodociągów!');
                console.log('Brak miasta w city-premium'); // Debug
                return;
            }
            const missingParams = ['ołów', 'rtęć'];
            const email = getWaterUtilityEmail(city);
            const subject = 'Prośba o dodanie parametrów do raportów o jakości wody';
            const body = `Szanowni Państwo,\n\nJako mieszkaniec ${city} proszę o dodanie do publicznych raportów o jakości wody informacji o następujących parametrach: ${missingParams.join(', ')}.\n\nZ poważaniem,\n[Twoje imię]`;
            console.log('Mail:', email, 'Temat:', subject, 'Treść:', body); // Debug
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    } else {
        console.error('Przycisk request-data-btn nie znaleziony'); // Debug
    }
});