# 🚀 SKANKRAN - Instrukcja Migracji do PostgreSQL

## 📋 Status: GOTOWE DO UŻYCIA

System został zmigrowany z JSON na PostgreSQL z zachowaniem pełnej kompatybilności wstecznej.

---

## 🎯 CO ZOSTAŁO ZAIMPLEMENTOWANE

### 1. **models.py** - Architektura Bazy Danych
- ✅ `City` - Miasta z informacjami
- ✅ `Station` - Stacje Uzdatniania Wody (SUW)
- ✅ `MeasurementPoint` - Punkty pomiarowe
- ✅ `WaterMeasurement` - Pomiary parametrów wody
- ✅ `CityZone` - Mapowanie dzielnic → SUW
- ✅ `CityAverage` - Średnie wartości dla miasta

### 2. **seed_db.py** - Migracja Danych
Inteligentny skrypt z logiką:
- ✅ `0` → `NULL` (brak danych)
- ✅ `0.0001` → `0.0001` (ZACHOWANE - "Poznań hack")
- ✅ `"Brak danych"` → `NULL`
- ✅ Konwersja jednostek (mg/l vs µg/l)
- ✅ Weryfikacja integralności

### 3. **aquabotBackend.py** - Fallback Strategy
```
Try: PostgreSQL (primary)
  ↓ błąd?
Except: JSON files (backup)
```

### 4. **app.py** - Integracja
- ✅ Import nowych modeli
- ✅ Zachowanie starych modeli (User, VisitorEvent, etc.)

---

## 🔧 KROKI MIGRACJI

### Krok 1: Setup Bazy Lokalnie (OPCJONALNIE)

Jeśli chcesz testować lokalnie z PostgreSQL:

```powershell
# Zainstaluj PostgreSQL (jeśli nie masz)
# Utwórz bazę danych
createdb skankran_dev

# Ustaw zmienną środowiskową
$env:DATABASE_URL = "postgresql://localhost/skankran_dev"
```

**LUB** zostaw domyślną SQLite (migracja działa też na SQLite):
```powershell
# Zostaw puste - użyje SQLite lokalnie
```

---

### Krok 2: Zainstaluj Zależności (jeśli jeszcze nie masz)

```powershell
pip install psycopg2-binary
```

---

### Krok 3: Uruchom Migrację

```powershell
python seed_db.py
```

**Co się stanie:**
1. Skrypt zapyta: `Type 'YES' to continue`
2. Po wpisaniu `YES`:
   - Kasuje stare tabele wody (jeśli są)
   - Tworzy nowe tabele
   - Importuje dane z `waterAnalysis.json`
   - Weryfikuje integralność (sprawdza Poznań hack)
   - Wyświetla statystyki

**Output przykładowy:**
```
============================================================
SKANKRAN - Database Migration Tool
Migrating from waterAnalysis.json to PostgreSQL
============================================================

[LOAD] Reading JSON files...
  ✅ Loaded 60 cities from waterAnalysis.json
  ✅ Loaded averages for 60 cities

[CLEAN] Dropping existing water data tables...
  ✅ Tables dropped

[CREATE] Creating tables...
  ✅ Tables created

[SEED] Creating cities and averages...
  → Processing city: Grudziądz
  → Processing city: Wałbrzych
  ...
  ✅ Created 60 cities

[SEED] Creating stations and measurements...
  → City Grudziądz: 1 stations
  → City Poznań: 13 stations
  ...
  ✅ Created 250 stations
  ✅ Created 3500 station measurements

[VERIFY] Checking migration integrity...
  ✅ POZNAŃ HACK: Ołów = 0.0001 (zachowane poprawnie)
  → NULL measurements: 450
  → Non-NULL measurements: 3050
  → Measurements in µg/l: 750
  → Measurements in mg/l: 2750

============================================================
✅ MIGRATION COMPLETE!
============================================================

Final Statistics:
  Cities: 60
  Stations: 250
  Measurement Points: 45
  Total Measurements: 3500
  City Zones: 1200
```

---

### Krok 4: Weryfikacja - Uruchom Aplikację

```powershell
python app.py
```

**Sprawdź w logach:**
```
[AQUABOT] ✅ Using PostgreSQL: 60 cities loaded
```

**LUB** jeśli baza nie działa (fallback):
```
[AQUABOT] ⚠️ PostgreSQL not available, falling back to JSON
[AQUABOT] ✅ Fallback: Loaded 60 cities from JSON
```

---

### Krok 5: Test w Przeglądarce

1. Otwórz stronę: `http://localhost:5000`
2. Wybierz miasto (np. Poznań)
3. Kliknij na stację
4. Sprawdź AquaBot

**Co powinno działać:**
- ✅ Mapa wyświetla stacje
- ✅ Parametry pokazują poprawne wartości
- ✅ Kolorowe kropki działają (szara/zielona/pomarańczowa/czerwona)
- ✅ Poznań: Ołów pokazuje "0.00" z zieloną kropką
- ✅ AquaBot odpowiada na pytania

---

## 🚀 DEPLOYMENT NA RENDER.COM

### 1. Dodaj PostgreSQL Add-on

W Render Dashboard:
1. Idź do swojej aplikacji
2. Dodaj PostgreSQL database
3. Skopiuj `DATABASE_URL`

### 2. Ustaw Environment Variables

```
DATABASE_URL=postgresql://user:pass@host/dbname
```

### 3. Uruchom Migrację na Render

**Metoda A: Przez Render Shell**
```bash
python seed_db.py
# Wpisz: YES
```

**Metoda B: Przez SSH (jeśli masz dostęp)**
```bash
render ssh
python seed_db.py
```

**Metoda C: Jednorazowy Job (zalecane)**
1. W Render → Jobs → New Job
2. Command: `python seed_db.py`
3. Manually trigger

---

## 🔄 AKTUALIZACJA DANYCH

### Opcja A: Ręczna Edycja JSON → Re-seed

1. Edytuj `waterAnalysis.json`
2. Uruchom: `python seed_db.py` (wpisz YES)
3. Wszystko zostanie nadpisane

### Opcja B: SQL Updates (zaawansowane)

```python
# Przykład: Dodaj nowy pomiar dla Poznania
from app import app, db
from models import Station, WaterMeasurement
from datetime import date

with app.app_context():
    station = Station.query.filter_by(name="SUW Poznań (Wiśniowa)").first()
    
    new_measurement = WaterMeasurement(
        station_id=station.id,
        parameter='pH',
        value=7.8,
        unit='mg/l',
        measurement_date=date(2026, 1, 8)
    )
    
    db.session.add(new_measurement)
    db.session.commit()
    print("✅ Nowy pomiar dodany!")
```

---

## 🛡️ FALLBACK STRATEGY

System ma **automatyczny fallback**:

```
1. AquaBot próbuje PostgreSQL
   ├─ Sukces → Używa bazy (wydajne, skalowalne)
   └─ Błąd → Fallback do JSON (bezpieczne)

2. Frontend zawsze używa waterAnalysis.js (hardcoded)
   - Nie wymaga zmian
   - Działa offline
```

**Kiedy aktywuje się fallback?**
- Baza PostgreSQL nie odpowiada
- Tabele nie istnieją
- Błąd połączenia
- Puste dane w bazie

**Aby wymusić fallback (test):**
```python
# Tymczasowo zmień w aquabotBackend.py
self.use_database = False  # Force JSON
```

---

## 🐛 TROUBLESHOOTING

### Problem: "could not connect to server"
**Rozwiązanie:**
1. Sprawdź `DATABASE_URL`
2. Sprawdź czy PostgreSQL działa
3. Fallback na JSON zadziała automatycznie

### Problem: "POZNAŃ HACK: Ołów = NULL"
**Rozwiązanie:**
```powershell
# W waterAnalysis.json upewnij się że jest:
"olow": "0.0001"  # NIE "0"

# Potem re-seed:
python seed_db.py
```

### Problem: "No module named 'psycopg2'"
**Rozwiązanie:**
```powershell
pip install psycopg2-binary
```

### Problem: Frontend pokazuje szare kropki
**Rozwiązanie:**
- Frontend używa `waterAnalysis.js` (nie SQL!)
- Sprawdź czy plik JS jest aktualny
- Alternatywnie: Zbuduj API endpoint (future work)

---

## 📊 WERYFIKACJA PO MIGRACJI

### Test 1: Sprawdź logi AquaBota
```
[AQUABOT] ✅ Using PostgreSQL: 60 cities loaded
```

### Test 2: Poznań Hack
```python
from app import app, db
from models import City, Station, WaterMeasurement

with app.app_context():
    poznan = City.query.filter_by(name='Poznań').first()
    station = poznan.stations.first()
    olow = WaterMeasurement.query.filter_by(
        station_id=station.id, 
        parameter='olow'
    ).first()
    
    print(f"Ołów w Poznaniu: {olow.value}")  # Powinno być: 0.0001
```

### Test 3: AquaBot Query
1. Otwórz stronę
2. Wybierz Poznań
3. AquaBot: "Jakie są parametry ołowiu?"
4. Powinno pokazać: `<param:olow:0.0001>` (zielona kropka)

---

## 🎯 KOLEJNE KROKI (Future Work)

### Faza 1: ✅ DONE
- [x] Models.py
- [x] Seed script
- [x] Fallback strategy
- [x] Integracja z app.py

### Faza 2: Planowane
- [ ] API endpoints (`/api/cities`, `/api/stations/<city>`)
- [ ] Frontend migration (waterAnalysis.js → API calls)
- [ ] Cache layer (Redis lub Python @lru_cache)
- [ ] Admin panel (CRUD dla pomiarów)

### Faza 3: Zaawansowane
- [ ] Historia pomiarów (time-series)
- [ ] Automatyczne importy z CSV
- [ ] Porównania międzymiastowe (SQL queries)
- [ ] Eksport do PDF (raporty)

---

## 💡 WSKAZÓWKI

1. **Testuj lokalnie** z SQLite przed Render
2. **Zawsze backup** `waterAnalysis.json` przed migracją
3. **Fallback działa automatycznie** - nie martw się!
4. **Frontend bezpieczny** - nie wymaga zmian

---

## 📞 POMOC

Jeśli coś nie działa:
1. Sprawdź logi: `[AQUABOT] ✅ Using...`
2. Fallback na JSON działa zawsze
3. Re-seed: `python seed_db.py`

---

**✅ System gotowy do grantu! Profesjonalna architektura PostgreSQL z pełnym fallbackiem.**
