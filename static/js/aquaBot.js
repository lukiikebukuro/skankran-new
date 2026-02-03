/* globals gtag */

// Na samej górze pliku, obok innych importów:
import { trackBotQuery } from './analytics.js';

let stationContext = null;

export function startAquaBot(type) {
    const messagesContainer = document.getElementById(`aqua-bot-${type}-messages`);
    const inputField = document.getElementById(`aqua-bot-${type}-input`);
    const sendButton = document.getElementById(`aqua-bot-${type}-send`);

    if (!messagesContainer || !inputField || !sendButton) return;

    messagesContainer.innerHTML = ''; // Zawsze czyść widok na starcie

    // Setup location picker
    setupLocationPicker();

    // Check localStorage for station
    const lastCheckedRaw = localStorage.getItem('lastCheckedStation');
    if (lastCheckedRaw) {
        try {
            stationContext = JSON.parse(lastCheckedRaw);
            updateLocationBadge(stationContext.city, stationContext.street);
            hideQuickChips(); // Ukryj quick chips gdy jest stacja
            initializeBotSession(stationContext, messagesContainer);
        } catch (e) {
            updateLocationBadge(null, null);
            showQuickChips();
            appendBotMessage({ text_message: 'Błąd danych stacji. Wybierz ją ponownie.' }, messagesContainer);
        }
    } else {
        updateLocationBadge(null, null);
        showQuickChips(); // Pokaż quick chips gdy brak stacji
        appendBotMessage({ text_message: 'Cześć! Kliknij 📍 w nagłówku i wybierz swoją lokalizację, abym wiedział o czym rozmawiać.' }, messagesContainer);
    }

    sendButton.onclick = () => sendMessage(inputField, messagesContainer);
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(inputField, messagesContainer);
        }
    };

    // Obsługa quick chips
    setupQuickChips(inputField, messagesContainer);
}

// === LOCATION PICKER LOGIC ===
function setupLocationPicker() {
    const badge = document.getElementById('location-badge');
    const picker = document.getElementById('aquabot-location-picker');
    const cityInput = document.getElementById('aquabot-city-input');
    const streetInput = document.getElementById('aquabot-street-input');
    const confirmBtn = document.getElementById('aquabot-confirm-location');
    const citySuggestions = document.getElementById('aquabot-city-suggestions');

    if (!badge || !picker) return;

    // Toggle picker on badge click
    badge.onclick = () => {
        const isVisible = picker.style.display !== 'none';
        picker.style.display = isVisible ? 'none' : 'block';
        badge.classList.toggle('expanded', !isVisible);

        // Pre-fill city from "Sprawdź kranówkę" if available
        if (!isVisible && !cityInput.value) {
            const lastCity = localStorage.getItem('lastCheckedCity');
            if (lastCity) {
                cityInput.value = lastCity;
            }
        }
    };

    // City autocomplete is handled by main.js via suggestCities()
    // No need for duplicate implementation here

    // Confirm button handler
    confirmBtn.onclick = async () => {
        const city = cityInput.value.trim();
        const street = streetInput.value.trim();

        if (!city || !street) {
            alert('Wpisz miasto i ulicę');
            return;
        }

        // Show loading state
        confirmBtn.textContent = 'Szukam stacji...';
        confirmBtn.disabled = true;

        try {
            // Find station via API
            const response = await fetch('/api/find-station', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, street })
            });

            const data = await response.json();

            if (data.station) {
                // Save to localStorage
                localStorage.setItem('lastCheckedStation', JSON.stringify(data.station));

                // Update badge
                updateLocationBadge(city, street);

                // Hide picker
                picker.style.display = 'none';
                badge.classList.remove('expanded');

                // Restart bot with new context
                stationContext = data.station;
                const messagesContainer = document.getElementById('aqua-bot-skin-messages');
                messagesContainer.innerHTML = '';
                hideQuickChips();
                initializeBotSession(data.station, messagesContainer);
            } else {
                alert('Nie znaleziono stacji dla tej lokalizacji. Spróbuj innej ulicy.');
            }
        } catch (error) {
            console.error('Error finding station:', error);
            alert('Wystąpił błąd. Spróbuj ponownie.');
        } finally {
            confirmBtn.textContent = 'Potwierdź';
            confirmBtn.disabled = false;
        }
    };
}

function updateLocationBadge(city, street) {
    const locationText = document.getElementById('location-text');
    if (!locationText) return;

    if (city && street) {
        locationText.textContent = `${city}, ul. ${street}`;
        locationText.classList.add('has-location');
    } else {
        locationText.textContent = 'Wybierz lokalizację';
        locationText.classList.remove('has-location');
    }
}

async function initializeBotSession(context, messagesContainer) {
    appendBotMessage({ text_message: 'Chwileczkę, łączę się z centralą...' }, messagesContainer);
    showTypingIndicator();

    try {
        const response = await fetch('/aquabot/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: context })
        });
        if (!response.ok) throw new Error(`Błąd serwera: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        hideTypingIndicator();
        messagesContainer.innerHTML = '';
        appendBotMessage(data.reply, messagesContainer);
    } catch (error) {
        console.error('Błąd inicjalizacji sesji bota:', error);
        hideTypingIndicator();
        messagesContainer.innerHTML = '';
        appendBotMessage({ text_message: `Nie udało się rozpocząć rozmowy. Błąd: ${error.message}` }, messagesContainer);
    }
}

async function sendMessage(inputField, messagesContainer) {
    const userMessage = inputField.value.trim();
    if (!userMessage) return;

    // Agent melduje o każdym pytaniu do centrali
    trackBotQuery(userMessage);

    // 🛰️ SATELITA: Trigger custom event dla visitor_tracking.js
    if (window.skankranTracker) {
        window.skankranTracker.handleAquaBotQuery(userMessage);
    }

    // Ukryj quick chips po wysłaniu pierwszej wiadomości
    hideQuickChips();

    appendUserMessage(userMessage, messagesContainer);
    inputField.value = '';

    // Pokaż typing indicator
    showTypingIndicator();

    try {
        const response = await fetch('/aquabot/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        if (!response.ok) throw new Error(`Błąd serwera: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        hideTypingIndicator();
        appendBotMessage(data.reply, messagesContainer);

        // Wyślij odpowiedź bota do satelity
        if (window.skankranTracker && data.reply && data.reply.text_message) {
            window.skankranTracker.handleAquaBotResponse(userMessage, data.reply.text_message);
        }

    } catch (error) {
        console.error('Błąd w sendMessage:', error);
        hideTypingIndicator();
        const errorReply = { text_message: "Ups, mam problem z połączeniem. Spróbuj zadać pytanie jeszcze raz." };
        appendBotMessage(errorReply, messagesContainer);
    }
}

function appendUserMessage(message, container) {
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.innerHTML = `<p>${message}</p>`;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

function appendBotMessage(reply, container) {
    if (!reply) return;
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message';

    // Avatar robota
    const avatar = document.createElement('div');
    avatar.className = 'bot-message-avatar';
    avatar.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C11.4477 2 11 2.44772 11 3V4H8C6.34315 4 5 5.34315 5 7V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7C19 5.34315 17.6569 4 16 4H13V3C13 2.44772 12.5523 2 12 2ZM9 9C9 8.44772 9.44772 8 10 8C10.5523 8 11 8.44772 11 9C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9ZM14 8C13.4477 8 13 8.44772 13 9C13 9.55228 13.4477 10 14 10C14.5523 10 15 9.55228 15 9C15 8.44772 14.5523 8 14 8ZM9 13C9 12.4477 9.44772 12 10 12H14C14.5523 12 15 12.4477 15 13C15 13.5523 14.5523 14 14 14H10C9.44772 14 9 13.5523 9 13Z" fill="#0277bd"/>
        </svg>
    `;

    // Zawartość wiadomości
    const content = document.createElement('div');
    content.className = 'bot-message-content';
    let replyHtml = '';

    if (reply.text_message) {
        // Bezpieczna konwersja Markdown -> HTML
        let processedText = reply.text_message;

        // Escape potencjalnie niebezpiecznych znaków HTML (ale zachowaj <span> i <param:> tagi z backendu)
        processedText = processedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/&lt;span class="dot (red-dot|orange-dot|green-dot|grey-dot)"&gt;&lt;\/span&gt;/g, '<span class="dot $1"></span>')
            .replace(/&lt;param:(\w+):([^&]+)&gt;/g, '<param:$1:$2>');

        // Markdown rendering (po escape!)
        processedText = processedText
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **bold**
            .replace(/\*(.+?)\*/g, '<em>$1</em>')              // *italic*
            .replace(/\n/g, '<br>');                           // newlines

        replyHtml += processedText;
    }

    if (reply.parameters && reply.parameters.length > 0) {
        replyHtml += '<div style="margin-top: 12px;"><strong style="color: #111827;">Parametry, na które warto zwrócić uwagę:</strong><ul style="margin-top: 8px; padding-left: 20px;">';
        reply.parameters.forEach(param => {
            replyHtml += `<li style="margin-bottom: 6px; color: #1f2937;"><span class="dot ${param.color}" style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; margin-right: 10px; vertical-align: middle;"></span><strong style="color: #111827;">${param.name}:</strong> ${param.value}</li>`;
        });
        replyHtml += '</ul></div>';
    }

    content.innerHTML = replyHtml;

    messageElement.appendChild(avatar);
    messageElement.appendChild(content);
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// Funkcje pomocnicze dla typing indicator
function showTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        // Dodaj avatar do typing indicator
        indicator.innerHTML = `
            <div class="bot-message-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C11.4477 2 11 2.44772 11 3V4H8C6.34315 4 5 5.34315 5 7V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7C19 5.34315 17.6569 4 16 4H13V3C13 2.44772 12.5523 2 12 2ZM9 9C9 8.44772 9.44772 8 10 8C10.5523 8 11 8.44772 11 9C11 9.55228 10.5523 10 10 10C9.44772 10 9 9.55228 9 9ZM14 8C13.4477 8 13 8.44772 13 9C13 9.55228 13.4477 10 14 10C14.5523 10 15 9.55228 15 9C15 8.44772 14.5523 8 14 8ZM9 13C9 12.4477 9.44772 12 10 12H14C14.5523 12 15 12.4477 15 13C15 13.5523 14.5523 14 14 14H10C9.44772 14 9 13.5523 9 13Z" fill="#0277bd"/>
                </svg>
            </div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        indicator.style.display = 'flex';
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Funkcje pomocnicze dla quick chips
function showQuickChips() {
    const quickChips = document.getElementById('aquabot-quick-chips');
    if (quickChips) {
        quickChips.style.display = 'flex';
    }
}

function hideQuickChips() {
    const quickChips = document.getElementById('aquabot-quick-chips');
    if (quickChips) {
        quickChips.style.display = 'none';
    }
}

function setupQuickChips(inputField, messagesContainer) {
    const quickChipButtons = document.querySelectorAll('.quick-chip');
    quickChipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const question = button.getAttribute('data-question');
            if (question) {
                inputField.value = question;
                sendMessage(inputField, messagesContainer);
            }
        });
    });
}