#!/usr/bin/env python3
"""
Debug: Test sensory complaints detection
"""

from app import app, db, AquaBotQuery

def test_sensory_detection():
    with app.app_context():
        # Kategorie sensory
        sensory_categories = {
            'Zapach': ['śmierdzi', 'odór', 'chlor', 'jaja', 'stęchlizna', 'ryba', 'szambo', 'chemikalia', 'cuchnąca', 'cuchn', 'smród', 'fetor', 'pachnie', 'zapach', 'zapachu', 'smrodek', 'brzydko'],
            'Smak': ['gorzka', 'gorzki', 'metaliczny', 'metaliczn', 'posmak', 'słona', 'słony', 'żelazo', 'żelazn', 'dziwny smak', 'niedobra', 'niesmaczna', 'smakuje', 'smaku'],
            'Wygląd': ['żółta', 'żółt', 'rdzawa', 'rdzaw', 'mętna', 'mętność', 'osad', 'osadu', 'kamień', 'biały nalot', 'pływa coś', 'brudna', 'brudn', 'zmętniała', 'koloru']
        }
        
        print("🔍 Testing sensory detection:\n")
        
        # Test query
        test_query = "woda źle pachnie"
        print(f"Test query: '{test_query}'")
        
        for category, keywords in sensory_categories.items():
            matches = [kw for kw in keywords if kw in test_query.lower()]
            if matches:
                print(f"✅ {category}: MATCH - {matches}")
            else:
                print(f"❌ {category}: NO MATCH")
        
        print("\n📊 Actual database results:")
        
        # Check what's in database
        all_queries = db.session.query(AquaBotQuery).order_by(AquaBotQuery.id.desc()).limit(5).all()
        
        for q in all_queries:
            print(f"\nID: {q.id}")
            print(f"Query: {q.query}")
            
            # Check matches
            for category, keywords in sensory_categories.items():
                if any(kw in q.query.lower() for kw in keywords):
                    print(f"  → {category} MATCH!")

if __name__ == '__main__':
    test_sensory_detection()
