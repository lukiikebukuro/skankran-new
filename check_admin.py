#!/usr/bin/env python3
"""
Check if admin user exists in database
"""

from app import app, db, User

def check_admin():
    with app.app_context():
        # Sprawdź wszystkich użytkowników
        users = User.query.all()
        
        print(f"📊 Total users in database: {len(users)}")
        print("")
        
        if len(users) == 0:
            print("❌ Baza jest pusta! Uruchom: python init_db.py")
            return
        
        for user in users:
            print(f"👤 User: {user.username}")
            print(f"   ID: {user.id}")
            print(f"   Admin: {user.is_admin}")
            print(f"   Password hash: {user.password[:50]}...")
            print("")
        
        # Sprawdź konkretnie lukipuki
        admin = User.query.filter_by(username='lukipuki').first()
        if admin:
            print("✅ User 'lukipuki' EXISTS in database!")
            print(f"   Can reset password now")
        else:
            print("❌ User 'lukipuki' NOT FOUND")

if __name__ == '__main__':
    check_admin()
