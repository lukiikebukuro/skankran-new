/* globals L, gtag */

// Import wszystkich modułów
import { checkWater, findWaterStation, displayHistory, waterStations, showAllSUW } from '/static/js/waterAnalysis.js';
import { startAquaBot } from '/static/js/aquaBot.js';
import { generateRanking, generateSUWRanking, generateDistrictRanking } from '/static/js/ranking.js';
// --- POPRAWKA: Importujemy kluczową funkcję z utils2.js ---
import { suggestCities } from '/static/js/utils2.js';

window.waterStations = waterStations;
window.map = null;

// --- GŁÓWNA FUNKCJA NAWIGACYJNA ---
function showSection(sectionId, shouldScroll = true) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        if (sectionId === 'find-stations' && window.map) {
            setTimeout(() => window.map.invalidateSize(), 10);
        }
        if (sectionId === 'aqua-bot') {
            startAquaBot('skin');
        }
        if (shouldScroll) {
            setTimeout(() => {
                selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200); // Delay to allow animations to complete
        }
    }
}
window.showSection = showSection;

window.toggleHamburgerMenu = function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    hamburgerMenu.style.display = hamburgerMenu.style.display === 'none' ? 'block' : 'none';
};

// --- GŁÓWNY BLOK STARTOWY APLIKACJI ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja mapy i sekcji bez zmian
    if (document.getElementById('map')) {
        window.map = L.map('map').setView([52.2297, 21.0122], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(window.map);
    }
    const initialSection = document.getElementById('check-tapwater');
    if(initialSection) {
        initialSection.classList.add('active');
    }

    // Podpięcie przycisków nawigacyjnych
    document.getElementById('check-tapwater-btn').addEventListener('click', () => showSection('check-tapwater'));
    document.getElementById('find-stations-btn').addEventListener('click', () => showSection('find-stations'));
    document.getElementById('rankings-btn').addEventListener('click', () => showSection('rankings'));
    document.getElementById('bottled-water-btn')?.addEventListener('click', () => showSection('bottled-water'));
    document.getElementById('about-btn').addEventListener('click', () => showSection('about'));
    document.getElementById('community-btn').addEventListener('click', () => showSection('community'));
    document.getElementById('aqua-bot-btn').addEventListener('click', () => showSection('aqua-bot'));

    // Podpięcie przycisków funkcyjnych
    document.getElementById('check-kranowka-btn')?.addEventListener('click', () => checkWater('city'));
    document.getElementById('find-station-btn')?.addEventListener('click', findWaterStation);
    document.getElementById('show-suw-btn')?.addEventListener('click', showAllSUW);
    document.getElementById('show-history-btn')?.addEventListener('click', displayHistory);

    document.getElementById('generate-city-ranking')?.addEventListener('click', () => {
        const param = document.getElementById('cityRankingParameter').value;
        generateRanking(param);
    });
    document.getElementById('generate-suw-ranking')?.addEventListener('click', () => {
        const city = document.getElementById('city-for-suw').value;
        const param = document.getElementById('suwRankingParameter').value;
        generateSUWRanking(city, param);
    });
    document.getElementById('generate-district-ranking')?.addEventListener('click', () => {
        const city = document.getElementById('city-for-suw').value;
        const param = document.getElementById('suwRankingParameter').value;
        generateDistrictRanking(city, param);
    });

    // Logika przycisków rankingów bez zmian
    const tapWaterBtn = document.getElementById('tap-water-btn');
    const bottledWaterBtn = document.getElementById('bottled-water-btn');
    if (tapWaterBtn && bottledWaterBtn) {
        // ... (twoja logika przełączania rankingów)
    }

    // --- POPRAWKA AUTOUZUPEŁNIANIA ---
    // Podpinamy event listenery do pól input, które wywołują funkcję z utils.js
    document.getElementById('city')?.addEventListener('input', (e) => suggestCities(e.target.value, 'city'));
    document.getElementById('city-premium')?.addEventListener('input', (e) => suggestCities(e.target.value, 'city-premium'));
    document.getElementById('city-for-suw')?.addEventListener('input', (e) => suggestCities(e.target.value, 'city-for-suw'));
});

// === TOGGLE LEGENDY ===
document.addEventListener('DOMContentLoaded', () => {
    const legendToggle = document.getElementById('legend-toggle');
    const legend = document.getElementById('legend');

    if (legendToggle && legend) {
        legendToggle.addEventListener('click', () => {
            const isVisible = legend.style.display === 'block';

            if (isVisible) {
                legend.style.display = 'none';
                legendToggle.classList.remove('active');
            } else {
                legend.style.display = 'block';
                legendToggle.classList.add('active');
            }
        });
    }
});