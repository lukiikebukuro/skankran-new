"""
🔒 SECURITY MIGRATION - Dodaje kolumnę is_admin do User model
Run this BEFORE starting the application after security fixes
"""

import eventlet
eventlet.monkey_patch()

from app import app, db, User
from sqlalchemy import text

def migrate_database():
    """Add is_admin column to existing User table"""
    with app.app_context():
        print("[MIGRATION] Starting security migration...")
        
        try:
            # Check if is_admin column exists
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result]
                
                if 'is_admin' not in columns:
                    print("[MIGRATION] Adding is_admin column to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                    conn.commit()
                    print("[MIGRATION] ✅ Column is_admin added!")
                else:
                    print("[MIGRATION] Column is_admin already exists")
            
            # Update lukipuki to be admin
            lukipuki = User.query.filter_by(username='lukipuki').first()
            if lukipuki:
                lukipuki.is_admin = True
                db.session.commit()
                print("[MIGRATION] ✅ User 'lukipuki' set as admin")
            else:
                print("[MIGRATION] ⚠️ User 'lukipuki' not found. Run init_db.py first.")
            
            print("[MIGRATION] Migration completed successfully!")
            
        except Exception as e:
            print(f"[MIGRATION] ❌ Error: {e}")
            raise

if __name__ == '__main__':
    migrate_database()
