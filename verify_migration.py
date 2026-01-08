# verify_migration.py - Szybka weryfikacja po migracji

from app import app, db, City, Station, WaterMeasurement, CityAverage
from sqlalchemy import func

def verify_all():
    """Kompleksowa weryfikacja migracji"""
    with app.app_context():
        print("=" * 60)
        print("SKANKRAN - Migration Verification")
        print("=" * 60)
        
        # Test 1: Podstawowe statystyki
        print("\n[TEST 1] Database Statistics:")
        cities_count = City.query.count()
        stations_count = Station.query.count()
        measurements_count = WaterMeasurement.query.count()
        
        print(f"  Cities: {cities_count}")
        print(f"  Stations: {stations_count}")
        print(f"  Measurements: {measurements_count}")
        
        if cities_count == 0:
            print("  ❌ BŁĄD: Baza pusta! Uruchom: python seed_db.py")
            return
        
        # Test 2: Poznań Hack
        print("\n[TEST 2] Poznań Hack (0.0001):")
        poznan = City.query.filter_by(name='Poznań').first()
        
        if not poznan:
            print("  ⚠️ Poznań nie znaleziony w bazie")
        else:
            station = poznan.stations.first()
            if station:
                olow = WaterMeasurement.query.filter_by(
                    station_id=station.id, 
                    parameter='olow'
                ).first()
                
                rtec = WaterMeasurement.query.filter_by(
                    station_id=station.id, 
                    parameter='rtec'
                ).first()
                
                if olow:
                    if olow.value == 0.0001:
                        print(f"  ✅ Ołów: {olow.value} (POPRAWNE - hack zachowany)")
                    elif olow.value is None:
                        print(f"  ❌ Ołów: NULL (BŁĄD! Powinno być 0.0001)")
                    else:
                        print(f"  ⚠️ Ołów: {olow.value} (Nieoczekiwana wartość)")
                
                if rtec:
                    if rtec.value == 0.0001:
                        print(f"  ✅ Rtęć: {rtec.value} (POPRAWNE - hack zachowany)")
                    elif rtec.value is None:
                        print(f"  ❌ Rtęć: NULL (BŁĄD! Powinno być 0.0001)")
                    else:
                        print(f"  ⚠️ Rtęć: {rtec.value} (Nieoczekiwana wartość)")
        
        # Test 3: NULL vs wartości
        print("\n[TEST 3] NULL vs Non-NULL Distribution:")
        null_count = WaterMeasurement.query.filter_by(value=None).count()
        non_null_count = WaterMeasurement.query.filter(WaterMeasurement.value.isnot(None)).count()
        total = null_count + non_null_count
        
        null_pct = (null_count / total * 100) if total > 0 else 0
        non_null_pct = (non_null_count / total * 100) if total > 0 else 0
        
        print(f"  NULL (brak danych): {null_count} ({null_pct:.1f}%)")
        print(f"  Non-NULL (zmierzone): {non_null_count} ({non_null_pct:.1f}%)")
        
        if null_count == total:
            print("  ❌ BŁĄD: Wszystkie pomiary to NULL!")
        elif null_count == 0:
            print("  ⚠️ UWAGA: Brak pomiarów NULL (podejrzane)")
        else:
            print("  ✅ Rozkład wygląda poprawnie")
        
        # Test 4: Jednostki
        print("\n[TEST 4] Units Distribution:")
        ug_count = WaterMeasurement.query.filter_by(unit='µg/l').count()
        mg_count = WaterMeasurement.query.filter_by(unit='mg/l').count()
        
        print(f"  µg/l (metale ciężkie): {ug_count}")
        print(f"  mg/l (pozostałe): {mg_count}")
        
        if ug_count == 0:
            print("  ⚠️ Brak pomiarów w µg/l (sprawdź metale ciężkie)")
        else:
            print("  ✅ Jednostki rozdzielone poprawnie")
        
        # Test 5: Średnie miejskie
        print("\n[TEST 5] City Averages:")
        avg_count = CityAverage.query.count()
        print(f"  Miasta ze średnimi: {avg_count}/{cities_count}")
        
        if avg_count < cities_count:
            print(f"  ⚠️ Brakuje średnich dla {cities_count - avg_count} miast")
        else:
            print("  ✅ Wszystkie miasta mają średnie")
        
        # Test 6: Przykładowe miasto
        print("\n[TEST 6] Sample Data (Grudziądz):")
        grudziadz = City.query.filter_by(name='Grudziądz').first()
        
        if grudziadz:
            print(f"  ✅ Miasto: {grudziadz.name}")
            print(f"  Stacje: {grudziadz.stations.count()}")
            print(f"  Info: {grudziadz.info[:50]}..." if grudziadz.info else "  Info: Brak")
            
            if grudziadz.averages:
                print(f"  Średnia pH: {grudziadz.averages.pH}")
                print(f"  Średnia twardość: {grudziadz.averages.twardosc}")
            
            station = grudziadz.stations.first()
            if station:
                meas_count = station.measurements.count()
                print(f"  Pomiary na SUW: {meas_count}")
                
                # Przykładowy pomiar
                sample = station.measurements.first()
                if sample:
                    print(f"  Przykład: {sample.parameter} = {sample.value} {sample.unit}")
        
        # Test 7: Parametry coverage
        print("\n[TEST 7] Parameters Coverage:")
        params = db.session.query(
            WaterMeasurement.parameter, 
            func.count(WaterMeasurement.id)
        ).group_by(WaterMeasurement.parameter).all()
        
        for param, count in sorted(params, key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {param}: {count} pomiarów")
        
        # Final verdict
        print("\n" + "=" * 60)
        if cities_count > 0 and measurements_count > 0:
            print("✅ MIGRACJA WYGLĄDA POPRAWNIE!")
            print("\nSystem gotowy do użycia. Uruchom: python app.py")
        else:
            print("❌ MIGRACJA NIEPEŁNA!")
            print("\nUruchom: python seed_db.py")
        print("=" * 60)


if __name__ == '__main__':
    verify_all()
