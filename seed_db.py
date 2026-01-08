# seed_db.py - Migracja danych z waterAnalysis.json do PostgreSQL
# KRYTYCZNA LOGIKA: 0 → NULL, 0.0001 → 0.0001 (ZACHOWAJ HACK!)

import json
import os
from datetime import datetime, date
from app import app, db, City, Station, MeasurementPoint, WaterMeasurement, CityZone, CityAverage

# Ścieżki do plików JSON
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WATER_ANALYSIS_PATH = os.path.join(BASE_DIR, 'waterAnalysis.json')
AVERAGES_PATH = os.path.join(BASE_DIR, 'averages.json')

# ============================================
# KLUCZOWE FUNKCJE LOGIKI DANYCH
# ============================================

def parse_value(value, parameter=None):
    """
    Konwertuje wartość z JSON do formatu bazy danych.
    
    KRYTYCZNA LOGIKA (zgodnie z instrukcją użytkownika):
    - 0 (number) → None (NULL)
    - "0" (string) → None (NULL)
    - "" (pusty string) → None (NULL)
    - "Brak danych" → None (NULL)
    - 0.0001 → 0.0001 (ZACHOWAJ! To "Poznań hack")
    - "<0.5" → (0.5, True) - poniżej granicy wykrywalności
    - Inne liczby → wartość numeryczna
    
    Args:
        value: Wartość z JSON (string lub number)
        parameter: Nazwa parametru (dla kontekstu)
    
    Returns:
        tuple: (numeric_value or None, below_detection_limit)
    """
    # Przypadek 1: None/null w JSON
    if value is None:
        return (None, False)
    
    # Przypadek 2: String
    if isinstance(value, str):
        value = value.strip()
        
        # "Brak danych" → NULL
        if value.lower() == "brak danych" or value == "":
            return (None, False)
        
        # Wartość poniżej granicy wykrywalności: "<0.5"
        if value.startswith('<'):
            try:
                numeric = float(value.replace('<', ''))
                return (numeric, True)  # below_detection_limit = True
            except (ValueError, TypeError):
                return (None, False)
        
        # Normalna wartość string → float
        try:
            numeric = float(value)
        except (ValueError, TypeError):
            print(f"[WARNING] Cannot parse value '{value}' for parameter {parameter}, setting to NULL")
            return (None, False)
    else:
        # Wartość już numeryczna
        numeric = float(value)
    
    # Przypadek 3: Liczba 0 (dokładnie zero) → NULL
    # WYJĄTEK: 0.0001 NIE JEST zerem, zachowujemy!
    if numeric == 0.0:
        return (None, False)
    
    # Przypadek 4: 0.0001 lub inna wartość → ZACHOWAJ
    return (numeric, False)


def get_unit_for_parameter(parameter):
    """
    Zwraca jednostkę dla danego parametru.
    Metale ciężkie w µg/l, reszta w mg/l.
    """
    # Metale ciężkie (µg/l)
    heavy_metals = ['mangan', 'olow', 'rtec']
    
    if parameter in heavy_metals:
        return 'µg/l'
    else:
        return 'mg/l'


def convert_units_if_needed(value, parameter, source_unit='mg/l'):
    """
    Konwertuje jednostki jeśli potrzeba.
    
    Jeśli w JSON dane są w mg/l, a mają być w µg/l (metale) → pomnóż przez 1000.
    
    Args:
        value: Wartość numeryczna (lub None)
        parameter: Nazwa parametru
        source_unit: Jednostka źródłowa z JSON (domyślnie mg/l)
    
    Returns:
        float or None: Wartość w odpowiedniej jednostce
    """
    if value is None:
        return None
    
    target_unit = get_unit_for_parameter(parameter)
    
    # Jeśli źródło to mg/l, a cel to µg/l → pomnóż przez 1000
    if source_unit == 'mg/l' and target_unit == 'µg/l':
        # UWAGA: Ale w waterAnalysis.json dla metali ciężkich już są w µg/l!
        # Sprawdzamy czy wartość jest podejrzanie mała (wtedy już jest w µg/l)
        # Np. 0.0001 dla ołowiu to już µg/l, nie mg/l
        
        # Heurystyka: jeśli wartość < 1 dla metali, zakładamy że już jest w µg/l
        if value < 1:
            return value  # Już w µg/l
        else:
            return value * 1000  # Konwersja mg/l → µg/l
    
    return value


# ============================================
# FUNKCJE SEEDOWANIA
# ============================================

def seed_cities_and_averages(water_data, averages_data):
    """
    Tworzy miasta i ich średnie wartości.
    """
    print("\n[SEED] Creating cities and averages...")
    
    for city_name, city_info in water_data.items():
        print(f"  → Processing city: {city_name}")
        
        # Tworzenie miasta
        city = City(
            name=city_name,
            info=city_info.get('info', ''),
            fun_facts=city_info.get('fun_facts')
        )
        db.session.add(city)
        db.session.flush()  # Aby dostać city.id
        
        # Tworzenie średnich
        avg_data = city_info.get('average', {})
        if not avg_data and city_name in averages_data:
            avg_data = averages_data[city_name]
        
        if avg_data:
            avg = CityAverage(city_id=city.id)
            
            # Parametry z JSON → baza
            for param in ['pH', 'twardosc', 'azotany', 'zelazo', 'fluorki', 'chlor', 
                         'chlorki', 'siarczany', 'potas', 'magnez', 'metnosc', 
                         'barwa', 'mangan', 'olow', 'rtec']:
                value, _ = parse_value(avg_data.get(param, 0), param)
                value = convert_units_if_needed(value, param)
                setattr(avg, param, value)
            
            db.session.add(avg)
    
    db.session.commit()
    print(f"[SEED] ✅ Created {City.query.count()} cities")


def seed_stations(water_data):
    """
    Tworzy stacje SUW i ich pomiary.
    """
    print("\n[SEED] Creating stations and measurements...")
    measurement_date = date(2024, 12, 1)  # Domyślna data dla istniejących danych
    
    for city_name, city_info in water_data.items():
        city = City.query.filter_by(name=city_name).first()
        if not city:
            continue
        
        stations = city_info.get('stations', [])
        print(f"  → City {city_name}: {len(stations)} stations")
        
        for station_data in stations:
            # Tworzenie stacji
            coords = station_data.get('coords', [0, 0])
            station = Station(
                city_id=city.id,
                name=station_data['name'],
                address=station_data.get('address', ''),
                latitude=coords[0],
                longitude=coords[1]
            )
            db.session.add(station)
            db.session.flush()
            
            # Tworzenie pomiarów
            measurements_data = station_data.get('data', {})
            for param, value in measurements_data.items():
                numeric_value, below_limit = parse_value(value, param)
                numeric_value = convert_units_if_needed(numeric_value, param)
                unit = get_unit_for_parameter(param)
                
                measurement = WaterMeasurement(
                    station_id=station.id,
                    parameter=param,
                    value=numeric_value,
                    unit=unit,
                    measurement_date=measurement_date,
                    below_detection_limit=below_limit
                )
                db.session.add(measurement)
    
    db.session.commit()
    print(f"[SEED] ✅ Created {Station.query.count()} stations")
    print(f"[SEED] ✅ Created {WaterMeasurement.query.filter(WaterMeasurement.station_id.isnot(None)).count()} station measurements")


def seed_measurement_points(water_data):
    """
    Tworzy punkty pomiarowe i ich pomiary.
    """
    print("\n[SEED] Creating measurement points...")
    measurement_date = date(2024, 12, 1)
    
    for city_name, city_info in water_data.items():
        city = City.query.filter_by(name=city_name).first()
        if not city:
            continue
        
        points = city_info.get('measurementPoints', [])
        if not points:
            continue
        
        print(f"  → City {city_name}: {len(points)} measurement points")
        
        for point_data in points:
            coords = point_data.get('coords', [0, 0])
            point = MeasurementPoint(
                city_id=city.id,
                name=point_data['name'],
                address=point_data.get('address', ''),
                latitude=coords[0],
                longitude=coords[1]
            )
            db.session.add(point)
            db.session.flush()
            
            # Tworzenie pomiarów
            measurements_data = point_data.get('data', {})
            for param, value in measurements_data.items():
                numeric_value, below_limit = parse_value(value, param)
                numeric_value = convert_units_if_needed(numeric_value, param)
                unit = get_unit_for_parameter(param)
                
                measurement = WaterMeasurement(
                    measurement_point_id=point.id,
                    parameter=param,
                    value=numeric_value,
                    unit=unit,
                    measurement_date=measurement_date,
                    below_detection_limit=below_limit
                )
                db.session.add(measurement)
    
    db.session.commit()
    print(f"[SEED] ✅ Created {MeasurementPoint.query.count()} measurement points")
    print(f"[SEED] ✅ Created {WaterMeasurement.query.filter(WaterMeasurement.measurement_point_id.isnot(None)).count()} point measurements")


def seed_zones(water_data):
    """
    Tworzy mapowanie dzielnic → stacji.
    """
    print("\n[SEED] Creating city zones...")
    
    for city_name, city_info in water_data.items():
        city = City.query.filter_by(name=city_name).first()
        if not city:
            continue
        
        zones = city_info.get('zones', {})
        if not zones:
            continue
        
        print(f"  → City {city_name}: {len(zones)} zones")
        
        for zone_name, station_name in zones.items():
            # Obsługa array (kilka stacji dla jednej dzielnicy)
            if isinstance(station_name, list):
                station_name = json.dumps(station_name)  # Zapisz jako JSON string
            
            zone = CityZone(
                city_id=city.id,
                zone_name=zone_name,
                station_name=station_name
            )
            db.session.add(zone)
    
    db.session.commit()
    print(f"[SEED] ✅ Created {CityZone.query.count()} zones")


def verify_migration():
    """
    Weryfikuje poprawność migracji - sprawdza kluczowe przypadki.
    """
    print("\n[VERIFY] Checking migration integrity...")
    
    # Test 1: Poznań - sprawdź czy 0.0001 zostało zachowane
    poznan = City.query.filter_by(name='Poznań').first()
    if poznan:
        station = poznan.stations.first()
        if station:
            olow = WaterMeasurement.query.filter_by(
                station_id=station.id, 
                parameter='olow'
            ).first()
            
            if olow:
                if olow.value == 0.0001:
                    print("  ✅ POZNAŃ HACK: Ołów = 0.0001 (zachowane poprawnie)")
                elif olow.value is None:
                    print("  ❌ BŁĄD: Ołów = NULL (powinno być 0.0001!)")
                else:
                    print(f"  ⚠️ UWAGA: Ołów = {olow.value} (oczekiwano 0.0001)")
            else:
                print("  ⚠️ Brak pomiaru ołowiu dla Poznania")
    
    # Test 2: Sprawdź NULL vs wartości
    null_count = WaterMeasurement.query.filter_by(value=None).count()
    non_null_count = WaterMeasurement.query.filter(WaterMeasurement.value.isnot(None)).count()
    print(f"  → NULL measurements: {null_count}")
    print(f"  → Non-NULL measurements: {non_null_count}")
    
    # Test 3: Jednostki
    ug_count = WaterMeasurement.query.filter_by(unit='µg/l').count()
    mg_count = WaterMeasurement.query.filter_by(unit='mg/l').count()
    print(f"  → Measurements in µg/l: {ug_count}")
    print(f"  → Measurements in mg/l: {mg_count}")
    
    print("\n[VERIFY] ✅ Verification complete")


# ============================================
# MAIN SEED FUNCTION
# ============================================

def seed_all():
    """
    Główna funkcja seedowania - czyści bazę i importuje wszystkie dane.
    """
    print("=" * 60)
    print("SKANKRAN - Database Migration Tool")
    print("Migrating from waterAnalysis.json to PostgreSQL")
    print("=" * 60)
    
    # Wczytaj JSON
    print("\n[LOAD] Reading JSON files...")
    try:
        with open(WATER_ANALYSIS_PATH, 'r', encoding='utf-8') as f:
            water_data = json.load(f)
        print(f"  ✅ Loaded {len(water_data)} cities from waterAnalysis.json")
    except Exception as e:
        print(f"  ❌ ERROR loading waterAnalysis.json: {e}")
        return
    
    try:
        with open(AVERAGES_PATH, 'r', encoding='utf-8') as f:
            averages_data = json.load(f)
        print(f"  ✅ Loaded averages for {len(averages_data)} cities")
    except Exception as e:
        print(f"  ⚠️ WARNING: Could not load averages.json: {e}")
        averages_data = {}
    
    # Wyczyść bazę (UWAGA: kasuje wszystkie dane!)
    print("\n[CLEAN] Dropping existing water data tables...")
    try:
        db.drop_all()
        print("  ✅ Tables dropped")
    except Exception as e:
        print(f"  ⚠️ WARNING: Could not drop tables: {e}")
    
    print("\n[CREATE] Creating tables...")
    db.create_all()
    print("  ✅ Tables created")
    
    # Seedowanie
    try:
        seed_cities_and_averages(water_data, averages_data)
        seed_stations(water_data)
        seed_measurement_points(water_data)
        seed_zones(water_data)
        
        # Weryfikacja
        verify_migration()
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION COMPLETE!")
        print("=" * 60)
        
        # Statystyki finalne
        print(f"\nFinal Statistics:")
        print(f"  Cities: {City.query.count()}")
        print(f"  Stations: {Station.query.count()}")
        print(f"  Measurement Points: {MeasurementPoint.query.count()}")
        print(f"  Total Measurements: {WaterMeasurement.query.count()}")
        print(f"  City Zones: {CityZone.query.count()}")
        
    except Exception as e:
        print(f"\n❌ MIGRATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()


# ============================================
# CLI
# ============================================

if __name__ == '__main__':
    with app.app_context():
        print("\n⚠️  WARNING: This will DELETE all existing water data!")
        confirm = input("Type 'YES' to continue: ")
        
        if confirm == 'YES':
            seed_all()
        else:
            print("Migration cancelled.")
