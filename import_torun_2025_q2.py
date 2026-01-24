#!/usr/bin/env python3
"""
Toruń - Q2 2025 Data Import
Data source: Toruńskie Wodociągi - Drugi kwartał 2025
5 stations with INDIVIDUAL data
"""

from datetime import date
from app import app, db, City, Station, CityAverage, WaterMeasurement

def import_torun_q2_2025():
    """Import Toruń with PER-STATION data from Q2 2025"""
    
    with app.app_context():
        print("📊 Importing Toruń Q2 2025 (per-station data)...")
        
        # Q2 2025 = kwiecień-czerwiec, używam końca kwartału
        measurement_date = date(2025, 6, 30)
        
        # Find city
        city = City.query.filter_by(name='Toruń').first()
        if not city:
            print("❌ ERROR: Toruń not found!")
            return
        
        print(f"✅ Found city: {city.name}")
        
        # Define units
        units = {
            'pH': 'pH',
            'twardosc': 'mg CaCO₃/L',
            'azotany': 'mg/l',
            'zelazo': 'mg/l',       # CRITICAL: mg/l not µg/l!
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
        
        # ============================================
        # STATION 1: Rubinkowo (ul. Niesiołowskiego)
        # ============================================
        
        station1_data = {
            'pH': 7.40,
            'twardosc': 267.0,
            'metnosc': 0.20,        # <0.20 → use limit
            'barwa': 5.0,           # <5 → use limit
            'zelazo': 0.027,        # PDF: 27 µg/dm³ = 0.027 mg/l (÷1000)
            'mangan': 5.0,          # <5.0 → use limit
            'chlor': 0.06,          # mg/dm³
        }
        
        station1 = Station.query.filter_by(city_id=city.id, name='SUW Rubinkowo').first()
        if not station1:
            print("  🆕 Creating station: SUW Rubinkowo")
            station1 = Station(
                city_id=city.id,
                name='SUW Rubinkowo',
                address='ul. Niesiołowskiego',
                latitude=53.0138,
                longitude=18.5984
            )
            db.session.add(station1)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Rubinkowo")
        
        deleted = WaterMeasurement.query.filter_by(station_id=station1.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        for param, value in station1_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station1.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len(station1_data)} parameters for Rubinkowo")
        
        # ============================================
        # STATION 2: Śródmieście (ul. Przy Kaszowniku)
        # ============================================
        
        station2_data = {
            'pH': 7.40,
            'twardosc': 265.0,
            'metnosc': 0.20,
            'barwa': 5.0,
            'zelazo': 0.020,        # PDF: <20.0 µg/dm³ = 0.020 mg/l
            'mangan': 5.0,
            'chlor': 0.05,
        }
        
        station2 = Station.query.filter_by(city_id=city.id, name='SUW Śródmieście').first()
        if not station2:
            print("  🆕 Creating station: SUW Śródmieście")
            station2 = Station(
                city_id=city.id,
                name='SUW Śródmieście',
                address='ul. Przy Kaszowniku',
                latitude=53.0105,
                longitude=18.6050
            )
            db.session.add(station2)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Śródmieście")
        
        deleted = WaterMeasurement.query.filter_by(station_id=station2.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        for param, value in station2_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station2.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len(station2_data)} parameters for Śródmieście")
        
        # ============================================
        # STATION 3: Bydgoskie (ul. Gagarina)
        # ============================================
        
        station3_data = {
            'pH': 7.40,
            'twardosc': 260.0,
            'metnosc': 0.20,
            'barwa': 5.0,
            'zelazo': 0.020,        # PDF: <20.0 µg/dm³ = 0.020 mg/l
            'mangan': 5.0,
            'chlor': 0.11,
        }
        
        station3 = Station.query.filter_by(city_id=city.id, name='SUW Bydgoskie').first()
        if not station3:
            print("  🆕 Creating station: SUW Bydgoskie")
            station3 = Station(
                city_id=city.id,
                name='SUW Bydgoskie',
                address='ul. Gagarina',
                latitude=53.0358,
                longitude=18.5647
            )
            db.session.add(station3)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Bydgoskie")
        
        deleted = WaterMeasurement.query.filter_by(station_id=station3.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        for param, value in station3_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station3.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len(station3_data)} parameters for Bydgoskie")
        
        # ============================================
        # STATION 4: Podgórz (ul. Parkowa)
        # ============================================
        
        station4_data = {
            'pH': 7.40,
            'twardosc': 250.0,
            'metnosc': 0.20,
            'barwa': 5.0,
            'zelazo': 0.020,        # PDF: <20.0 µg/dm³ = 0.020 mg/l
            'mangan': 5.0,
            'chlor': 0.04,
        }
        
        station4 = Station.query.filter_by(city_id=city.id, name='SUW Podgórz').first()
        if not station4:
            print("  🆕 Creating station: SUW Podgórz")
            station4 = Station(
                city_id=city.id,
                name='SUW Podgórz',
                address='ul. Parkowa',
                latitude=53.0047,
                longitude=18.6234
            )
            db.session.add(station4)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Podgórz")
        
        deleted = WaterMeasurement.query.filter_by(station_id=station4.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        for param, value in station4_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station4.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len(station4_data)} parameters for Podgórz")
        
        # ============================================
        # STATION 5: Chełmińskie (studnia zbiorcza St.Bielany)
        # ============================================
        
        station5_data = {
            'pH': 7.50,
            'twardosc': 260.0,
            'metnosc': 0.20,
            'barwa': 5.0,
            'zelazo': 0.020,        # PDF: <20.0 µg/dm³ = 0.020 mg/l
            'mangan': 5.0,
            'chlor': 0.17,
        }
        
        station5 = Station.query.filter_by(city_id=city.id, name='SUW Chełmińskie').first()
        if not station5:
            print("  🆕 Creating station: SUW Chełmińskie")
            station5 = Station(
                city_id=city.id,
                name='SUW Chełmińskie',
                address='studnia zbiorcza St.Bielany',
                latitude=53.0456,
                longitude=18.6123
            )
            db.session.add(station5)
            db.session.commit()
        else:
            print("  ♻️ Updating station: SUW Chełmińskie")
        
        deleted = WaterMeasurement.query.filter_by(station_id=station5.id).delete()
        db.session.commit()
        print(f"  🗑️ Deleted {deleted} old measurements")
        
        for param, value in station5_data.items():
            if value is not None:
                measurement = WaterMeasurement(
                    station_id=station5.id,
                    parameter=param,
                    value=value,
                    unit=units.get(param, 'mg/l'),
                    measurement_date=measurement_date
                )
                db.session.add(measurement)
        
        db.session.commit()
        print(f"  ✅ Saved {len(station5_data)} parameters for Chełmińskie")
        
        # ============================================
        # CITY AVERAGE (mean of 5 stations)
        # ============================================
        
        all_stations = [station1_data, station2_data, station3_data, station4_data, station5_data]
        city_avg_data = {}
        
        for key in station1_data.keys():
            values = [s.get(key) for s in all_stations if s.get(key) is not None]
            if values:
                city_avg_data[key] = round(sum(values) / len(values), 2)
        
        avg = city.averages
        if not avg:
            avg = CityAverage(city_id=city.id)
            db.session.add(avg)
        
        for param, value in city_avg_data.items():
            setattr(avg, param, value)
        
        db.session.commit()
        print(f"  ✅ Saved city average: {city_avg_data.get('twardosc')} mg/l")
        
        print(f"\n✅ COMPLETE!")
        print(f"\n🎯 EXPECTED:")
        print(f"  Rubinkowo: {station1_data['twardosc']} mg/l")
        print(f"  Śródmieście: {station2_data['twardosc']} mg/l")
        print(f"  Bydgoskie: {station3_data['twardosc']} mg/l")
        print(f"  Podgórz: {station4_data['twardosc']} mg/l")
        print(f"  Chełmińskie: {station5_data['twardosc']} mg/l")
        print(f"  City average: {city_avg_data.get('twardosc')} mg/l")
        print(f"  Measurement date: {measurement_date}")

if __name__ == '__main__':
    import_torun_q2_2025()
