#!/usr/bin/env python3
"""
Bydgoszcz - Q3 2025 Data Import (FIXED)
Data source: MWiK Bydgoszcz - III kwartał 2025
2 stations with INDIVIDUAL data: Czyżkówko (195 mg/l), Las Gdański (395 mg/l)
"""

from datetime import date
from app import app, db, City, Station, CityAverage, WaterMeasurement

def import_bydgoszcz_q3_2025_fixed():
    """Import Bydgoszcz with PER-STATION data"""
    
    with app.app_context():
        print("📊 Importing Bydgoszcz Q3 2025 (per-station data)...")
        
        measurement_date = date(2025, 9, 30)  # Q3 2025 end
        
        # Find city
        city = City.query.filter_by(name='Bydgoszcz').first()
        if not city:
            print("❌ ERROR: Bydgoszcz not found!")
            return
        
        print(f"✅ Found city: {city.name}")
        
        # ============================================
        # STATION 1: Czyżkówko
        # ============================================
        
        station1_data = {
            'pH': 7.7,
            'twardosc': 195.0,
            'azotany': 0.74,
            'zelazo': 0.01,
            'fluorki': 0.13,
            'chlorki': 14.0,
            'siarczany': 31.0,
            'magnez': 7.27,
            'metnosc': 0.09,
            'barwa': 2.0,
            'mangan': 40.0,      # µg/l
            'olow': 1.0,         # µg/l
            'rtec': 0.3,         # µg/l
        }
        
        station1 = Station.query.filter_by(city_id=city.id, name='SUW Czyżkówko').first()
        if not station1:
            print("  🆕 Creating station: SUW Czyżkówko")
            station1 = Station(
                city_id=city.id,
                name='SUW Czyżkówko',
                address='Czyżkówko',
                latitude=53.1235,  # Approximate
                longitude=17.9876
            )
            db.session.add(station1)
            db.session.commit()  # Commit to get ID
        else:
            print("  ♻️ Updating station: SUW Czyżkówko")
        
        # Delete old measurements for this station
        deleted = WaterMeasurement.query.filter_by(station_id=station1.id).delete()
        db.session.commit()  # Commit deletion
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        # Add new measurements
        # Define units for each parameter
        units = {
            'pH': 'pH',
            'twardosc': 'mg CaCO₃/L',
            'azotany': 'mg/l',
            'zelazo': 'mg/l',
            'fluorki': 'mg/l',
            'chlorki': 'mg/l',
            'siarczany': 'mg/l',
            'magnez': 'mg/l',
            'metnosc': 'NTU',
            'barwa': 'mg Pt/l',
            'mangan': 'µg/l',
            'olow': 'µg/l',
            'rtec': 'µg/l',
        }
        
        for param, value in station1_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station1.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),  # Default to mg/l if not specified
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()  # Commit new measurements
        
        print(f"  ✅ Saved {len(station1_data)} parameters for Czyżkówko")
        
        # ============================================
        # STATION 2: Las Gdański
        # ============================================
        
        station2_data = {
            'pH': 7.8,
            'twardosc': 395.0,
            'azotany': 2.0,
            'zelazo': 0.014,
            'fluorki': 0.24,
            'chlorki': 30.0,
            'siarczany': 96.0,
            'magnez': 26.4,
            'metnosc': 0.11,
            'barwa': 5.0,
            'mangan': 40.0,
            'olow': 1.0,
            'rtec': 0.3,
        }
        
        station2 = Station.query.filter_by(city_id=city.id, name='SUW Las Gdański').first()
        if not station2:
            print("  🆕 Creating station: SUW Las Gdański")
            station2 = Station(
                city_id=city.id,
                name='SUW Las Gdański',
                address='Las Gdański',
                latitude=53.1456,
                longitude=18.0234
            )
            db.session.add(station2)
            db.session.commit()  # Commit to get ID
        else:
            print("  ♻️ Updating station: SUW Las Gdański")
        
        # Delete old measurements
        deleted = WaterMeasurement.query.filter_by(station_id=station2.id).delete()
        db.session.commit()  # Commit deletion
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        # Add new measurements
        for param, value in station2_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station2.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),  # Use same units dict
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()  # Commit new measurements

        
        print(f"  ✅ Saved {len(station2_data)} parameters for Las Gdański")
        
        # ============================================
        # CITY AVERAGE (for "Sprawdź Kranówkę" and Rankings)
        # ============================================
        
        city_avg_data = {}
        for key in station1_data.keys():
            val1 = station1_data.get(key)
            val2 = station2_data.get(key)
            
            if val1 is not None and val2 is not None:
                city_avg_data[key] = round((val1 + val2) / 2, 2)
            elif val1 is not None:
                city_avg_data[key] = val1
            elif val2 is not None:
                city_avg_data[key] = val2
        
        avg = city.averages
        if not avg:
            avg = CityAverage(city_id=city.id)
            db.session.add(avg)
        
        for param, value in city_avg_data.items():
            setattr(avg, param, value)
        
        print(f"  ✅ Saved city average: {city_avg_data['twardosc']} mg/l")
        
        # Commit all
        db.session.commit()
        
        print(f"\n✅ COMPLETE!")
        print(f"\n🎯 EXPECTED:")
        print(f"  Czyżkówko: {station1_data['twardosc']} mg/l")
        print(f"  Las Gdański: {station2_data['twardosc']} mg/l")
        print(f"  City average: {city_avg_data['twardosc']} mg/l")

if __name__ == '__main__':
    import_bydgoszcz_q3_2025_fixed()
