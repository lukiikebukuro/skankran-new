"""
fix_users_table.py - Naprawa tabeli users na Renderze
Problem: Kolumna password ma limit 120 znaków, a bcrypt hash potrzebuje 255
Rozwiązanie: Usunięcie starej tabeli, aby aplikacja stworzyła ją na nowo
"""

import os
import psycopg2
from dotenv import load_dotenv

# Wczytaj zmienne środowiskowe z .env
load_dotenv()

# Pobierz DATABASE_URL
DATABASE_URL = os.environ.get('DATABASE_URL')

# BACKUP: Jeśli nie ma w .env, wklej ręcznie (odkomentuj linię poniżej):
# DATABASE_URL = "postgresql://skankran_user:haslo@host/dbname"

def fix_table():
    if not DATABASE_URL:
        print("❌ BŁĄD: Brak DATABASE_URL w .env!")
        print("   Dodaj DATABASE_URL do pliku .env lub wklej ręcznie w skrypt.")
        return
    
    # Ukryj hasło w logach
    safe_url = DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else '***'
    print(f"🔌 Łączenie z bazą: ...@{safe_url}")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("\n⚠️  OSTRZEŻENIE: To usunie tabelę 'users' i wszystkich użytkowników!")
        print("   (Admin 'lukipuki' zostanie stworzony automatycznie przy starcie)")
        confirm = input("\nWpisz 'TAK' aby kontynuować: ")
        
        if confirm != 'TAK':
            print("❌ Anulowano.")
            return
        
        print("\n🔨 Usuwanie starej tabeli 'users'...")
        cur.execute("DROP TABLE IF EXISTS users CASCADE;")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("\n✅ SUKCES! Tabela 'users' usunięta.")
        print("\n📋 NASTĘPNE KROKI:")
        print("   1. Git push (kod już ma String(255))")
        print("   2. Deploy na Renderze")
        print("   3. Aplikacja stworzy nową tabelę z limitem 255 znaków")
        print("   4. Admin 'lukipuki' zostanie stworzony automatycznie")
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ BŁĄD POŁĄCZENIA: {e}")
        print("\nSprawdź:")
        print("   - Czy DATABASE_URL jest poprawny")
        print("   - Czy Render pozwala na zewnętrzne połączenia")
        print("   - Czy baza PostgreSQL jest włączona")
        
    except Exception as e:
        print(f"\n❌ BŁĄD: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("SKANKRAN - Naprawa tabeli 'users' (password 120 → 255)")
    print("=" * 60)
    fix_table()
