import { fetchPosts } from './community.js';

export const cities = ["Chorzów", "Płock", "Olsztyn", "Tychy", "Poznań", "Gorzów Wielkopolski", "Warszawa", "Wrocław", "Kraków", "Gdańsk", "Kalisz", "Koszalin", "Grudziądz", "Wałbrzych", "Bydgoszcz", "Toruń", "Zielona Góra", "Legnica", "Radom"];
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
            if (value > 500) return 'red-dot';
            if (value > 120) return 'orange-dot';
            return 'green-dot';
        case 'azotany':
            if (value > 50) return 'red-dot';
            if (value > 25) return 'orange-dot';
            return 'green-dot';
        case 'chlor':
            if (value > 0.3) return 'red-dot';
            if (value >= 0.15) return 'orange-dot';
            return 'green-dot';
        case 'fluorki':
            if (value > 1.5) return 'red-dot';
            if (value > 0.7) return 'orange-dot';
            return 'green-dot';
        case 'zelazo':
            if (value > 0.2) return 'red-dot';
            if (value > 0.1) return 'orange-dot';
            return 'green-dot';
        case 'mangan':
            if (value > 0.05) return 'red-dot';
            if (value > 0.02) return 'orange-dot';
            return 'green-dot';
        case 'chlorki':
            if (value > 250) return 'red-dot';
            if (value > 150) return 'orange-dot';
            return 'green-dot';
        case 'metnosc':
            if (value > 1) return 'red-dot';
            if (value > 0.5) return 'orange-dot';
            return 'green-dot';
        case 'barwa':
            if (value > 15) return 'red-dot';
            if (value > 5) return 'orange-dot';
            return 'green-dot';
        default:
            return 'green-dot';
    }
}

export function getParameterDescription(parameter, value, color, azotanyValue = null) {
    let description = '';
    let filterRecommendation = '';

    const skipFilterRecommendation = azotanyValue === 0;

    switch (parameter) {
        case 'pH':
            if (color === 'red-dot') {
                description = 'pH poza normą – może wpływać na smak i zdrowie.';
                filterRecommendation = 'Zalecamy filtr korygujący pH.';
            } else if (color === 'orange-dot') {
                description = 'pH nieoptymalne – może wpływać na smak.';
                filterRecommendation = 'Rozważ filtr korygujący pH.';
            } else {
                description = 'pH w normie – woda bezpieczna.';
            }
            break;
        case 'twardosc':
            if (color === 'red-dot') {
                description = 'Woda bardzo twarda – może powodować osad.';
                filterRecommendation = 'Zalecamy filtr zmiękczający.';
            } else if (color === 'orange-dot') {
                description = 'Woda twarda – może wpływać na urządzenia.';
                filterRecommendation = 'Rozważ filtr zmiękczający.';
            } else {
                description = 'Twardość w normie – woda dobra.';
            }
            break;
        case 'azotany':
            if (color === 'red-dot') {
                description = 'Wysokie stężenie azotanów – może być szkodliwe.';
                filterRecommendation = 'Zalecamy filtr usuwający azotany.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższone azotany – warto monitorować.';
                filterRecommendation = 'Rozważ filtr usuwający azotany.';
            } else {
                description = 'Azotany w normie – woda bezpieczna.';
            }
            break;
        case 'chlor':
            if (color === 'red-dot') {
                description = 'Wysoki poziom chloru – może wpływać na smak i zapach.';
                filterRecommendation = 'Zalecamy filtr smakowy.';
            } else if (color === 'orange-dot') {
                description = 'Chlor może wpływać na smak wody.';
                filterRecommendation = 'Rozważ filtr smakowy.';
            } else {
                description = 'Chlor w normie – woda dobra.';
            }
            break;
        case 'zelazo':
            if (color === 'red-dot') {
                description = 'Wysoki poziom żelaza – może wpływać na smak i wygląd.';
                filterRecommendation = 'Zalecamy filtr usuwający żelazo.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższony poziom żelaza – może wpływać na smak.';
                filterRecommendation = 'Rozważ filtr usuwający żelazo.';
            } else {
                description = 'Żelazo w normie – woda dobra.';
            }
            break;
        case 'mangan':
            if (color === 'red-dot') {
                description = 'Wysoki poziom manganu – może wpływać na smak i wygląd.';
                filterRecommendation = 'Zalecamy filtr usuwający mangan.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższony poziom manganu – może wpływać na smak.';
                filterRecommendation = 'Rozważ filtr usuwający mangan.';
            } else {
                description = 'Mangan w normie – woda dobra.';
            }
            break;
        case 'chlorki':
            if (color === 'red-dot') {
                description = 'Wysoki poziom chlorków – może wpływać na smak.';
                filterRecommendation = 'Zalecamy filtr usuwający chlorki.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższony poziom chlorków – może wpływać na smak.';
                filterRecommendation = 'Rozważ filtr usuwający chlorki.';
            } else {
                description = 'Chlorki w normie – woda dobra.';
            }
            break;
        case 'metnosc':
            if (color === 'red-dot') {
                description = 'Wysoka mętność – woda może być nieatrakcyjna wizualnie.';
                filterRecommendation = 'Zalecamy filtr eko usuwający mętność.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższona mętność – może wpływać na wygląd wody.';
                filterRecommendation = 'Rozważ filtr eko usuwający mętność.';
            } else {
                description = 'Mętność w normie – woda klarowna.';
            }
            break;
        case 'barwa':
            if (color === 'red-dot') {
                description = 'Wysoka barwa – woda może być nieatrakcyjna wizualnie.';
                filterRecommendation = 'Zalecamy filtr eko poprawiający barwę.';
            } else if (color === 'orange-dot') {
                description = 'Podwyższona barwa – może wpływać na wygląd wody.';
                filterRecommendation = 'Rozważ filtr eko poprawiający barwę.';
            } else {
                description = 'Barwa w normie – woda dobra.';
            }
            break;
        default:
            description = 'Parametr w normie.';
    }

    if (skipFilterRecommendation) {
        filterRecommendation = '';
    }

    return filterRecommendation ? `${description} ${filterRecommendation}` : description;
}

export function recommendFilter(params) {
    try {
        let issues = [];
        if (getColor("twardosc", params.twardosc) !== "green") issues.push("zmiękczający na osad i skórę");
        if (getColor("azotany", params.azotany) !== "green") issues.push("eko-filtr na zanieczyszczenia");
        if (getColor("zelazo", params.zelazo) !== "green" || getColor("mangan", params.mangan) !== "green") issues.push("eko-filtr na metale");
        return issues.length > 0 ? issues.join(", ") : "smakowy dla lepszego komfortu";
    } catch (error) {
        console.error('Błąd w recommendFilter:', error);
        return "smakowy dla lepszego komfortu";
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