import { getParameterDescription, getColor, suggestWaterFilter, getSelectedParameters, getPremiumParameters } from './utils.js';
import { trackCitySearch, trackStationSearch } from './analytics.js';
export let map = null;
export function getDistance(lat1, lon1, lat2, lon2) {
    try {
        const R = 6371; // Promień Ziemi w kilometrach
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Odległość w kilometrach
        return distance.toFixed(2); // Zaokrąglamy do 2 miejsc po przecinku
    } catch (error) {
        console.error('Błąd w getDistance:', error);
        return Infinity;
    }
}

// ============================================
// HARDCODED DATA REMOVED - PostgreSQL is Single Source of Truth
// ============================================
// All water data now fetched from PostgreSQL API:
// - /api/water-data/<city> for station data
// - /api/city-averages for city averages
// 
// Fallback mechanism exists in:
// - checkWater() - line ~5438
// - findWaterStation() - line ~5535  
// - generateRanking() - ranking.js
// - generateSUWRanking() - ranking.js
// - generateDistrictRanking() - ranking.js
//
// This empty object is kept ONLY for fallback compatibility
// ============================================
export const waterStations = {};


    try {
        for (let city in waterStations) {
            const stations = waterStations[city].stations || [];
            const avg = { pH: 0, twardosc: 0, azotany: 0, zelazo: 0, fluorki: 0, chlor: 0, mangan: 0 };
            const displayValues = { pH: [], twardosc: [], azotany: [], zelazo: [], fluorki: [], chlor: [], mangan: [] };
            const count = stations.length;

            if (count === 0) {
                waterStations[city].average = avg;
                continue;
            }

            stations.forEach(station => {
                const params = ['pH', 'twardosc', 'azotany', 'zelazo', 'fluorki', 'chlor', 'mangan'];
                params.forEach(param => {
                    let value = station.data[param];
                    if (typeof value === 'string' && value.startsWith('<')) {
                        displayValues[param].push(value); // Zachowujemy "<X"
                    } else {
                        value = parseFloat(value) || 0;
                        avg[param] += value;
                        displayValues[param].push(value);
                    }
                });
            });

            const finalAvg = {};
            Object.keys(avg).forEach(param => {
                const values = displayValues[param];
                const allLessThan = values.every(val => typeof val === 'string' && val.startsWith('<'));
                if (allLessThan) {
                    finalAvg[param] = values[0]; // Wszystkie "<X" są takie same, bierzemy pierwsze
                } else {
                    const numericValues = values.filter(val => typeof val === 'number');
                    finalAvg[param] = numericValues.length > 0 ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2) : 0;
                }
            });

            waterStations[city].average = finalAvg;

            console.log(`Miasto: ${city}, Średnia twardość: ${waterStations[city].average.twardosc} mg/l, Chlor: ${waterStations[city].average.chlor}, Fluorki: ${waterStations[city].average.fluorki}`);
        }
    } catch (error) {
        console.error('Błąd w calculateCityAverages:', error);
    }
}
calculateCityAverages();

export async function checkWater(inputId) {
    let resultDiv;
    try {
        resultDiv = inputId === 'city' ? document.getElementById('city-result') : document.getElementById('bottle-result');
        if (!resultDiv) return;

        if (inputId === 'city') {
            const city = document.getElementById('city').value.trim();
            if (!city) {
                resultDiv.innerHTML = "Proszę wpisać miasto!";
                return;
            }

            // 🛰️ SATELITA: Track city search
            trackCitySearch(city);

            // 🚀 POSTGRESQL API FETCH (Single Source of Truth)
            let data = null;
            let dataSource = 'postgresql';

            try {
                const response = await fetch(`/api/water-data/${encodeURIComponent(city)}`);
                const result = await response.json();

                if (result.success && result.data && result.data.average) {
                    data = result.data.average;
                    dataSource = result.source || 'postgresql';
                    console.log(`✅ Loaded ${city} from ${dataSource}`, data);
                } else {
                    throw new Error(result.error || 'API returned no data');
                }
            } catch (apiError) {
                // ⚠️ FALLBACK: Use hardcoded waterStations if API fails
                console.warn(`⚠️ PostgreSQL unavailable for ${city}, using stale hardcoded data:`, apiError.message);
                data = waterStations[city]?.average;
                dataSource = 'hardcoded-json-fallback';
            }

            if (!data) {
                resultDiv.innerHTML = "Brak danych dla tego miasta.";
                return;
            }

            let result = `<h3>Jakość wody w ${city}</h3>`;
            if (dataSource === 'hardcoded-json-fallback') {
                result += `<div class="note" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 8px; margin-bottom: 10px;">⚠️ Wyświetlam dane archiwalne (baza niedostępna)</div>`;
            }

            const selectedParams = getSelectedParameters(data);
            const parameters = selectedParams.map(param => {
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                const normWithUnit = param.unit ? `${param.norm} ${param.unit}` : param.norm;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${normWithUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });
            result += `Jakość wody:<br>${parameters.join('')}`;

            // Add city info if using PostgreSQL data
            if (dataSource !== 'hardcoded-json-fallback' && waterStations[city]?.info) {
                result += `<div class="note">${waterStations[city].info}</div>`;
            }

            resultDiv.innerHTML = result;
        } else if (inputId === 'bottle') {
            const bottle = document.getElementById('bottle').value.trim();
            if (!bottle) {
                resultDiv.innerHTML = "Proszę wpisać nazwę wody butelkowanej!";
                return;
            }
            const data = bottleData[bottle];
            if (!data) {
                resultDiv.innerHTML = "Brak danych dla tej wody butelkowanej.";
                return;
            }
            let result = `<h3>Jakość wody ${bottle}</h3>`;
            const parameters = [
                `<div class="parameter"><span class="dot ${getColor('pH', data.pH.value)}"></span> pH: ${data.pH.value.toFixed(2)} (${data.pH.norm}) – ${data.pH.desc}</div>`,
                `<div class="parameter"><span class="dot ${getColor('wapn', data.wapn.value)}"></span> Wapń: ${data.wapn.value.toFixed(2)} mg/l (${data.wapn.norm}) – ${data.wapn.desc}</div>`,
                `<div class="parameter"><span class="dot ${getColor('magnez', data.magnez.value)}"></span> Magnez: ${data.magnez.value.toFixed(2)} mg/l (${data.magnez.norm}) – ${data.magnez.desc}</div>`,
                `<div class="parameter"><span class="dot ${getColor('sod', data.sod.value)}"></span> Sód: ${data.sod.value.toFixed(2)} mg/l (${data.sod.norm}) – ${data.sod.desc}</div>`,
                `<div class="parameter"><span class="dot ${getColor('fluorki', data.fluorki.value)}"></span> Fluorki: ${data.fluorki.value.toFixed(2)} mg/l (${data.fluorki.norm}) – ${data.fluorki.desc}</div>`,
                `<div class="parameter">${data.mikroplastik.desc}</div>`
            ];
            result += `Jakość wody:<br>${parameters.join('')}`;
            resultDiv.innerHTML = result;
        }
    } catch (error) {
        console.error('Błąd w checkWater:', error);
        if (resultDiv) {
            resultDiv.innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
        }
    }
}
export async function findWaterStation() {
    let closestStation = null;
    let city = '';
    const waterInfo = document.getElementById('waterInfo');

    try {
        const streetInput = document.getElementById('street');
        const cityInput = document.getElementById('city-premium');
        if (!streetInput || !cityInput || !waterInfo) return;

        const street = streetInput.value.trim();
        city = cityInput.value.trim();

        if (!city || !street) {
            waterInfo.innerHTML = !city ? "Proszę wpisać miasto!" : "Proszę wpisać ulicę!";
            return;
        }

        // 🚀 POSTGRESQL API FETCH (Single Source of Truth)
        let cityData = null;
        let dataSource = 'postgresql';

        try {
            const response = await fetch(`/api/water-data/${encodeURIComponent(city)}`);
            const result = await response.json();

            if (result.success && result.data) {
                cityData = result.data;
                dataSource = result.source || 'postgresql';
                console.log(`✅ Loaded ${city} stations from ${dataSource}`, cityData);
            } else {
                throw new Error(result.error || 'API returned no data');
            }
        } catch (apiError) {
            // ⚠️ FALLBACK: Use hardcoded waterStations if API fails
            console.warn(`⚠️ PostgreSQL unavailable for ${city}, using stale hardcoded data:`, apiError.message);
            cityData = waterStations[city];
            dataSource = 'hardcoded-json-fallback';
        }

        if (!cityData || (!cityData.stations && !cityData.stations?.length && !cityData.measurementPoints && !cityData.measurementPoints?.length)) {
            waterInfo.innerHTML = cityData?.info || "Brak danych dla tego miasta.";
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement || !window.map) return;

        mapElement.style.display = 'block';
        let userLat = 52.7325, userLon = 15.2369;
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(street + ', ' + city + ', Polska')}&format=json&limit=1`);
        const geoData = await geoResponse.json();
        if (geoData.length > 0) {
            userLat = parseFloat(geoData[0].lat);
            userLon = parseFloat(geoData[0].lon);
        }

        window.map.setView([userLat, userLon], 14);
        window.map.invalidateSize();
        window.map.eachLayer(layer => {
            if (layer instanceof L.Marker) window.map.removeLayer(layer);
        });
        L.marker([userLat, userLon]).addTo(window.map).bindPopup(`Lokalizacja: ${street}, ${city}`).openPopup();

        let minStationDistance = Infinity;
        (cityData.stations || []).forEach(station => {
            const distance = parseFloat(getDistance(userLat, userLon, station.coords[0], station.coords[1]));
            if (distance < minStationDistance) {
                minStationDistance = distance;
                closestStation = station;
            }
        });

        let closestPoint = null;
        let minPointDistance = Infinity;
        (cityData.measurementPoints || []).forEach(point => {
            const distance = parseFloat(getDistance(userLat, userLon, point.coords[0], point.coords[1]));
            if (distance < minPointDistance) {
                minPointDistance = distance;
                closestPoint = point;
            }
        });

        let waterInfoHTML = `<h3 style="text-align: center; font-family: 'Poppins', sans-serif; color: #0277bd; margin-bottom: 24px;">Wyniki dla adresu: ${street}, ${city}</h3>`;

        if (dataSource === 'hardcoded-json-fallback') {
            waterInfoHTML += `<div class="note" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 8px; margin-bottom: 10px;">⚠️ Wyświetlam dane archiwalne (baza niedostępna)</div>`;
        }

        if (closestStation) {
            L.marker(closestStation.coords).addTo(window.map).bindPopup(`${closestStation.name} (${closestStation.address})`).openPopup();
            // 🚀 USE STATION DATA (if available), fallback to city average only if station has no measurements
            const params = (closestStation.data && Object.keys(closestStation.data).length > 0)
                ? closestStation.data
                : cityData.average;
            const allParams = [...getSelectedParameters(params), ...getPremiumParameters(params)];
            const parameters = allParams.map(param => {
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                const normWithUnit = param.unit ? `${param.norm} ${param.unit}` : param.norm;
                const desc = getParameterDescription(param.name, param.value, color);
                return `<div class="parameter-item">
                    <span class="dot ${color}"></span>
                    <div>
                        <div><strong>${param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</strong> <span class="param-value">${displayValue}</span> <span class="param-norm">(norma: ${normWithUnit})</span></div>
                        <div class="param-desc">${desc}</div>
                    </div>
                </div>`;
            }).join('');

            // 🛰️ SATELITA: Track station search
            trackStationSearch(city, street, closestStation.name);

            waterInfoHTML += `<div class="station-feature-card">
                <div class="station-card-header">
                    <h4>Najbliższa stacja SUW: ${closestStation.name}</h4>
                    <p class="station-address">${closestStation.address}</p>
                    <p class="station-distance">📍 Odległość: ${minStationDistance.toFixed(2)} km</p>
                </div>
                <p class="note" style="margin-bottom: 16px; color: #666; font-style: italic;">To najbliższa stacja uzdatniania wody na podstawie Twojej lokalizacji.</p>
                <div class="parameters-grid">${parameters}</div>
                <div class="station-recommendation">
                    <strong>💡 Rekomendacja:</strong>
                    <p>${suggestWaterFilter(params).summary}</p>
                </div>
                <button class="cta-aquabot-station pulse-animation" onclick="document.getElementById('aqua-bot-btn').click()">
                    <img src="/static/assets/icons/aqua_bot.svg" alt="AquaBot" class="btn-aquabot-icon-large">
                    Uruchom analizę w AquaBot
                </button>
            </div>`;
        }

        if (closestPoint) {
            L.marker(closestPoint.coords).addTo(window.map).bindPopup(`${closestPoint.name} (${closestPoint.address})`);
            // 🚀 USE POINT DATA (if available), fallback to city average only if point has no measurements
            const pointParams = (closestPoint.data && Object.keys(closestPoint.data).length > 0)
                ? closestPoint.data
                : cityData.average;
            const allPointParams = [...getSelectedParameters(pointParams), ...getPremiumParameters(pointParams)];
            const pointParameters = allPointParams.map(param => {
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                const normWithUnit = param.unit ? `${param.norm} ${param.unit}` : param.norm;
                const desc = getParameterDescription(param.name, param.value, color);
                return `<div class="parameter-item">
                    <span class="dot ${color}"></span>
                    <div>
                        <div><strong>${param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</strong> <span class="param-value">${displayValue}</span> <span class="param-norm">(norma: ${normWithUnit})</span></div>
                        <div class="param-desc">${desc}</div>
                    </div>
                </div>`;
            }).join('');

            waterInfoHTML += `<div class="station-feature-card">
                <div class="station-card-header">
                    <h4>Najbliższy punkt pomiarowy: ${closestPoint.name}</h4>
                    <p class="station-address">${closestPoint.address}</p>
                    <p class="station-distance">📍 Odległość: ${minPointDistance.toFixed(2)} km</p>
                </div>
                <p class="note" style="margin-bottom: 16px; color: #666; font-style: italic;">Dane z punktów pomiarowych mogą być bardziej precyzyjne dla Twojej lokalizacji.</p>
                <div class="parameters-grid">${pointParameters}</div>
                <div class="station-recommendation">
                    <strong>💡 Rekomendacja:</strong>
                    <p>${suggestWaterFilter(pointParams).summary}</p>
                </div>
                <button class="cta-aquabot-station pulse-animation" onclick="document.getElementById('aqua-bot-btn').click()">
                    <img src="/static/assets/icons/aqua_bot.svg" alt="AquaBot" class="btn-aquabot-icon-large">
                    Uruchom analizę w AquaBot
                </button>
            </div>`;
        }

        waterInfo.innerHTML = waterInfoHTML;

        // Smooth scroll do wyników
        setTimeout(() => {
            waterInfo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    } catch (error) {
        console.error('Błąd w findWaterStation:', error);
        if (waterInfo) waterInfo.innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }

    if (closestStation && city) {
        const lastChecked = { city: city, station: closestStation };
        localStorage.setItem('lastCheckedStation', JSON.stringify(lastChecked));
        console.log('ZAPISANO W LOCALSTORAGE:', lastChecked);
    }
}

// Zakładam, że pozostałe funkcje (getDistance, getColor, itp.) są zdefiniowane w pliku i nie wymagają zmian.

export function showDistrictData(userLat, userLon) {
    try {
        const city = document.getElementById('city-for-suw')?.value?.trim();
        const districtSelect = document.getElementById('district-select');
        const stationInfo = document.getElementById('station-info');
        if (!city || !districtSelect || !stationInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, district-select, station-info');
            return;
        }

        const selectedDistrict = districtSelect.value;
        if (!selectedDistrict) {
            stationInfo.innerHTML = '<p>Proszę wybrać dzielnicę!</p>';
            return;
        }

        const stations = waterStations[city]?.stations || [];
        const measurementPoints = waterStations[city]?.measurementPoints || [];
        const zones = waterStations[city]?.zones || {};
        const suw = zones[selectedDistrict];

        console.log('Wybrana dzielnica:', selectedDistrict, 'SUW:', suw); // Debug

        if (!suw) {
            stationInfo.innerHTML = '<p>Brak danych dla wybranej dzielnicy!</p>';
            return;
        }

        // Funkcja parseValue z ranking.js
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

        let params = {};
        let stationNames = [];
        let avgCoords = [0, 0];
        let stationCount = 0;

        if (typeof suw === 'string') {
            const station = stations.find(s => s.name === suw);
            if (!station) {
                stationInfo.innerHTML = '<p>Brak danych dla SUW w dzielnicy!</p>';
                return;
            }
            params = station.data;
            stationNames = [station.name];
            avgCoords = station.coords;
            stationCount = 1;
        } else if (Array.isArray(suw)) {
            const validStations = suw.map(name => stations.find(s => s.name === name)).filter(s => s);
            if (validStations.length === 0) {
                stationInfo.innerHTML = '<p>Brak danych dla SUW-ów w dzielnicy!</p>';
                return;
            }
            // Uśrednianie parametrów
            const paramKeys = Object.keys(validStations[0].data);
            paramKeys.forEach(key => {
                const values = validStations.map(s => parseValue(s.data[key])).filter(v => !isNaN(v));
                params[key] = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
            });
            stationNames = validStations.map(s => s.name);
            // Uśrednianie współrzędnych
            avgCoords = validStations.reduce(
                (acc, s) => [acc[0] + s.coords[0], acc[1] + s.coords[1]],
                [0, 0]
            ).map(coord => coord / validStations.length);
            stationCount = validStations.length;
        }

        // Obliczanie odległości od użytkownika
        const distance = parseFloat(getDistance(userLat, userLon, avgCoords[0], avgCoords[1]));

        // Aktualizacja mapy
        window.map.setView(avgCoords, 14);
        window.map.eachLayer(layer => {
            if (layer instanceof L.Marker) window.map.removeLayer(layer);
        });
        L.marker([userLat, userLon]).addTo(window.map).bindPopup(`Twoja lokalizacja: ${document.getElementById('street').value.trim()}, ${city}`);
        if (stationCount === 1) {
            L.marker(avgCoords).addTo(window.map).bindPopup(`${stationNames[0]} (${stations.find(s => s.name === stationNames[0]).address})`).openPopup();
        } else {
            stationNames.forEach(name => {
                const station = stations.find(s => s.name === name);
                L.marker(station.coords).addTo(window.map).bindPopup(`${name} (${station.address})`);
            });
        }

        // Generowanie parametrów
        const basicParams = getSelectedParameters(params);
        const premiumParams = getPremiumParameters(params);
        const allParams = [...basicParams, ...premiumParams];
        const parameters = allParams.map(param => {
            const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
            const color = getColor(param.name, param.value);
            const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
            return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
        });

        // Generowanie wyniku
        let result = `<h4>Dane dla dzielnicy ${selectedDistrict}</h4>`;
        result += `<p class="note">Dane ${stationCount > 1 ? 'uśrednione dla SUW-ów' : 'z SUW'}: ${stationNames.join(', ')}</p>`;
        result += `<p>Odległość od Twojej lokalizacji: ${distance.toFixed(2)} km</p>`;
        result += `Jakość wody:<br>${parameters.join('')}`;
        const filterRec = suggestWaterFilter(params);
        result += `<p><strong>Rekomendacja:</strong> ${filterRec.summary}</p>`;

        // Punkty pomiarowe
        let closestPoint = null;
        let minPointDistance = Infinity;
        const relevantPoints = measurementPoints.filter(point => {
            const pointDistricts = Object.keys(zones).filter(d => zones[d] === suw || (Array.isArray(zones[d]) && zones[d].some(s => suw.includes(s))));
            return pointDistricts.includes(selectedDistrict);
        });
        relevantPoints.forEach(point => {
            const distance = parseFloat(getDistance(userLat, userLon, point.coords[0], point.coords[1]));
            if (distance < minPointDistance) {
                minPointDistance = distance;
                closestPoint = point;
            }
        });

        if (closestPoint) {
            const pointParams = closestPoint.data;
            const pointBasicParams = getSelectedParameters(pointParams);
            const pointPremiumParams = getPremiumParameters(pointParams);
            const pointAllParams = [...pointBasicParams, ...pointPremiumParams];
            const pointParameters = pointAllParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });

            result += `<h4>Najbliższy punkt pomiarowy w dzielnicy ${selectedDistrict}: ${closestPoint.name} (${closestPoint.address})</h4>`;
            result += `<p>Odległość: ${minPointDistance.toFixed(2)} km</p>`;
            result += `<p class="note">Dane z punktów pomiarowych mogą być bardziej precyzyjne dla Twojej lokalizacji.</p>`;
            result += `Jakość wody:<br>${pointParameters.join('')}`;
            const pointFilterRec = suggestWaterFilter(pointParams);
            result += `<p><strong>Rekomendacja:</strong> ${pointFilterRec.summary}</p>`;
            L.marker(closestPoint.coords).addTo(window.map).bindPopup(`${closestPoint.name} (${closestPoint.address})`);
        }

        result += '<div class="note">Dane zależą od wodociągów. Skontaktuj się z nimi dla dokładniejszych informacji.</div>';
        stationInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showDistrictData:', error);
        document.getElementById('station-info').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
export function showAllSUW() {
    try {
        const city = document.getElementById('city-premium')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        const mapElement = document.getElementById('map');
        if (!city || !waterInfo || !mapElement || !window.map) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo, map lub window.map');
            return;
        }

        const stations = waterStations[city]?.stations || [];
        const measurementPoints = waterStations[city]?.measurementPoints || [];
        if (stations.length === 0 && measurementPoints.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        window.map.eachLayer(layer => {
            if (layer instanceof L.Marker) window.map.removeLayer(layer);
        });

        stations.forEach(station => {
            L.marker(station.coords).addTo(window.map).bindPopup(`${station.name} (${station.address})`);
        });

        if (stations.length > 0) {
            const avgLat = stations.reduce((sum, s) => sum + s.coords[0], 0) / stations.length;
            const avgLon = stations.reduce((sum, s) => sum + s.coords[1], 0) / stations.length;
            window.map.setView([avgLat, avgLon], 12);
            mapElement.style.display = 'block';
            window.map.invalidateSize();
        }

        let result = `<h3 style="text-align: center; font-family: 'Poppins', sans-serif; color: #0277bd; margin-bottom: 24px;">Wszystkie stacje SUW w mieście: ${city}</h3>`;
        if (stations.length === 1) {
            result += `<p style="text-align: center; color: #666;">To miasto ma tylko jeden SUW – dane poniżej.</p>`;
        }

        result += `<div class="stations-grid">`;

        stations.forEach(station => {
            const params = station.data;
            const basicParams = getSelectedParameters(params);
            const premiumParams = getPremiumParameters(params);
            const allParams = [...basicParams, ...premiumParams];
            const parameters = allParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' || param.value === undefined ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                return `<div class="parameter-item">
                    <span class="dot ${color}"></span>
                    <div><strong>${param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</strong> <span class="param-value">${displayValue}</span> <span class="param-norm">(${param.norm}${normUnit})</span></div>
                </div>`;
            });

            const filterRec = suggestWaterFilter(params);

            result += `<div class="station-grid-card">
                <h4>${station.name}</h4>
                <p class="station-address">${station.address}</p>
                <div style="margin-bottom: 12px;">${parameters.join('')}</div>
                <div class="station-recommendation">
                    <strong>💡 Rekomendacja:</strong>
                    <p style="margin: 0; font-size: 13px;">${filterRec.summary}</p>
                </div>
            </div>`;
        });

        result += `</div>`;
        waterInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllSUW:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}


export function showAllMeasurementPoints() {
    try {
        const city = document.getElementById('city-for-suw')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        if (!city || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo');
            return;
        }

        const measurementPoints = waterStations[city]?.measurementPoints || [];
        if (measurementPoints.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak punktów pomiarowych dla tego miasta.";
            }
            return;
        }

        let result = `<h3>Punkty pomiarowe w ${city}</h3>`;
        measurementPoints.forEach(point => {
            const params = point.data;
            const basicParams = getSelectedParameters(params);
            const premiumParams = getPremiumParameters(params);
            const allParams = [...basicParams, ...premiumParams];
            const parameters = allParams.map(param => {
                const normUnit = param.name === 'mangan' ? ' µg/l' : param.name === 'metnosc' ? ' NTU' : param.name === 'barwa' ? ' mgPt/dm³' : ' mg/l';
                const color = getColor(param.name, param.value);
                const displayValue = param.displayValue === 'Brak danych' || param.value === undefined ? 'Brak danych' : `${param.displayValue} ${param.unit || ''}`;
                return `<div class="parameter"><span class="dot ${color}"></span> ${param.name.charAt(0).toUpperCase() + param.name.slice(1)}: ${displayValue} (norma: ${param.norm}${normUnit}) – ${getParameterDescription(param.name, param.value, color)}</div>`;
            });

            result += `<h4>Punkt pomiarowy: ${point.name} (${point.address})</h4>Jakość wody:<br>${parameters.join('')}`;
        });

        waterInfo.innerHTML = result;
    } catch (error) {
        console.error('Błąd w showAllMeasurementPoints:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}

export function displayHistory() {
    try {
        const city = document.getElementById('city-for-suw')?.value?.trim();
        const waterInfo = document.getElementById('waterInfo');
        if (!city || !waterInfo) {
            console.error('Brak wymaganych elementów HTML: city-premium, waterInfo');
            return;
        }

        const stations = waterStations[city]?.stations || [];
        if (stations.length === 0) {
            if (waterStations[city]?.info) {
                waterInfo.innerHTML = waterStations[city].info;
            } else {
                waterInfo.innerHTML = "Brak danych dla tego miasta.";
            }
            return;
        }

        let result = `<h3>Historia pomiarów w ${city}</h3>`;
        stations.forEach(station => {
            result += `<h4>${station.name} (${station.address})</h4>`;
            if (station.history && station.history.length > 0) {
                station.history.forEach(entry => {
                    const parameters = [
                        `<div class="parameter"><span class="dot"></span> pH: ${entry.pH} (norma: 6.5–9.5) – ${getParameterDescription('pH', entry.pH, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Twardość: ${entry.twardosc} mg/l (optymalnie: <120 mg/l) – ${getParameterDescription('twardosc', entry.twardosc, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Azotany: ${entry.azotany} mg/l (norma: <50 mg/l) – ${getParameterDescription('azotany', entry.azotany, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Chlor wolny: ${entry.chlor} mg/l (norma: <0.3 mg/l) – ${getParameterDescription('chlor', entry.chlor, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Fluorki: ${entry.fluorki} mg/l (norma: <1.5 mg/l) – ${getParameterDescription('fluorki', entry.fluorki, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Żelazo: ${entry.zelazo} mg/l (norma: <0.2 mg/l) – ${getParameterDescription('zelazo', entry.zelazo, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Mangan: ${entry.mangan} µg/l (norma: <50 µg/l) – ${getParameterDescription('mangan', entry.mangan, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Chlorki: ${entry.chlorki} mg/l (norma: <250 mg/l) – ${getParameterDescription('chlorki', entry.chlorki, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Mętność: ${entry.metnosc} NTU (norma: <1 NTU) – ${getParameterDescription('metnosc', entry.metnosc, null, entry.azotany)}</div>`,
                        `<div class="parameter"><span class="dot"></span> Barwa: ${entry.barwa} mgPt/dm³ (norma: <15 mgPt/dm³) – ${getParameterDescription('barwa', entry.barwa, null, entry.azotany)}</div>`
                    ];
                    result += `<p>Data: ${entry.date}</p>Jakość wody:<br>${parameters.join('')}`;
                });
            } else {
                result += `<p>Brak historii pomiarów dla tej stacji.</p>`;
            }
        });

        waterInfo.innerHTML = result;

        waterInfo.querySelectorAll('.parameter').forEach(paramDiv => {
            const text = paramDiv.textContent;
            const colorMatch = text.match(/red-dot|orange-dot|green-dot/);
            if (colorMatch) {
                const dot = paramDiv.querySelector('.dot');
                if (dot) dot.classList.add(colorMatch[0]);
            }
        });
    } catch (error) {
        console.error('Błąd w displayHistory:', error);
        document.getElementById('waterInfo').innerHTML = "Wystąpił błąd – sprawdź konsolę (F12).";
    }
}
delete waterStations['Płock'];