"""Manually create event_logs table with SQL"""
import sqlite3

conn = sqlite3.connect('skankran.db')
cursor = conn.cursor()

# Utwórz tabelę ręcznie
create_table_sql = """
CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    query_data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    city VARCHAR(100),
    organization VARCHAR(200)
);
"""

cursor.execute(create_table_sql)

# Utwórz indeksy
cursor.execute("CREATE INDEX IF NOT EXISTS ix_event_logs_session_id ON event_logs (session_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_event_logs_action_type ON event_logs (action_type)")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_event_logs_timestamp ON event_logs (timestamp)")

conn.commit()
print("✅ Tabela event_logs została utworzona ręcznie!")

# Sprawdź strukturę
cursor.execute("PRAGMA table_info(event_logs)")
columns = cursor.fetchall()
print("\nKolumny:")
for col in columns:
    print(f"  - {col[1]} ({col[2]})")

conn.close()
