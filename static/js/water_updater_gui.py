# water_updater_gui.py - GUI DO AKTUALIZACJI DANYCH WODY (WERSJA INTELIGENTNA)

import json
import re
import os
import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk

# Ścieżki do plików
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WATER_ANALYSIS_PATH = os.path.join(BASE_DIR, 'waterAnalysis.json')

class WaterDataExtractor:
    def __init__(self):
        # Aliasy dla parametrów (różne sposoby zapisu)
        self.param_aliases = {
            'ph': ['ph', 'odczyn', 'stężenie jonów wodoru'],
            'twardosc': ['twardość', 'twardosc', 'caco3'],
            'azotany': ['azotany', 'no3'],
            'zelazo': ['żelazo', 'zelazo', 'fe'],
            'fluorki': ['fluorki', 'fluor', 'f'],
            'chlor': ['chlor wolny', 'chlor'],
            'chlorki': ['chlorki', 'cl'],
            'siarczany': ['siarczany', 'so4'],
            'potas': ['potas', 'k'],
            'metnosc': ['mętność', 'metnosc', 'ntu'],
            'barwa': ['barwa', 'pt'],
            'mangan': ['mangan', 'mn'],
            'magnez': ['magnez', 'mg'],
            'olow': ['ołów', 'olow', 'pb'],
            'rtec': ['rtęć', 'rtec', 'hg'],
        }
    
    def detect_unit(self, line: str) -> str:
        """Wykrywa jednostkę w linii tekstu."""
        line_lower = line.lower()
        if 'µg/l' in line_lower or 'ug/l' in line_lower:
            return 'µg/L'
        elif 'mg/l' in line_lower:
            return 'mg/L'
        return None
    
    def convert_unit(self, param: str, value, unit: str):
        """Konwertuje jednostki do formatu JSON."""
        # Obsługa wartości "<X"
        if isinstance(value, str) and value.startswith('<'):
            numeric_part = float(value[1:])
            converted = self._convert_numeric(param, numeric_part, unit)
            return f"<{converted}"
        
        return self._convert_numeric(param, value, unit)
    
    def _convert_numeric(self, param: str, value: float, unit: str) -> float:
        """Konwertuje wartość numeryczną."""
        # Parametry w µg/L: mangan, olow, rtec
        if param in ['mangan', 'olow', 'rtec']:
            if unit == 'mg/L':
                return value * 1000  # mg/L → µg/L
            return value  # już µg/L
        
        # Parametry w mg/L: reszta
        else:
            if unit == 'µg/L':
                return value / 1000  # µg/L → mg/L
            return value  # już mg/L
    
    def extract_from_line(self, line: str):
        """Wyciąga parametr i wartość z pojedynczej linii."""
        line_lower = line.lower()
        
        # Sprawdź każdy parametr
        for param_key, param_names in self.param_aliases.items():
            for name in param_names:
                if name in line_lower:
                    # Znaleziono parametr - szukaj wartości
                    # Wzorce: "5", "<20", "0,15", "292", "-" (brak)
                    
                    # Usuń nazwę parametru z linii, żeby szukać tylko wartości
                    value_part = line_lower.split(name, 1)[1] if name in line_lower else line
                    
                    # Szukaj pierwszej wartości liczbowej
                    # Obsługa: <0.10, 292, 0,15, b.b., n.b., -, akcept
                    
                    # Sprawdź "brak danych"
                    if any(x in value_part for x in ['b.b.', 'n.b.', 'brak', 'bnz', 'akcept', '---']):
                        return param_key, 0
                    
                    # Szukaj liczby
                    match = re.search(r'(<?\d+[,\.]?\d*)', value_part)
                    if match:
                        value_str = match.group(1).replace(',', '.')
                        
                        # Obsługa "<"
                        if value_str.startswith('<'):
                            try:
                                numeric_value = float(value_str[1:])
                            except:
                                continue
                            unit = self.detect_unit(line)
                            converted = self.convert_unit(param_key, numeric_value, unit)
                            return param_key, f"<{converted}"
                        else:
                            try:
                                numeric_value = float(value_str)
                            except:
                                continue
                            unit = self.detect_unit(line)
                            return param_key, self.convert_unit(param_key, numeric_value, unit)
                    
                    # Jeśli tylko "-" bez liczby
                    if re.search(r'^\s*-\s*$', value_part.strip()):
                        return param_key, 0
        
        return None, None
    
    def extract_all(self, text: str):
        """Wyciąga wszystkie parametry z tekstu (linia po linii)."""
        results = {}
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            param, value = self.extract_from_line(line)
            if param and value is not None:
                # Nie nadpisuj jeśli już mamy wartość (chyba że to było 0)
                if param not in results or results[param] == 0:
                    results[param] = value
        
        return results

class WaterUpdaterGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🔧 Skankran.pl - Aktualizator Danych Wody")
        self.root.geometry("900x700")
        self.root.resizable(True, True)
        
        self.extractor = WaterDataExtractor()
        self.extracted_data = {}
        
        self.create_widgets()
    
    def create_widgets(self):
        # Nagłówek
        header = tk.Label(
            self.root,
            text="AKTUALIZATOR DANYCH WODY",
            font=("Arial", 16, "bold"),
            bg="#2c3e50",
            fg="white",
            pady=10
        )
        header.pack(fill=tk.X)
        
        # Frame dla inputów
        input_frame = tk.Frame(self.root, padx=10, pady=10)
        input_frame.pack(fill=tk.X)
        
        # Miasto
        tk.Label(input_frame, text="📍 Nazwa miasta:", font=("Arial", 10, "bold")).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.city_entry = tk.Entry(input_frame, font=("Arial", 10), width=30)
        self.city_entry.grid(row=0, column=1, sticky=tk.W, pady=5)
        
        # Stacja
        tk.Label(input_frame, text="🏢 Nazwa stacji:", font=("Arial", 10, "bold")).grid(row=1, column=0, sticky=tk.W, pady=5)
        self.station_entry = tk.Entry(input_frame, font=("Arial", 10), width=30)
        self.station_entry.grid(row=1, column=1, sticky=tk.W, pady=5)
        
        # Pole tekstowe
        text_frame = tk.Frame(self.root, padx=10)
        text_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(text_frame, text="📋 Wklej surowy tekst z tabelki (Ctrl+C → Ctrl+V):", font=("Arial", 10, "bold")).pack(anchor=tk.W, pady=5)
        
        self.text_area = scrolledtext.ScrolledText(
            text_frame,
            font=("Consolas", 9),
            wrap=tk.WORD,
            height=15
        )
        self.text_area.pack(fill=tk.BOTH, expand=True)
        
        # Przyciski
        button_frame = tk.Frame(self.root, padx=10, pady=10)
        button_frame.pack(fill=tk.X)
        
        analyze_btn = tk.Button(
            button_frame,
            text="🔍 ANALIZUJ DANE",
            font=("Arial", 11, "bold"),
            bg="#3498db",
            fg="white",
            command=self.analyze_data,
            padx=20,
            pady=10
        )
        analyze_btn.pack(side=tk.LEFT, padx=5)
        
        self.save_btn = tk.Button(
            button_frame,
            text="💾 ZAPISZ DO JSON",
            font=("Arial", 11, "bold"),
            bg="#27ae60",
            fg="white",
            command=self.save_data,
            padx=20,
            pady=10,
            state=tk.DISABLED
        )
        self.save_btn.pack(side=tk.LEFT, padx=5)
        
        clear_btn = tk.Button(
            button_frame,
            text="🗑️ WYCZYŚĆ",
            font=("Arial", 11, "bold"),
            bg="#e74c3c",
            fg="white",
            command=self.clear_all,
            padx=20,
            pady=10
        )
        clear_btn.pack(side=tk.LEFT, padx=5)
        
        # Tabelka wyników
        result_frame = tk.Frame(self.root, padx=10, pady=10)
        result_frame.pack(fill=tk.BOTH, expand=True)
        
        tk.Label(result_frame, text="✨ Znalezione wartości:", font=("Arial", 10, "bold")).pack(anchor=tk.W)
        
        # Treeview
        columns = ("Parametr", "Wartość", "Jednostka")
        self.tree = ttk.Treeview(result_frame, columns=columns, show="headings", height=8)
        
        self.tree.heading("Parametr", text="Parametr")
        self.tree.heading("Wartość", text="Wartość")
        self.tree.heading("Jednostka", text="Jednostka")
        
        self.tree.column("Parametr", width=200)
        self.tree.column("Wartość", width=150)
        self.tree.column("Jednostka", width=200)
        
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Scrollbar dla treeview
        scrollbar = ttk.Scrollbar(result_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def get_unit_display(self, param):
        """Zwraca jednostkę dla wyświetlenia."""
        units = {
            'ph': 'bezwzględna',
            'twardosc': 'mg CaCO₃/L',
            'azotany': 'mg/L',
            'zelazo': 'mg/L',
            'fluorki': 'mg/L',
            'chlor': 'mg/L',
            'chlorki': 'mg/L',
            'siarczany': 'mg/L',
            'potas': 'mg/L',
            'metnosc': 'NTU',
            'barwa': 'mg/L Pt',
            'mangan': 'µg/L',
            'magnez': 'mg/L',
            'olow': 'µg/L',
            'rtec': 'µg/L',
        }
        return units.get(param, '?')
    
    def analyze_data(self):
        """Analizuje wklejone dane."""
        city = self.city_entry.get().strip()
        station = self.station_entry.get().strip()
        raw_text = self.text_area.get("1.0", tk.END).strip()
        
        if not city:
            messagebox.showwarning("Brak danych", "Podaj nazwę miasta!")
            return
        
        if not station:
            messagebox.showwarning("Brak danych", "Podaj nazwę stacji!")
            return
        
        if not raw_text:
            messagebox.showwarning("Brak danych", "Wklej dane do analizy!")
            return
        
        # Ekstrakcja
        self.extracted_data = self.extractor.extract_all(raw_text)
        
        if not self.extracted_data:
            messagebox.showerror("Błąd", "Nie znaleziono żadnych rozpoznawalnych parametrów!\n\nUpewnij się, że tekst zawiera parametry jak:\npH, Twardość, Azotany, Żelazo, itp.")
            return
        
        # Wypełnij tabelkę
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        for param, value in self.extracted_data.items():
            unit = self.get_unit_display(param)
            self.tree.insert("", tk.END, values=(param.capitalize(), value, unit))
        
        self.save_btn.config(state=tk.NORMAL)
        messagebox.showinfo("Sukces", f"✅ Znaleziono {len(self.extracted_data)} parametrów!")
    
    def save_data(self):
        """Zapisuje dane do waterAnalysis.json."""
        city = self.city_entry.get().strip()
        station = self.station_entry.get().strip()
        
        if not self.extracted_data:
            messagebox.showwarning("Brak danych", "Najpierw przeanalizuj dane!")
            return
        
        try:
            # Wczytaj istniejące dane
            if os.path.exists(WATER_ANALYSIS_PATH):
                with open(WATER_ANALYSIS_PATH, 'r', encoding='utf-8') as f:
                    water_data = json.load(f)
            else:
                water_data = {}
            
            # Inicjalizacja struktury
            if city not in water_data:
                water_data[city] = {}
            
            if station not in water_data[city]:
                water_data[city][station] = {
                    "name": station,
                    "data": {}
                }
            
            # Aktualizacja danych
            water_data[city][station]["data"].update(self.extracted_data)
            
            # Zapis
            with open(WATER_ANALYSIS_PATH, 'w', encoding='utf-8') as f:
                json.dump(water_data, f, indent=2, ensure_ascii=False)
            
            messagebox.showinfo("Sukces", f"✅ Zapisano dane dla:\n{city} → {station}\n\nŚcieżka: {WATER_ANALYSIS_PATH}")
            
        except Exception as e:
            messagebox.showerror("Błąd zapisu", f"Nie udało się zapisać danych:\n{e}")
    
    def clear_all(self):
        """Czyści wszystkie pola."""
        self.city_entry.delete(0, tk.END)
        self.station_entry.delete(0, tk.END)
        self.text_area.delete("1.0", tk.END)
        
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        self.extracted_data = {}
        self.save_btn.config(state=tk.DISABLED)

if __name__ == "__main__":
    root = tk.Tk()
    app = WaterUpdaterGUI(root)
    root.mainloop()