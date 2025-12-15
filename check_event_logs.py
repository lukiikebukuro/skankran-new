"""Check if event_logs table exists"""
import sqlite3

conn = sqlite3.connect('skankran.db')
cursor = conn.cursor()

# Sprawdź czy tabela istnieje
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='event_logs'")
result = cursor.fetchone()

if result:
    print(f"✅ Tabela '{result[0]}' istnieje!")
    
    # Sprawdź strukturę
    cursor.execute("PRAGMA table_info(event_logs)")
    columns = cursor.fetchall()
    print("\nKolumny:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    # Sprawdź liczbę rekordów
    cursor.execute("SELECT COUNT(*) FROM event_logs")
    count = cursor.fetchone()[0]
    print(f"\nLiczba rekordów: {count}")
else:
    print("❌ Tabela event_logs NIE istnieje")

conn.close()
