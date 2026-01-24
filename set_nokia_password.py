#!/usr/bin/env python3
"""
Set admin password to Nokia5310!
"""

from app import app, db, User
from werkzeug.security import generate_password_hash

def set_password():
    with app.app_context():
        admin = User.query.filter_by(username='lukipuki').first()
        
        if not admin:
            print("❌ User 'lukipuki' not found!")
            return
        
        # Ustaw hasło Nokia5310!
        admin.password = generate_password_hash('Nokia5310!', method='scrypt:32768:8:1')
        db.session.commit()
        
        print("✅ Hasło zostało zmienione!")
        print(f"   Login: lukipuki")
        print(f"   Hasło: Nokia5310!")

if __name__ == '__main__':
    set_password()
