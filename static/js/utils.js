import { fetchPosts } from './community.js';

export const cities = ["Chorzów", "Olsztyn", "Tychy", "Poznań", "Gorzów Wielkopolski", "Warszawa", "Wrocław", "Kraków", "Gdańsk", "Kalisz", "Koszalin", "Grudziądz", "Wałbrzych", "Bydgoszcz", "Toruń"];
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

export function getColor(param, value) {
    try {
        if (param === "pH") {
            const avg = typeof value === 'string' ? (parseFloat(value.split("–")[0]) + parseFloat(value.split("–")[1])) / 2 : value;
            if (avg < 6.0 || avg > 10.0) return "red";
            if (avg < 6.5 || avg > 9.5) return "orange";
            return "green";
        }
        if (param === "twardosc") {
            let avg;
            if (typeof value === 'string') {
                if (value.includes("–")) {
                    const range = value.split("–");
                    avg = (parseFloat(range[0]) + parseFloat(range[1])) / 2;
                } else {
                    avg = parseFloat(value);
                }
            } else {
                avg = value;
            }
            console.log(`Twardość: ${avg} mg/l, kolor: ${avg > 180 ? "red" : avg >= 120 ? "orange" : "green"}`);
            if (isNaN(avg)) return "green";
            if (avg > 180) return "red";
            if (avg >= 120) return "orange";
            return "green";
        }
        if (param === "azotany") {
            if (value > 50) return "red";
            if (value >= 25) return "orange";
            return "green";
        }
        if (param === "zelazo") {
            if (value > 0.2) return "red";
            if (value >= 0.16) return "orange";
            return "green";
        }
        if (param === "mangan") {
            if (value > 0.05) return "red";
            if (value >= 0.04) return "orange";
            return "green";
        }
        if (param === "fluorki") {
            const avg = typeof value === 'string' ? (parseFloat(value.split("–")[0]) + parseFloat(value.split("–")[1])) / 2 : value;
            if (avg > 1.5) return "red";
            if (avg >= 0.7) return "orange";
            return "green";
        }
        if (param === "potas") {
            const avg = typeof value === 'string' ? (parseFloat(value.split("–")[0]) + parseFloat(value.split("–")[1])) / 2 : value;
            if (avg > 20) return "red";
            if (avg >= 10) return "orange";
            return "green";
        }
        if (param === "wapn" || param === "magnez") return value > 150 ? "green" : "orange";
        if (param === "sod") return value < 20 ? "green" : "orange";
        return "green";
    } catch (error) {
        console.error('Błąd w getColor:', error);
        return "green";
    }
}

export function getParameterDescription(param, value, color) {
    const descriptions = {
        pH: {
            green: "Neutralne, spoko dla żołądka.",
            orange: "Lekko poza optimum, może wpływać na smak – filtr smakowy poprawi komfort!",
            red: "Poza normą, może podrażniać żołądek – filtr konieczny!"
        },
        twardosc: {
            green: "W normie, bez wpływu na cerę i sprzęt AGD.",
            orange: "Lekko ponad optimum, może wysuszać cerę – polecamy filtr zmiękczający!",
            red: "Twarda, powoduje osad i podrażnia cerę – filtr zmiękczający to must-have!"
        },
        azotany: {
            green: "W normie, ale dla dzieci warto je obniżyć – filtr eko dla bezpieczeństwa.",
            orange: "Podwyższone, może być szkodliwe dla dzieci – filtr eko zalecany!",
            red: "Zbyt wysokie, szkodliwe dla dzieci i dorosłych – filtr eko konieczny!"
        },
        chlor: {
            green: "W normie, minimalny wpływ na smak.",
            orange: "Podwyższone, zmienia smak wody – filtr smakowy zalecany!",
            red: "Zbyt wysokie, zmienia smak i może podrażniać – filtr smakowy konieczny!"
        },
        fluorki: {
            green: "W normie, wspiera zęby, ale dla dzieci warto kontrolować – filtr eko dla bezpieczeństwa.",
            orange: "Podwyższone, może wpływać na zdrowie dzieci – filtr eko zalecany!",
            red: "Zbyt wysokie, szkodliwe dla dzieci – filtr eko konieczny!"
        },
        zelazo: {
            green: "W normie, bez wpływu na smak czy zdrowie.",
            orange: "Podwyższone, może zmieniać smak wody – filtr eko zalecany!",
            red: "Zbyt wysokie, zmienia smak i może brudzić armaturę – filtr eko konieczny!"
        },
        mangan: {
            green: "W normie, bez wpływu na zdrowie.",
            orange: "Podwyższone, może brudzić armaturę – filtr eko zalecany!",
            red: "Zbyt wysokie, brudzi armaturę i może wpływać na zdrowie – filtr eko konieczny!"
        },
        chlorki: {
            green: "W normie, bez wpływu na zdrowie.",
            orange: "Podwyższone, może wpływać na smak – filtr eko zalecany!",
            red: "Zbyt wysokie, zmienia smak i może być szkodliwe – filtr eko konieczny!"
        },
        siarczany: {
            green: "W normie, bez wpływu na zdrowie.",
            orange: "Podwyższone, może wpływać na smak – filtr eko zalecany!",
            red: "Zbyt wysokie, może powodować problemy żołądkowe – filtr eko konieczny!"
        },
        metnosc: {
            green: "W normie, woda klarowna.",
            orange: "Lekko podwyższona, może wpływać na wygląd wody – filtr eko zalecany!",
            red: "Zbyt wysoka, woda mętna – filtr eko konieczny!"
        },
        barwa: {
            green: "W normie, woda bez przebarwień.",
            orange: "Lekko podwyższona, może wpływać na wygląd – filtr eko zalecany!",
            red: "Zbyt wysoka, woda przebarwiona – filtr eko konieczny!"
        },
        magnez: {
            green: "Wysoki, super dla zdrowia serca i mięśni!",
            orange: "Niski, filtr mineralizujący może uzupełnić!",
            red: "Zbyt niski, warto uzupełnić – filtr mineralizujący konieczny!"
        }
    };

    value = parseFloat(value) || 0;
    return descriptions[param]?.[color] || "Brak opisu.";
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