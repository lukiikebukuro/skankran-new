import { waterStations, bottleData } from './waterAnalysis.js';
import { getColor } from './utils.js';
import { currentUser } from './main.js';

export let userRatings = [
    { waterType: "kranowa", waterName: "Koszalin", rating: 4, username: "WodnyFan", timestamp: "2025-04-22 10:00:00" },
    { waterType: "butelkowana", waterName: "Nałęczowianka", rating: 5, username: "AquaManiak", timestamp: "2025-04-22 10:05:00" },
    { waterType: "kranowa", waterName: "Olsztyn", rating: 3, username: "WodnyFan", timestamp: "2025-04-23 09:00:00" }
];

export function generateRanking(parameter = "twardosc") {
    try {
        const rankingsDiv = document.getElementById('rankings2');
        if (!rankingsDiv) {
            console.error('Brak elementu #rankings2');
            return;
        }

        function parseValue(value) {
            if (typeof value === 'string') {
                if (value.startsWith('<')) {
                    return parseFloat(value.replace('<', '')) || 0;
                }
                return parseFloat(value) || 0;
            }
            return parseFloat(value) || 0;
        }

        const ranking = Object.keys(waterStations)
            .map(city => ({
                city,
                value: parseValue(waterStations[city].average?.[parameter])
            }))
            .filter(item => !isNaN(item.value) && item.value !== 0);

        if (!waterStations["Wałbrzych"]?.average?.[parameter] || parseValue(waterStations["Wałbrzych"]?.average?.[parameter]) === 0) {
            const rankingInfo = document.getElementById('ranking-info');
            if (rankingInfo) {
                rankingInfo.innerHTML = '<p>Wałbrzych odmówił podania danych, więc nie jest uwzględniony w rankingu.</p>';
            }
        }

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value; // Sortowanie rosnąco (najniższe wartości na górze)
        });

        let result = `<h3>Ranking miast (${parameter})</h3>`;
        result += `<h4>5 najlepszych (najniższe wartości):</h4><ol>`;
        ranking.slice(0, 5).forEach((item, index) => {
            const unit = ['twardosc', 'azotany', 'zelazo', 'mangan', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : '';
            let drop = '';
            if (index === 0) {
                drop = `<img src="/static/assets/icons/goldendrop.svg" class="ranking-drop">`;
            } else if (index === 1) {
                drop = `<img src="/static/assets/icons/silverdrop.svg" class="ranking-drop">`;
            } else if (index === 2) {
                drop = `<img src="/static/assets/icons/bronzedrop.svg" class="ranking-drop">`;
            }
            result += `<li>${item.city}: ${item.value.toFixed(2)} ${unit} ${drop}</li>`;
        });
        result += "</ol><h4>5 najgorszych (najwyższe wartości):</h4><ol>";
        ranking.slice(-5).reverse().forEach((item, index) => {
            const unit = ['twardosc', 'azotany', 'zelazo', 'mangan', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : '';
            let warning = '';
            if (index === 0) {
                warning = '<span style="color: #FF0000;">💧</span> <span style="color: #FF0000;">– Za wysoka!</span>';
            } else if (index === 1) {
                warning = '<span style="color: #FF0000;">🚱</span> <span style="color: #FF0000;">– Za wysoka!</span>';
            } else if (index === 2) {
                warning = '<span style="color: #FF0000;">🔴</span> <span style="color: #FF0000;">– Za wysoka!</span>';
            } else if (index === 3) {
                warning = '<span style="color: #FF0000;">😕</span> <span style="color: #FF0000;">– Za wysoka!</span>';
            } else {
                warning = '<span style="color: #FF0000;">⚠️</span> <span style="color: #FF0000;">– Za wysoka!</span>';
            }
            result += `<li>${item.city}: ${item.value.toFixed(2)} ${unit} ${warning}</li>`;
        });
        result += "</ol>";

        rankingsDiv.innerHTML = result;
        console.log(`Ranking miast dla ${parameter}:`, ranking);
    } catch (error) {
        console.error('Błąd w generateRanking:', error);
        document.getElementById('rankings2').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
// Reszta kodu pozostaje bez zmian (generateSUWRanking, submitUserRating, itd.)
 
export function generateSUWRanking(city, parameter) {
    try {
        // Definicja parseValue
        function parseValue(value) {
            if (typeof value === 'string') {
                if (value.startsWith('<')) {
                    return parseFloat(value.replace('<', '')) || 0;
                } else if (value.includes('–')) {
                    const range = value.split('–').map(parseFloat);
                    return (range[0] + range[1]) / 2;
                } else if (value === 'Brak danych') {
                    return 0;
                }
                return parseFloat(value) || 0;
            }
            return parseFloat(value) || 0;
        }

        const rankingsDiv = document.getElementById('rankings2');
        if (!rankingsDiv) {
            console.error('Brak elementu #rankings2');
            return;
        }

        const stations = waterStations[city]?.stations || [];
        if (stations.length === 0) {
            rankingsDiv.innerHTML = `<h3>Brak danych dla ${city}</h3>`;
            return;
        }

        // Sprawdzenie, czy wszystkie SUW-y mają wartość 0 dla parametru
        let allZero = true;
        stations.forEach(station => {
            const value = parseValue(station.data[parameter]);
            if (value !== 0) allZero = false;
        });

        if (allZero) {
            let message = `Brak danych dla parametru ${parameter} w ${city}.`;
            if (parameter === 'chlor') {
                message += ` Prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane.`;
            }
            rankingsDiv.innerHTML = `<h3>Ranking SUW-ów w ${city} (${parameter})</h3><p>${message}</p>`;
            return;
        }

        // Tworzenie rankingu SUW-ów
        let ranking = stations.map(station => {
            let value = station.data[parameter];
            let parsedValue = parseValue(value);
            let note = '';
            if (parsedValue === 0) {
                note = parameter === 'chlor' 
                    ? 'Brak danych (prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane)' 
                    : `Brak danych dla ${parameter}`;
            }
            return { name: station.name, address: station.address, value: parsedValue, note };
        });

        // Sortowanie
        ranking.sort((a, b) => {
            if (parameter === 'pH') {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<h3>Ranking SUW-ów w ${city} (${parameter})</h3>`;
        result += `<p style="font-size: 0.9em; color: #666;">Uwaga: Ranking oparty na danych z SUW-ów. Skontaktuj się z wodociągami dla dokładniejszych informacji.</p>`;
        result += `<ol>`;
        ranking.forEach((item, index) => {
            const unit = ['twardosc', 'azotany', 'zelazo', 'mangan', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : '';
            const color = getColor(parameter, item.value);
            let warning = '';
            if (index === ranking.length - 1 && color === 'red') {
                warning = '<span style="color: #f44336;"> – Za wysoka wartość!</span>';
            } else if (index === 1 && color === 'orange') {
                warning = '<span style="color: #ff9800;"> – Rozważ filtr!</span>';
            }
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const displayValue = item.value === 0 ? item.note : `${item.value.toFixed(2)} ${unit}`;
            result += `<li>${item.name} (${item.address}): ${displayValue} <span class="dot ${color}"></span> ${warning} ${medal}</li>`;
        });
        result += `</ol>`;
        result += `<p class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</p>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateSUWRanking:', error);
        document.getElementById('rankings2').innerHTML = 'Wystąpił błąd – sprawdź konsolę (F12).';
    }
}

export function submitUserRating() {
    try {
        if (!currentUser) {
            alert('Proszę się zalogować!');
            return;
        }

        const waterType = document.getElementById('water-type').value;
        const waterName = document.getElementById('water-name').value.trim();
        const rating = parseInt(document.getElementById('water-rating').value);

        if (!waterName) {
            alert('Proszę wpisać nazwę wody!');
            return;
        }

        userRatings.push({
            waterType: waterType,
            waterName: waterName,
            rating: rating,
            username: currentUser,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });

        document.getElementById('water-name').value = '';
        displayUserRankings();
    } catch (error) {
        console.error('Błąd w submitUserRating:', error);
        alert('Wystąpił błąd – sprawdź konsolę (F12).');
    }
}

export function displayUserRankings(filterType = "wszystkie") {
    try {
        const rankingsDiv = document.getElementById('user-rankings');
        if (!rankingsDiv) return;

        let filteredRatings = userRatings;
        if (filterType === "kranowa") {
            filteredRatings = userRatings.filter(rating => rating.waterType === "kranowa");
        } else if (filterType === "butelkowana") {
            filteredRatings = userRatings.filter(rating => rating.waterType === "butelkowana");
        }

        const aggregatedRatings = {};
        filteredRatings.forEach(rating => {
            const key = `${rating.waterType}-${rating.waterName}`;
            if (!aggregatedRatings[key]) {
                aggregatedRatings[key] = {
                    waterType: rating.waterType,
                    waterName: rating.waterName,
                    ratings: [],
                    total: 0,
                    count: 0
                };
            }
            aggregatedRatings[key].ratings.push(rating);
            aggregatedRatings[key].total += rating.rating;
            aggregatedRatings[key].count += 1;
        });

        const rankedWaters = Object.values(aggregatedRatings).map(item => {
            const average = item.total / item.count;
            return {
                waterType: item.waterType,
                waterName: item.waterName,
                averageRating: average.toFixed(1),
                count: item.count
            };
        });
        rankedWaters.sort((a, b) => b.averageRating - a.averageRating);

        let result = `<h3>Ranking wód według użytkowników (${filterType === "kranowa" ? "Woda kranowa" : filterType === "butelkowana" ? "Woda butelkowana" : "Wszystkie wody"})</h3>`;
        result += `<ol>`;
        rankedWaters.forEach((item, index) => {
            let drop = '';
            if (index === 0) {
                drop = `<img src="/static/assets/icons/golden_drop.svg" class="ranking-drop">`;
            } else if (index === 1) {
                drop = `<img src="/static/assets/icons/silver_drop.svg" class="ranking-drop">`;
            } else if (index === 2) {
                drop = `<img src="/static/assets/icons/bronze_drop.svg" class="ranking-drop">`;
            }
            result += `
                <li class="user-ranking-item">
                    ${item.waterType === 'kranowa' ? 'Kranówka' : 'Butelkowana'} – ${item.waterName}: 
                    <span class="rating">${item.averageRating} / 5</span> 
                    (${item.count} ocen) ${drop}
                </li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w displayUserRankings:', error);
        document.getElementById('user-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function generateBottleRanking(parameter = "wapn") {
    try {
        const rankingsDiv = document.getElementById('bottle-rankings');
        if (!rankingsDiv) {
            console.error('Brak elementu #bottle-rankings');
            return;
        }

        let ranking = Object.keys(bottleData).map(bottle => ({
            bottle,
            value: parseFloat(bottleData[bottle][parameter].value)
        }));

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            } else if (parameter === "sod" || parameter === "fluorki") {
                return a.value - b.value;
            }
            return b.value - a.value;
        });

        let result = `<h3>Ranking wód butelkowanych (${parameter})</h3>`;
        result += `<h4>Top wód:</h4><ol>`;
        ranking.forEach((item, index) => {
            let medal = '';
            if (index === 0) {
                medal = '🥇';
            } else if (index === 1) {
                medal = '🥈';
            } else if (index === 2) {
                medal = '🥉';
            }
            result += `<li>${item.bottle}: ${item.value} ${parameter === "wapn" || parameter === "magnez" || parameter === "sod" || parameter === "potas" || parameter === "fluorki" ? "mg/l" : ""} <span class="dot ${bottleData[item.bottle][parameter].color}"></span> ${medal}</li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateBottleRanking:', error);
        document.getElementById('bottle-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function displayUserBottleRankings() {
    try {
        const rankingsDiv = document.getElementById('user-rankings');
        if (!rankingsDiv) return;

        const bottleRatings = userRatings.filter(rating => rating.waterType === "butelkowana");
        const aggregatedRatings = {};
        bottleRatings.forEach(rating => {
            const key = `${rating.waterType}-${rating.waterName}`;
            if (!aggregatedRatings[key]) {
                aggregatedRatings[key] = {
                    waterType: rating.waterType,
                    waterName: rating.waterName,
                    ratings: [],
                    total: 0,
                    count: 0
                };
            }
            aggregatedRatings[key].ratings.push(rating);
            aggregatedRatings[key].total += rating.rating;
            aggregatedRatings[key].count += 1;
        });

        const rankedWaters = Object.values(aggregatedRatings).map(item => {
            const average = item.total / item.count;
            return {
                waterType: item.waterType,
                waterName: item.waterName,
                averageRating: average.toFixed(1),
                count: item.count
            };
        });
        rankedWaters.sort((a, b) => b.averageRating - a.averageRating);

        let result = `<h3>Ranking wód butelkowanych według użytkowników</h3>`;
        result += `<ol>`;
        rankedWaters.forEach((item, index) => {
            let drop = '';
            if (index === 0) {
                drop = `<img src="/static/assets/icons/golden_drop.svg" class="ranking-drop">`;
            } else if (index === 1) {
                drop = `<img src="/static/assets/icons/silver_drop.svg" class="ranking-drop">`;
            } else if (index === 2) {
                drop = `<img src="/static/assets/icons/bronze_drop.svg" class="ranking-drop">`;
            }
            result += `
                <li class="user-ranking-item">
                    ${item.waterName}: 
                    <span class="rating">${item.averageRating} / 5</span> 
                    (${item.count} ocen) ${drop}
                </li>`;
        });
        result += `</ol>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w displayUserBottleRankings:', error);
        document.getElementById('user-rankings').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
export function generateDistrictRanking(city, parameter) {
    try {
        // Definicja parseValue
        function parseValue(value) {
            if (typeof value === 'string') {
                if (value.startsWith('<')) {
                    return parseFloat(value.replace('<', '')) || 0;
                } else if (value.includes('–')) {
                    const range = value.split('–').map(parseFloat);
                    return (range[0] + range[1]) / 2;
                } else if (value === 'Brak danych') {
                    return 0;
                }
                return parseFloat(value) || 0;
            }
            return parseFloat(value) || 0;
        }

        const rankingsDiv = document.getElementById('rankings2');
        if (!rankingsDiv) {
            console.error('Brak elementu #rankings2');
            return;
        }

        const zones = waterStations[city]?.zones || {};
        const stations = waterStations[city]?.stations || [];
        if (Object.keys(zones).length === 0 || stations.length === 0) {
            rankingsDiv.innerHTML = `<h3>Brak danych dla ${city}</h3>`;
            return;
        }

        // Sprawdzenie, czy miasto ma tylko jeden SUW
        if (stations.length === 1) {
            rankingsDiv.innerHTML = `<h3>Ranking dzielnic w ${city}</h3><p>To miasto ma tylko jeden SUW (${stations[0].name}), więc ranking dzielnic nie jest dostępny.</p>`;
            return;
        }

        // Mapowanie SUW-ów na ich dane
        const stationData = {};
        let allZero = true; // Flaga dla zerowych wartości
        stations.forEach(station => {
            const value = parseValue(station.data[parameter]);
            stationData[station.name] = value;
            if (value !== 0) allZero = false; // Jeśli jest niezerowa wartość, ustaw flagę na false
        });

        // Sprawdzenie, czy wszystkie SUW-y mają wartość 0 dla parametru
        if (allZero) {
            let message = `Brak danych dla parametru ${parameter} w ${city}.`;
            if (parameter === 'chlor') {
                message += ` Prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane.`;
            }
            rankingsDiv.innerHTML = `<h3>Ranking dzielnic w ${city} (${parameter})</h3><p>${message}</p>`;
            return;
        }

        // Tworzenie rankingu dzielnic
        let ranking = Object.keys(zones).map(district => {
            const suw = zones[district];
            let value;
            let note = '';
            if (typeof suw === 'string') {
                value = stationData[suw] || 0;
                if (value === 0) {
                    note = parameter === 'chlor' 
                        ? 'Brak danych (prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane)' 
                        : `Brak danych dla ${parameter}`;
                }
            } else if (Array.isArray(suw)) {
                const values = suw.map(s => stationData[s] || 0);
                value = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
                if (value === 0) {
                    note = parameter === 'chlor' 
                        ? 'Brak danych (prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane)' 
                        : `Brak danych dla ${parameter}`;
                }
            } else {
                value = 0;
                note = `Brak danych dla ${parameter}`;
            }
            return { district, value, note };
        });

        // Sortowanie
        ranking.sort((a, b) => {
            if (parameter === 'pH') {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<h3>Ranking dzielnic w ${city} (${parameter})</h3>`;
        result += `<p style="font-size: 0.9em; color: #666;">Uwaga: Ranking oparty na danych z głównych SUW-ów przypisanych do dzielnic. Woda może pochodzić z kilku SUW-ów – wartości są przybliżone.</p>`;
        result += `<ol>`;
        ranking.forEach((item, index) => {
            const unit = ['twardosc', 'azotany', 'zelazo', 'mangan', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : '';
            const color = getColor(parameter, item.value);
            let warning = '';
            if (index === ranking.length - 1 && color === 'red') {
                warning = '<span style="color: #f44336;"> – Za wysoka wartość!</span>';
            } else if (index === 1 && color === 'orange') {
                warning = '<span style="color: #ff9800;"> – Rozważ filtr!</span>';
            }
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const displayValue = item.value === 0 ? item.note : `${item.value.toFixed(2)} ${unit}`;
            result += `<li>${item.district}: ${displayValue} <span class="dot ${color}"></span> ${warning} ${medal}</li>`;
        });
        result += `</ol>`;
        result += `<p class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</p>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateDistrictRanking:', error);
        document.getElementById('rankings2').innerHTML = 'Wystąpił błąd – sprawdź konsolę (F12).';
    }
}
