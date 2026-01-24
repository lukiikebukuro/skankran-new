"""
🔥 DATABASE INITIALIZATION - PostgreSQL Ready
Uruchamiane przez Build Command na Render.com: python init_db.py
"""
# 🔥 EVENTLET MONKEY PATCH - MUSI BYĆ NA POCZĄTKU!
import eventlet
eventlet.monkey_patch()

import os
from dotenv import load_dotenv
load_dotenv()

from app import app, db, User
from werkzeug.security import generate_password_hash

def init_database():
    """Inicjalizuj bazę PostgreSQL/SQLite i utwórz tabele + admina"""
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        db_type = 'PostgreSQL' if 'postgres' in db_uri else 'SQLite'
        
        print(f"[INIT_DB] 🚀 Skankran Database Initialization")
        print(f"[INIT_DB] 📊 Database Type: {db_type}")
        print(f"[INIT_DB] 🔗 URI: {db_uri[:50]}...")
        print(f"[INIT_DB] 🛠️  Creating tables...")
        
        db.create_all()
        print("[INIT_DB] ✅ Tables created: users, visitor_events, aquabot_queries, b2b_leads, event_logs")
        
        # Sprawdź czy admin istnieje
        admin = User.query.filter_by(username='lukipuki').first()
        if not admin:
            print("[INIT_DB] 👤 Creating admin user 'lukipuki'...")
            
            # 🔒 SECURITY: Password z zmiennej środowiskowej
            admin_password = os.getenv('ADMIN_PASSWORD')
            if not admin_password:
                print("[INIT_DB] ⚠️  ADMIN_PASSWORD not set - using default password")
                print("[INIT_DB] ⚠️  CHANGE PASSWORD IMMEDIATELY after first login!")
                admin_password = 'ChangeMe123!'  # Default password
            
            admin = User(
                username='lukipuki',
                password=generate_password_hash(admin_password, method='scrypt:32768:8:1'),
                is_premium=True,
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("[INIT_DB] ✅ Admin user 'lukipuki' created!")
            print(f"[INIT_DB] 📝 Login: lukipuki / Password: {admin_password}")
        else:
            # Update existing user to have admin flag
            if not admin.is_admin:
                admin.is_admin = True
                db.session.commit()
                print("[INIT_DB] ✅ Admin flag updated")
            print("[INIT_DB] ℹ️  Admin user 'lukipuki' already exists")
        
        print("[INIT_DB] 🎉 Database initialization complete!")

if __name__ == '__main__':
    init_database()
