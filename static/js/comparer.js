import { waterStations } from './waterAnalysis.js';
import { getColor, getParameterDescription, getSelectedParameters, getPremiumParameters, suggestCities } from './utils.js';

// Autouzupełnianie dla city1 i city2
document.getElementById('city1').addEventListener('input', () => suggestCities(document.getElementById('city1').value, 'city1'));
document.getElementById('city2').addEventListener('input', () => suggestCities(document.getElementById('city2').value, 'city2'));

// Funkcja selectCity dla sugestii (klik wybiera)
function selectCity(city, inputId) {
    document.getElementById(inputId).value = city;
    document.getElementById(inputId + '-suggestions').innerHTML = '';
    document.getElementById(inputId + '-suggestions').classList.remove('visible'); // Ukryj po wyborze
}

document.getElementById('compare-btn').addEventListener('click', () => {
    let city1 = document.getElementById('city1').value.trim().toLowerCase();
    let city2 = document.getElementById('city2').value.trim().toLowerCase();
    const resultDiv = document.getElementById('compare-result');

    // Match insensitive: Znajdź klucz ignorując case
    const findCityKey = (input) => Object.keys(waterStations).find(key => key.toLowerCase() === input);
    city1 = findCityKey(city1);
    city2 = findCityKey(city2);

    if (!city1 || !city2) {
        resultDiv.innerHTML = '<p>Wpisz poprawne miasta!</p>';
        return;
    }

    const data1 = waterStations[city1].average;
    const data2 = waterStations[city2].average;

    const dummy = {};
    const basic = getSelectedParameters(dummy).map(p => p.name);
    const premium = getPremiumParameters(dummy).map(p => p.name);
    const params = [...basic, ...premium];

    let html = `<div class="compare-columns" style="display: flex; gap: 10px;">`;
    html += `<div class="city-left" style="flex: 1;"><h3>${city1.toUpperCase()}</h3>`;
    let middleHtml = `<div class="compare-middle" style="flex: 0.5; text-align: center;"><h3>Zwycięzca</h3>`; // Środkowa kolumna

    params.forEach(param => {
        let val1 = parseFloat(data1[param]);
        let displayVal1 = (isNaN(val1) || val1 === 0) ? 'Brak danych' : val1.toFixed(2);
        let color1 = (isNaN(val1) || val1 === 0) ? 'grey-dot' : getColor(param, val1);
        let desc1 = getParameterDescription(param, val1, color1);
        html += `<div class="parameter"><span class="dot ${color1}"></span> ${param.toUpperCase()}: ${displayVal1} – ${desc1}</div>`;

        let val2 = parseFloat(data2[param]);
        let displayVal2 = (isNaN(val2) || val2 === 0) ? 'Brak danych' : val2.toFixed(2);
        let color2 = (isNaN(val2) || val2 === 0) ? 'grey-dot' : getColor(param, val2);

        // Logika zwycięzcy: niższy=lepszy (oprócz pH bliżej 7); brak=szary komunikat
        let winnerText = `${param.toUpperCase()}: `;
        let winnerClass = 'grey-winner'; // Domyślny szary
        if (isNaN(val1) || isNaN(val2) || val1 === 0 || val2 === 0) {
            winnerText += 'Brak porównania – dane niepełne';
        } else if (param === 'pH') {
            const diff1 = Math.abs(val1 - 7);
            const diff2 = Math.abs(val2 - 7);
            if (diff1 < diff2) {
                winnerText += `Lepsze w ${city1.toUpperCase()} (vs ${city2.toUpperCase()})`;
                winnerClass = 'darkgreen-winner';
            } else if (diff1 > diff2) {
                winnerText += `Lepsze w ${city2.toUpperCase()} (vs ${city1.toUpperCase()})`;
                winnerClass = 'darkorange-winner';
            } else {
                winnerText += 'Remis';
            }
        } else {
            if (val1 < val2) {
                winnerText += `Lepsze w ${city1.toUpperCase()} (vs ${city2.toUpperCase()})`;
                winnerClass = 'darkgreen-winner';
            } else if (val1 > val2) {
                winnerText += `Lepsze w ${city2.toUpperCase()} (vs ${city1.toUpperCase()})`;
                winnerClass = 'darkorange-winner';
            } else {
                winnerText += 'Remis';
            }
        }
        middleHtml += `<div class="parameter ${winnerClass}">${winnerText}</div>`;
    });
    html += `</div>${middleHtml}</div>`; // Dodaj środkową
    html += `<div class="city-right" style="flex: 1;"><h3>${city2.toUpperCase()}</h3>`;
    params.forEach(param => {
        let val2 = parseFloat(data2[param]);
        let displayVal2 = (isNaN(val2) || val2 === 0) ? 'Brak danych' : val2.toFixed(2);
        let color2 = (isNaN(val2) || val2 === 0) ? 'grey-dot' : getColor(param, val2);
        let desc2 = getParameterDescription(param, val2, color2);
        html += `<div class="parameter"><span class="dot ${color2}"></span> ${param.toUpperCase()}: ${displayVal2} – ${desc2}</div>`;
    });
    html += '</div></div>';
    resultDiv.innerHTML = html;
});