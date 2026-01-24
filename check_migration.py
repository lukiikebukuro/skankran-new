#!/usr/bin/env python3
"""
Check PostgreSQL migration status
Compare waterAnalysis.json vs PostgreSQL database
"""

import json
from app import app, db, City

def check_migration_status():
    with app.app_context():
        print("="*60)
        print("MIGRATION STATUS CHECK")
        print("="*60)
        
        # 1. Cities in PostgreSQL
        cities_in_db = City.query.all()
        db_city_names = sorted([c.name for c in cities_in_db])
        
        print(f"\n📊 PostgreSQL: {len(db_city_names)} cities")
        for name in db_city_names:
            city = City.query.filter_by(name=name).first()
            has_avg = "✅" if city.averages else "❌"
            has_stations = "✅" if city.stations.count() > 0 else "❌"
            print(f"  {has_avg} {has_stations} {name}")
        
        # 2. Cities in JSON
        try:
            with open('waterAnalysis.json', 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            json_city_names = sorted(json_data.keys())
            print(f"\n📄 JSON: {len(json_city_names)} cities")
        except Exception as e:
            print(f"\n❌ Could not load JSON: {e}")
            json_city_names = []
        
        # 3. Compare
        print(f"\n🔍 COMPARISON:")
        
        in_json_not_db = set(json_city_names) - set(db_city_names)
        in_db_not_json = set(db_city_names) - set(json_city_names)
        
        if in_json_not_db:
            print(f"\n⚠️  In JSON but NOT in PostgreSQL ({len(in_json_not_db)}):")
            for name in sorted(in_json_not_db):
                print(f"  - {name}")
        
        if in_db_not_json:
            print(f"\n🆕 In PostgreSQL but NOT in JSON ({len(in_db_not_json)}):")
            for name in sorted(in_db_not_json):
                print(f"  - {name}")
        
        if not in_json_not_db and not in_db_not_json:
            print("  ✅ All cities match!")
        
        # 4. Verdict
        print(f"\n{'='*60}")
        if len(db_city_names) >= len(json_city_names):
            print("✅ SAFE TO DELETE JSON - PostgreSQL has all cities!")
        else:
            print("⚠️  NOT SAFE - PostgreSQL missing cities from JSON")
        print(f"{'='*60}")

if __name__ == '__main__':
    check_migration_status()
