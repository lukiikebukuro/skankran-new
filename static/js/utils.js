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
            if (value >= 200) return 'red-dot';
            if (value > 150) return 'orange-dot';
            return 'green-dot';
        case 'azotany':
            if (value > 50) return 'red-dot';
            if (value > 25) return 'orange-dot';
            return 'green-dot';
        case 'chlor':
            if (value > 0.3) return 'red-dot';
            if (value >= 0.15) return 'orange-dot';
            return 'green-dot';
        case 'metnosc':
            if (value > 1) return 'red-dot';
            if (value > 0.5) return 'orange-dot';
            return 'green-dot';
        case 'zelazo':
            if (value > 0.2) return 'red-dot';
            if (value > 0.1) return 'orange-dot';
            return 'green-dot';
        case 'mangan':
            if (value > 0.05) return 'red-dot';
            if (value > 0.02) return 'orange-dot';
            return 'green-dot';
        case 'fluorki':
            if (value > 1.5) return 'red-dot';
            if (value > 0.7) return 'orange-dot';
            return 'green-dot';
        default:
            return 'green-dot';
    }
}

export function getParameterDescription(parameter, value, color) {
    let description = '';
    let filterRecommendation = '';

    switch (parameter) {
        case 'pH':
            if (color === 'red-dot') {
                description = 'pH poza normą – podrażnia skórę i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr premium.';
            } else if (color === 'orange-dot') {
                description = 'pH nieoptymalne – może powodować dyskomfort skóry i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'pH w normie – bezpieczne dla skóry, dobry smak wody.';
            }
            break;
        case 'twardosc':
            if (color === 'red-dot') {
                description = 'Wysoka twardość – wysusza cerę, szczególnie u kobiet, i zostawia kamień.';
                filterRecommendation = 'Polecamy filtr zmiękczający.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższona twardość – może wysuszać cerę i powodować kamień.';
                filterRecommendation = 'Polecamy filtr zmiękczający.';
            } else {
                description = 'Twardość w normie – bezpieczna dla cery, minimalny kamień.';
            }
            break;
        case 'azotany':
            if (color === 'red-dot') {
                description = 'Wysokie azotany – szkodliwe, zwłaszcza dla dzieci i kobiet w ciąży!';
                filterRecommendation = 'Polecamy filtr eko.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższone azotany – mogą szkodzić dzieciom i zdrowiu.';
                filterRecommendation = 'Polecamy filtr eko.';
            } else {
                description = 'Azotany w normie, ale mogą być szkodliwe dla dzieci.';
                filterRecommendation = 'Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa, ale to niekonieczne.';
            }
            break;
        case 'metnosc':
            if (color === 'red-dot') {
                description = 'Wysoka mętność – pogarsza wygląd wody i może wpływać na zdrowie.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższona mętność – sprawia, że woda wygląda nieczysto.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'Mętność w normie – woda klarowna i bezpieczna dla zdrowia.';
            }
            break;
        case 'chlor':
            if (color === 'red-dot') {
                description = 'Wysoki chlor – podrażnia skórę i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższony chlor – może podrażniać skórę i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'Chlor w normie – bezpieczny dla zdrowia, minimalny wpływ na smak.';
                if (value >= 0.1) {
                    description += ' Może lekko zmieniać smak wody.';
                    filterRecommendation = 'Opcjonalnie rozważ filtr poprawiający smak dla większego bezpieczeństwa, ale to niekonieczne.';
                }
            }
            break;
        case 'zelazo':
            if (color === 'red-dot') {
                description = 'Wysokie żelazo – może wpływać na zdrowie i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższone żelazo – może zmieniać smak wody i powodować osad.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'Żelazo w normie – bezpieczne dla zdrowia, bez wpływu na smak.';
            }
            break;
        case 'mangan':
            if (color === 'red-dot') {
                description = 'Wysoki mangan – może wpływać na zdrowie i zmienia smak wody.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższony mangan – może zmieniać smak wody i powodować osad.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'Mangan w normie – bezpieczny dla zdrowia, bez wpływu na smak.';
            }
            break;
        case 'fluorki':
            if (color === 'red-dot') {
                description = 'Wysokie fluorki – mogą wpływać na zdrowie zębów i kości.';
                filterRecommendation = 'Polecamy filtr premium.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższone fluorki – mogą wpływać na zdrowie przy długim spożyciu.';
                filterRecommendation = 'Polecamy filtr poprawiający smak.';
            } else {
                description = 'Fluorki w normie – bezpieczne dla zdrowia, wspierają zęby.';
            }
            break;
        default:
            description = 'Parametr w normie.';
    }

    return filterRecommendation ? `${description} ${filterRecommendation}` : description;
}

export function suggestWaterFilter(params) {
    try {
        let issues = [];
        let summary = '';

        if (getColor('twardosc', params.twardosc) !== 'green-dot') {
            issues.push({ param: 'twardość', reason: 'może wysuszać cerę i zostawiać kamień', filter: 'zmiękczający' });
        }
        if (getColor('azotany', params.azotany) !== 'green-dot') {
            issues.push({ param: 'azotany', reason: 'mogą być szkodliwe dla dzieci', filter: 'eko' });
        }
        if (getColor('metnosc', params.metnosc) !== 'green-dot') {
            issues.push({ param: 'mętność', reason: 'pogarsza wygląd wody', filter: 'poprawiający smak' });
        }
        if (getColor('chlor', params.chlor) !== 'green-dot') {
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
            const hasChlorIssue = params.chlor >= 0.1;
            const hasAzotanyIssue = params.azotany > 0;
            if (hasChlorIssue && hasAzotanyIssue) {
                summary = '<strong>Woda w normie, ale możesz rozważyć filtr eko lub poprawiający smak dla większego bezpieczeństwa ze względu na chlor i azotany, które mogą być szkodliwe dla dzieci.</strong> <a href="/dropshipping/eko" target="_blank">Sprawdź filtry</a>.';
                return { filter: 'eko', summary };
            } else if (hasChlorIssue) {
                summary = '<strong>Woda w normie, ale możesz rozważyć filtr poprawiający smak dla większego bezpieczeństwa ze względu na chlor.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa dzieci ze względu na azotany. <a href="/dropshipping/poprawiajacy-smak" target="_blank">Sprawdź filtr</a>.';
                return { filter: 'poprawiający smak', summary };
            } else {
                summary = '<strong>Woda w normie – bezpieczna dla zdrowia.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa dzieci ze względu na azotany. <a href="/dropshipping/eko" target="_blank">Sprawdź filtr</a>.';
                return { filter: 'eko', summary };
            }
        } else if (issues.length === 1) {
            const issue = issues[0];
            summary = `<strong>Polecamy filtr ${issue.filter}, ponieważ ${issue.param} ${issue.reason}.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa dzieci ze względu na azotany. <a href="/dropshipping/${issue.filter.replace(' ', '-')}" target="_blank">Sprawdź filtr</a>.`;
            return { filter: issue.filter, summary };
        } else {
            const reasons = issues.map(issue => issue.param).join(' i ');
            summary = `<strong>Polecamy filtr premium, ponieważ podwyższone są ${reasons}.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa dzieci ze względu na azotany. <a href="/dropshipping/premium" target="_blank">Sprawdź filtr</a>.`;
            return { filter: 'premium', summary };
        }
    } catch (error) {
        console.error('Błąd w suggestWaterFilter:', error);
        return { filter: 'poprawiający smak', summary: '<strong>Rozważ filtr poprawiający smak dla większego komfortu.</strong> Opcjonalnie rozważ filtr eko dla większego bezpieczeństwa dzieci ze względu na azotany. <a href="/dropshipping/poprawiajacy-smak" target="_blank">Sprawdź filtr</a>.' };
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