#!/usr/bin/env python3
"""Check Grudziądz data in PostgreSQL"""

from app import app, db, City

with app.app_context():
    grudz = City.query.filter_by(name='Grudziądz').first()
    
    if not grudz:
        print("❌ Grudziądz NOT FOUND!")
    else:
        print("✅ Grudziądz found in database")
        
        if grudz.averages:
            avg = grudz.averages
            print(f"\n📊 Grudziądz CityAverage data:")
            print(f"  pH: {avg.pH}")
            print(f"  Twardość: {avg.twardosc} mg/l")
            print(f"  Azotany: {avg.azotany} mg/l")
            print(f"  Żelazo: {avg.zelazo} mg/l")
            print(f"  Chlorki: {avg.chlorki} mg/l")
            print(f"  Mangan: {avg.mangan} µg/l")
            print(f"  Mętność: {avg.metnosc} NTU")
            print(f"  Barwa: {avg.barwa} mg/l Pt")
            
            print(f"\n🎯 EXPECTED (2025-12-15 import):")
            print(f"  pH: 7.3")
            print(f"  Twardość: 372.0 mg/l")
            print(f"  Żelazo: 0.03 mg/l")
        else:
            print("❌ No CityAverage data!")
