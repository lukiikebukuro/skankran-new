"""
🔥 RENDER.COM - Database Initialization Script
Uruchamiane przez Gunicorn przed startem aplikacji
"""
from app import app, db, User
from werkzeug.security import generate_password_hash

def init_database():
    """Inicjalizuj bazę danych i utwórz tabele"""
    with app.app_context():
        print("[INIT_DB] Creating database tables...")
        db.create_all()
        print("[INIT_DB] Database tables created!")
        
        # Sprawdź czy admin istnieje
        admin = User.query.filter_by(username='lukipuki').first()
        if not admin:
            print("[INIT_DB] Creating admin user 'lukipuki'...")
            admin = User(
                username='lukipuki',
                password=generate_password_hash('nokia5310'),
                is_premium=True
            )
            db.session.add(admin)
            db.session.commit()
            print("[INIT_DB] Admin user created!")
        else:
            print("[INIT_DB] Admin user 'lukipuki' already exists")

if __name__ == '__main__':
    init_database()
