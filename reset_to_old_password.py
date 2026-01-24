#!/usr/bin/env python3
"""
Reset admin password to specific value
"""

from app import app, db, User
from werkzeug.security import generate_password_hash

def reset_to_old_password():
    with app.app_context():
        admin = User.query.filter_by(username='lukipuki').first()
        
        if not admin:
            print("❌ User 'lukipuki' not found!")
            return
        
        # Jakie było stare hasło? (user musi podać)
        print("🔑 Resetowanie hasła dla 'lukipuki'")
        print("")
        old_password = input("Podaj stare hasło (które działało wcześniej): ")
        
        if not old_password:
            print("❌ Hasło nie może być puste!")
            return
        
        # Ustaw nowe hasło
        admin.password = generate_password_hash(old_password, method='scrypt:32768:8:1')
        db.session.commit()
        
        print("")
        print("✅ Hasło zostało zmienione!")
        print(f"   Login: lukipuki")
        print(f"   Hasło: {old_password}")

if __name__ == '__main__':
    reset_to_old_password()
