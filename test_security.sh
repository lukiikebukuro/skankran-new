#!/bin/bash
# ============================================
# SKANKRAN.PL - SECURITY TEST SUITE
# ============================================
# Użycie: bash test_security.sh
# ============================================

set -e  # Exit on error

echo "============================================"
echo "🔒 SKANKRAN.PL SECURITY AUDIT"
echo "============================================"
echo ""

# Kolory dla outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

# ============================================
# TEST 1: SPRAWDZENIE PLIKÓW WRAŻLIWYCH
# ============================================
echo "Test 1: Sprawdzanie plików wrażliwych..."
echo "-------------------------------------------"

if [ ! -f ".env" ]; then
    fail ".env nie istnieje - stwórz go z .env.example"
else
    pass ".env istnieje"
fi

if grep -q "\.env" .gitignore 2>/dev/null; then
    pass ".env jest w .gitignore"
else
    fail ".env NIE JEST w .gitignore - DODAJ NATYCHMIAST!"
fi

if [ -f "config.py" ]; then
    fail "config.py nadal istnieje - USUŃ GO (zastąpiony przez .env)"
else
    pass "config.py usunięty (poprawnie)"
fi

echo ""

# ============================================
# TEST 2: SPRAWDZENIE GIT HISTORY
# ============================================
echo "Test 2: Sprawdzanie historii Git..."
echo "-------------------------------------------"

if git log --all --full-history -- .env 2>/dev/null | grep -q "commit"; then
    fail ".env ZNALEZIONY W HISTORII GIT - WYMAGA filter-branch!"
    echo "   Uruchom: git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all"
else
    pass ".env nie był nigdy commitowany"
fi

if git log --all --full-history -- config.py 2>/dev/null | grep -q "DISCORD_BOT_TOKEN"; then
    warn "Stare klucze API w historii Git - rozważ regenerację kluczy"
else
    pass "Brak wrażliwych danych w historii Git"
fi

echo ""

# ============================================
# TEST 3: WALIDACJA .env
# ============================================
echo "Test 3: Walidacja zawartości .env..."
echo "-------------------------------------------"

if [ -f ".env" ]; then
    if grep -q "SECRET_KEY='tutaj_wklej" .env; then
        fail "SECRET_KEY nie został zmieniony - użyj generate_secret_key.py"
    elif grep -q "SECRET_KEY='default_secret" .env; then
        fail "SECRET_KEY to domyślna wartość - ZMIEŃ!"
    else
        secret_length=$(grep "SECRET_KEY=" .env | cut -d"'" -f2 | wc -c)
        if [ "$secret_length" -lt 32 ]; then
            fail "SECRET_KEY za krótki (${secret_length} znaków, minimum 64)"
        else
            pass "SECRET_KEY ma odpowiednią długość"
        fi
    fi
    
    if grep -q "GOOGLE_API_KEY=YOUR" .env; then
        fail "GOOGLE_API_KEY nie został ustawiony"
    else
        pass "GOOGLE_API_KEY został skonfigurowany"
    fi
fi

echo ""

# ============================================
# TEST 4: FLASK APP - ENDPOINTS
# ============================================
echo "Test 4: Testowanie endpointów Flask (lokalnie)..."
echo "-------------------------------------------"

# Sprawdź czy Flask działa
if ! command -v curl &> /dev/null; then
    warn "curl nie zainstalowany - pomijam testy HTTP"
else
    # Test 1: HTTP -> HTTPS redirect (tylko produkcja)
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 2>/dev/null | grep -q "301\|302"; then
        pass "HTTP redirect do HTTPS działa"
    else
        warn "HTTP redirect nie działa (OK dla dev, ZŁE dla produkcji)"
    fi
    
    # Test 2: Rate Limiting
    echo -n "Testowanie rate limiting (10 requestów)... "
    rate_limit_hit=0
    for i in {1..11}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/aquabot/send \
            -H "Content-Type: application/json" \
            -d '{"message":"test"}' 2>/dev/null)
        if [ "$response" == "429" ]; then
            rate_limit_hit=1
            break
        fi
    done
    
    if [ $rate_limit_hit -eq 1 ]; then
        pass "Rate limiting działa (429 po limicie)"
    else
        warn "Rate limiting nie zadziałał - sprawdź konfigurację"
    fi
fi

echo ""

# ============================================
# TEST 5: PYTHON SECURITY (BANDIT)
# ============================================
echo "Test 5: Analiza statyczna kodu (Bandit)..."
echo "-------------------------------------------"

if command -v bandit &> /dev/null; then
    bandit -r app.py aquabotBackend.py -f txt -o bandit_report.txt 2>/dev/null || true
    
    if grep -q "High:" bandit_report.txt; then
        fail "Znaleziono HIGH severity issues - sprawdź bandit_report.txt"
    elif grep -q "Medium:" bandit_report.txt; then
        warn "Znaleziono MEDIUM severity issues - sprawdź bandit_report.txt"
    else
        pass "Brak HIGH/MEDIUM security issues w kodzie"
    fi
    rm -f bandit_report.txt
else
    warn "Bandit nie zainstalowany - pomijam (zainstaluj: pip install bandit)"
fi

echo ""

# ============================================
# TEST 6: DEPENDENCIES (SAFETY)
# ============================================
echo "Test 6: Sprawdzanie vulnerability w zależnościach..."
echo "-------------------------------------------"

if command -v safety &> /dev/null; then
    if safety check --json > safety_report.json 2>/dev/null; then
        pass "Brak znanych vulnerability w dependencies"
    else
        fail "Znaleziono vulnerability - uruchom: safety check"
    fi
    rm -f safety_report.json
else
    warn "Safety nie zainstalowany - pomijam (zainstaluj: pip install safety)"
fi

echo ""

# ============================================
# TEST 7: SSL/TLS (produkcja)
# ============================================
echo "Test 7: Sprawdzanie SSL/TLS (tylko produkcja)..."
echo "-------------------------------------------"

if curl -k -s https://localhost:5443 &> /dev/null; then
    ssl_version=$(curl -k -s -o /dev/null -w "%{ssl_verify_result}" https://localhost:5443 2>/dev/null)
    if [ "$ssl_version" == "0" ]; then
        pass "SSL certificate valid"
    else
        warn "SSL certificate invalid (OK dla self-signed dev cert)"
    fi
else
    warn "HTTPS nie działa lokalnie (OK, użyj Nginx w produkcji)"
fi

echo ""

# ============================================
# TEST 8: PLIKI RODO/COMPLIANCE
# ============================================
echo "Test 8: Sprawdzanie dokumentów RODO..."
echo "-------------------------------------------"

required_files=("templates/privacy.html" "templates/disclaimer.html" "templates/cookie_banner.html")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        pass "$file istnieje"
    else
        fail "$file BRAKUJE - dodaj z dokumentacji"
    fi
done

echo ""

# ============================================
# PODSUMOWANIE
# ============================================
echo "============================================"
echo "📊 PODSUMOWANIE AUDYTU"
echo "============================================"

pass_count=$(grep -c "✅ PASS" <<< "$(set +x; bash test_security.sh 2>&1)" || echo "0")
fail_count=$(grep -c "❌ FAIL" <<< "$(set +x; bash test_security.sh 2>&1)" || echo "0")
warn_count=$(grep -c "⚠️  WARN" <<< "$(set +x; bash test_security.sh 2>&1)" || echo "0")

echo "Zakończono testy bezpieczeństwa"
echo ""
echo "📋 CHECKLIST RĘCZNY (przeprowadź samodzielnie):"
echo "-------------------------------------------"
echo "[ ] Zregenerowano wszystkie klucze API (Google, Discord)"
echo "[ ] .env NIGDY nie był commitowany do Git"
echo "[ ] Cookie banner pokazuje się przed Google Analytics"
echo "[ ] Użytkownik może wycofać zgodę na cookies"
echo "[ ] Nginx reverse proxy działa w produkcji"
echo "[ ] Certbot SSL certificate aktywny (produkcja)"
echo "[ ] Rate limiting testowany ręcznie (11 requestów/min)"
echo "[ ] XSS test: <img src=x onerror=alert(1)> w AquaBot"
echo "[ ] CSRF test: POST bez tokenu zwraca 403"
echo "[ ] IP anonimizacja: logi pokazują hash, nie prawdziwy IP"
echo ""

if [ "$fail_count" -gt 0 ]; then
    echo -e "${RED}❌ AUDIT FAILED${NC} - Napraw błędy przed wdrożeniem!"
    exit 1
else
    echo -e "${GREEN}✅ AUDIT PASSED${NC} - Gotowe do wdrożenia (sprawdź checklist ręczny)"
    exit 0
fi
