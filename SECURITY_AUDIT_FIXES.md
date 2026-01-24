# 🔒 SKANKRAN.PL - PEŁNA DOKUMENTACJA NAPRAW BEZPIECZEŃSTWA
## Audyt wykonany: 3 grudnia 2025
## Status: KRYTYCZNY - Wymaga natychmiastowej naprawy przed zgłoszeniem do grantu UE

---

## 📁 PLIKI DO ANALIZY PRZEZ CLAUDE

**NAJPIERW WKLEJ DO CLAUDE TE PLIKI (skopiuj całą zawartość):**

1. `c:\Users\lpisk\Projects\skankran\app.py` - główna aplikacja Flask
2. `c:\Users\lpisk\Projects\skankran\aquabotBackend.py` - backend bota AI
3. `c:\Users\lpisk\Projects\skankran\.env` - zmienne środowiskowe (UWAGA: nie commituj!)
4. `c:\Users\lpisk\Projects\skankran\config.py` - konfiguracja Discord
5. `c:\Users\lpisk\Projects\skankran\templates\index.html` - główny template
6. `c:\Users\lpisk\Projects\skankran\static\js\aquaBot.js` - frontend bota

---

## 🔴 KATEGORIA A: LUKI KRYTYCZNE (MUST-FIX przed grantem)

### A1. EKSPOZYCJA KLUCZY API ⚠️ NAJWYŻSZY PRIORYTET

**Problem:**
- Plik `.env` zawiera niezabezpieczone klucze:
  - `GOOGLE_API_KEY=AIzaSyAtlxvm1L9cma4Q79mbLfKyOvbjQUthGxQ`
  - `DISCORD_BOT_TOKEN=MTM5Nzk2OTcxNTk2MzYyNTYyMw.G4CWHW.w3wZGmAN2FBBNnrgIXGm7ykBYuh4zosMrfG2cI`
  - `DISCORD_CLIENT_SECRET=A51zj6pe-tctrKYGcz2QGr6nwuiZL9T7`
- `config.py` duplikuje te same klucze (hardcoded w kodzie źródłowym!)

**Ryzyko prawne:**
- Jeśli repo było kiedykolwiek publiczne → klucze są SKOMPROMITOWANE
- Każdy może wykraść klucze z historii Git
- Koszt: nieograniczone użycie Twojego API ($$$)

**NAPRAWA:**

```bash
# KROK 1: Sprawdź czy .env był commitowany
git log --all --full-history -- .env

# KROK 2: Jeśli TAK - usuń z historii (UWAGA: destrukcyjne!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# KROK 3: Wymuś push (tylko jeśli repo jest prywatne!)
git push origin --force --all

# KROK 4: NATYCHMIAST zregeneruj klucze API:
# - Google Cloud Console → API & Services → Credentials → Delete + Create New
# - Discord Developer Portal → Bot → Reset Token
```

**NOWE PLIKI:**

Utwórz `.env.example` (template dla innych):
```bash
# .env.example
SECRET_KEY='ZMIEN_MNIE_NA_LOSOWY_STRING_64_ZNAKI'
GOOGLE_API_KEY='YOUR_GOOGLE_API_KEY_HERE'
DISCORD_CLIENT_ID='YOUR_DISCORD_CLIENT_ID'
DISCORD_CLIENT_SECRET='YOUR_DISCORD_CLIENT_SECRET'
DISCORD_BOT_TOKEN='YOUR_DISCORD_BOT_TOKEN'
DISCORD_GUILD_ID='YOUR_GUILD_ID'
DISCORD_REDIRECT_URI='https://skankran.pl/discord_callback'
DISCORD_INVITE_LINK='https://discord.gg/YOUR_INVITE'
```

Usuń `config.py` całkowicie i przenieś do `.env`:
```python
# config.py - DO USUNIĘCIA (zastąpione przez .env)
# Wszystkie wartości przenieś do .env i ładuj przez os.getenv()
```

---

### A2. BRAK HTTPS/SSL ⚠️ WYMÓG RODO

**Problem:**
```python
# app.py linia 155
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)  # ❌ HTTP tylko, brak SSL
```

**Ryzyko prawne:**
- Art. 32 RODO: "szyfrowanie danych w tranzycie" - OBOWIĄZKOWE
- Hasła użytkowników wysyłane plain text
- Man-in-the-middle attack możliwy

**NAPRAWA - Opcja 1 (Reverse Proxy - ZALECANE dla produkcji):**

Użyj Nginx + Certbot (darmowy SSL):
```bash
# Na serwerze produkcyjnym
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d skankran.pl -d www.skankran.pl

# Nginx config (/etc/nginx/sites-available/skankran)
server {
    listen 80;
    server_name skankran.pl www.skankran.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name skankran.pl www.skankran.pl;
    
    ssl_certificate /etc/letsencrypt/live/skankran.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/skankran.pl/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Flask app.py
app.config['SESSION_COOKIE_SECURE'] = True  # Tylko HTTPS
app.config['PREFERRED_URL_SCHEME'] = 'https'
```

**NAPRAWA - Opcja 2 (Flask bezpośrednio - tylko development):**
```python
# app.py - TYLKO DO TESTÓW LOKALNYCH
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Generuj self-signed cert do testów
    # openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
    app.run(debug=False, port=5443, ssl_context=('cert.pem', 'key.pem'))
```

---

### A3. BRAK ANONIMIZACJI PRZED GEMINI API ⚠️ RODO Art. 25

**Problem:**
```python
# aquabotBackend.py - obecnie
def get_bot_response(self, user_message):
    # user_message wysyłane BEZPOŚREDNIO do Gemini
    # Brak hashowania/anonimizacji user_id, IP, session_id
    response = chat.send_message(system_prompt)  # ❌
```

**Ryzyko prawne:**
- Art. 25 RODO (Privacy by Design): minimalizacja danych
- Gemini API może logować zapytania → wyciek danych osobowych

**NAPRAWA:**

```python
# aquabotBackend.py - NOWA WERSJA
import hashlib
from flask import request, session

def _anonymize_context(self):
    """Anonimizuje identyfikatory przed wysłaniem do API."""
    user_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    session_id = session.get('session_id', 'anonymous')
    
    # SHA256 hash - nieodwracalny
    ip_hash = hashlib.sha256(user_ip.encode()).hexdigest()[:16]
    session_hash = hashlib.sha256(str(session_id).encode()).hexdigest()[:16]
    
    return {
        'ip_hash': ip_hash,
        'session_hash': session_hash,
        'timestamp': int(time.time())
    }

def get_bot_response(self, user_message):
    # ... istniejący kod ...
    
    # Anonimizuj PRZED wysłaniem
    anon_context = self._anonymize_context()
    
    # Dodaj do promptu jako metadane (nie user_message!)
    system_prompt = f"""
    [METADATA: Session={anon_context['session_hash']}, Time={anon_context['timestamp']}]
    
    {system_prompt}  # reszta jak było
    """
    
    # NIE WYSYŁAJ: user_ip, username, email, phone
```

**app.py - dodaj middleware:**
```python
# app.py - na początku
from werkzeug.middleware.proxy_fix import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# Generuj unikalny session_id jeśli nie ma
@app.before_request
def ensure_session_id():
    if 'session_id' not in session:
        session['session_id'] = os.urandom(16).hex()
```

---

### A4. GOOGLE ANALYTICS BEZ ZGODY (ePrivacy Directive) ⚠️

**Problem:**
```html
<!-- templates/index.html linia 20 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FB097HQ344"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FB097HQ344');  <!-- ❌ Ładuje BEZ zgody użytkownika -->
</script>
```

**Ryzyko prawne:**
- Kara do 20M€ lub 4% obrotu (ePrivacy + RODO)
- Cookies analityczne wymagają AKTYWNEJ zgody użytkownika

**NAPRAWA:**

**KROK 1: Dodaj Cookie Consent Banner**

Utwórz `templates/cookie_banner.html`:
```html
<!-- cookie_banner.html -->
<div id="cookie-consent-banner" style="display:none; position:fixed; bottom:0; width:100%; background:#2c3e50; color:#fff; padding:20px; z-index:9999;">
    <div style="max-width:1200px; margin:0 auto;">
        <p><strong>Ta strona używa plików cookies</strong> (m.in. Google Analytics) do analizy ruchu. 
        <a href="/privacy" style="color:#3498db;">Polityka Prywatności</a></p>
        <button onclick="acceptCookies()" style="background:#27ae60; color:#fff; border:none; padding:10px 20px; cursor:pointer; margin-right:10px;">
            Akceptuję
        </button>
        <button onclick="rejectCookies()" style="background:#e74c3c; color:#fff; border:none; padding:10px 20px; cursor:pointer;">
            Odrzuć
        </button>
    </div>
</div>

<script>
// Sprawdź czy użytkownik już wyraził zgodę
window.addEventListener('DOMContentLoaded', function() {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        document.getElementById('cookie-consent-banner').style.display = 'block';
    } else if (consent === 'accepted') {
        loadGoogleAnalytics();
    }
});

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-consent-banner').style.display = 'none';
    loadGoogleAnalytics();
}

function rejectCookies() {
    localStorage.setItem('cookieConsent', 'rejected');
    document.getElementById('cookie-consent-banner').style.display = 'none';
}

function loadGoogleAnalytics() {
    // Załaduj GA DOPIERO PO zgodzie
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-FB097HQ344';
    document.head.appendChild(script);
    
    script.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-FB097HQ344', {
            'anonymize_ip': true  // Anonimizuj IP
        });
    };
}
</script>
```

**KROK 2: Usuń GA z wszystkich templates i dodaj banner:**
```html
<!-- index.html, login.html, etc. - USUŃ: -->
<!-- ❌ DELETE CAŁĄ SEKCJĘ: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FB097HQ344"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FB097HQ344');
</script>

<!-- ✅ DODAJ ZAMIAST TEGO (na końcu <body>): -->
{% include 'cookie_banner.html' %}
```

---

## 🟠 KATEGORIA B: LUKI WYSOKIEGO RYZYKA (SHOULD-FIX)

### B1. XSS (Cross-Site Scripting) w AquaBot

**Problem:**
```javascript
// static/js/aquaBot.js linia 90, 115
function appendUserMessage(message, container) {
    messageElement.innerHTML = `<p>${message}</p>`;  // ❌ XSS!
}

function appendBotMessage(reply, container) {
    messageElement.innerHTML = replyHtml;  // ❌ Niesanityzowany HTML
}
```

**Atak:**
Użytkownik wysyła: `<img src=x onerror="alert('XSS')">`
Bot odpowiada i wykonuje kod!

**NAPRAWA - Opcja 1 (DOMPurify - zalecane):**
```html
<!-- index.html - dodaj CDN -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

```javascript
// aquaBot.js - NOWA WERSJA
function appendUserMessage(message, container) {
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    
    // Opcja A: Tylko tekst (najbezpieczniejsze)
    const p = document.createElement('p');
    p.textContent = message;  // ✅ Automatyczne escapowanie
    messageElement.appendChild(p);
    
    container.appendChild(messageElement);
}

function appendBotMessage(reply, container) {
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message';
    
    // Opcja B: Sanityzuj HTML jeśli bot zwraca HTML
    const cleanHtml = DOMPurify.sanitize(reply.text_message, {
        ALLOWED_TAGS: ['p', 'span', 'strong', 'em', 'br'],
        ALLOWED_ATTR: ['class']
    });
    
    messageElement.innerHTML = cleanHtml;  // ✅ Bezpieczne
    container.appendChild(messageElement);
}
```

---

### B2. BRAK CSRF PROTECTION

**Problem:**
```python
# app.py - wszystkie POST endpointy bez CSRF
@app.route('/aquabot/send', methods=['POST'])
def aquabot_send():
    data = request.get_json()  # ❌ Brak weryfikacji CSRF
```

**Atak:**
Atakujący tworzy stronę: `evil.com` z kodem:
```html
<script>
fetch('https://skankran.pl/aquabot/send', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({message: 'spam'})
});
</script>
```

**NAPRAWA:**
```bash
pip install Flask-WTF
```

```python
# app.py - na początku
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['WTF_CSRF_TIME_LIMIT'] = None  # Token nie wygasa

csrf = CSRFProtect(app)

# Wyłącz CSRF tylko dla API endpoints (ale dodaj inną ochronę!)
@csrf.exempt
@app.route('/aquabot/send', methods=['POST'])
def aquabot_send():
    # Dodaj weryfikację origin header
    origin = request.headers.get('Origin')
    if origin and origin not in ['https://skankran.pl', 'https://www.skankran.pl']:
        return jsonify({'error': 'Forbidden'}), 403
    
    # ... reszta kodu
```

**Frontend - dodaj token CSRF:**
```html
<!-- templates/index.html -->
<meta name="csrf-token" content="{{ csrf_token() }}">
```

```javascript
// aquaBot.js - dodaj header
async function sendMessage(inputField, messagesContainer) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    const response = await fetch('/aquabot/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // ✅ CSRF protection
        },
        body: JSON.stringify({ message: userMessage })
    });
}
```

---

### B3. BRAK RATE LIMITING

**Problem:**
```python
# Atakujący może wysłać 10000 zapytań/sekundę
# Koszt: Gemini API = $0.002 za 1000 tokenów → $$$
```

**NAPRAWA:**
```bash
pip install Flask-Limiter
```

```python
# app.py - na początku
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Lub Redis w produkcji
)

# Zastosuj limity
@app.route('/aquabot/send', methods=['POST'])
@limiter.limit("10 per minute")  # Max 10 pytań/min
def aquabot_send():
    # ... kod ...

@app.route('/aquabot/start', methods=['POST'])
@limiter.limit("5 per minute")  # Max 5 nowych sesji/min
def aquabot_start():
    # ... kod ...

@app.route('/send_feedback', methods=['POST'])
@limiter.limit("3 per hour")  # Max 3 wiadomości/h
def send_feedback():
    # ... kod ...
```

---

### B4. NIEZABEZPIECZONE COOKIES

**Problem:**
```python
# app.py - cookies mogą być przechwycone przez JS lub HTTP
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
# ❌ Brak flag bezpieczeństwa
```

**NAPRAWA:**
```python
# app.py - NOWA KONFIGURACJA
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Konfiguracja sesji (filesystem lub Redis w produkcji)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_COOKIE_SECURE"] = True      # ✅ Tylko HTTPS
app.config["SESSION_COOKIE_HTTPONLY"] = True    # ✅ Niedostępne dla JS
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"   # ✅ Ochrona CSRF
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=24)

# Dodatkowe zabezpieczenia
app.config["SESSION_COOKIE_NAME"] = "skankran_session"  # Ukryj framework
app.config["REMEMBER_COOKIE_SECURE"] = True
app.config["REMEMBER_COOKIE_HTTPONLY"] = True
```

---

### B5. WALIDACJA INPUT

**Problem:**
```python
# app.py - brak limitu długości
@app.route('/aquabot/send', methods=['POST'])
def aquabot_send():
    user_message = data.get('message', '')  # ❌ Może być 10MB
```

**NAPRAWA:**
```python
@app.route('/aquabot/send', methods=['POST'])
@limiter.limit("10 per minute")
def aquabot_send():
    bot = AquaBot()
    data = request.get_json()
    user_message = data.get('message', '')
    
    # ✅ Walidacja
    if not user_message:
        return jsonify({'error': 'Brak wiadomości.'}), 400
    
    if len(user_message) > 500:  # Max 500 znaków
        return jsonify({'error': 'Wiadomość za długa (max 500 znaków).'}), 400
    
    # Sanityzacja (usuń potencjalnie niebezpieczne znaki)
    import re
    user_message = re.sub(r'[<>\"\'&]', '', user_message)
    
    try:
        reply = bot.get_bot_response(user_message)
        return jsonify({'reply': reply})
    except Exception as e:
        app.logger.error(f"AquaBot error: {e}")
        return jsonify({'error': 'Błąd serwera.'}), 500
```

---

## 🟡 KATEGORIA C: COMPLIANCE (Dokumenty prawne)

### C1. KLAUZULA WYŁĄCZENIA ODPOWIEDZIALNOŚCI

**NOWY PLIK: `templates/disclaimer.html`**

Treść w następnym pliku (za długa dla tego dokumentu).

**DODAJ DO KAŻDEJ STRONY:**
```html
<!-- index.html, templates/*.html - na końcu <body> -->
<div class="disclaimer-footer" style="background:#f8d7da; padding:15px; margin-top:50px; border-top:3px solid #dc3545;">
    <p style="color:#721c24; font-size:0.9em; text-align:center;">
        <strong>⚠️ WAŻNE:</strong> Dane o jakości wody pochodzą z publicznych źródeł (wodociągi, sanepid) 
        i mają charakter informacyjny. Nie gwarantujemy aktualności w czasie rzeczywistym. 
        Ostateczna decyzja o piciu wody należy do użytkownika. 
        <a href="/disclaimer" style="color:#721c24; text-decoration:underline;">Pełna klauzula</a>
    </p>
</div>
```

---

### C2. POLITYKA PRYWATNOŚCI (RODO)

**NOWY PLIK: `templates/privacy.html`**

Treść w następnym pliku.

**DODAJ LINK w footer:**
```html
<footer>
    <a href="/privacy">Polityka Prywatności</a> | 
    <a href="/disclaimer">Klauzula</a> | 
    <a href="/regulamin">Regulamin</a>
</footer>
```

```python
# app.py - dodaj route
@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/disclaimer')
def disclaimer():
    return render_template('disclaimer.html')
```

---

## 🟢 KATEGORIA D: ULEPSZENIA (NICE-TO-HAVE)

### D1. SILNY SECRET_KEY

```python
# W terminalu (generuj nowy klucz):
python -c "import os; print(os.urandom(32).hex())"

# Wynik (64 znaki): 
# 7f3a9c8e1b2d4f6a8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f

# Wklej do .env:
SECRET_KEY='7f3a9c8e1b2d4f6a8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f'
```

### D2. DEBUG=FALSE w produkcji

```python
# app.py - FINALNA WERSJA
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    # Środowisko z .env
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, port=5000, host='127.0.0.1')
```

```bash
# .env
FLASK_ENV=production  # Zmień na 'development' lokalnie
```

### D3. LOGGING ZDARZEŃ

```python
# app.py - na początku
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    # Loguj do pliku w produkcji
    handler = RotatingFileHandler('skankran.log', maxBytes=10000000, backupCount=3)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Skankran startup')

# Loguj ważne zdarzenia
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        app.logger.info(f'User logged in: {username}')  # ✅ Audit log
        return redirect(url_for('index'))
    else:
        app.logger.warning(f'Failed login attempt: {username}')  # ✅
        flash('Błąd logowania.')
    return render_template('login.html')
```

---

## 📦 INSTALACJA ZALEŻNOŚCI

```bash
# requirements.txt - ZAKTUALIZUJ
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-Session==0.5.0
Flask-WTF==1.2.1          # ✅ CSRF
Flask-Limiter==3.5.0      # ✅ Rate limiting
google-generativeai==0.3.1
python-dotenv==1.0.0
Werkzeug==3.0.1
redis==5.0.1              # Opcjonalnie (dla Limiter w produkcji)

# Zainstaluj
pip install -r requirements.txt
```

---

## 🚀 CHECKLIST WDROŻENIA

### PRZED COMMITOWANIEM:
- [ ] Zregeneruj WSZYSTKIE klucze API (Google, Discord)
- [ ] Upewnij się, że `.env` jest w `.gitignore`
- [ ] Usuń `config.py` (zastąpione przez `.env`)
- [ ] Sprawdź historię Git: `git log --all -- .env`

### KONFIGURACJA PRODUKCYJNA:
- [ ] Nginx + Certbot (SSL/TLS)
- [ ] Zmień `FLASK_ENV=production` w `.env`
- [ ] Ustaw `DEBUG=False`
- [ ] Skonfiguruj rate limiting (Redis zamiast memory)
- [ ] Backup bazy danych (cron: `0 3 * * * cp users.db backup/`)

### DOKUMENTY PRAWNE:
- [ ] Dodaj `/privacy` - Polityka Prywatności
- [ ] Dodaj `/disclaimer` - Klauzula wyłączenia
- [ ] Cookie consent banner na wszystkich stronach
- [ ] Link do dokumentów w stopce

### TESTY:
- [ ] Testuj HTTPS: `https://skankran.pl`
- [ ] Sprawdź cookies (DevTools → Application → Cookies)
- [ ] Testuj rate limiting (wyślij 11 zapytań w minucie)
- [ ] Testuj XSS: `<img src=x onerror=alert(1)>` w AquaBot

---

## 📞 KONTAKT W RAZIE PROBLEMÓW

Jeśli Claude AI ma pytania podczas implementacji:

**Priorytet napraw:**
1. A1, A2, A3, A4 (MUST-FIX)
2. B1, B2, B3, B4 (SHOULD-FIX)
3. C1, C2 (COMPLIANCE)
4. D1, D2, D3 (NICE-TO-HAVE)

**Najczęstsze błędy:**
- "ImportError: No module named 'flask_wtf'" → `pip install Flask-WTF`
- "SSL Error" → Sprawdź Nginx config
- "Rate limit exceeded" → Zmniejsz limit testowo

---

## 🎯 NOTATKA O BEZPIECZEŃSTWIE DLA GRANTU

**(Osobny dokument - patrz: GRANT_SECURITY_NOTE.md)**

Status po naprawach:
- ✅ Privacy by Design (anonimizacja IP)
- ✅ HTTPS/TLS 1.3
- ✅ CSRF + XSS protection
- ✅ Rate limiting
- ✅ Secure cookies (HttpOnly, Secure, SameSite)
- ✅ Compliance: RODO + ePrivacy
- ✅ Audit logging
- ✅ Backup strategy

**Gotowe do audytu UE: TAK** (po implementacji wszystkich MUST-FIX)

---

END OF DOCUMENT
Data utworzenia: 2025-12-03
Status: WERSJA FINALNA
