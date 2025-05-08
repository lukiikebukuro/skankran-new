import { fetchPosts } from './community.js';

export const cities = ["Chorzów", "Lublin", "Częstochowa", "Płock", "Olsztyn", "Tychy", "Poznań", "Gorzów Wielkopolski", "Warszawa", "Wrocław", "Kraków", "Gdańsk", "Kalisz", "Koszalin", "Grudziądz", "Wałbrzych", "Bydgoszcz", "Toruń", "Zielona Góra", "Legnica", "Radom", "Olsztyn"];
export const bottles = ["Nałęczowianka", "Muszynianka", "Cisowianka", "Staropolanka", "Żywiec Zdrój", "Polaris"];

export function suggestCities(val, inputId = 'city') {
    try {
        console.log(`suggestCities: Wpisano "${val}", inputId: ${inputId}`);
        const suggestionsElement = document.getElementById(inputId + '-suggestions');
        if (!suggestionsElement) return;
        suggestionsElement.innerHTML = "";
        if (val.length > 0) {
            const filteredCities = cities.filter(city => city.toLowerCase().startsWith(val.toLowerCase()));
            filteredCities.forEach(city => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.style.padding = '5px';
                div.style.cursor = 'pointer';
                div.textContent = city;
                div.addEventListener('click', () => selectCity(city, inputId));
                suggestionsElement.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Błąd w suggestCities:', error);
    }
}

export function selectCity(city, inputId = 'city') {
    try {
        const cityInput = document.getElementById(inputId);
        const suggestionsElement = document.getElementById(inputId + '-suggestions');
        if (cityInput && suggestionsElement) {
            cityInput.value = city;
            suggestionsElement.innerHTML = "";
            if (inputId === 'city-premium') {
                // Zakładamy, że findWaterStation jest importowane w main.js
                document.dispatchEvent(new Event('findWaterStation'));
            } else if (inputId === 'alert-city') {
                // Zakładamy, że alertCity jest w main.js
                document.dispatchEvent(new CustomEvent('updateAlertCity', { detail: city }));
            }
        }
    } catch (error) {
        console.error('Błąd w selectCity:', error);
    }
}

export function suggestBottles(val) {
    try {
        const suggestionsElement = document.getElementById('bottle-suggestions');
        if (!suggestionsElement) return;
        suggestionsElement.innerHTML = "";
        if (val.length > 0) {
            const filteredBottles = bottles.filter(bottle => bottle.toLowerCase().startsWith(val.toLowerCase()));
            filteredBottles.forEach(bottle => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.style.padding = '5px';
                div.style.cursor = 'pointer';
                div.textContent = bottle;
                div.addEventListener('click', () => selectBottle(bottle));
                suggestionsElement.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Błąd w suggestBottles:', error);
    }
}

export function selectBottle(bottle) {
    try {
        const bottleInput = document.getElementById('bottle');
        const suggestionsElement = document.getElementById('bottle-suggestions');
        if (bottleInput && suggestionsElement) {
            bottleInput.value = bottle;
            suggestionsElement.innerHTML = "";
        }
    } catch (error) {
        console.error('Błąd w selectBottle:', error);
    }
}

export function getColor(parameter, value) {
  switch (parameter) {
      case 'pH':
          if (value < 6.5 || value > 9.5) return 'red-dot';
          if (value < 7.0 || value > 8.5) return 'orange-dot';
          return 'green-dot';
      case 'twardosc':
          if (value < 60 || value > 250) return 'red-dot';
          if (value > 150) return 'orange-dot';
          return 'green-dot';
      case 'azotany':
          if (value > 50) return 'red-dot';
          if (value > 25) return 'orange-dot';
          return 'green-dot';
      case 'zelazo':
          if (value > 0.2) return 'red-dot';
          if (value > 0.1) return 'orange-dot';
          return 'green-dot';
      case 'fluorki':
          if (value > 1.5) return 'red-dot';
          if (value > 0.7) return 'orange-dot';
          return 'green-dot';
      case 'chlor':
          if (value > 0.3) return 'red-dot';
          if (value > 0.15) return 'orange-dot';
          return 'green-dot';
      case 'mangan':
          if (value > 50) return 'red-dot'; // Zmiana z 0.05 mg/l na 50 µg/l
          if (value > 20) return 'orange-dot'; // Zmiana z 0.02 mg/l na 20 µg/l
          return 'green-dot';
      case 'wapn':
          if (value > 200) return 'red-dot';
          if (value > 150) return 'orange-dot';
          return 'green-dot';
      case 'magnez':
          if (value > 100) return 'red-dot';
          if (value > 50) return 'orange-dot';
          return 'green-dot';
      case 'sod':
          if (value > 50) return 'red-dot';
          if (value > 20) return 'orange-dot';
          return 'green-dot';
      default:
          return 'green-dot';
  }
}

// Funkcja główna: Zwraca opis wpływu parametru
export function getParameterDescription(parameter, value, color) {
  const descriptions = {
    pH: "pH wpływa na smak i bezpieczeństwo wody.",
    twardosc: {
      'green-dot': "Twardość wpływa na cerę i osad w czajniku.",
      'orange-dot': "Podwyższona twardość może wysuszać cerę i powodować kamień. Rozważ filtr zmiękczający.",
      'red-dot': "Wysoka twardość wysusza cerę i powoduje kamień. Zalecamy filtr zmiękczający."
    },
    azotany: "Azotany mogą szkodzić dzieciom, zwłaszcza niemowlętom, opcjonalnie rozważ filtr eko.",
    zelazo: "Żelazo zmienia smak i kolor wody.",
    fluorki: "Fluorki w małych dawkach wspierają zęby, ale ich nadmiar może być szkodliwy. Istnieją debaty na temat wpływu fluoryzacji wody na zdrowie, jednak w normach jest bezpieczna.",
    chlor: "Chlor zmienia smak i zapach wody.",
    mangan: "Mangan w nadmiarze wpływa na smak wody.",
    chlorki: "Chlorki w nadmiarze mogą wpływać na smak wody i zdrowie.",
    siarczany: "Siarczany w wysokich stężeniach mogą być szkodliwe dla zdrowia.",
    barwa: "Barwa wpływa na wygląd i estetykę wody.",
    magnez: "Magnez jest korzystny dla zdrowia, ale w nadmiarze może zmieniać smak.",
    potas: "Potas jest ważny dla zdrowia, ale w nadmiarze może wpływać na smak."
  };

  if (parameter === 'twardosc') {
    return descriptions.twardosc[color] || descriptions.twardosc['green-dot'];
  }
  return descriptions[parameter] || "Brak opisu dla tego parametru.";
}
  
  // Funkcja pomocnicza: Wybiera 6 parametrów z danych
  export function getSelectedParameters(data) {
    const basicParams = [
        { name: 'pH', norm: '6.5–9.5', unit: '' },
        { name: 'twardosc', norm: '60–500', unit: 'mg/l' },
        { name: 'azotany', norm: '<50', unit: 'mg/l' },
        { name: 'zelazo', norm: '<0.2', unit: 'mg/l' },
        { name: 'fluorki', norm: '<1.5', unit: 'mg/l' },
        { name: 'chlor', norm: '<0.3', unit: 'mg/l', fallback: 'mangan', fallbackNorm: '<50 µg/l', fallbackUnit: 'µg/l' }
    ];

    return basicParams.map(param => {
        let rawValue = data[param.name];
        let displayValue = rawValue;
        let value;
        let selectedUnit = param.unit;

        if (typeof rawValue === 'string' && rawValue.includes('<')) {
            const match = rawValue.match(/<([\d.]+)/);
            if (match) {
                const boundary = parseFloat(match[1]);
                if (param.name === 'mangan') {
                    value = boundary / 2;
                    displayValue = `${value.toFixed(2)}`;
                    selectedUnit = 'µg/l';
                    console.log(`Mangan (granica): Wartość: ${value}, Jednostka: ${selectedUnit}`); // Debugowanie
                } else {
                    value = boundary / 2;
                    displayValue = `${value.toFixed(2)}`;
                }
            } else {
                value = 0;
                displayValue = 'Brak danych';
            }
        } else {
            value = parseFloat(rawValue) || 0;
            if (param.name === 'mangan') {
                displayValue = value === 0 ? 'Brak danych' : `${value.toFixed(2)}`;
                selectedUnit = 'µg/l';
                console.log(`Mangan (bez granicy): Wartość: ${value}, Jednostka: ${selectedUnit}`); // Debugowanie
            } else {
                displayValue = value === 0 ? 'Brak danych' : `${value.toFixed(2)}`;
            }
        }

        let selectedName = param.name;
        let selectedNorm = param.norm;

        if (param.name === 'chlor' && value === 0) {
            rawValue = data['mangan'];
            if (typeof rawValue === 'string' && rawValue.includes('<')) {
                const match = rawValue.match(/<([\d.]+)/);
                if (match) {
                    const boundary = parseFloat(match[1]);
                    value = boundary / 2;
                    displayValue = `${value.toFixed(2)}`;
                } else {
                    value = 0;
                    displayValue = 'Brak danych';
                }
            } else {
                value = parseFloat(rawValue) || 0;
                displayValue = value === 0 ? 'Brak danych' : `${value.toFixed(2)}`;
            }
            selectedName = 'mangan';
            selectedNorm = param.fallbackNorm;
            selectedUnit = param.fallbackUnit || 'µg/l';
            console.log(`Mangan (po zamianie z chlor): Wartość: ${value}, Jednostka: ${selectedUnit}`); // Debugowanie
        }

        return {
            name: selectedName,
            value: value,
            displayValue: displayValue,
            description: getParameterDescription(selectedName),
            color: getColor(selectedName, value),
            norm: selectedNorm,
            unit: selectedUnit
        };
    });
}

export function suggestWaterFilter(params) {
  try {
      let issues = [];
      let summary = '';
      let filterType = null;

      if (getColor('twardosc', params.twardosc) !== 'green-dot') {
          issues.push({ param: 'twardość', reason: 'może wysuszać cerę i zostawiać kamień', filter: 'zmiękczający' });
      }
      issues.push({ param: 'azotany', reason: 'mogą szkodzić dzieciom, opcjonalnie rozważ filtr eko dla większego bezpieczeństwa', filter: 'eko' });
      if (getColor('metnosc', params.metnosc) !== 'green-dot') {
          issues.push({ param: 'mętność', reason: 'pogarsza wygląd wody', filter: 'poprawiający smak' });
      }
      if (params.chlor >= 0.1) {
          issues.push({ param: 'chlor', reason: 'może podrażniać skórę i zmieniać smak', filter: 'poprawiający smak' });
      }
      if (params.zelazo && getColor('zelazo', params.zelazo) !== 'green-dot') {
          issues.push({ param: 'żelazo', reason: 'może zmieniać smak i powodować osad', filter: 'poprawiający smak' });
      }
      if (params.mangan && getColor('mangan', params.mangan) !== 'green-dot') {
          issues.push({ param: 'mangan', reason: 'może zmieniać smak i powodować osad', filter: 'poprawiający smak' });
      }
      if (params.fluorki && getColor('fluorki', params.fluorki) !== 'green-dot') {
          issues.push({ param: 'fluorki', reason: 'mogą wpływać na zdrowie zębów', filter: 'poprawiający smak' });
      }

      if (issues.length === 0) {
          summary = '<strong>Woda w normie, ale azotany mogą szkodzić dzieciom.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa. <a href="/dropshipping/eko" target="_blank">Sprawdź filtr</a>.';
          return { filter: 'eko', summary };
      } else if (issues.length === 1 && issues[0].param === 'azotany') {
          summary = '<strong>Woda w normie, ale azotany mogą szkodzić dzieciom.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa. <a href="/dropshipping/eko" target="_blank">Sprawdź filtr</a>.';
          return { filter: 'eko', summary };
      } else {
          const nonAzotanyIssues = issues.filter(i => i.param !== 'azotany');
          if (nonAzotanyIssues.length >= 2) {
              filterType = 'premium';
              const reasons = nonAzotanyIssues.map(issue => issue.param).join(' i ');
              summary = `<strong>Polecamy filtr premium, ponieważ podwyższone są ${reasons}.</strong> Azotany mogą szkodzić dzieciom, opcjonalnie rozważ filtr eko dla większego bezpieczeństwa. <a href="/dropshipping/premium" target="_blank">Sprawdź filtr</a>.`;
          } else {
              const issue = nonAzotanyIssues[0];
              filterType = issue.filter;
              summary = `<strong>Polecamy filtr ${filterType}, ponieważ ${issue.param} ${issue.reason}.</strong> Azotany mogą szkodzić dzieciom, opcjonalnie rozważ filtr eko dla większego bezpieczeństwa. <a href="/dropshipping/${filterType.replace(' ', '-')}" target="_blank">Sprawdź filtr</a>.`;
          }
          return { filter: filterType, summary };
      }
  } catch (error) {
      console.error('Błąd w suggestWaterFilter:', error);
      return {
          filter: 'eko',
          summary: '<strong>Azotany mogą szkodzić dzieciom.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa. <a href="/dropshipping/eko" target="_blank">Sprawdź filtr</a>.'
      };
  }
}

export function getTwardoscCategory(value) {
    if (value <= 120) return "miękka";
    if (value <= 180) return "średnio twarda";
    return "twarda";
}

export function setUsername() {
    try {
        const usernameInput = document.getElementById('username');
        if (!usernameInput) return;
        const username = usernameInput.value.trim();
        if (!username) {
            alert('Proszę wpisać nazwę użytkownika!');
            return;
        }
        fetch('/user_stats/' + encodeURIComponent(username))
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                localStorage.setItem('username', username);
                localStorage.setItem('isPremium', data.is_premium.toString());
                const loginBox = document.getElementById('login-box');
                const postForm = document.getElementById('post-form');
                const userInfo = document.getElementById('user-info');
                const currentUsername = document.getElementById('current-username');
                if (loginBox && postForm && userInfo && currentUsername) {
                    loginBox.style.display = 'none';
                    postForm.style.display = 'block';
                    userInfo.style.display = 'block';
                    currentUsername.textContent = username;
                    fetchUserStats();
                    fetchPosts();
                }
            })
            .catch(error => {
                console.error('Błąd w setUsername:', error);
                alert('Wystąpił błąd podczas logowania. Sprawdź konsolę (F12).');
            });
    } catch (error) {
        console.error('Błąd w setUsername:', error);
        alert('Wystąpił błąd podczas logowania. Sprawdź konsolę (F12).');
    }
}

export function fetchUserStats() {
    try {
        const username = localStorage.getItem('username');
        if (!username) return;
        fetch('/user_stats/' + encodeURIComponent(username))
            .then(response => response.json())
            .then(data => {
                if (data.error) return;
                const userRank = document.getElementById('user-rank');
                if (userRank) {
                    userRank.textContent = data.rank;
                }
            })
            .catch(error => {
                console.error('Błąd w fetchUserStats:', error);
            });
    } catch (error) {
        console.error('Błąd w fetchUserStats:', error);
    }
}

export function togglePremium() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            alert('Proszę się zalogować!');
            return;
        }
        fetch('/toggle_premium', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('isPremium', data.message.includes('włączony') ? 'true' : 'false');
                alert(data.message);
                fetchUserStats();
                fetchPosts();
            })
            .catch(error => {
                console.error('Błąd w togglePremium:', error);
                alert('Wystąpił błąd podczas przełączania premium. Sprawdź konsolę (F12).');
            });
    } catch (error) {
        console.error('Błąd w togglePremium:', error);
        alert('Wystąpił błąd podczas przełączania premium. Sprawdź konsolę (F12).');
    }
}

export function logout() {
    try {
        localStorage.removeItem('username');
        localStorage.removeItem('isPremium');
        location.reload();
    } catch (error) {
        console.error('Błąd w logout:', error);
        alert('Wystąpił błąd podczas wylogowania. Sprawdź konsolę (F12).');
    }
}

export function isWithin24Hours(timestamp) {
    try {
        const postDate = new Date(timestamp);
        const now = new Date();
        if (isNaN(postDate.getTime())) {
            console.error('Błąd: Nieprawidłowy timestamp:', timestamp);
            return false;
        }
        const diffHours = (now - postDate) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours < 24;
    } catch (error) {
        console.error('Błąd w isWithin24Hours:', error);
        return false;
    }
}

export function editPost(postId) {
    try {
        const postElement = document.querySelector(`.post[data-id="${postId}"] .post-content`);
        if (!postElement) {
            alert('Nie znaleziono posta!');
            return;
        }
        const postContent = prompt('Edytuj post:', postElement.textContent);
        if (postContent && postContent.trim()) {
            fetch('/edit_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postId,
                    content: postContent,
                    username: localStorage.getItem('username'),
                }),
            })
                .then(response => response.json().then(data => ({ response, data }))) // Przekazujemy 'response' i 'data'
                .then(({ response, data }) => {
                    if (response.ok) {
                        fetchPosts();
                    } else {
                        alert(data.error || 'Błąd podczas edycji posta.');
                    }
                })
                .catch(error => {
                    console.error('Błąd w editPost:', error);
                    alert('Wystąpił błąd podczas edycji posta. Sprawdź konsolę (F12).');
                });
        }
    } catch (error) {
        console.error('Błąd w editPost:', error);
        alert('Wystąpił błąd podczas edycji posta. Sprawdź konsolę (F12).');
    }
}

export function editComment(commentId, postId) {
    try {
        const commentElement = document.querySelector(`.comment[data-id="${commentId}"] .comment-content`);
        if (!commentElement) {
            alert('Nie znaleziono komentarza!');
            return;
        }
        const commentContent = prompt('Edytuj komentarz:', commentElement.textContent);
        if (commentContent && commentContent.trim()) {
            fetch('/edit_comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: commentId,
                    content: commentContent,
                    username: localStorage.getItem('username'),
                }),
            })
                .then(response => response.json().then(data => ({ response, data }))) // Przekazujemy 'response' i 'data'
                .then(({ response, data }) => {
                    if (response.ok) {
                        fetchPosts();
                    } else {
                        alert(data.error || 'Błąd podczas edycji komentarza.');
                    }
                })
                .catch(error => {
                    console.error('Błąd w editComment:', error);
                    alert('Wystąpił błąd podczas edycji komentarza. Sprawdź konsolę (F12).');
                });
        }
    } catch (error) {
        console.error('Błąd w editComment:', error);
        alert('Wystąpił błąd podczas edycji komentarza. Sprawdź konsolę (F12).');
    }
}
export function getPremiumParameters(data) {
  const premiumParams = [
    "chlorki",
    "siarczany",
    "barwa",
    "magnez",
    "potas"
  ];

  return premiumParams.map(param => {
    let rawValue = data[param];
    let displayValue = rawValue;
    let value;

    // Obsługa wartości z "<"
    if (typeof rawValue === 'string' && rawValue.includes('<')) {
      const match = rawValue.match(/<([\d.]+)/);
      if (match) {
        const boundary = parseFloat(match[1]);
        value = boundary / 2; // Przyjmujemy połowę granicy wykrywalności
        displayValue = rawValue;
      } else {
        value = 0;
        displayValue = 'Brak danych';
      }
    } else {
      value = parseFloat(rawValue) || 0;
      displayValue = value === 0 ? 'Brak danych' : `${value.toFixed(2)}`;
    }

    return {
      name: param,
      value: value,
      displayValue: displayValue,
      description: getParameterDescription(param),
      color: getColor(param, value),
      norm: getNorm(param)
    };
  });
}

// Pomocnicza funkcja getNorm (dla spójności)
function getNorm(param) {
  const norms = {
    chlorki: '<250',
    siarczany: '<250',
    barwa: '<15',
    magnez: '<50',
    potas: '<12'
  };
  return norms[param] || '';
}