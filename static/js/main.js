import { setUsername, fetchUserStats, togglePremium, logout, suggestCities, suggestBottles } from './utils.js';
import { fetchPosts, addPost, addComment, togglePostComments, markPostAsSolved } from './community.js';
import { generateRanking, generateSUWRanking, displayUserRankings, submitUserRating, generateBottleRanking, displayUserBottleRankings } from './ranking.js';
import { checkWater, findWaterStation, showAllStations, displayHistory, waterStations, showAllSUW, showAllMeasurementPoints } from './waterAnalysis.js';
import { toggleQuiz, checkQuizSkin, checkQuizWellbeing } from './quiz.js';
import { startAquaBot } from './aquaBot.js';

export let currentUser = localStorage.getItem('username') || null;
export let remindersActive = false;
export let reminderInterval = null;
export let alertsActive = false;
export let alertCity = '';
export let lastCheckedData = {};

window.onload = function() {
    try {
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
        let localMap = null;
        if (mapElement && typeof L !== 'undefined') {
            try {
                localMap = L.map('map');
                localMap.setView([50.2975, 18.9496], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(localMap);
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
        displayUserRankings(); // Domyślnie pokazujemy wszystkie rankingi

        // Logowanie i przypisywanie event listenerów
        const elements = {
            'city': document.getElementById('city'),
            'check-kranowka-btn': document.getElementById('check-kranowka-btn'),
            'city-premium': document.getElementById('city-premium'),
            'find-station-btn': document.getElementById('find-station-btn'),
            'show-suw-btn': document.getElementById('show-suw-btn'),
            'show-points-btn': document.getElementById('show-points-btn'),
            'show-history-btn': document.getElementById('show-history-btn'),
            'ranking-miast-btn': document.getElementById('ranking-miast-btn'),
            'ranking-suw-btn': document.getElementById('ranking-suw-btn'),
            'bottle': document.getElementById('bottle'),
            'check-butelkowana-btn': document.getElementById('check-butelkowana-btn'),
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
            'bottleRankingParameter': document.getElementById('bottleRankingParameter'),
            'ranking-bottles-btn': document.getElementById('ranking-bottles-btn'),
            'show-user-rankings-btn': document.getElementById('show-user-rankings-btn'),
            'community-nav-btn': document.getElementById('community-nav-btn')
        };
        for (const [id, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element o ID '${id}' nie został znaleziony`);
            }
        }

        if (elements['city']) elements['city'].addEventListener('keyup', (e) => suggestCities(e.target.value));
        if (elements['check-kranowka-btn']) elements['check-kranowka-btn'].addEventListener('click', () => checkWater('city'));
        if (elements['city-premium']) elements['city-premium'].addEventListener('keyup', (e) => suggestCities(e.target.value, 'city-premium'));
        if (elements['find-station-btn']) elements['find-station-btn'].addEventListener('click', findWaterStation);
        if (elements['show-suw-btn']) elements['show-suw-btn'].addEventListener('click', showAllSUW);
        if (elements['show-points-btn']) elements['show-points-btn'].addEventListener('click', showAllMeasurementPoints);
        if (elements['show-history-btn']) elements['show-history-btn'].addEventListener('click', () => displayHistory(document.getElementById('city-premium').value));
        if (elements['ranking-miast-btn']) elements['ranking-miast-btn'].addEventListener('click', () => generateRanking(document.getElementById('rankingParameter').value));
        if (elements['ranking-suw-btn']) elements['ranking-suw-btn'].addEventListener('click', () => generateSUWRanking(document.getElementById('city-premium').value, document.getElementById('rankingParameter').value));
        if (elements['bottle']) elements['bottle'].addEventListener('keyup', (e) => suggestBottles(e.target.value));
        if (elements['check-butelkowana-btn']) elements['check-butelkowana-btn'].addEventListener('click', () => checkWater('bottle'));
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
        if (elements['toggle-reminders']) elements['toggle-reminders'].addEventListener('click', toggleReminders);
        if (elements['alert-city']) elements['alert-city'].addEventListener('keyup', (e) => suggestCities(e.target.value, 'alert-city'));
        if (elements['toggle-alerts']) elements['toggle-alerts'].addEventListener('click', toggleAlerts);
        if (elements['bottleRankingParameter']) elements['bottleRankingParameter'].addEventListener('change', () => {
            generateBottleRanking(document.getElementById('bottleRankingParameter').value);
        });
        if (elements['ranking-bottles-btn']) elements['ranking-bottles-btn'].addEventListener('click', () => {
            generateBottleRanking(document.getElementById('bottleRankingParameter').value);
        });
        if (elements['show-user-rankings-btn']) elements['show-user-rankings-btn'].addEventListener('click', () => {
            const filterType = document.getElementById('user-ranking-type').value;
            displayUserRankings(filterType);
        });
        if (elements['community-nav-btn']) elements['community-nav-btn'].addEventListener('click', () => {
            const communitySection = document.getElementById('community-section');
            communitySection.style.display = 'block';
            communitySection.scrollIntoView({ behavior: 'smooth' });
        });

        // Wczytaj ustawienia przypomnień
        if (localStorage.getItem('remindersActive') === 'true') {
            const frequency = localStorage.getItem('reminderFrequency');
            if (frequency) {
                document.getElementById('reminder-frequency').value = frequency;
                toggleReminders();
            }
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

export function toggleReminders() {
    try {
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (!isPremium) {
            alert('Funkcja dostępna tylko dla użytkowników Premium! Przejdź na Premium za 9,99 zł/mc na https://x.ai/grok.');
            return;
        }
        const frequency = parseInt(document.getElementById('reminder-frequency').value) * 60 * 60 * 1000;
        const statusDiv = document.getElementById('reminder-status');
        const toggleButton = document.getElementById('toggle-reminders');

        if (!remindersActive) {
            reminderInterval = setInterval(() => {
                alert('Czas na szklankę wody! 💧');
            }, frequency);
            remindersActive = true;
            toggleButton.textContent = 'Wyłącz przypomnienia';
            statusDiv.textContent = `Przypomnienia włączone: co ${frequency / (60 * 60 * 1000)}h`;
            localStorage.setItem('remindersActive', 'true');
            localStorage.setItem('reminderFrequency', frequency / (60 * 60 * 1000));
        } else {
            clearInterval(reminderInterval);
            remindersActive = false;
            toggleButton.textContent = 'Włącz przypomnienia';
            statusDiv.textContent = 'Przypomnienia wyłączone';
            localStorage.setItem('remindersActive', 'false');
            localStorage.removeItem('reminderFrequency');
        }
    } catch (error) {
        console.error('Błąd w toggleReminders:', error);
        alert('Wystąpił błąd w przypomnieniach. Sprawdź konsolę (F12).');
    }
}

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
