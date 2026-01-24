#!/usr/bin/env python3
"""
🔒 SKRYPT DO RESETOWANIA HASŁA
Użyj tego jeśli zapomniałeś hasła
"""
import sqlite3
import sys
from werkzeug.security import generate_password_hash
import getpass

def reset_password(username, new_password=None):
    """Resetuj hasło dla użytkownika"""
    try:
        conn = sqlite3.connect('instance/skankran.db')
        cursor = conn.cursor()
        
        # Sprawdź czy user istnieje
        cursor.execute("SELECT id, username FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ BŁĄD: Użytkownik '{username}' nie istnieje!")
            conn.close()
            return False
        
        # Pobierz nowe hasło
        if not new_password:
            new_password = getpass.getpass(f"Nowe hasło dla '{username}': ")
            confirm = getpass.getpass("Potwierdź hasło: ")
            
            if new_password != confirm:
                print("❌ BŁĄD: Hasła się nie zgadzają!")
                conn.close()
                return False
        
        # Walidacja
        if len(new_password) < 8:
            print("❌ BŁĄD: Hasło musi mieć min. 8 znaków!")
            conn.close()
            return False
        
        if not any(c.isupper() for c in new_password):
            print("❌ BŁĄD: Hasło musi zawierać wielką literę!")
            conn.close()
            return False
        
        if not any(c.isdigit() for c in new_password):
            print("❌ BŁĄD: Hasło musi zawierać cyfrę!")
            conn.close()
            return False
        
        # Hashuj hasło
        hashed = generate_password_hash(new_password)
        
        # Aktualizuj w bazie
        cursor.execute("UPDATE users SET password = ? WHERE username = ?", (hashed, username))
        conn.commit()
        
        print(f"✅ Hasło dla '{username}' zostało zmienione!")
        print(f"   ID: {user[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ BŁĄD: {e}")
        return False


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Użycie: python reset_password.py <username>")
        print("Przykład: python reset_password.py lukipuki")
        sys.exit(1)
    
    username = sys.argv[1]
    success = reset_password(username)
    sys.exit(0 if success else 1)
