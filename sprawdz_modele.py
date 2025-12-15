import google.generativeai as genai
import os

# WAŻNE: Wklej tu ten sam klucz API, którego używasz w projekcie (ten z configu)
api_key = "AIzaSyAtlxvm1L9cma4Q79mbLfKyOvbjQUthGxQ" 

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