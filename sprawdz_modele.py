import google.generativeai as genai
import os

# 🔒 SECURITY FIX: Use environment variable instead of hardcoded key
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("ERROR: GOOGLE_API_KEY environment variable not set!")
    print("Please set it before running this script.")
    exit(1)

try:
    genai.configure(api_key=api_key)
    print("--- LISTA DOSTĘPNYCH MODELI ---")
    found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"MODEL: {m.name}")
            found = True
    if not found:
        print("Brak modeli obsługujących generateContent. Sprawdź klucz API.")
except Exception as e:
    print(f"BŁĄD KRYTYCZNY: {e}")