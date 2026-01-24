#!/usr/bin/env python3
# ============================================
# GENERATOR BEZPIECZNEGO SECRET_KEY
# ============================================
# Użycie: python generate_secret_key.py
# ============================================

import os
import secrets

def generate_secret_key(length=64):
    """
    Generuje kryptograficznie bezpieczny SECRET_KEY.
    
    Args:
        length (int): Długość klucza w znakach hex (domyślnie 64)
    
    Returns:
        str: Losowy klucz hex
    """
    # Metoda 1: os.urandom (CSPRNG - Cryptographically Secure Pseudo-Random Number Generator)
    key1 = os.urandom(length // 2).hex()
    
    # Metoda 2: secrets (zalecana od Python 3.6+)
    key2 = secrets.token_hex(length // 2)
    
    return key2  # Zwracamy metodę 2 (nowsza)

if __name__ == '__main__':
    print("=" * 60)
    print("GENERATOR BEZPIECZNEGO SECRET_KEY DLA FLASK")
    print("=" * 60)
    print()
    
    # Generuj klucz
    secret_key = generate_secret_key(64)
    
    print("Twój nowy SECRET_KEY:")
    print("-" * 60)
    print(secret_key)
    print("-" * 60)
    print()
    
    print("📋 INSTRUKCJA:")
    print("1. Skopiuj powyższy klucz")
    print("2. Otwórz plik .env")
    print("3. Zmień linię:")
    print("   SECRET_KEY='ZMIEN_MNIE...'")
    print("   na:")
    print(f"   SECRET_KEY='{secret_key}'")
    print()
    
    print("⚠️  WAŻNE:")
    print("- NIGDY nie commituj pliku .env do Git!")
    print("- Każde środowisko (dev/prod) powinno mieć INNY klucz")
    print("- Zapisz klucz w bezpiecznym miejscu (password manager)")
    print()
    
    print("✅ Bezpieczeństwo:")
    print(f"- Długość: {len(secret_key)} znaków")
    print(f"- Entropia: ~{len(secret_key) * 4} bitów")
    print("- Algorytm: secrets.token_hex() (CSPRNG)")
    print()
    
    # Dodatkowa walidacja
    if len(secret_key) < 32:
        print("❌ BŁĄD: Klucz za krótki! (minimum 32 znaki)")
    elif len(secret_key) < 64:
        print("⚠️  OSTRZEŻENIE: Zalecane minimum 64 znaki")
    else:
        print("✅ Klucz spełnia wymogi bezpieczeństwa!")
    
    print("=" * 60)
