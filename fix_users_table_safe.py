"""
fix_users_table_safe.py - Bezpieczna migracja (ALTER zamiast DROP)
Alternatywa do fix_users_table.py - modyfikuje istniejącą tabelę zamiast usuwać
UWAGA: Może nie działać jeśli są istniejące hasła dłuższe niż 120 znaków
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.environ.get('DATABASE_URL')

def safe_fix():
    if not DATABASE_URL:
        print("❌ BŁĄD: Brak DATABASE_URL w .env!")
        return
    
    print("🔌 Łączenie z bazą...")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🔍 Sprawdzam obecny limit kolumny 'password'...")
        cur.execute("""
            SELECT character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='password';
        """)
        
        result = cur.fetchone()
        if result:
            current_limit = result[0]
            print(f"   Obecny limit: {current_limit} znaków")
            
            if current_limit >= 255:
                print("✅ Limit już wynosi 255+. Wszystko OK!")
                return
        
        print("\n🔨 Rozszerzam kolumnę 'password' do 255 znaków...")
        cur.execute("ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);")
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("\n✅ SUKCES! Kolumna rozszerzona do 255 znaków.")
        print("   Możesz teraz rejestrować użytkowników z długimi hasłami.")
        
    except psycopg2.ProgrammingError as e:
        if "does not exist" in str(e):
            print("\n⚠️ Tabela 'users' nie istnieje.")
            print("   To normalne przy pierwszym starcie - aplikacja ją stworzy.")
        else:
            print(f"\n❌ BŁĄD: {e}")
            
    except Exception as e:
        print(f"\n❌ BŁĄD: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("SKANKRAN - Bezpieczna migracja users.password (ALTER)")
    print("=" * 60)
    safe_fix()
