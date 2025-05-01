import { waterStations } from './waterAnalysis.js';
import { userCity } from './quiz.js';

export function startAquaBot(type) {
    try {
        const botSection = document.getElementById(`aqua-bot-${type}`);
        const messages = document.getElementById(`aqua-bot-${type}-messages`);
        const options = document.getElementById(`aqua-bot-${type}-options`);
        if (botSection && messages && options) {
            botSection.style.display = 'block';
            messages.innerHTML = '<p>Witaj! Jestem AquaBot – Twój ekspert od wody. Jak mogę pomóc?</p>';
            options.innerHTML = `
                <button onclick="askAquaBot('${type}', 'water_quality')">Jak poprawić jakość wody?</button>
                <button onclick="askAquaBot('${type}', 'hydration_tips')">Jak lepiej się nawadniać?</button>
                <button onclick="askAquaBot('${type}', 'filter_advice')">Jaki filtr wybrać?</button>
            `;
        }
    } catch (error) {
        console.error('Błąd w startAquaBot:', error);
        alert('Wystąpił błąd w AquaBocie. Sprawdź konsolę (F12).');
    }
}

export function askAquaBot(type, question) {
    try {
        const messages = document.getElementById(`aqua-bot-${type}-messages`);
        if (!messages) return;
        let response = '';
        if (question === 'water_quality') {
            response = `Jakość wody poprawisz filtrami – zmiękczający na twardość, eko-filtr na metale. W ${userCity || "Twoim mieście"} ${userCity && waterStations[userCity] ? "sprawdź parametry w apce!" : "wpisz miasto!"}`;
        } else if (question === 'hydration_tips') {
            response = 'Pij 2 litry wody dziennie – co 2h po 200 ml. Nałęczowianka ma wapń i magnez!';
        } else if (question === 'filter_advice') {
            response = 'Twarda woda? Zmiękczający (99 zł). Metale? Eko-filtr (109 zł). Pełna ochrona? Premium (129 zł)!';
        }
        messages.innerHTML += `<p>${response}</p>`;
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        console.error('Błąd w askAquaBot:', error);
        alert('Wystąpił błąd w AquaBocie. Sprawdź konsolę (F12).');
    }
}