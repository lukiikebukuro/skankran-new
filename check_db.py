from app import app, db, AquaBotQuery, VisitorEvent, B2BLead
from sqlalchemy import func

with app.app_context():
    print('=== DATABASE CHECK ===')
    print(f'AquaBotQuery count: {db.session.query(func.count(AquaBotQuery.id)).scalar()}')
    print(f'VisitorEvent count: {db.session.query(func.count(VisitorEvent.id)).scalar()}')
    print(f'B2BLead count: {db.session.query(func.count(B2BLead.id)).scalar()}')
    
    print('\n=== LAST 5 VISITOR EVENTS ===')
    events = db.session.query(VisitorEvent).order_by(VisitorEvent.timestamp.desc()).limit(5).all()
    for e in events:
        print(f'{e.timestamp} | {e.event_type} | {e.city} | {e.organization}')
    
    print('\n=== LAST 5 AQUABOT QUERIES ===')
    queries = db.session.query(AquaBotQuery).order_by(AquaBotQuery.timestamp.desc()).limit(5).all()
    for q in queries:
        print(f'{q.timestamp} | {q.city} | {q.query[:50]}')
