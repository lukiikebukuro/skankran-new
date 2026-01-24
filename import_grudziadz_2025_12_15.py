#!/usr/bin/env python3
"""
Grudziądz - 2025-12-15 Data Import (FIXED - Per-Station)
Data source: SPRAWOZDANIE Z POBIERANIA I BADAŃ Nr 10507/2025
1 station: SUW Hallera
"""

from datetime import date
from app import app, db, City, Station, CityAverage, WaterMeasurement

def import_grudziadz_2025_12_15_fixed():
    """Import Grudziądz with PER-STATION data"""
    
    with app.app_context():
        print("📊 Importing Grudziądz 2025-12-15 (per-station data)...")
        
        measurement_date = date(2025, 12, 15)
        
        # Find city
        city = City.query.filter_by(name='Grudziądz').first()
        if not city:
            print("❌ ERROR: Grudziądz not found!")
            return
        
        print(f"✅ Found city: {city.name}")
        
        # ============================================
        # STATION: SUW Hallera
        # ============================================
        
        station_data = {
            'pH': 7.3,
            'twardosc': 372.0,      # mg CaCO3/l
            'azotany': 6.8,         # mg/l
            'zelazo': 0.03,         # mg/l (PDF: 30 µg/l = 0.03 mg/l)
            'fluorki': None,        # Not in report
            'chlor': None,          # Not in report
            'chlorki': 94.0,        # mg/l
            'siarczany': None,      # Not in report
            'magnez': None,         # Not in report
            'metnosc': 0.71,        # NTU
            'barwa': 10.0,          # mg Pt/l
            'mangan': 5.0,          # µg/l
            'olow': None,           # Not in report
            'rtec': None,           # Not in report
        }
        
        station = Station.query.filter_by(city_id=city.id, name='SUW Hallera').first()
        if not station:
            print("  🆕 Creating station: SUW Hallera")
            station = Station(
                city_id=city.id,
                name='SUW Hallera',
                address='ul. Hallera 79',
                latitude=53.4837,  # Approximate
                longitude=18.7537
            )
            db.session.add(station)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Hallera")
        
        # Delete old measurements
        deleted = WaterMeasurement.query.filter_by(station_id=station.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        # Define units
        units = {
            'pH': 'pH',
            'twardosc': 'mg CaCO₃/L',
            'azotany': 'mg/l',
            'zelazo': 'mg/l',
            'fluorki': 'mg/l',
            'chlor': 'mg/l',
            'chlorki': 'mg/l',
            'siarczany': 'mg/l',
            'magnez': 'mg/l',
            'metnosc': 'NTU',
            'barwa': 'mg Pt/l',
            'mangan': 'µg/l',
            'olow': 'µg/l',
            'rtec': 'µg/l',
        }
        
        # Add new measurements
        for param, value in station_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len([v for v in station_data.values() if v is not None])} parameters for SUW Hallera")
        
        # ============================================
        # CITY AVERAGE (same as station since only 1 SUW)
        # ============================================
        
        avg = city.averages
        if not avg:
            avg = CityAverage(city_id=city.id)
            db.session.add(avg)
        
        for param, value in station_data.items():
            if value is not None:
                setattr(avg, param, value)
        
        db.session.commit()
        print(f"  ✅ Saved city average: {station_data['twardosc']} mg/l")
        
        print(f"\n✅ COMPLETE!")
        print(f"\n🎯 EXPECTED:")
        print(f"  SUW Hallera: {station_data['twardosc']} mg/l")
        print(f"  City average: {station_data['twardosc']} mg/l")

if __name__ == '__main__':
    import_grudziadz_2025_12_15_fixed()
