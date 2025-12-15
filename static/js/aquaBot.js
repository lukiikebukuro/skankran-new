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

    const lastCheckedRaw = localStorage.getItem('lastCheckedStation');
    if (lastCheckedRaw) {
        try {
            stationContext = JSON.parse(lastCheckedRaw);
            hideQuickChips(); // Ukryj quick chips gdy jest stacja
            initializeBotSession(stationContext, messagesContainer);
        } catch (e) {
            appendBotMessage({ text_message: 'Błąd danych stacji. Wybierz ją ponownie.' }, messagesContainer);
        }
    } else {
        showQuickChips(); // Pokaż quick chips gdy brak stacji
        appendBotMessage({ text_message: 'Cześć! Użyj sekcji "Znajdź stacje", abym wiedział, o czym rozmawiać.' }, messagesContainer);
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
        replyHtml += `${reply.text_message.replace(/\n/g, '<br>')}`;
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