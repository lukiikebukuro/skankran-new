# 📋 INSTRUKCJA DLA CLAUDE AI - NAPRAWA BEZPIECZEŃSTWA SKANKRAN.PL

## CONTEXT
Dostajesz projekt Flask (skankran.pl) z 13 krytycznymi lukami bezpieczeństwa wykrytymi przed zgłoszeniem do grantu UE. Musisz naprawić wszystkie luki z kategorii MUST-FIX i SHOULD-FIX.

## PLIKI DO PRZEANALIZOWANIA (w kolejności)

**WKLEJ DO CLAUDE W TEJ KOLEJNOŚCI:**

```
1. c:\Users\lpisk\Projects\skankran\SECURITY_AUDIT_FIXES.md (ten dokument - główna dokumentacja)
2. c:\Users\lpisk\Projects\skankran\app.py (aplikacja Flask)
3. c:\Users\lpisk\Projects\skankran\aquabotBackend.py (backend AI)
4. c:\Users\lpisk\Projects\skankran\.env (klucze API - NIE COMMITUJ!)
5. c:\Users\lpisk\Projects\skankran\config.py (konfiguracja Discord)
6. c:\Users\lpisk\Projects\skankran\templates\index.html (główny template)
7. c:\Users\lpisk\Projects\skankran\static\js\aquaBot.js (frontend bota)
```

## PROMPT DLA CLAUDE

```
Jestem właścicielem projektu Skankran.pl (Flask + AI chatbot). Wykryto 13 luk bezpieczeństwa 
przed zgłoszeniem do grantu UE. Potrzebuję naprawić wszystkie luki z kategorii MUST-FIX i SHOULD-FIX 
zgodnie z dokumentacją SECURITY_AUDIT_FIXES.md.

PRIORYTETY:
1. A1-A4 (MUST-FIX): Ekspozycja kluczy, HTTPS, anonimizacja IP, Google Analytics bez zgody
2. B1-B5 (SHOULD-FIX): XSS, CSRF, Rate Limiting, Secure cookies, walidacja input

WYMAGANIA:
- Nie zmieniaj logiki biznesowej (tylko security fixes)
- Zachowaj kompatybilność z istniejącymi templates
- Wszystkie naprawy muszą być zgodne z RODO Art. 25 i 32
- Kod musi być production-ready (bez TODO/placeholderów)

DOSTARCZ:
1. Pełny kod naprawionych plików (app.py, aquabotBackend.py, templates, etc.)
2. Nowe pliki do utworzenia (cookie_banner.html, disclaimer.html, privacy_policy.html)
3. requirements.txt z nowymi zależnościami (Flask-WTF, Flask-Limiter, etc.)
4. Nginx config dla HTTPS (certbot)
5. Checklist weryfikacji (co przetestować)

ZACZYNAJ od A1 (najwyższy priorytet).
```

## EXPECTED OUTPUT

Claude powinien dostarczyć:

### 1. Naprawione pliki Python:
- `app.py` - z CSRF, rate limiting, secure cookies, HTTPS redirect
- `aquabotBackend.py` - z anonimizacją IP (SHA256 hash)
- `config.py` - USUNIĘTY (zastąpiony przez .env)

### 2. Nowe templates:
- `templates/cookie_banner.html` - banner zgody na cookies (opt-in)
- `templates/disclaimer.html` - klauzula wyłączenia odpowiedzialności
- `templates/privacy_policy.html` - polityka prywatności RODO

### 3. Zmodyfikowane JS:
- `static/js/aquaBot.js` - sanityzacja XSS (DOMPurify), CSRF token

### 4. Konfiguracja infrastruktury:
- `nginx.conf` - reverse proxy, SSL/TLS 1.3
- `.env.example` - template dla innych (bez prawdziwych kluczy)
- `requirements.txt` - zaktualizowane zależności

### 5. Skrypty pomocnicze:
- `generate_secret_key.py` - generator bezpiecznego SECRET_KEY
- `test_security.sh` - testy penetracyjne (curl, SQLMap, etc.)

## CHECKPOINTS (po każdej kategorii napraw)

### Po A1-A4 (MUST-FIX):
```bash
# Sprawdź czy .env nie jest w Git
git log --all -- .env

# Test HTTPS (localhost z self-signed cert)
curl -k https://localhost:5443

# Test cookie consent
# → Otwórz DevTools → Application → Cookies
# → Sprawdź czy GA ładuje się DOPIERO PO kliknięciu "Akceptuję"

# Test anonimizacji IP
# → Wyślij zapytanie do AquaBota
# → Sprawdź logi: grep "ip_hash" skankran.log
# → Upewnij się, że nie ma prawdziwego IP
```

### Po B1-B5 (SHOULD-FIX):
```bash
# Test XSS
# → Wyślij do AquaBota: <img src=x onerror=alert('XSS')>
# → Sprawdź czy alert() NIE wykonuje się

# Test CSRF
curl -X POST http://localhost:5000/aquabot/send \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# → Oczekiwany wynik: 403 Forbidden (brak CSRF token)

# Test Rate Limiting
for i in {1..15}; do curl -X POST http://localhost:5000/aquabot/send; done
# → Oczekiwany wynik: 429 Too Many Requests po 10 zapytaniu

# Test Secure Cookies
curl -I https://localhost:5443
# → Sprawdź header: Set-Cookie: skankran_session=...; Secure; HttpOnly; SameSite=Lax
```

## COMMON ISSUES (częste błędy Claude)

### Problem 1: "ModuleNotFoundError: No module named 'flask_wtf'"
**Rozwiązanie:**
```bash
pip install Flask-WTF Flask-Limiter
```

### Problem 2: Nginx błąd "certificate verify failed"
**Rozwiązanie:**
```bash
# Wygeneruj self-signed cert do testów
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

### Problem 3: Rate limiting nie działa
**Rozwiązanie:**
```python
# app.py - upewnij się że Limiter jest PRZED routes
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# DOPIERO POTEM definicje @app.route
```

### Problem 4: CSRF blokuje wszystkie POST requesty
**Rozwiązanie:**
```python
# Jeśli masz API JSON endpoints, wyłącz CSRF dla nich:
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect(app)

@csrf.exempt  # Tylko dla API, NIE dla formularzy HTML!
@app.route('/aquabot/send', methods=['POST'])
def aquabot_send():
    # Ale dodaj weryfikację Origin header!
    origin = request.headers.get('Origin')
    if origin and origin not in ['https://skankran.pl']:
        return jsonify({'error': 'Forbidden'}), 403
```

## VERIFICATION STEPS (po wszystkich naprawach)

### 1. Security Audit
```bash
# Instaluj narzędzia
pip install safety bandit

# Sprawdź dependency vulnerabilities
safety check

# Sprawdź Python code security
bandit -r app.py aquabotBackend.py
```

### 2. SSL/TLS Test
```bash
# Testuj lokalne HTTPS
curl -vk https://localhost:5443 2>&1 | grep "SSL connection"

# Po wdrożeniu na produkcję:
# https://www.ssllabs.com/ssltest/analyze.html?d=skankran.pl
```

### 3. GDPR Compliance Check
- [ ] Polityka prywatności dostępna pod /privacy
- [ ] Klauzula wyłączenia odpowiedzialności pod /disclaimer
- [ ] Cookie banner pokazuje się PRZED załadowaniem GA
- [ ] Użytkownik może wycofać zgodę (przycisk w footer)
- [ ] IP anonimizowany przed API (sprawdź logi)

### 4. Functional Testing
```bash
# Test 1: Rejestracja użytkownika
curl -X POST http://localhost:5000/register \
  -d "username=testuser&password=Test123!"

# Test 2: Logowanie
curl -X POST http://localhost:5000/login \
  -d "username=testuser&password=Test123!" \
  -c cookies.txt

# Test 3: AquaBot (z session cookie)
curl -X POST http://localhost:5000/aquabot/send \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"message":"jaka jest twardość wody?"}'
```

## SUCCESS CRITERIA

✅ Wszystkie testy przechodzą bez błędów  
✅ SSL Labs: A+ (produkcja) lub A (localhost self-signed)  
✅ Bandit: 0 HIGH/MEDIUM issues  
✅ Safety: 0 known vulnerabilities  
✅ Functional tests: 100% pass  
✅ GDPR compliance: wszystkie dokumenty dostępne  
✅ Rate limiting: 429 error po przekroczeniu limitu  
✅ XSS: brak wykonania skryptu z user input  
✅ CSRF: 403 error bez tokenu  
✅ Anonimizacja IP: hash w logach zamiast prawdziwego IP  

## POST-IMPLEMENTATION

### 1. Commitowanie zmian
```bash
# NIGDY nie commituj .env!
echo ".env" >> .gitignore
git add .gitignore

# Commituj naprawione pliki
git add app.py aquabotBackend.py templates/ static/ requirements.txt
git commit -m "fix: Critical security fixes (RODO compliance, XSS, CSRF, rate limiting)"

# UPEWNIJ SIĘ ŻE .env NIE JEST W REPO
git log --all -- .env
# → Jeśli widzisz wpisy, ZATRZYMAJ SIĘ i użyj git filter-branch!
```

### 2. Regeneracja kluczy API
```bash
# Google Cloud Console → API & Services → Credentials
# 1. DELETE old API key (AIzaSy...GxQ)
# 2. CREATE NEW restricted key
# 3. Skopiuj do .env

# Discord Developer Portal → Bot → Reset Token
# Skopiuj nowy token do .env
```

### 3. Wdrożenie produkcyjne
```bash
# Na serwerze (Ubuntu/Debian)
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Certbot (automatyczny SSL)
sudo certbot --nginx -d skankran.pl -d www.skankran.pl

# Restart Nginx
sudo systemctl restart nginx

# Uruchom Flask przez systemd (nie debug mode!)
# Utwórz /etc/systemd/system/skankran.service
```

### 4. Monitoring
```bash
# Logi Nginx
sudo tail -f /var/log/nginx/access.log

# Logi Flask
tail -f skankran.log

# Sprawdzanie błędów
grep "ERROR" skankran.log | tail -20
```

## CONTACT IN CASE OF ISSUES

Jeśli Claude AI ma problemy z implementacją:

**Zacznij od prostych napraw:**
1. Najpierw napraw A1 (ekspozycja kluczy) - najłatwiejsze
2. Potem A4 (cookie banner) - czysto frontend
3. Potem B1 (XSS) - prosta zmiana innerHTML → textContent
4. Na końcu B3 (rate limiting) - wymaga testowania

**Debugowanie:**
- Każda naprawa w osobnym commicie (łatwiej rollbackować)
- Testuj po każdej kategorii (A1-A4, potem B1-B5)
- Jeśli coś nie działa, sprawdź logi: `tail -f skankran.log`

**Priorytet:** Jeśli czegoś nie da się naprawić, pomiń to i napisz w komentarzu:
```python
# TODO: [Kategoria X.Y] - Not implemented due to [reason]
# Risk: [LOW/MEDIUM/HIGH]
# Workaround: [alternative solution]
```

---

END OF INSTRUCTION DOCUMENT
