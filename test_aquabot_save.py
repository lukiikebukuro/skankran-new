#!/usr/bin/env python3
"""
Test AquaBot query saving to database
Simulates what WebSocket does
"""

from app import app, db, AquaBotQuery
from datetime import datetime, timezone

def test_aquabot_save():
    with app.app_context():
        print("🧪 Testing AquaBot query save...")
        
        # Simulate WebSocket data
        test_query = AquaBotQuery(
            session_id='test_session_123',
            query='Czy woda jest bezpieczna?',
            city='Warszawa',
            country='Poland',
            organization='Test Org',
            query_count=1,
            time_since_entry=5000,
            bot_response_summary='Tak, woda jest bezpieczna.'
        )
        
        db.session.add(test_query)
        db.session.commit()
        
        print("✅ Test query saved!")
        print(f"   ID: {test_query.id}")
        print(f"   Query: {test_query.query}")
        
        # Sprawdź czy faktycznie jest w bazie
        count = db.session.query(AquaBotQuery).count()
        print(f"\n📊 Total AquaBotQuery records: {count}")
        
        if count > 0:
            print("\n✅ DATABASE WRITE WORKS!")
            print("   Problem musi być w WebSocket connection lub frontend")
        else:
            print("\n❌ DATABASE WRITE FAILED!")
            print("   Problem z PostgreSQL connection")

if __name__ == '__main__':
    test_aquabot_save()
