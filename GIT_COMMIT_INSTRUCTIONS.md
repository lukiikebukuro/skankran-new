# Skankran - Git Commit Instructions

## Zmiany do zapisania (Faza 0 - Critical Fixes)

### Pliki zmodyfikowane:
1. `force_reset_admin.py` - Nowy skrypt do resetu hasła admin
2. `static/js/visitor_tracking.js` - Fix Content-Type header (linia 539-556)
3. `app.py` - Fix SQLAlchemy deprecation (linia 219) + datetime (linie 298, 566, 573, 1236, 1290)
4. `init_db.py` - Fix default password creation (linie 35-51)
5. `aquabotBackend.py` - Fix colored dots rendering (linia 189)

### Nowe pliki:
- `set_nokia_password.py` - Helper script
- `test_aquabot_save.py` - Database test script
- `check_admin.py` - Admin verification script
- `check_bot_responses.py` - Response debugging script

---

## Git Commands

### Opcja 1: Commit do main branch
```bash
cd C:\Users\lpisk\Projects\skankran2

# Sprawdź status
git status

# Dodaj wszystkie zmiany
git add .

# Commit z opisem
git commit -m "Fix: Faza 0 - Critical fixes (login, SATELITA, SQLAlchemy, datetime, AquaBot logs, colored dots)"

# Push do GitHub
git push origin main
```

### Opcja 2: Nowy branch (ZALECANE)
```bash
cd C:\Users\lpisk\Projects\skankran2

# Stwórz nowy branch
git checkout -b fix/faza-0-critical-fixes

# Dodaj zmiany
git add .

# Commit
git commit -m "Fix: Faza 0 - Critical fixes

- Login: Reset password mechanism (Nokia5310!)
- SATELITA: Fix 415 error (Content-Type header)
- SQLAlchemy: Fix deprecation warnings (User.query.get → db.session.get)
- Datetime: Fix deprecation warnings (datetime.utcnow → datetime.now(timezone.utc))
- AquaBot logs: Now saving to PostgreSQL successfully
- Colored dots: Fixed rendering in bot responses (removed double-escape)
- init_db.py: Create admin with default password when ADMIN_PASSWORD not set

Tested: Login works, logs save, console clean"

# Push nowy branch
git push -u origin fix/faza-0-critical-fixes
```

### Opcja 3: Stash (tymczasowe zapisanie bez commit)
```bash
# Zapisz zmiany tymczasowo
git stash save "Faza 0 - work in progress"

# Później przywróć
git stash pop
```

---

## Weryfikacja przed commit

```bash
# Sprawdź co zostało zmienione
git diff

# Sprawdź listę plików
git status

# Sprawdź logi
git log --oneline -5
```

---

## Po push do GitHub

1. Otwórz https://github.com/twoje-repo/skankran2
2. Jeśli zrobiłeś branch, stwórz Pull Request
3. Merge do main gdy wszystko działa

---

## Backup lokalny (opcjonalnie)

```bash
# Skopiuj cały folder
xcopy C:\Users\lpisk\Projects\skankran2 C:\Users\lpisk\Projects\skankran2_backup_2026-01-22 /E /I /H
```
