import { waterStations } from './waterAnalysis.js';
import { userCity } from './quiz.js';

export function startAquaBot(type) {
    console.log('Inicjalizacja AquaBot dla typu:', type);
    const botSection = document.getElementById(`aqua-bot-${type}`);
    const messages = document.getElementById(`aqua-bot-${type}-messages`);
    const input = document.getElementById(`aqua-bot-${type}-input`);
    const sendButton = document.getElementById(`aqua-bot-${type}-send`);

    if (!botSection || !messages || !input || !sendButton) {
        console.error('Brak elementów czatu!');
        alert('Wystąpił błąd: Brak elementów czatu.');
        return;
    }

    botSection.style.display = 'block';
    const userName = localStorage.getItem('aquaBotUserName');
    const addressStyle = localStorage.getItem('aquaBotAddressStyle');
    let city = localStorage.getItem('aquaBotCity') || userCity || 'Grudziądz';

    if (!userName) {
        messages.innerHTML = '<p class="bot-message">Cześć! Jestem AquaBot – Twój ekspert od wody. Jak masz na imię? 😊</p>';
    } else if (!addressStyle) {
        messages.innerHTML = `<p class="bot-message">Cześć, ${userName}! Jak mam się do Ciebie zwracać? (Np. przyjacielu, kochanie) 😊</p>`;
    } else if (!city) {
        messages.innerHTML = `<p class="bot-message">Super, ${userName}! Skąd jesteś, ${addressStyle}? (Np. Warszawa) 😊</p>`;
    } else {
        messages.innerHTML = `<p class="bot-message">Cześć, ${userName} z ${city}! Jak mogę Ci pomóc, ${addressStyle}? 😊</p>`;
    }
    input.value = '';

    sendButton.onclick = () => sendMessage(type, input, messages);
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(type, input, messages); };
}




async function sendMessage(type, input, messages) {
    const message = input.value.trim();
    if (!message) return;

    messages.innerHTML += `<p class="user-message">${message}</p>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    try {
        let userName = localStorage.getItem('aquaBotUserName');
        let addressStyle = localStorage.getItem('aquaBotAddressStyle');
        let userCity = localStorage.getItem('aquaBotCity') || 'Grudziądz';
        let selectedStation = localStorage.getItem('aquaBotSelectedStation') || null;
        let waitingForCategory = localStorage.getItem('aquaBotWaitingForCategory') === 'true';
        let lastParameters = JSON.parse(localStorage.getItem('aquaBotLastParameters') || '[]');

        if (!userName) {
            userName = message;
            localStorage.setItem('aquaBotUserName', userName);
            messages.innerHTML += `<p class="bot-message">Cześć, ${userName}! Jak mam się do Ciebie zwracać? (Np. przyjacielu, kochanie) 😊</p>`;
            messages.scrollTop = messages.scrollHeight;
            return;
        }

        if (!addressStyle) {
            addressStyle = message;
            localStorage.setItem('aquaBotAddressStyle', addressStyle);
            messages.innerHTML += `<p class="bot-message">Super, ${userName}! Skąd jesteś, ${addressStyle}? (Np. Warszawa, Kraków) 😊</p>`;
            messages.scrollTop = messages.scrollHeight;
            return;
        }

        if (!userCity) {
            const response = await fetch('/verify_city', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: message })
            });
            const data = await response.json();
            if (data.valid) {
                userCity = data.city;
                localStorage.setItem('aquaBotCity', userCity);
                messages.innerHTML += `<p class="bot-message">Okej, ${userName} z ${userCity.charAt(0).toUpperCase() + userCity.slice(1)}! Wybierz stację uzdatniania, ${addressStyle}, np. 'SUW Praga'! 😊</p>`;
            } else {
                messages.innerHTML += `<p class="bot-message">Nie znam miasta '${message}', ${addressStyle}! 😕 Wpisz np. 'Warszawa' lub 'Kraków'.</p>`;
            }
            messages.scrollTop = messages.scrollHeight;
            return;
        }

        const response = await fetch('/aquabot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                userName: userName,
                addressStyle: addressStyle,
                city: userCity,
                selectedStation: selectedStation,
                waitingForCategory: waitingForCategory,
                lastParameters: lastParameters
            })
        });
        const data = await response.json();
        console.log("API Response:", data);
        const reply = data.reply || "Brak odpowiedzi, spróbuj ponownie! 😅";
        messages.innerHTML += `<p class="bot-message">${reply}</p>`;
        messages.scrollTop = messages.scrollHeight;

        // Aktualizacja miasta i reset stacji
        if (data.city) {
            userCity = data.city;
            localStorage.setItem('aquaBotCity', userCity);
            if (data.reply.includes("Zmieniłem miasto")) {
                localStorage.removeItem('aquaBotSelectedStation');
                selectedStation = null;
            }
        }
        if (data.selectedStation) {
            localStorage.setItem('aquaBotSelectedStation', data.selectedStation);
            selectedStation = data.selectedStation;
        }
        if (data.waitingForCategory !== undefined) {
            localStorage.setItem('aquaBotWaitingForCategory', data.waitingForCategory);
            waitingForCategory = data.waitingForCategory;
        }
        if (data.lastParameters) {
            localStorage.setItem('aquaBotLastParameters', JSON.stringify(data.lastParameters));
            lastParameters = data.lastParameters;
        } else {
            localStorage.removeItem('aquaBotLastParameters');
            lastParameters = [];
        }
    } catch (error) {
        console.error('Błąd:', error);
        messages.innerHTML += `<p class="bot-message">Oj, coś poszło nie tak! Spróbuj jeszcze raz.</p>`;
        messages.scrollTop = messages.scrollHeight;
    }
}









function scheduleReminder() {
    const lastReminder = localStorage.getItem('lastReminder');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (!lastReminder || now - lastReminder > oneDay) {
        fetch('/remindWater')
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                localStorage.setItem('lastReminder', now);
            })
            .catch(error => console.error('Błąd przypomnienia:', error));
    }
}

window.onload = function() {
    scheduleReminder();
};