import sqlite3
import os

# Sprawdź obie bazy
for db_name in ['skankran.db', 'users.db']:
    if not os.path.exists(db_name):
        print(f"❌ {db_name} nie istnieje")
        continue
    
    print(f"\n=== {db_name} ===")
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    # Pokaż tabele
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tabele: {[t[0] for t in tables]}")
    
    # Sprawdź users
    try:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        if users:
            print(f"✅ Znaleziono {len(users)} użytkowników:")
            # Pokaż kolumny
            cursor.execute("PRAGMA table_info(users)")
            cols = [c[1] for c in cursor.fetchall()]
            print(f"Kolumny: {cols}")
            for u in users:
                print(f"  {u}")
    except Exception as e:
        print(f"  Brak tabeli users lub błąd: {e}")
    
    conn.close()
