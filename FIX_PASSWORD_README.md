# 🔧 Naprawa problemu z hasłem (password 120 → 255)

## 🐛 Problem:
Kolumna `password` w tabeli `users` ma limit 120 znaków, a bcrypt hash potrzebuje minimum 60-80 znaków (często więcej).

## ✅ Rozwiązanie (WYBIERZ JEDNĄ METODĘ):

---

### **METODA 1: Bezpieczna (ALTER) - ZALECANA**

Rozszerza kolumnę bez usuwania danych.

```powershell
python fix_users_table_safe.py
```

**Plusy:**
- ✅ Zachowuje użytkowników
- ✅ Szybkie (1 sekunda)
- ✅ Bezpieczne

**Minusy:**
- ⚠️ Może nie działać jeśli są hasła dłuższe niż 120 (rzadkie)

---

### **METODA 2: Radykalna (DROP) - Gdy safe nie działa**

Usuwa tabelę i pozwala aplikacji stworzyć ją na nowo.

```powershell
python fix_users_table.py
```

Wpisz: `TAK` gdy zapyta.

**Plusy:**
- ✅ Gwarantuje naprawę
- ✅ Czyści stare dane

**Minusy:**
- ⚠️ Usuwa wszystkich użytkowników (będą musieć się zarejestrować ponownie)
- ⚠️ Admin 'lukipuki' zostanie stworzony automatycznie przy starcie

---

## 📋 Kolejność działań:

### 1. Zmień kod (✅ JUŻ ZROBIONE)
- [x] `app.py`: `String(120)` → `String(255)`

### 2. Uruchom skrypt naprawczy
```powershell
# Opcja A (bezpieczna):
python fix_users_table_safe.py

# Opcja B (radykalna):
python fix_users_table.py
```

### 3. Deploy na Render
```powershell
git add .
git commit -m "Fix: Zwiększ limit password do 255 znaków"
git push
```

### 4. Restart na Renderze
- Render Dashboard → Manual Deploy
- LUB poczekaj na auto-deploy

---

## 🔍 Weryfikacja:

Sprawdź logi na Renderze:
```
[INFO] Database connected
[INFO] Admin user 'lukipuki' created
```

Przetestuj rejestrację:
```
https://skankran.pl/register
```

---

## 🆘 Troubleshooting:

### "connection refused"
- Sprawdź DATABASE_URL w .env
- Upewnij się że baza na Renderze jest włączona

### "column password does not exist"
- To normalne przy pierwszym starcie
- Aplikacja stworzy tabelę automatycznie

### "permission denied"
- Sprawdź czy użytkownik bazy ma uprawnienia ALTER TABLE
- Użyj METODY 2 (DROP)

---

## 📝 Nota techniczna:

**Dlaczego 255?**
- Bcrypt hash: ~60 znaków
- Salt: 22 znaki
- Prefix ($2b$, $2y$): ~7 znaków
- Total: ~89 znaków minimum
- **Standard branżowy: VARCHAR(255)** dla bezpieczeństwa

---

✅ **Po naprawie wszystko będzie działać!**
