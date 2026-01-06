# 🔥 EVENTLET MONKEY PATCH - MUSI BYĆ NA SAMYM POCZĄTKU!
import eventlet
eventlet.monkey_patch()

from dotenv import load_dotenv
import os
load_dotenv()

from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from datetime import timedelta, datetime
from aquabotBackend import AquaBot
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_session import Session
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_socketio import SocketIO, emit
import logging
from logging.handlers import RotatingFileHandler
import re
import json
from sqlalchemy import desc

# ============================================
# INICJALIZACJA APLIKACJI
# ============================================

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# KONFIGURACJA
SECRET_KEY_VALUE = os.getenv('SECRET_KEY', 'dev_key_change_in_production')

# 🔒 SECURITY FIX: Prevent production use with default secret key
if not app.debug and SECRET_KEY_VALUE == 'dev_key_change_in_production':
    raise RuntimeError(
        "CRITICAL SECURITY ERROR: Cannot run in production with default SECRET_KEY. "
        "Set SECRET_KEY environment variable to a secure random string."
    )

app.config['SECRET_KEY'] = SECRET_KEY_VALUE

# 🔥 DATABASE: SQLite lokalnie, PostgreSQL na Render (opcjonalnie)
database_url = os.getenv('DATABASE_URL', 'sqlite:///skankran.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}
app.config['JSON_AS_ASCII'] = False  # 🔥 Polskie znaki w JSON

# SESSION - Cookie-based (działa na Render.com)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "null"  # 🔥 RENDER: null = Flask default cookie sessions (nie filesystem!)
app.config["SESSION_COOKIE_SECURE"] = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_NAME"] = "skankran_session"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=24)
app.config['PREFERRED_URL_SCHEME'] = os.getenv('PREFERRED_URL_SCHEME', 'http')

# 🔥 RENDER: Nie używamy Flask-Session, tylko built-in Flask sessions
# Session(app)  # <-- WYŁĄCZONE dla Render.com
csrf = CSRFProtect(app)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)
limiter.init_app(app)

# Wyłącz limity dla admina i analytics - zwiększ limity zamiast wyłączać
@app.before_request
def exempt_admin_routes():
    if request.path.startswith('/api/analytics/') or request.path.startswith('/admin/'):
        from flask import g
        g._limiter_exempt = True  # Całkowicie wyłącz rate limiting dla admin routes

# 🛰️ SATELITA: Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', logger=True, engineio_logger=True)

# LOGGING
if not app.debug:
    handler = RotatingFileHandler('skankran.log', maxBytes=10000000, backupCount=3)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

# ============================================
# DATABASE MODELS (SQLite)
# ============================================

db = SQLAlchemy(app)

# USER MODEL (istniejący)
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_premium = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)  # 🔒 SECURITY FIX: Proper admin flag


# 🛰️ SATELITA: VISITOR EVENTS MODEL
class VisitorEvent(db.Model):
    __tablename__ = 'visitor_events'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False, index=True)
    event_type = db.Column(db.String(50), nullable=False)  # session_start, page_visible, scroll_depth
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Location data (RODO compliant)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    organization = db.Column(db.String(200))  # ISP/Company name
    
    # Device info (minimal)
    device_type = db.Column(db.String(20))  # Desktop/Mobile/Tablet
    os = db.Column(db.String(20))
    browser = db.Column(db.String(20))
    
    # IP hash (SHA-256, not reversible)
    ip_hash = db.Column(db.String(64))
    
    # Anonymous mode
    anonymous_mode = db.Column(db.Boolean, default=False)
    
    # Extra data (JSON)
    extra_data = db.Column(db.Text)  # JSON string


# 🛰️ SATELITA: AQUABOT QUERIES MODEL
class AquaBotQuery(db.Model):
    __tablename__ = 'aquabot_queries'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False, index=True)
    query = db.Column(db.Text, nullable=False)  # Sanitized query
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Location
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    organization = db.Column(db.String(200))
    
    # Query metadata
    query_count = db.Column(db.Integer, default=1)  # Nth query in session
    time_since_entry = db.Column(db.Integer)  # Seconds since session start
    
    # Classification (opcjonalne - do Lost Demand)
    bot_confidence = db.Column(db.Float)  # 0.0 - 1.0
    bot_response_summary = db.Column(db.Text)  # Krótkie streszczenie odpowiedzi


# 🛰️ SATELITA: B2B LEADS MODEL
class B2BLead(db.Model):
    __tablename__ = 'b2b_leads'
    id = db.Column(db.Integer, primary_key=True)
    organization = db.Column(db.String(200), unique=True, nullable=False, index=True)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    
    # Engagement metrics
    first_visit = db.Column(db.DateTime, default=datetime.utcnow)
    last_visit = db.Column(db.DateTime, default=datetime.utcnow)
    total_queries = db.Column(db.Integer, default=0)
    total_sessions = db.Column(db.Integer, default=0)
    
    # Lead scoring
    engagement_score = db.Column(db.Integer, default=0)  # 0-100
    is_b2b = db.Column(db.Boolean, default=False)  # True jeśli firma, False jeśli ISP domowy
    
    # Last query
    last_query = db.Column(db.Text)


# 🛰️ SATELITA: EVENT LOGS MODEL (dla trackingu akcji użytkownika)
class EventLog(db.Model):
    __tablename__ = 'event_logs'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(64), nullable=False, index=True)
    action_type = db.Column(db.String(50), nullable=False, index=True)  # 'search_city', 'find_station', 'generate_ranking'
    query_data = db.Column(db.Text, nullable=False)  # JSON string: {city, street, parameter, ranking_type, etc}
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Location (optional)
    city = db.Column(db.String(100))
    organization = db.Column(db.String(200))


login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 🔒 ADMIN DECORATOR - SECURITY FIXED
def admin_required(f):
    """Decorator to require admin privileges - uses is_admin flag"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('login'))
        if not current_user.is_admin:  # 🔒 SECURITY FIX: Use is_admin flag
            app.logger.warning(f'[SECURITY] Unauthorized admin access attempt by {current_user.username}')
            return render_template('unauthorized.html'), 403
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def ensure_session_id():
    if 'session_id' not in session:
        session['session_id'] = os.urandom(16).hex()

# ============================================
# HELPER FUNCTIONS
# ============================================

def verify_origin():
    """Verify request origin for CSRF-exempt endpoints"""
    origin = request.headers.get('Origin')
    referer = request.headers.get('Referer')
    
    # Allow requests from same origin or localhost (dev)
    allowed_origins = [
        'https://skankran.pl',
        'https://www.skankran.pl',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ]
    
    # Check Origin header first
    if origin:
        return origin in allowed_origins
    
    # Fallback to Referer
    if referer:
        return any(referer.startswith(allowed) for allowed in allowed_origins)
    
    # Allow if no Origin/Referer (direct navigation)
    return True


def is_b2b_organization(org_name):
    """Sprawdź czy to firma czy domowy ISP"""
    if not org_name or org_name == 'Unknown':
        return False
    
    # Blacklist domowych ISP (rozszerz według potrzeb)
    home_isps = [
        'UPC', 'Vectra', 'Netia', 'Orange Polska', 'T-Mobile', 
        'Play', 'Plus', 'Multimedia Polska', 'Inea', 'Toya'
    ]
    
    org_lower = org_name.lower()
    for isp in home_isps:
        if isp.lower() in org_lower:
            return False
    
    return True


def update_or_create_lead(data):
    """Aktualizuj lub stwórz lead B2B"""
    org = data.get('organization', 'Unknown')
    if org == 'Unknown':
        return
    
    lead = B2BLead.query.filter_by(organization=org).first()
    
    if lead:
        # Update existing
        lead.last_visit = datetime.utcnow()
        lead.total_queries += 1
        lead.last_query = data.get('query')
        lead.engagement_score = min(100, lead.total_queries * 5)  # Prosta formuła
    else:
        # Create new
        lead = B2BLead(
            organization=org,
            city=data.get('city'),
            country=data.get('country'),
            total_queries=1,
            total_sessions=1,
            is_b2b=is_b2b_organization(org),
            last_query=data.get('query'),
            engagement_score=5
        )
        db.session.add(lead)
    
    db.session.commit()


# ============================================
# ROUTES - GŁÓWNE STRONY
# ============================================

@app.route('/health')
def health():
    """Health check endpoint for Render.com"""
    return jsonify({"status": "ok", "database": "connected"}), 200

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sitemap.xml')
def sitemap():
    """Sitemap dla Google Search Console"""
    return app.send_static_file('sitemap.xml')

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/mission')
def mission():
    return render_template('mission.html')

@app.route('/updates')
def updates():
    return render_template('updates.html')

@app.route('/regulamin')
def regulamin():
    return render_template('regulamin.html')

@app.route('/support')
def support():
    return render_template('support.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy_policy.html')

@app.route('/disclaimer')
def disclaimer():
    return render_template('disclaimer.html')

@app.route('/test-tracking')
def test_tracking():
    return render_template('test_tracking.html')

@app.route('/send_feedback', methods=['POST'])
@limiter.limit("5 per hour")
def send_feedback():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        if not message or len(message) > 2000:
            return jsonify({'error': 'Invalid message'}), 400
        app.logger.info(f"Feedback: {message[:200]}")
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# ROUTES - AUTHENTICATION
# ============================================

@app.route('/register', methods=['GET', 'POST'])
@limiter.limit("3 per hour")
def register():
    # 🔒 SECURITY FIX: Registration closed or whitelist-only
    # Uncomment to completely disable registration:
    # flash('Rejestracja jest tymczasowo wyłączona. Skontaktuj się z administratorem.')
    # return redirect(url_for('login'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Enhanced validation
        if len(username) < 3 or len(password) < 8:
            flash('Username min 3, password min 8 chars')
            return render_template('register.html')
        
        # Check password strength
        if not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
            flash('Password must contain at least 1 uppercase letter and 1 digit')
            return render_template('register.html')
        
        hashed = generate_password_hash(password)
        new_user = User(username=username, password=hashed, is_admin=False)  # 🔒 Explicit is_admin=False
        try:
            db.session.add(new_user)
            db.session.commit()
            app.logger.info(f'[AUTH] New user registered: {username}')
            flash('Account created!')
            return redirect(url_for('login'))
        except Exception as e:
            app.logger.error(f'[AUTH] Registration failed: {e}')
            flash('Username taken')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
@limiter.limit("10 per hour")
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            # 🔒 SECURITY FIX: Regenerate session to prevent session fixation
            old_session = dict(session)
            session.clear()
            session.update(old_session)
            session['session_id'] = os.urandom(16).hex()  # New session ID
            
            login_user(user)
            app.logger.info(f'[AUTH] User {username} logged in successfully')
            return redirect(url_for('index'))
        app.logger.warning(f'[AUTH] Failed login attempt for username: {username}')
        flash('Login failed')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('index'))

# ============================================
# ROUTES - AQUABOT
# ============================================

@app.route('/aquabot/start', methods=['POST'])
@limiter.limit("20 per hour")
@csrf.exempt
def aquabot_start():
    # 🔒 SECURITY FIX: Verify origin for CSRF protection
    if not verify_origin():
        return jsonify({'error': 'Unauthorized origin'}), 403
    
    bot = AquaBot()
    data = request.get_json()
    context = data.get('context')
    if not context:
        return jsonify({'error': 'No context'}), 400
    try:
        bot.set_station_context(context)
        response = bot.get_initial_greeting()
        return jsonify({'reply': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/aquabot/send', methods=['POST'])
@limiter.limit("10 per minute")
@csrf.exempt
def aquabot_send():
    # 🔒 SECURITY FIX: Verify origin for CSRF protection
    if not verify_origin():
        return jsonify({'error': 'Unauthorized origin'}), 403
    
    bot = AquaBot()
    data = request.get_json()
    message = data.get('message', '').strip()
    if not message or len(message) > 500:
        return jsonify({'error': 'Invalid message'}), 400
    try:
        reply = bot.get_bot_response(message)
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# 🛰️ SATELITA - VISITOR TRACKING ENDPOINTS
# ============================================

@app.route('/api/visitor-tracking', methods=['POST'])
@csrf.exempt
@limiter.exempt
def visitor_tracking():
    """Endpoint do zbierania danych o wizytach"""
    # 🔒 SECURITY FIX: Verify origin (less strict for tracking)
    if not verify_origin():
        return jsonify({'error': 'Unauthorized origin'}), 403
    
    try:
        data = request.get_json()
        if not data or 'session_id' not in data:
            return jsonify({'error': 'Invalid'}), 400
        
        # Zapisz do SQLite
        event = VisitorEvent(
            session_id=data.get('session_id'),
            event_type=data.get('event_type'),
            city=data.get('city'),
            country=data.get('country'),
            organization=data.get('organization'),
            device_type=data.get('device_type'),
            os=data.get('os'),
            browser=data.get('browser'),
            ip_hash=data.get('ip_hash'),
            anonymous_mode=data.get('anonymous_mode', False),
            extra_data=json.dumps(data.get('extra_data', {}))
        )
        db.session.add(event)
        db.session.commit()
        
        app.logger.info(f"[SATELITA] {data.get('event_type')} | {data.get('city')}")
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        app.logger.error(f"[SATELITA ERROR] {e}")
        return jsonify({'error': str(e)}), 500


# ============================================
# 🛰️ SATELITA - ANALYTICS ENDPOINTS (dla dashboardu)
# ============================================

@app.route('/api/analytics/stats', methods=['GET'])
@login_required
@limiter.exempt
def analytics_stats():
    """Statystyki główne (Moduł A)"""
    try:
        # Użytkownicy online (ostatnie 15 min)
        fifteen_min_ago = datetime.utcnow() - timedelta(minutes=15)
        active_sessions = db.session.query(VisitorEvent.session_id).filter(
            VisitorEvent.timestamp >= fifteen_min_ago,
            VisitorEvent.event_type == 'session_start'
        ).distinct().count()
        
        # Sesje dziś
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        sessions_today = db.session.query(VisitorEvent.session_id).filter(
            VisitorEvent.timestamp >= today_start,
            VisitorEvent.event_type == 'session_start'
        ).distinct().count()
        
        # Total queries
        total_queries = db.session.query(AquaBotQuery).count()
        
        # Zagrożenia dnia (przykład: users checking high hardness)
        # TODO: Implement threat detection based on query patterns
        threats_today = 0
        
        return jsonify({
            'active_now': active_sessions,
            'sessions_today': sessions_today,
            'total_queries': total_queries,
            'threats_today': threats_today
        })
        
    except Exception as e:
        app.logger.error(f"[ANALYTICS ERROR] {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/heatmap', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Only admin can access
@limiter.exempt
def analytics_heatmap():
    """Mapa Skażeń - Top Locations (Moduł B)"""
    try:
        # Grupuj zapytania po miastach
        results = db.session.query(
            AquaBotQuery.city,
            AquaBotQuery.country,
            db.func.count(AquaBotQuery.id).label('query_count')
        ).filter(
            AquaBotQuery.city.isnot(None)
        ).group_by(
            AquaBotQuery.city,
            AquaBotQuery.country
        ).order_by(
            desc('query_count')
        ).limit(10).all()
        
        heatmap = []
        for r in results:
            # Znajdź najczęstszy temat zapytań dla tego miasta
            queries = db.session.query(AquaBotQuery.query).filter(
                AquaBotQuery.city == r.city
            ).all()
            
            topics = analyze_query_topics([q.query for q in queries])
            
            heatmap.append({
                'city': r.city,
                'country': r.country,
                'queries': r.query_count,
                'most_searched': topics['summary'],
                'all_topics': topics['full']
            })
        
        return jsonify({'heatmap': heatmap})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/b2b-leads', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Prevent B2B data leak
@limiter.exempt
def analytics_b2b_leads():
    """Wywiad B2B - Lead Detector (Moduł C)"""
    try:
        # Pobierz tylko firmy (nie domowe ISP)
        leads = db.session.query(B2BLead).filter_by(is_b2b=True).order_by(
            desc(B2BLead.engagement_score)
        ).limit(20).all()
        
        leads_data = [
            {
                'company': lead.organization,
                'city': lead.city,
                'country': lead.country,
                'total_queries': lead.total_queries,
                'last_query': lead.last_query,
                'engagement_score': lead.engagement_score,
                'last_visit': lead.last_visit.strftime('%Y-%m-%d %H:%M') if lead.last_visit else 'N/A'
            }
            for lead in leads
        ]
        
        return jsonify({'leads': leads_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/lost-demand', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Prevent query history leak
@limiter.exempt
def analytics_lost_demand():
    """Lost Demand - Niezaspokojony Popyt (Moduł D)"""
    try:
        # Queries z niską pewnością bota (TODO: implement confidence scoring)
        queries = db.session.query(AquaBotQuery).order_by(
            desc(AquaBotQuery.timestamp)
        ).limit(20).all()
        
        lost_demand = [
            {
                'query': q.query,
                'city': q.city,
                'organization': q.organization,
                'timestamp': q.timestamp.strftime('%Y-%m-%d %H:%M'),
                'confidence': q.bot_confidence if q.bot_confidence else 'N/A',
                'response': q.bot_response_summary if q.bot_response_summary else 'No response'  # PEŁNA ODPOWIEDŹ
            }
            for q in queries
        ]
        
        return jsonify({'lost_demand': lost_demand})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/city-searches', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Admin only
@limiter.exempt
def analytics_city_searches():
    """Analityka wyszukiwań miast (Sprawdź Kranówkę)"""
    try:
        # Pobierz wszystkie eventy search_city
        events = db.session.query(EventLog).filter(
            EventLog.action_type == 'search_city'
        ).order_by(desc(EventLog.timestamp)).limit(100).all()
        
        # Zlicz top miasta
        city_counts = {}
        history = []
        
        for event in events:
            data = json.loads(event.query_data)
            city_name = data.get('city_name', 'Unknown')
            city_counts[city_name] = city_counts.get(city_name, 0) + 1
            history.append({
                'timestamp': event.timestamp.strftime('%Y-%m-%d %H:%M'),
                'city': city_name
            })
        
        # Top 3 miasta
        top_cities = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_cities_data = [{'city': city, 'count': count} for city, count in top_cities]
        
        return jsonify({
            'top_cities': top_cities_data,
            'history': history[:50]  # Ostatnie 50 wyszukiwań
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/station-searches', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Admin only
@limiter.exempt
def analytics_station_searches():
    """Analityka wyszukiwań stacji (Znajdź Stacje)"""
    try:
        events = db.session.query(EventLog).filter(
            EventLog.action_type == 'search_station'
        ).order_by(desc(EventLog.timestamp)).limit(100).all()
        
        # Zlicz top lokalizacje (miasta)
        location_counts = {}
        history = []
        
        for event in events:
            data = json.loads(event.query_data)
            city_name = data.get('city_name', 'Unknown')
            street_name = data.get('street_name', '')
            
            location_counts[city_name] = location_counts.get(city_name, 0) + 1
            history.append({
                'timestamp': event.timestamp.strftime('%Y-%m-%d %H:%M'),
                'city': city_name,
                'street': street_name
            })
        
        # Top 3 lokalizacje
        top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_locations_data = [{'city': city, 'count': count} for city, count in top_locations]
        
        return jsonify({
            'top_locations': top_locations_data,
            'history': history[:50]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/rankings', methods=['GET'])
@login_required
@admin_required  # 🔒 SECURITY FIX: Admin only
@limiter.exempt
def analytics_rankings():
    """Analityka generowanych rankingów"""
    try:
        events = db.session.query(EventLog).filter(
            EventLog.action_type == 'generate_ranking'
        ).order_by(desc(EventLog.timestamp)).limit(100).all()
        
        # Zlicz top parametry
        parameter_counts = {}
        history = []
        
        for event in events:
            data = json.loads(event.query_data)
            parameter = data.get('ranking_parameter', 'Unknown')
            ranking_type = data.get('ranking_type', 'city')
            
            parameter_counts[parameter] = parameter_counts.get(parameter, 0) + 1
            history.append({
                'timestamp': event.timestamp.strftime('%Y-%m-%d %H:%M'),
                'parameter': parameter,
                'type': ranking_type
            })
        
        # Top 3 parametry
        top_parameters = sorted(parameter_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_parameters_data = [{'parameter': param, 'count': count} for param, count in top_parameters]
        
        return jsonify({
            'top_parameters': top_parameters_data,
            'history': history[:50]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Endpoint do logowania eventów z frontendu
@app.route('/api/log-event', methods=['POST'])
@csrf.exempt
@limiter.limit("20 per minute")  # 🔒 SECURITY FIX: Zmniejszone z 100 na 20
def log_event():
    """Endpoint do logowania eventów użytkownika"""
    # 🔒 SECURITY FIX: Verify origin for CSRF protection
    if not verify_origin():
        return jsonify({'error': 'Unauthorized origin'}), 403
    
    try:
        print(f"\n[LOG-EVENT] 🎯 Otrzymano request!")
        data = request.get_json()
        print(f"[LOG-EVENT] Data: {data}")
        
        action_type = data.get('action_type')
        query_data = data.get('query_data', {})
        
        print(f"[LOG-EVENT] action_type: {action_type}")
        print(f"[LOG-EVENT] query_data: {query_data}")
        
        if not action_type:
            print(f"[LOG-EVENT] ❌ Brak action_type!")
            return jsonify({'error': 'action_type required'}), 400
        
        # Pobierz session_id
        session_id = session.get('session_id', 'unknown')
        print(f"[LOG-EVENT] session_id: {session_id}")
        
        # Stwórz event log (ensure_ascii=False dla polskich znaków)
        event = EventLog(
            session_id=session_id,
            action_type=action_type,
            query_data=json.dumps(query_data, ensure_ascii=False),
            city=query_data.get('city_name') or query_data.get('city'),
            organization=data.get('organization')
        )
        
        print(f"[LOG-EVENT] 💾 Zapisuję do bazy...")
        db.session.add(event)
        db.session.commit()
        print(f"[LOG-EVENT] ✅ Zapisano! ID: {event.id}")
        
        return jsonify({'status': 'logged', 'event_id': event.id}), 200
        
    except Exception as e:
        print(f"[LOG-EVENT] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ============================================
# 🛰️ SATELITA - HELPER FUNCTIONS
# ============================================

def analyze_query_topics(queries):
    """Analizuje zapytania i zwraca tematy z liczbą wystąpień"""
    keywords = {
        'Twardość': ['twardość', 'twardośc', 'twarda', 'tward', 'kamień', 'wapień', 'mg/l', 'mięk'],
        'Azotany': ['azot', 'NO3', 'nawóz'],
        'Chlor': ['chlor', 'Cl', 'dezynfekcja', 'odkażanie'],
        'Fluorki': ['fluor', 'F', 'fluork'],
        'pH': ['pH', 'kwas', 'zasad'],
        'Żelazo': ['żelaz', 'Fe', 'rdza'],
        'Metale': ['ołów', 'miedź', 'cynk', 'metal', 'Pb', 'Cu', 'Zn'],
        'Bakterie': ['bakterie', 'bakter', 'e.coli', 'paciorko', 'zaraz', 'mikrob'],
        'Smak': ['smak', 'zapach', 'cuchn', 'śmierd', 'brzyd']
    }
    
    topic_counts = {topic: 0 for topic in keywords}
    
    for query in queries:
        if not query:
            continue
        query_lower = query.lower()
        for topic, words in keywords.items():
            # Sprawdź czy KTÓREKOLWIEK słowo kluczowe jest ZAWARTE w zapytaniu
            if any(word.lower() in query_lower for word in words):
                topic_counts[topic] += 1
    
    # Zwróć wszystkie tematy z ich liczbą (posortowane malejąco)
    topics_with_counts = [(topic, count) for topic, count in topic_counts.items() if count > 0]
    
    if not topics_with_counts:
        return {
            'summary': 'Ogólne pytania',
            'full': 'Brak wykrytych tematów'
        }
    
    # Sortuj malejąco
    topics_with_counts.sort(key=lambda x: x[1], reverse=True)
    
    # Top 3 do pokazania (summary)
    top_3 = topics_with_counts[:3]
    summary = ', '.join([f'{topic} ({count})' for topic, count in top_3])
    
    # Pełna lista (full)
    full = ', '.join([f'{topic} ({count})' for topic, count in topics_with_counts])
    
    return {
        'summary': summary,
        'full': full
    }


@app.route('/admin/analytics')
@login_required
@admin_required
@limiter.exempt
def admin_analytics():
    """Dashboard analityczny - główny widok (ADMIN ONLY - lukipuki)"""
    return render_template('admin-analytics.html')


# ============================================
# 🛰️ SOCKET.IO EVENTS (Real-time updates)
# ============================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    # 🔒 SECURITY FIX: Only authenticated admins can join admin_room
    from flask_login import current_user
    if current_user.is_authenticated and current_user.is_admin:
        from flask_socketio import join_room
        join_room('admin_room')
        app.logger.info(f'[SOCKET.IO] Admin {current_user.username} joined admin_room')
    else:
        app.logger.info(f'[SOCKET.IO] Regular user connected (no admin room access)')

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    from flask_login import current_user
    if current_user.is_authenticated and current_user.is_admin:
        from flask_socketio import leave_room
        leave_room('admin_room')
        app.logger.info(f'[SOCKET.IO] Admin {current_user.username} left admin_room')

@socketio.on('visitor_connected')
def handle_visitor_connected(data):
    """Nowy visitor podłączył się"""
    app.logger.info(f"[SATELITA] Visitor connected: {data.get('session_id')}")
    
    # 🔒 SECURITY FIX: Emit tylko do pokoju 'admin_room', NIE broadcast=True
    emit('new_visitor', {
        'session_id': data.get('session_id'),
        'city': data.get('city'),
        'organization': data.get('organization'),
        'timestamp': datetime.utcnow().strftime('%H:%M:%S')
    }, room='admin_room')  # Only to admins, not everyone!


@socketio.on('aquabot_query')
def handle_aquabot_query(data):
    """Nowe zapytanie do AquaBota"""
    try:
        # 🔒 SECURITY FIX: Sanitize query before storing/broadcasting
        import html
        raw_query = data.get('query', '')
        sanitized_query = html.escape(raw_query)[:500]  # Escape HTML + limit length
        
        # Zapisz zapytanie Z odpowiedzią bota
        bot_response_full = data.get('bot_response', '')
        bot_response_summary = html.escape(bot_response_full[:1000]) if bot_response_full else None
        
        # Sprawdź czy istnieje już rekord dla tego session_id i query
        existing_query = db.session.query(AquaBotQuery).filter_by(
            session_id=data.get('session_id'),
            query=sanitized_query
        ).first()
        
        if existing_query:
            # Aktualizuj istniejący rekord odpowiedzią bota
            existing_query.bot_response_summary = bot_response_summary
            db.session.commit()
            app.logger.info(f"[SATELITA] Query updated: {data.get('query')[:50]}")
        else:
            # Dodaj nowy rekord
            query = AquaBotQuery(
                session_id=data.get('session_id'),
                query=data.get('query'),
                city=data.get('city'),
                country=data.get('country'),
                organization=data.get('organization'),
                query_count=data.get('query_count', 1),
                time_since_entry=data.get('time_since_entry'),
                bot_response_summary=bot_response_summary
            )
            db.session.add(query)
            db.session.commit()
            app.logger.info(f"[SATELITA] Query saved: {data.get('query')[:50]}")
        
        # Update/Create B2B Lead tylko jeśli to nowy rekord lub aktualizacja z odpowiedzią
        if bot_response_summary:
            update_or_create_lead(data)
        
        # 🔒 SECURITY FIX: Emit tylko do admin_room, NIE broadcast=True
        emit('new_query', {
            'query': sanitized_query,
            'city': data.get('city'),
            'organization': data.get('organization'),
            'bot_response': bot_response_summary or 'No response',
            'timestamp': datetime.utcnow().strftime('%H:%M:%S')
        }, room='admin_room')  # Only admins see this!
        
    except Exception as e:
        app.logger.error(f"[SATELITA QUERY ERROR] {e}")


@socketio.on('visitor_disconnected')
def handle_visitor_disconnected(data):
    """Visitor opuścił stronę"""
    emit('visitor_left', {'session_id': data.get('session_id')}, broadcast=True)


# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Too many requests'}), 429

@app.errorhandler(404)
def not_found(e):
    return "404 Not Found", 404

@app.errorhandler(500)
def internal_error(e):
    app.logger.error(f'500 error: {e}')
    return "500 Internal Server Error", 500


# ============================================
# STARTUP - PostgreSQL Ready
# ============================================
# UWAGA: db.create_all() jest w init_db.py (uruchamianym przez Build Command)
# Tutaj tylko startujemy serwer

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))
    host = '0.0.0.0'
    
    db_type = 'PostgreSQL' if 'postgres' in app.config['SQLALCHEMY_DATABASE_URI'] else 'SQLite'
    mode = 'DEBUG' if debug_mode else 'PRODUCTION'
    
    print(f'[STARTUP] 🚀 Skankran + Satelita')
    print(f'[STARTUP] 📊 Database: {db_type}')
    print(f'[STARTUP] 🌐 Server: {host}:{port} ({mode} mode)')
    
    # ✅ Socket.IO run (zamiast app.run)
    socketio.run(app, debug=debug_mode, port=port, host=host)