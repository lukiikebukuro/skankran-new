// Ten plik centralizuje wszystkie funkcje śledzenia dla Google Analytics 4.

/**
 * Główna funkcja wysyłająca zdarzenie do Google Analytics i backendu.
 * @param {string} eventName - Nazwa zdarzenia (np. 'search_city').
 * @param {object} eventParams - Dodatkowe parametry zdarzenia.
 */
function trackEvent(eventName, eventParams = {}) {
    // Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
        console.log(`[Analytics] GA4 Meldunek: ${eventName}`, eventParams);
    } else {
        console.warn('[Analytics] gtag() nie jest dostępne.');
    }
    
    // Backend logging (dla panelu admina)
    logEventToBackend(eventName, eventParams);
}

/**
 * Loguj event do backendu (dla Satelity)
 */
async function logEventToBackend(action_type, query_data) {
    try {
        await fetch('/api/log-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action_type: action_type,
                query_data: query_data
            })
        });
        console.log(`[Satelita] Event logged: ${action_type}`);
    } catch (error) {
        console.error('[Satelita] Error logging event:', error);
    }
}

// --- Funkcje-agenci do śledzenia konkretnych akcji ---

/**
 * Agent śledzący zapytania do AquaBota (NAJWAŻNIEJSZY).
 * @param {string} userQuery - Pytanie zadane przez użytkownika.
 */
export function trackBotQuery(userQuery) {
    trackEvent('ask_aquabot', {
        'bot_query': userQuery
    });
}

/**
 * Agent śledzący, kiedy użytkownik sprawdza jakość wody dla danego miasta.
 * @param {string} cityName - Nazwa wyszukiwanego miasta.
 */
export function trackCitySearch(cityName) {
    trackEvent('search_city', {
        'city_name': cityName
    });
}

/**
 * Agent śledzący, kiedy użytkownik znajduje najbliższą stację.
 * @param {string} cityName - Nazwa miasta.
 * @param {string} streetName - Nazwa ulicy.
 * @param {string} stationName - Nazwa znalezionej stacji.
 */
export function trackStationSearch(cityName, streetName, stationName) {
    trackEvent('search_station', {
        'city_name': cityName,
        'street_name': streetName,
        'station_found': stationName
    });
}

/**
 * Agent śledzący, kiedy użytkownik generuje ranking.
 * @param {string} rankingType - Typ rankingu ('city', 'suw', 'district').
 * @param {string} parameter - Parametr, dla którego generowany jest ranking.
 */
export function trackRankingGeneration(rankingType, parameter) {
    trackEvent('generate_ranking', {
        'ranking_type': rankingType,
        'ranking_parameter': parameter
    });
}
