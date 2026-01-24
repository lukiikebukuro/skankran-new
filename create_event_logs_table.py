"""Script to create event_logs table"""
from app import app, db

with app.app_context():
    # Tworzy wszystkie tabele które nie istnieją
    db.create_all()
    print("✅ Tabela event_logs utworzona!")
