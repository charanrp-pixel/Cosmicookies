from app import app
import sqlite3

app.config['TESTING'] = True
client = app.test_client()

# create user
with app.app_context():
    with sqlite3.connect('users.db') as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, verified INTEGER DEFAULT 0)')
        from werkzeug.security import generate_password_hash
        try:
            conn.execute('INSERT INTO users (email, password, verified) VALUES (?, ?, ?)', ('test@test.com', generate_password_hash('password'), 1))
            conn.commit()
        except sqlite3.IntegrityError:
            pass

response = client.post('/login', data={'email': 'test@test.com', 'password': 'password'})
print("Status:", response.status_code)
print("Headers:", response.headers)
print("Data:", response.data.decode('utf-8')[:500])
