import { waterStations } from './waterAnalysis.js';
import { getColor } from './utils2.js';
// Na samej górze pliku, obok innych importów:
import { trackRankingGeneration } from './analytics.js';

export async function generateRanking(parameter = "twardosc") {
    try {
        // --- NOWY MELDUNEK WYWIADOWCZY ---
        trackRankingGeneration('city', parameter);
        // ------------------------------------

        const rankingsDiv = document.getElementById('city-ranking');
        if (!rankingsDiv) {
            console.error('Brak elementu #city-ranking');
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

        // 🚀 POSTGRESQL API FETCH (Single Source of Truth)
        let citiesData = {};
        let dataSource = 'postgresql';

        try {
            const response = await fetch('/api/city-averages');
            const result = await response.json();

            if (result.success && result.data) {
                citiesData = result.data; // { "City1": { pH, twardosc, ... }, "City2": {...} }
                dataSource = result.source || 'postgresql';
                console.log(`✅ Loaded rankings from ${dataSource}`, Object.keys(citiesData).length + ' cities');
            } else {
                throw new Error('API returned no data');
            }
        } catch (apiError) {
            // ⚠️ FALLBACK: Use hardcoded waterStations if API fails
            console.warn(`⚠️ PostgreSQL unavailable, using stale hardcoded data for rankings:`, apiError.message);
            citiesData = Object.fromEntries(
                Object.entries(waterStations).map(([city, data]) => [city, data.average])
            );
            dataSource = 'hardcoded-json-fallback';
        }

        const totalCities = 35; // Zakładamy 35 miast
        const ranking = Object.keys(citiesData)
            .map(city => ({
                city,
                value: parseValue(citiesData[city]?.[parameter])
            }))
            .filter(item => !isNaN(item.value) && item.value !== 0);

        const citiesWithData = ranking.length;
        const citiesWithoutData = totalCities - citiesWithData;

        ranking.sort((a, b) => {
            if (parameter === "pH") {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<div class="ranking-header">
            <img src="/static/assets/icons/ranking_icon.svg" alt="Ranking">
            <h3>Ranking miast (${parameter})</h3>
        </div>`;

        if (dataSource === 'hardcoded-json-fallback') {
            result += `<div class="note" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 8px; margin-bottom: 10px;">⚠️ Wyświetlam dane archiwalne (baza niedostępna)</div>`;
        }

        result += `<p>Ranking dla ${citiesWithData}/${totalCities} miast – brak danych dla ${citiesWithoutData} miast.</p>`;
        result += `<h4>5 najlepszych (najniższe wartości):</h4><ol>`;
        ranking.slice(0, 5).forEach((item, index) => {
            const unit = parameter === 'twardosc' ? 'mg CaCO₃/L' : (parameter === 'mangan' ? 'µg/l' : (['azotany', 'zelazo', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : ''));
            const color = getColor(parameter, item.value);
            let drop = '';
            if (index === 0) {
                drop = `<img src="/static/assets/icons/goldendrop.svg" class="ranking-drop">`;
            } else if (index === 1) {
                drop = `<img src="/static/assets/icons/silverdrop.svg" class="ranking-drop">`;
            } else if (index === 2) {
                drop = `<img src="/static/assets/icons/bronzedrop.svg" class="ranking-drop">`;
            }
            result += `<li>
                <span class="ranking-number">${index + 1}.</span>
                <span class="ranking-item-name">${item.city}</span>
                <span class="ranking-item-value">${item.value.toFixed(2)} ${unit}</span>
                <span class="ranking-item-status">
                    <span class="dot ${color}"></span>
                    ${drop}
                </span>
            </li>`;
        });
        result += "</ol><h4>5 najgorszych (najwyższe wartości):</h4><ol>";
        ranking.slice(-5).reverse().forEach((item, index) => {
            const unit = parameter === 'twardosc' ? 'mg CaCO₃/L' : (parameter === 'mangan' ? 'µg/l' : (['azotany', 'zelazo', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : ''));
            const color = getColor(parameter, item.value);
            const displayIndex = ranking.length - 4 + index;
            result += `<li>
                <span class="ranking-number">${displayIndex}.</span>
                <span class="ranking-item-name">${item.city}</span>
                <span class="ranking-item-value">${item.value.toFixed(2)} ${unit}</span>
                <span class="ranking-item-status">
                    <span class="dot ${color}"></span>
                </span>
            </li>`;
        });
        result += "</ol>";

        rankingsDiv.innerHTML = result;
        console.log(`Ranking miast dla ${parameter}:`, ranking);
    } catch (error) {
        console.error('Błąd w generateRanking:', error);
        document.getElementById('city-ranking').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export async function generateSUWRanking(city, parameter) {
    try {
        // --- NOWY MELDUNEK WYWIADOWCZY ---
        trackRankingGeneration('suw', parameter);
        // ------------------------------------

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

        const rankingsDiv = document.getElementById('suw-ranking');
        if (!rankingsDiv) {
            console.error('Brak elementu #suw-ranking');
            return;
        }

        // 🚀 FETCH FROM POSTGRESQL API
        let stations = [];
        let dataSource = 'postgresql';

        try {
            const response = await fetch(`/api/water-data/${encodeURIComponent(city)}`);
            const result = await response.json();

            if (result.success && result.data && result.data.stations) {
                stations = result.data.stations;
                dataSource = result.source || 'postgresql';
                console.log(`✅ Loaded ${city} SUW data from ${dataSource}`, stations.length + ' stations');
            } else {
                throw new Error('API returned no station data');
            }
        } catch (apiError) {
            // ⚠️ FALLBACK: Use hardcoded waterStations
            console.warn(`⚠️ PostgreSQL unavailable for ${city} SUWs, using stale data:`, apiError.message);
            stations = waterStations[city]?.stations || [];
            dataSource = 'hardcoded-json-fallback';
        }

        if (stations.length === 0) {
            rankingsDiv.innerHTML = `<h3>Brak danych dla ${city}</h3>`;
            return;
        }

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

        let ranking = stations.map(station => {
            let value = station.data[parameter];
            let parsedValue = parseValue(value);
            let note = '';
            if (parsedValue === 0 || value === "Brak danych") {
                note = parameter === 'chlor'
                    ? 'Brak danych (prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane)'
                    : `Brak danych dla ${parameter}`;
            }
            return { name: station.name, address: station.address, value: parsedValue, note };
        });

        ranking.sort((a, b) => {
            if (parameter === 'pH') {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<div class="ranking-header">
            <img src="/static/assets/icons/ranking_icon.svg" alt="Ranking">
            <h3>Ranking SUW-ów w ${city} (${parameter})</h3>
        </div>`;

        if (dataSource === 'hardcoded-json-fallback') {
            result += `<div class="note" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 8px; margin-bottom: 10px;">⚠️ Wyświetlam dane archiwalne (baza niedostępna)</div>`;
        }

        result += `<p style="font-size: 0.9em; color: #666;">Uwaga: Ranking oparty na danych z SUW-ów. Skontaktuj się z wodociągami dla dokładniejszych informacji.</p>`;
        result += `<ol>`;
        ranking.forEach((item, index) => {
            const unit = parameter === 'twardosc' ? 'mg CaCO₃/L' : (parameter === 'mangan' ? 'µg/l' : (['azotany', 'zelazo', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : ''));
            const color = getColor(parameter, item.value);
            let warning = '';
            if (index === ranking.length - 1 && color === 'red') {
                warning = '<span style="color: #f44336; font-size: 0.85em;"> – Za wysoka wartość!</span>';
            } else if (index === 1 && color === 'orange') {
                warning = '<span style="color: #ff9800; font-size: 0.85em;"> – Rozważ filtr!</span>';
            }
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const displayValue = (item.value === 0 || item.note) ? item.note : `${item.value.toFixed(2)} ${unit}`;
            result += `<li>
                <span class="ranking-number">${index + 1}.</span>
                <div style="flex: 1;">
                    <span class="ranking-item-name">${item.name}</span>
                    <div class="ranking-item-value">${item.address}</div>
                </div>
                <span class="ranking-item-value">${displayValue}${warning}</span>
                <span class="ranking-item-status">
                    <span class="dot ${color}"></span>
                    <span style="font-size: 24px;">${medal}</span>
                </span>
            </li>`;
        });
        result += `</ol>`;
        result += `<p class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</p>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateSUWRanking:', error);
        document.getElementById('suw-ranking').innerHTML = 'Wystąpił błąd – sprawdź konsolę (F12).';
    }
}

export async function generateDistrictRanking(city, parameter) {
    try {
        // --- NOWY MELDUNEK WYWIADOWCZY ---
        trackRankingGeneration('district', parameter);
        // ------------------------------------

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

        const rankingsDiv = document.getElementById('district-ranking');
        if (!rankingsDiv) {
            console.error('Brak elementu #district-ranking');
            return;
        }

        // 🚀 FETCH FROM POSTGRESQL API
        let zones = {};
        let stations = [];
        let dataSource = 'postgresql';

        try {
            const response = await fetch(`/api/water-data/${encodeURIComponent(city)}`);
            const result = await response.json();

            if (result.success && result.data) {
                stations = result.data.stations || [];
                zones = result.data.zones || {};
                dataSource = result.source || 'postgresql';
                console.log(`✅ Loaded ${city} district data from ${dataSource}`, Object.keys(zones).length + ' zones');
            } else {
                throw new Error('API returned no data');
            }
        } catch (apiError) {
            // ⚠️ FALLBACK: Use hardcoded waterStations
            console.warn(`⚠️ PostgreSQL unavailable for ${city} districts, using stale data:`, apiError.message);
            zones = waterStations[city]?.zones || {};
            stations = waterStations[city]?.stations || [];
            dataSource = 'hardcoded-json-fallback';
        }

        if (Object.keys(zones).length === 0 || stations.length === 0) {
            rankingsDiv.innerHTML = `<h3>Brak danych dla ${city}</h3>`;
            return;
        }

        if (stations.length === 1) {
            rankingsDiv.innerHTML = `<h3>Ranking dzielnic w ${city}</h3><p>To miasto ma tylko jeden SUW (${stations[0].name}), więc ranking dzielnic nie jest dostępny.</p>`;
            return;
        }

        const stationData = {};
        let allZero = true;
        stations.forEach(station => {
            const value = parseValue(station.data[parameter]);
            stationData[station.name] = value;
            if (value !== 0) allZero = false;
        });

        if (allZero) {
            let message = `Brak danych dla parametru ${parameter} w ${city}.`;
            if (parameter === 'chlor') {
                message += ` Prawdopodobnie woda nie jest chlorowana, ale możliwe, że dane nie zostały podane.`;
            }
            rankingsDiv.innerHTML = `<h3>Ranking dzielnic w ${city} (${parameter})</h3><p>${message}</p>`;
            return;
        }

        let ranking = Object.keys(zones).map(district => {
            const suw = zones[district];
            let value;
            let note = '';
            if (typeof suw === 'string') {
                value = stationData[suw] || 0;
                if (value === 0 || suw === "Brak danych") {
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

        ranking.sort((a, b) => {
            if (parameter === 'pH') {
                return Math.abs(a.value - 7) - Math.abs(b.value - 7);
            }
            return a.value - b.value;
        });

        let result = `<div class="ranking-header">
            <img src="/static/assets/icons/ranking_icon.svg" alt="Ranking">
            <h3>Ranking dzielnic w ${city} (${parameter})</h3>
        </div>`;

        if (dataSource === 'hardcoded-json-fallback') {
            result += `<div class="note" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 8px; margin-bottom: 10px;">⚠️ Wyświetlam dane archiwalne (baza niedostępna)</div>`;
        }

        result += `<p style="font-size: 0.9em; color: #666;">Uwaga: Ranking oparty na danych z głównych SUW-ów przypisanych do dzielnic. Woda może pochodzić z kilku SUW-ów – wartości są przybliżone.</p>`;
        result += `<ol>`;
        ranking.forEach((item, index) => {
            const unit = parameter === 'twardosc' ? 'mg CaCO₃/L' : (parameter === 'mangan' ? 'µg/l' : (['azotany', 'zelazo', 'fluorki', 'chlor'].includes(parameter) ? 'mg/l' : ''));
            const color = getColor(parameter, item.value);
            let warning = '';
            if (index === ranking.length - 1 && color === 'red') {
                warning = '<span style="color: #f44336; font-size: 0.85em;"> – Za wysoka wartość!</span>';
            } else if (index === 1 && color === 'orange') {
                warning = '<span style="color: #ff9800; font-size: 0.85em;"> – Rozważ filtr!</span>';
            }
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            const displayValue = (item.value === 0 || item.note) ? item.note : `${item.value.toFixed(2)} ${unit}`;
            result += `<li>
                <span class="ranking-number">${index + 1}.</span>
                <span class="ranking-item-name">${item.district}</span>
                <span class="ranking-item-value">${displayValue}${warning}</span>
                <span class="ranking-item-status">
                    <span class="dot ${color}"></span>
                    <span style="font-size: 24px;">${medal}</span>
                </span>
            </li>`;
        });
        result += `</ol>`;
        result += `<p class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</p>`;

        rankingsDiv.innerHTML = result;
    } catch (error) {
        console.error('Błąd w generateDistrictRanking:', error);
        document.getElementById('district-ranking').innerHTML = 'Wystąpił błąd – sprawdź konsolę (F12).';
    }
}

