#!/usr/bin/env python3
"""
Database Migration: Add user_profile column to aquabot_queries
"""

from app import app, db

def add_user_profile_column():
    with app.app_context():
        try:
            # PostgreSQL migration
            with db.engine.connect() as conn:
                # Check if column already exists
                result = conn.execute(db.text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='aquabot_queries' 
                    AND column_name='user_profile'
                """))
                
                if result.fetchone():
                    print("ℹ️  Column 'user_profile' already exists")
                    return
                
                # Add column
                conn.execute(db.text("""
                    ALTER TABLE aquabot_queries 
                    ADD COLUMN user_profile VARCHAR(50) DEFAULT 'Ogólny'
                """))
                conn.commit()
                
            print("✅ Dodano kolumnę user_profile do aquabot_queries")
            print("   Domyślna wartość: 'Ogólny'")
            print("   Możliwe wartości: Rodzic, Biohacker, Pacjent, Ogólny")
            
        except Exception as e:
            print(f"❌ ERROR: {e}")
            print("   Sprawdź czy tabela aquabot_queries istnieje")

if __name__ == '__main__':
    add_user_profile_column()
