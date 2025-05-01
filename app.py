from flask import Flask, render_template, send_from_directory, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Inicjalizacja bazy danych
def init_db():
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        post_count INTEGER DEFAULT 0,
        is_premium INTEGER DEFAULT 0
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_premium_only INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/manifest.json')
def manifest():
    return send_from_directory('.', 'manifest.json')

@app.route('/static/icon.png')
def serve_icon():
    return send_from_directory('static', 'icon.png')

@app.route('/static/js/<path:path>')
def serve_js(path):
    return send_from_directory('static/js', path)

@app.route('/posts', methods=['GET'])
def get_posts():
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('''SELECT p.id, p.content, p.timestamp, u.username, u.post_count, u.is_premium, p.is_premium_only
                 FROM posts p LEFT JOIN users u ON p.user_id = u.id
                 ORDER BY u.is_premium DESC, p.timestamp DESC''')
    posts = c.fetchall()
    posts_data = []
    for post in posts:
        post_id, content, timestamp, username, post_count, is_premium, is_premium_only = post
        if is_premium:
            if post_count >= 200:
                rank = "Król H2O"
            elif post_count >= 50:
                rank = "Wodny Ambasador"
            else:
                rank = "Wodny Nowicjusz"
        else:
            if post_count >= 100:
                rank = "Mistrz H2O"
            else:
                rank = "Wodny Nowicjusz"
        c.execute('''SELECT c.id, c.content, c.timestamp, u.username, u.is_premium
                     FROM comments c JOIN users u ON c.user_id = u.id
                     WHERE c.post_id = ?''', (post_id,))
        comments = c.fetchall()
        comments_data = []
        for comment in comments:
            comment_id, comment_content, comment_timestamp, comment_username, comment_is_premium = comment
            comments_data.append({
                'id': comment_id,
                'content': comment_content,
                'timestamp': comment_timestamp,
                'username': comment_username,
                'is_premium': bool(comment_is_premium)
            })
        posts_data.append({
            'id': post_id,
            'content': content,
            'timestamp': timestamp,
            'username': username,
            'rank': rank,
            'is_premium': bool(is_premium),
            'is_premium_only': bool(is_premium_only),
            'comments': comments_data
        })
    conn.close()
    return jsonify(posts_data)

@app.route('/add_post', methods=['POST'])
def add_post():
    data = request.get_json()
    username = data.get('username')
    content = data.get('content')
    is_premium_only = data.get('is_premium_only', 0)
    if not username or not content:
        return jsonify({'error': 'Brak nazwy użytkownika lub treści'}), 400
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('SELECT id, post_count, is_premium FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    if not user:
        c.execute('INSERT INTO users (username, post_count) VALUES (?, 0)', (username,))
        c.execute('SELECT id FROM users WHERE username = ?', (username,))
        user_id = c.fetchone()[0]
    else:
        user_id, post_count, is_premium = user
        c.execute('UPDATE users SET post_count = post_count + 1 WHERE id = ?', (user_id,))
        if is_premium_only and not is_premium:
            conn.close()
            return jsonify({'error': 'Tylko użytkownicy premium mogą tworzyć tematy premium-only'}), 403
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute('INSERT INTO posts (user_id, content, timestamp, is_premium_only) VALUES (?, ?, ?, ?)', 
              (user_id, content, timestamp, is_premium_only))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Post dodany'}), 200

@app.route('/add_comment', methods=['POST'])
def add_comment():
    data = request.get_json()
    username = data.get('username')
    post_id = data.get('post_id')
    content = data.get('content')
    if not username or not post_id or not content:
        return jsonify({'error': 'Brak wymaganych danych'}), 400
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('SELECT id, is_premium FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    if not user:
        c.execute('INSERT INTO users (username, post_count) VALUES (?, 0)', (username,))
        c.execute('SELECT id FROM users WHERE username = ?', (username,))
        user_id = c.fetchone()[0]
    else:
        user_id, is_premium = user
        c.execute('SELECT is_premium_only FROM posts WHERE id = ?', (post_id,))
        post = c.fetchone()
        if post and post[0] and not is_premium:
            conn.close()
            return jsonify({'error': 'Tylko użytkownicy premium mogą komentować w tematach premium-only'}), 403
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute('INSERT INTO comments (post_id, user_id, content, timestamp) VALUES (?, ?, ?, ?)',
              (post_id, user_id, content, timestamp))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Komentarz dodany'}), 200

@app.route('/user_stats/<username>', methods=['GET'])
def user_stats(username):
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('SELECT post_count, is_premium FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'Użytkownik nie istnieje'}), 404
    post_count, is_premium = user
    if is_premium:
        if post_count >= 200:
            rank = "Król H2O"
        elif post_count >= 50:
            rank = "Wodny Ambasador"
        else:
            rank = "Wodny Nowicjusz"
    else:
        if post_count >= 100:
            rank = "Mistrz H2O"
        else:
            rank = "Wodny Nowicjusz"
    conn.close()
    return jsonify({
        'username': username,
        'post_count': post_count,
        'rank': rank,
        'is_premium': bool(is_premium)
    })

@app.route('/toggle_premium', methods=['POST'])
def toggle_premium():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'error': 'Brak nazwy użytkownika'}), 400
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('SELECT id, is_premium FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'Użytkownik nie istnieje'}), 404
    user_id, is_premium = user
    new_status = 0 if is_premium else 1
    c.execute('UPDATE users SET is_premium = ? WHERE id = ?', (new_status, user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': f'Status premium {"włączony" if new_status else "wyłączony"}'}), 200

@app.route('/edit_post', methods=['POST'])
def edit_post():
    data = request.get_json()
    post_id = data.get('post_id')
    content = data.get('content')
    username = data.get('username')
    if not post_id or not content or not username:
        return jsonify({'error': 'Brak wymaganych danych'}), 400
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('''SELECT p.user_id, p.timestamp, u.is_premium
                 FROM posts p JOIN users u ON p.user_id = u.id
                 WHERE p.id = ? AND u.username = ?''', (post_id, username))
    post = c.fetchone()
    if not post:
        conn.close()
        return jsonify({'error': 'Post nie istnieje lub nie należy do Ciebie'}), 404
    user_id, timestamp, is_premium = post
    if not is_premium:
        conn.close()
        return jsonify({'error': 'Tylko użytkownicy premium mogą edytować posty'}), 403
    try:
        post_date = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
        now = datetime.now()
        diff_hours = (now - post_date).total_seconds() / 3600
        if diff_hours < 0 or diff_hours >= 24:
            conn.close()
            return jsonify({'error': 'Minął czas na edycję (24h)'}), 403
    except ValueError as e:
        conn.close()
        return jsonify({'error': 'Błąd formatu daty'}), 400
    c.execute('UPDATE posts SET content = ? WHERE id = ?', (content, post_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Post zaktualizowany'}), 200

@app.route('/edit_comment', methods=['POST'])
def edit_comment():
    data = request.get_json()
    comment_id = data.get('comment_id')
    content = data.get('content')
    username = data.get('username')
    if not comment_id or not content or not username:
        return jsonify({'error': 'Brak wymaganych danych'}), 400
    conn = sqlite3.connect('community.db')
    c = conn.cursor()
    c.execute('''SELECT c.user_id, c.timestamp, u.is_premium
                 FROM comments c JOIN users u ON c.user_id = u.id
                 WHERE c.id = ? AND u.username = ?''', (comment_id, username))
    comment = c.fetchone()
    if not comment:
        conn.close()
        return jsonify({'error': 'Komentarz nie istnieje lub nie należy do Ciebie'}), 404
    user_id, timestamp, is_premium = comment
    if not is_premium:
        conn.close()
        return jsonify({'error': 'Tylko użytkownicy premium mogą edytować komentarze'}), 403
    try:
        comment_date = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
        now = datetime.now()
        diff_hours = (now - comment_date).total_seconds() / 3600
        if diff_hours < 0 or diff_hours >= 24:
            conn.close()
            return jsonify({'error': 'Minął czas na edycję (24h)'}), 403
    except ValueError as e:
        conn.close()
        return jsonify({'error': 'Błąd formatu daty'}), 400
    c.execute('UPDATE comments SET content = ? WHERE id = ?', (content, comment_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Komentarz zaktualizowany'}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)