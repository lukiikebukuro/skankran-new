#!/usr/bin/env python3
"""
Check what's stored in database for bot responses
"""

from app import app, db, AquaBotQuery

def check_bot_responses():
    with app.app_context():
        # Pobierz ostatnie 3 zapytania
        queries = db.session.query(AquaBotQuery).order_by(
            AquaBotQuery.id.desc()
        ).limit(3).all()
        
        print(f"📊 Last 3 AquaBot queries:\n")
        
        for q in queries:
            print(f"ID: {q.id}")
            print(f"Query: {q.query[:50]}...")
            print(f"Response (first 200 chars):")
            if q.bot_response_summary:
                print(q.bot_response_summary[:200])
                print("")
                # Check if HTML is escaped
                if '&lt;' in q.bot_response_summary:
                    print("⚠️  HTML IS ESCAPED in database!")
                elif '<span' in q.bot_response_summary:
                    print("✅ HTML is NOT escaped (good)")
                else:
                    print("ℹ️  No HTML tags found")
            else:
                print("(No response)")
            print("-" * 80)

if __name__ == '__main__':
    check_bot_responses()
