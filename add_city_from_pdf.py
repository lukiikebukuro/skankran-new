#!/usr/bin/env python3
"""
SKANKRAN - PDF Paste → PostgreSQL Render
==========================================

Workflow:
1. User wkłada PDF tabelkę (paste text)
2. Skrypt wyciąga 15 parametrów
3. Konwertuje jednostki (mg/L ↔ ug/L)
4. Zapisuje do Render PostgreSQL
5. NOWE DANE zastępują STARE (upsert)

15 Parametrów:
pH, twardosc, azotany, zelazo, fluorki, chlor, chlorki, siarczany, 
potas, magnez, metnosc, barwa, mangan, olow, rtec

Units:
- Metale ciężkie (mangan, olow, rtec): ug/L
- Reszta: mg/L
"""

import os
import re
from datetime import datetime, date
from app import app, db, City, Station, MeasurementPoint, WaterMeasurement, CityAverage

# ============================================
# UNIT CONVERSION
# ============================================

def get_unit_for_parameter(param):
    """Zwraca jednostkę dla parametru."""
    heavy_metals = ['mangan', 'olow', 'rtec']
    return 'µg/l' if param in heavy_metals else 'mg/l'


def convert_to_target_unit(value, param, source_unit='mg/l'):
    """
    Konwertuje wartość do docelowej jednostki.
    
    Examples:
        Mangan: 50 µg/L (source) → 50 µg/L (no change)
        Mangan: 0.05 mg/L (source) → 50 µg/L (multiply by 1000)
    """
    if value is None:
        return None
    
    target_unit = get_unit_for_parameter(param)
    
    # mg/l → µg/l conversion for heavy metals
    if source_unit == 'mg/l' and target_unit == 'µg/l':
        return value * 1000
    
    return value


# ============================================
# PDF PARSING
# ============================================

def parse_pdf_paste(pdf_text):
    """
    Parsuje wklejony tekst z PDF.
    
    Expected format (example):
    pH: 7.5
    Twardość ogólna: 250 mg/l
    Azotany: 15.0 mg/l
    Żelazo: 0.05 mg/l
   ... etc
    
    Returns:
        dict: {'pH': 7.5, 'twardosc': 250, ...}
    """
    params = {
        'pH': None, 'twardosc': None, 'azotany': None, 'zelazo': None,
        'fluorki': None, 'chlor': None, 'chlorki': None, 'siarczany': None,
        'potas': None, 'magnez': None, 'metnosc': None, 'barwa': None,
        'mangan': None, 'olow': None, 'rtec': None
    }
    
    # Mapping: tekst w PDF → key w słowniku
    param_aliases = {
        'ph': 'pH',
        'twardość': 'twardosc',
        'twardosc': 'twardosc',
        'azotany': 'azotany',
        'żelazo': 'zelazo',
        'zelazo': 'zelazo',
        'fluorki': 'fluorki',
        'chlor wolny': 'chlor',
        'chlor': 'chlor',
        'chlorki': 'chlorki',
        'siarczany': 'siarczany',
        'potas': 'potas',
        'magnez': 'magnez',
        'mętność': 'metnosc',
        'metnosc': 'metnosc',
        'barwa': 'barwa',
        'mangan': 'mangan',
        'ołów': 'olow',
        'olow': 'olow',
        'rtęć': 'rtec',
        'rtec': 'rtec'
    }
    
    lines = pdf_text.split('\\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Regex: "Nazwa parametru: 123.45 mg/l" lub "Nazwa: 10 µg/l"
        match = re.search(r'([^:]+):\\s*([0-9.,]+)\\s*(mg/l|µg/l|ug/l)?', line, re.IGNORECASE)  
        
        if match:
            param_name = match.group(1).strip().lower()
            value_str = match.group(2).replace(',', '.')
            unit_str = match.group(3).lower() if match.group(3) else 'mg/l'
            
            # Normalize unit
            if 'ug' in unit_str or 'µg' in unit_str:
                unit_str = 'µg/l'
            else:
                unit_str = 'mg/l'
            
            # Find matching parameter
            for alias, key in param_aliases.items():
                if alias in param_name:
                    try:
                        value = float(value_str)
                        # Convert to target unit
                        value = convert_to_target_unit(value, key, unit_str)
                        params[key] = value
                        print(f\"  ✅ {key}: {value} {get_unit_for_parameter(key)}\")
                        break
                    except ValueError:
                        print(f\"  ⚠️ Cannot parse value '{value_str}' for {param_name}\")
    
    return params


# ============================================
# DATABASE UPSERT
# ============================================

def upsert_city_data(city_name, params, measurement_date=None):
    \"\"\"
    UPSERT: Dodaje lub aktualizuje dane miasta.
    
    Args:
        city_name: Nazwa miasta (np. 'Grudziądz')
        params: dict z 15 parametrami
        measurement_date: data pomiaru (domyślnie dzisiaj)
    \"\"\"
    if measurement_date is None:
        measurement_date = date.today()
    
    print(f\"\\n📊 UPSERT: {city_name} (date: {measurement_date})\")
    
    # 1. Znajdź lub utwórz miasto
    city = City.query.filter_by(name=city_name).first()
    if not city:
        print(f\"  🆕 Creating new city: {city_name}\")
        city = City(name=city_name)
        db.session.add(city)
        db.session.flush()
    else:
        print(f\"  ♻️ Updating existing city: {city_name}\")
    
    # 2. Update lub utwórz CityAverage
    avg = city.averages
    if not avg:
        print(f\"  🆕 Creating CityAverage\")
        avg = CityAverage(city_id=city.id)
        db.session.add(avg)
    else:
        print(f\"  ♻️ Updating CityAverage\")
    
    # 3. Zapisz parametry do CityAverage
    for param, value in params.items():
        if value is not None:
            setattr(avg, param, value)
    
    # 4. Commit
    db.session.commit()
    print(f\"\\n✅ SAVED: {city_name} → Render PostgreSQL\")
    
    return city


# ============================================
# MAIN WORKFLOW
# ============================================

if __name__ == '__main__':
    with app.app_context():
        print(\"=\"*60)
        print(\"SKANKRAN - PDF → PostgreSQL Scraper\")
        print(\"=\"*60)
        
        # 1. Get city name
        city_name = input(\"\\n📍 Nazwa miasta: \").strip()
        if not city_name:
            print(\"❌ Nazwa miasta jest wymagana!\")
            exit(1)
        
        # 2. Get PDF paste
        print(\"\\n📋 Wklej dane z PDF (Ctrl+D lub pusta linia żeby zakończyć):\\n\")
        pdf_lines = []
        try:
            while True:
                line = input()
                if not line:
                    break
                pdf_lines.append(line)
        except EOFError:
            pass
        
        pdf_text = '\\n'.join(pdf_lines)
        
        if not pdf_text.strip():
            print(\"❌ Brak danych!\")
            exit(1)
        
        # 3. Parse
        print(\"\\n🔍 Parsing PDF data...\")
        params = parse_pdf_paste(pdf_text)
        
        # 4. Show parsed data
        print(\"\\n📊 Parsed parameters:\")
        for k, v in params.items():
            if v is not None:
                unit = get_unit_for_parameter(k)
                print(f\"  {k}: {v} {unit}\")
        
        # 5. Confirm
        confirm = input(\"\\n💾 Save to database? (yes/no): \").strip().lower()
        if confirm == 'yes':
            upsert_city_data(city_name, params)
        else:
            print(\"❌ Cancelled\")
