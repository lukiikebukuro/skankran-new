#!/usr/bin/env python3
"""
Force Reset Admin Password
Naprawia problem z logowaniem użytkownika 'lukipuki'
"""

from app import app, db, User
from werkzeug.security import generate_password_hash
import os

def reset_admin_password():
    with app.app_context():
        # Znajdź admina
        admin = User.query.filter_by(username='lukipuki').first()
        
        if not admin:
            print("❌ User 'lukipuki' nie istnieje w bazie!")
            print("   Uruchom najpierw: python init_db.py")
            return
        
        # Pobierz nowe hasło z .env lub użyj domyślnego
        new_password = os.getenv('ADMIN_PASSWORD', 'TwojeNoweHaslo123!')
        
        # Wygeneruj hash scrypt (zgodny z security fixes)
        admin.password = generate_password_hash(new_password, method='scrypt:32768:8:1')
        
        # Upewnij się że ma flagę admin
        admin.is_admin = True
        
        # Zapisz
        db.session.commit()
        
        print("✅ Hasło dla 'lukipuki' zostało zresetowane!")
        print(f"   Login: lukipuki")
        print(f"   Hasło: {new_password}")
        print("")
        print("⚠️  ZMIEŃ HASŁO po zalogowaniu!")
        print("   Ustaw ADMIN_PASSWORD w .env dla bezpieczeństwa")

if __name__ == '__main__':
    reset_admin_password()
