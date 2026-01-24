#!/usr/bin/env python3
"""
🔒 SKRYPT DO USTAWIANIA ADMINA
Użyj tego do oznaczenia użytkownika jako admin po migracji
"""
import sqlite3
import sys

def set_admin(username):
    """Ustaw is_admin=True dla użytkownika"""
    try:
        conn = sqlite3.connect('instance/skankran.db')
        cursor = conn.cursor()
        
        # Sprawdź czy kolumna is_admin istnieje
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_admin' not in columns:
            print("❌ BŁĄD: Kolumna 'is_admin' nie istnieje!")
            print("   Najpierw uruchom: python migrate_security.py")
            conn.close()
            return False
        
        # Sprawdź czy user istnieje
        cursor.execute("SELECT id, username FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ BŁĄD: Użytkownik '{username}' nie istnieje!")
            conn.close()
            return False
        
        # Ustaw is_admin=True
        cursor.execute("UPDATE users SET is_admin = 1 WHERE username = ?", (username,))
        conn.commit()
        
        print(f"✅ Użytkownik '{username}' jest teraz ADMINEM!")
        print(f"   ID: {user[0]}")
        
        # Pokaż status
        cursor.execute("SELECT id, username, is_admin FROM users WHERE username = ?", (username,))
        updated = cursor.fetchone()
        print(f"   is_admin: {bool(updated[2])}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ BŁĄD: {e}")
        return False


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Użycie: python set_admin.py <username>")
        print("Przykład: python set_admin.py lukipuki")
        sys.exit(1)
    
    username = sys.argv[1]
    success = set_admin(username)
    sys.exit(0 if success else 1)
