from app import app, db, City, Station, WaterMeasurement

with app.app_context():
    city = City.query.filter_by(name='Grudziądz').first()
    
    if not city:
        print('❌ BRAK Grudziądza w bazie!')
    else:
        print(f'✅ Miasto: {city.name}')
        print(f'   Liczba stacji: {city.stations.count()}')
        
        for station in city.stations:
            print(f'\n📍 Stacja: {station.name}')
            
            # Pomiary twardości
            twardosc_measurements = WaterMeasurement.query.filter_by(
                station_id=station.id,
                parameter='twardosc'
            ).order_by(WaterMeasurement.measurement_date).all()
            
            print(f'   Pomiary twardości: {len(twardosc_measurements)}')
            
            if twardosc_measurements:
                print('\n   📊 HISTORIA TWARDOŚCI:')
                for m in twardosc_measurements:
                    print(f'   {m.measurement_date} → {m.value} {m.unit}')
            else:
                print('   ⚠️ BRAK pomiarów twardości!')
            
            # Wszystkie parametry
            all_measurements = WaterMeasurement.query.filter_by(
                station_id=station.id
            ).count()
            print(f'\n   Wszystkie pomiary: {all_measurements}')
