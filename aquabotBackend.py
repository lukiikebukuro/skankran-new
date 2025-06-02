import json
import random
import re
import unicodedata
import os
from dotenv import load_dotenv
from openai import OpenAI
from fuzzywuzzy import process, fuzz
import time

load_dotenv()
XAI_API_KEY = os.getenv('XAI_API_KEY')

def normalize_name(name):
    """Normalizuje nazwy, usuwając znaki diakrytyczne i zamieniając na małe litery."""
    return ''.join(c for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn').lower().strip()

def parseFloat(value):
    """Parsuje wartości, w tym '<0.1', na float."""
    if isinstance(value, str) and value.startswith('<'):
        return float(value.replace('<', ''))
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def normalize_keys(d):
    """Rekurencyjnie normalizuje klucze w słowniku lub liście."""
    if isinstance(d, dict):
        return {normalize_name(k): normalize_keys(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [normalize_keys(item) for item in d]
    return d

class AquaBot:
    CATEGORY_ALIASES = {
        "health_physical": ["zdrowie fizyczne", "fizyczne", "zdrowie fiz"],
        "health_mental": ["zdrowie psychiczne", "psychiczne", "zdrowie psy"],
        "beauty": ["uroda", "piękno", "wygląd"],
        "ecology": ["ekologia", "eko", "środowisko"],
        "lifestyle": ["styl życia", "styl zycia", "zycie", "lifestyle"],
        "autoimmune_health": ["choroby autoimmunologiczne", "choroby", "autoimmunologiczne", "autoimuno"],
        "gym": ["gym", "siłownia", "trening", "fitness"],
    }

    CITY_ALIASES = {
        "wwa": "warszawa",
        "krk": "krakow",
        "wro": "wrocław",
        "pozn": "poznan",
        "gd": "gdansk",
        "szcz": "szczecin",
    }

    def __init__(self, userName, city, addressStyle, selectedStation=None, waitingForCategory=False, lastParameters=[], expectingCity=False):
        self.userName = userName or "Użytkownik"
        self.city = city or "Grudziądz"
        self.addressStyle = addressStyle or "przyjacielu"
        self.selected_station = None
        self.waiting_for_category = waitingForCategory
        self.last_parameters = lastParameters
        self.chat_history = []
        self.expecting_city = expectingCity

        self.client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")

        try:
            with open('static/js/waterAnalysis.json', 'r', encoding='utf-8') as f:
                self.water_data = json.load(f)
            self.water_data = normalize_keys(self.water_data)
        except Exception as e:
            print(f"Błąd ładowania waterAnalysis.json: {e}")
            self.water_data = {}

        try:
            with open("advice_templates.json", "r", encoding="utf-8") as f:
                self.advice_templates = json.load(f)
        except Exception as e:
            print(f"Błąd ładowania advice_templates.json: {e}")
            self.advice_templates = {}

        self.normy = {
            'ph': {'type': 'range', 'green_min': 7.0, 'green_max': 8.5, 'orange_min': 6.5, 'orange_max': 9.5},
            'twardosc': {'type': 'upper', 'thresholds': {'orange': 150, 'red': 220}},
            'azotany': {'type': 'upper', 'thresholds': {'orange': 10, 'red': 20}},
            'zelazo': {'type': 'upper', 'thresholds': {'orange': 0.1, 'red': 0.2}},
            'fluorki': {'type': 'upper', 'thresholds': {'orange': 1.2, 'red': 1.5}},
            'chlor': {'type': 'upper', 'thresholds': {'orange': 0.15, 'red': 0.27}},
            'mangan': {'type': 'upper', 'thresholds': {'orange': 20, 'red': 50}},
            'chlorki': {'type': 'upper', 'thresholds': {'orange': 125, 'red': 250}},
            'siarczany': {'type': 'upper', 'thresholds': {'orange': 125, 'red': 250}},
            'barwa': {'type': 'upper', 'thresholds': {'orange': 7.5, 'red': 15}},
            'magnez': {'type': 'upper', 'thresholds': {'orange': 25, 'red': 50}},
            'potas': {'type': 'upper', 'thresholds': {'orange': 6, 'red': 12}},
            'olow': {'type': 'upper', 'thresholds': {'orange': 5, 'red': 10}},
            'rtec': {'type': 'upper', 'thresholds': {'orange': 0.5, 'red': 1}},
        }

        self.all_parameters = list(self.normy.keys())
        self.param_aliases = {
            'ph': ['ph', 'pH', 'ph?', 'pH?'],
            'twardosc': ['twardosc', 'twardość', 'twardosci', 'twardoscia', 'twardosc?'],
            'azotany': ['azotany', 'azotanami', 'azotanow', 'azotany?'],
            'zelazo': ['zelazo', 'żelazo', 'zelaza', 'żelaza', 'zelazo?'],
            'fluorki': ['fluorki', 'fluorkami', 'fluorkow', 'fluorki?', 'fluor', 'fluorem', 'fluor?'],
            'chlor': ['chlor', 'chlorem', 'chlory', 'chlor?'],
            'mangan': ['mangan', 'manganem', 'mangany', 'mangan?'],
            'chlorki': ['chlorki', 'chlorkami', 'chlorkow', 'chlorki?'],
            'siarczany': ['siarczany', 'siarczanami', 'siarczanow', 'siarczany?'],
            'barwa': ['barwa', 'barwe', 'barwy', 'barwa?'],
            'magnez': ['magnez', 'magnezem', 'magnezu', 'magnez?'],
            'potas': ['potas', 'potasem', 'potasu', 'potas?'],
            'olow': ['olow', 'ołów', 'ołowiem', 'olow?'],
            'rtec': ['rtec', 'rtęć', 'rtecia', 'rtec?'],
        }
        self.status_descriptions = {
            'green': "OK",
            'orange': "podwyższone",
            'red': "za wysokie"
        }

        if selectedStation:
            self.setStation(selectedStation)

    def call_xai_api(self, prompt, max_tokens=100):
        """Wywołuje API xAI z historią rozmowy."""
        cache_file = "cache.json"
        try:
            with open(cache_file, "r") as f:
                cache = json.load(f)
            if prompt in cache:
                return cache[prompt]
        except FileNotFoundError:
            cache = {}

        system_prompt = (
            f"Jesteś AquaBot, mega inteligentny i wyluzowany ziomek, który troszczy się o użytkownika jak o kumpla. "
            f"Nie mów o wodzie, chyba że ktoś o to pyta – wtedy krótko i na temat, sugerując filtry do wody, jeśli pasują. "
            f"Odpowiadaj krótko, max 80 znaków, z jajem i opieką, np. 'Yo, {self.userName}! Dbaj o siebie – co lubisz?' "
            f"Na 'lubisz anime?' mów np. 'Yo, {self.userName}! Anime? Spoko, a Ty co lubisz?' "
            f"Subtelnie naprowadzaj rozmowę, np. 'Yo, {self.userName}! Akcja? To może Mad Max?' "
            f"Jeśli pyta o parametry, sugeruj filtry, np. 'Podwyższone chlorki? Filtr z węglem aktywnym pomoże!' "
            f"Pamiętaj kontekst z ostatnich 5 wiadomości."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for hist in self.chat_history[-5:]:
            if hist.startswith("Użytkownik:"):
                messages.append({"role": "user", "content": hist.replace("Użytkownik: ", "")})
            else:
                messages.append({"role": "assistant", "content": hist.replace("AquaBot: ", "")})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(3):
            try:
                completion = self.client.chat.completions.create(
                    model="grok-2-1212",
                    messages=messages,
                    max_tokens=100,
                    temperature=0.9,
                    top_p=0.9
                )
                content = completion.choices[0].message.content.strip()
                if len(content) > 80:
                    last_space = content[:80].rfind(' ')
                    if last_space != -1:
                        content = content[:last_space]
                    else:
                        content = content[:80]
                if content and len(content) >= 20 and "pokićkało" not in content:
                    reply = content
                else:
                    reply = f"Yo, {self.userName}! 😎 Coś mi umknęło, ale spoko, co słychać?"
                cache[prompt] = reply
                with open(cache_file, "w") as f:
                    json.dump(cache, f)
                return reply
            except Exception as e:
                print(f"Błąd API xAI: {e}")
                time.sleep(2 ** attempt)
        return f"Yo, {self.userName}! 😎 Coś poszło nie tak, spróbuj później."

    def match_city(self, user_input):
        """Dopasowuje miasto na podstawie aliasów lub fuzzy matching."""
        user_input = normalize_name(user_input)
        if user_input in self.CITY_ALIASES:
            return self.CITY_ALIASES[user_input]
        best_match = process.extractOne(user_input, self.water_data.keys(), scorer=fuzz.ratio)
        if best_match and best_match[1] >= 80:
            return best_match[0]
        return None

    def setStation(self, station_name):
        """Ustawia stację na podstawie nazwy i sugeruje zapytanie o wodę."""
        city_key = normalize_name(self.city)
        if city_key not in self.water_data:
            return f"Nie mam danych dla {self.city}, {self.addressStyle}! 😕"

        stations = self.water_data[city_key].get('stations', [])
        if not stations:
            return f"Brak stacji dla {self.city}, {self.addressStyle}! 😕"

        normalized_input = normalize_name(station_name)
        for station in stations:
            if normalized_input in normalize_name(station['name']):
                self.selected_station = station
                return f"Ustawiłem stację na {station['name']}, {self.addressStyle}! 😊 Teraz możesz zapytać 'co z wodą'."
        best_match = process.extractOne(normalized_input, [normalize_name(s['name']) for s in stations], scorer=fuzz.token_sort_ratio)
        if best_match and best_match[1] >= 70:
            matched_station = next(s for s in stations if normalize_name(s['name']) == best_match[0])
            self.selected_station = matched_station
            return f"Ustawiłem stację na {matched_station['name']}, {self.addressStyle}! 😊 Teraz możesz zapytać 'co z wodą'."
        return f"Nie znalazłem stacji '{station_name}' w {self.city}, {self.addressStyle}. 😕 Spróbuj np. 'SUW Praga'!"

    def get_out_of_norm_parameters(self):
        """Zwraca parametry poza normą."""
        if not self.selected_station or 'data' not in self.selected_station:
            return []
        data = self.selected_station['data']
        out_of_norm = []
        for param, norm in self.normy.items():
            if param in data and data[param] is not None:
                value = parseFloat(data[param])
                if value == 0:
                    continue
                status = self.get_parameter_status(param, value)
                if status in ['orange', 'red']:
                    unit = "μg/l" if param in ['olow', 'rtec', 'mangan'] else "mg/l"
                    out_of_norm.append(f"{param.capitalize()}: {value} {unit}, {self.status_descriptions[status]}")
        return out_of_norm

    def get_parameter_status(self, param, value):
        """Określa status parametru względem normy."""
        norm = self.normy.get(param, {})
        if not norm or value is None:
            return 'green'
        if norm['type'] == 'range':
            if norm['green_min'] <= value <= norm['green_max']:
                return 'green'
            elif norm['orange_min'] <= value <= norm['orange_max']:
                return 'orange'
            return 'red'
        elif norm['type'] == 'upper':
            if value <= norm['thresholds']['orange']:
                return 'green'
            elif value <= norm['thresholds']['red']:
                return 'orange'
            return 'red'
        return 'green'

    def get_norm_text(self, param, norm):
        """Zwraca tekst normy dla parametru."""
        unit = "μg/l" if param in ['olow', 'rtec', 'mangan'] else "mg/l"
        if norm['type'] == 'range':
            return f"norma: {norm['green_min']}-{norm['green_max']}"
        return f"norma: <{norm['thresholds']['orange']} {unit}"

    def extract_parameter_from_message(self, message):
        """Rozpoznaje parametr z wiadomości z priorytetem dla dokładnych dopasowań."""
        normalized_message = normalize_name(message)
        for param, aliases in self.param_aliases.items():
            for alias in aliases:
                if normalize_name(alias) == normalized_message:
                    return param
        words = normalized_message.split()
        for word in words:
            for param, aliases in self.param_aliases.items():
                for alias in aliases:
                    if normalize_name(alias) == word:
                        return param
        for param, aliases in self.param_aliases.items():
            for alias in aliases:
                if normalize_name(alias) in normalized_message:
                    return param
        return None

    def match_category(self, message):
        """Dopasowuje kategorię na podstawie wiadomości."""
        message = normalize_name(message)
        for category, aliases in self.CATEGORY_ALIASES.items():
            if any(normalize_name(alias) in message for alias in aliases):
                return category
        return None

    def getHealthAdvice(self, message=""):
        """Obsługuje zapytania użytkownika z API xAI tylko przy braku danych."""
        message_lower = message.lower().strip()
        normalized_message = normalize_name(message_lower)
        categories_prompt = "Chcesz porady z kategorii: zdrowie fizyczne, zdrowie psychiczne, uroda, ekologia, styl życia, choroby autoimmunologiczne, siłownia?"

        self.chat_history.append(f"Użytkownik: {message}")
        if len(self.chat_history) > 10:
            self.chat_history = self.chat_history[-10:]

        if self.expecting_city:
            matched_city = self.match_city(normalized_message)
            if matched_city:
                self.city = matched_city
                self.selected_station = None
                self.expecting_city = False
                self.waiting_for_category = False
                self.last_parameters = []
                reply = f"Zmieniłem miasto na {matched_city.capitalize()}, {self.userName}! 😊 Wybierz stację, np. 'SUW {matched_city.capitalize()}'!"
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            else:
                reply = f"Nie znam miasta '{message}', {self.addressStyle}! 😕 Wpisz np. 'Warszawa' lub 'Kraków'."
                self.chat_history.append(f"AquaBot: {reply}")
                return reply

        if any(keyword in message_lower for keyword in ["zmienić miasto", "inne miasto", "jak zmienić miasto"]):
            self.expecting_city = True
            reply = f"Yo, {self.userName}! Wpisz nazwę miasta, np. 'Toruń', a ja je ustawię!"
            self.chat_history.append(f"AquaBot: {reply}")
            return reply

        matched_city = self.match_city(normalized_message)
        if matched_city:
            self.city = matched_city
            self.selected_station = None
            self.waiting_for_category = False
            self.last_parameters = []
            self.expecting_city = False
            reply = f"Zmieniłem miasto na {matched_city.capitalize()}, {self.userName}! 😊 Wybierz stację, np. 'SUW {matched_city.capitalize()}'!"
            self.chat_history.append(f"AquaBot: {reply}")
            return reply

        if self.city and not self.selected_station:
            station_result = self.setStation(message)
            if "Ustawiłem stację" in station_result:
                self.waiting_for_category = False
                self.last_parameters = []
                self.chat_history.append(f"AquaBot: {station_result}")
                return station_result
            elif "Nie znalazłem stacji" not in station_result:
                self.chat_history.append(f"AquaBot: {station_result}")
                return station_result

        if any(keyword in message_lower for keyword in ["co z wodą", "jak woda", "sprawdź wodę", "jaka woda", "woda"]):
            if not self.selected_station:
                reply = f"Najpierw wybierz stację, {self.addressStyle}! 😊"
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            out_of_norm = self.get_out_of_norm_parameters()
            if out_of_norm:
                self.last_parameters = [param.split(':')[0].lower() for param in out_of_norm]
                self.waiting_for_category = True
                reply = ", ".join(out_of_norm) + ". " + categories_prompt
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            reply = f"Woda w normie dla stacji {self.selected_station['name']}, {self.addressStyle}! 😊 Możesz sprawdzić parametry."
            self.chat_history.append(f"AquaBot: {reply}")
            return reply

        if self.waiting_for_category:
            category = self.match_category(message_lower)
            if category:
                param = self.last_parameters[0] if self.last_parameters else None
                if param and self.selected_station:
                    data = self.selected_station['data']
                    if param in data and data[param] is not None:
                        value = parseFloat(data[param])
                        status = self.get_parameter_status(param, value)
                        advice_list = self.advice_templates.get(param, {}).get(status, {}).get(category, [])
                        if advice_list:
                            advice = random.choice(advice_list)
                            self.waiting_for_category = False
                            self.last_parameters = []
                            reply = f"{advice} Wpisz inny parametr lub zmień miasto."
                            self.chat_history.append(f"AquaBot: {reply}")
                            return reply
                prompt = f"Brak danych dla parametru: {param}, kategoria: {category}. Podaj krótko wpływ {param} na {category} (WHO/EPA)."
                reply = self.call_xai_api(prompt)
                self.waiting_for_category = False
                self.last_parameters = []
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            reply = f"Wybierz kategorię, np. 'zdrowie fizyczne', {self.addressStyle}!"
            self.chat_history.append(f"AquaBot: {reply}")
            return reply

        param = self.extract_parameter_from_message(normalized_message)
        if param:
            if not self.selected_station:
                reply = f"Najpierw wybierz stację, {self.addressStyle}! 😊"
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            data = self.selected_station['data']
            if param in data and data[param] is not None:
                value = parseFloat(data[param])
                if value == 0:
                    reply = f"Brak danych dla {param}, {self.addressStyle}!"
                else:
                    status = self.get_parameter_status(param, value)
                    norm_text = self.get_norm_text(param, self.normy[param])
                    unit = "μg/l" if param in ['olow', 'rtec', 'mangan'] else "mg/l"
                    self.last_parameters = [param]
                    self.waiting_for_category = True
                    reply = f"{param.capitalize()}: {value} {unit}, {self.status_descriptions[status]} ({norm_text}). {categories_prompt}"
                self.chat_history.append(f"AquaBot: {reply}")
                return reply
            prompt = f"Brak danych dla parametru: {param}. Podaj krótko wpływ {param} na zdrowie (WHO/EPA)."
            reply = self.call_xai_api(prompt)
            self.chat_history.append(f"AquaBot: {reply}")
            return reply

        reply = self.call_xai_api(message)
        self.chat_history.append(f"AquaBot: {reply}")
        return reply

if __name__ == "__main__":
    bot = AquaBot("Łuki", "Warszawa", "luki")
    print(bot.getHealthAdvice("praga"))
    print(bot.getHealthAdvice("co z wodą"))