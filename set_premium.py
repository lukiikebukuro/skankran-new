from app import app, db, User

with app.app_context():
    user = User.query.filter_by(username='siemaeniu').first()
    if user:
        user.is_premium = True
        db.session.commit()
        print('Premium aktywowane dla siemaeniu!')
    else:
        print('Użytkownik monika6050 nie znaleziony - zarejestruj najpierw!')