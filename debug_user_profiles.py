#!/usr/bin/env python3
"""
Debug: Check if user_profile is being saved
"""

from app import app, db, AquaBotQuery

def check_user_profiles():
    with app.app_context():
        # Pobierz ostatnie zapytania
        queries = db.session.query(AquaBotQuery).order_by(
            AquaBotQuery.id.desc()
        ).limit(10).all()
        
        print(f"📊 Last 10 AquaBot queries:\n")
        
        for q in queries:
            print(f"ID: {q.id}")
            print(f"Query: {q.query[:80]}...")
            print(f"User Profile: {q.user_profile}")
            print(f"City: {q.city}")
            print(f"Timestamp: {q.timestamp}")
            print("-" * 80)
        
        # Statystyki profili
        print("\n📈 Profile Statistics:")
        results = db.session.query(
            AquaBotQuery.user_profile,
            db.func.count(AquaBotQuery.id).label('count')
        ).filter(
            AquaBotQuery.user_profile.isnot(None)
        ).group_by(
            AquaBotQuery.user_profile
        ).all()
        
        for r in results:
            print(f"  {r.user_profile}: {r.count}")

if __name__ == '__main__':
    check_user_profiles()
