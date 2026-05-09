import sqlite3
import smtplib
from email.message import EmailMessage
from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from werkzeug.middleware.proxy_fix import ProxyFix
import os

app = Flask(__name__)
# Tell Flask it is behind a proxy (like Vercel) to generate correct HTTPS URLs
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
app.secret_key = "cosmicookies_super_secret_key_123"

# Vercel has a read-only filesystem, so we must save the DB in /tmp/
if os.environ.get("VERCEL"):
    DB_NAME = "/tmp/users.db"
else:
    DB_NAME = "users.db"

# ==========================================
# EMAIL CONFIGURATION (UPDATE THESE)
# ==========================================
from dotenv import load_dotenv
load_dotenv()

# For Gmail, you must enable 2FA and use an "App Password"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465 # SSL Port
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD")

# Serializer for generating secure, expiring verification tokens
serializer = URLSafeTimedSerializer(app.secret_key)

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                verified INTEGER DEFAULT 0
            )
        ''')
        conn.commit()

init_db()

def send_verification_email(user_email, token):
    # Construct the full verification URL
    verify_url = url_for('verify_token', token=token, _external=True)
    
    msg = EmailMessage()
    msg['Subject'] = 'Verify your Cosmicookies Account'
    msg['From'] = SENDER_EMAIL
    msg['To'] = user_email
    msg.set_content(f'''Welcome to Cosmicookies! ✦
    
Please verify your email address to secure your account by clicking the link below:

{verify_url}

This link will expire in 1 hour.
If you did not create an account with us, please ignore this email.

Love,
The Cosmicookies Team
''')

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Don't serve app.py or database files directly
    if filename in ['app.py', 'users.db', 'requirements.txt', 'test_login.py', 'test2.py']:
        return "Access denied", 403
    return send_from_directory('.', filename)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            
            if user and check_password_hash(user[2], password):
                if user[3] == 0:
                    flash('Please verify your email address first. Check your inbox for the verification link.', 'danger')
                    return redirect(url_for('login'))
                
                session['user_id'] = user[0]
                session['email'] = user[1]
                flash('Logged in successfully!', 'success')
                return redirect(url_for('home'))
            else:
                flash('Invalid email or password.', 'danger')
                
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Passwords do not match!', 'danger')
            return redirect(url_for('register'))
            
        hashed_password = generate_password_hash(password)
        
        try:
            with sqlite3.connect(DB_NAME) as conn:
                cursor = conn.cursor()
                cursor.execute('INSERT INTO users (email, password, verified) VALUES (?, ?, ?)', 
                             (email, hashed_password, 0)) 
                conn.commit()
                
                # Generate secure token
                token = serializer.dumps(email, salt='email-confirm-salt')
                
                # Send verification email
                email_sent = send_verification_email(email, token)
                
                if email_sent:
                    flash('Registration successful! Please check your email to verify your account.', 'success')
                else:
                    flash(f'Registration successful, but we failed to send the email. (Check your SMTP settings). Verification link for testing: {url_for("verify_token", token=token, _external=True)}', 'warning')
                    
                return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Email already exists! Please login instead.', 'danger')
            return redirect(url_for('register'))
            
    return render_template('register.html')

@app.route('/verify/<token>')
def verify_token(token):
    try:
        # Token expires after 3600 seconds (1 hour)
        email = serializer.loads(token, salt='email-confirm-salt', max_age=3600)
    except SignatureExpired:
        flash('The verification link has expired. Please register again to get a new link.', 'danger')
        return redirect(url_for('login'))
    except BadTimeSignature:
        flash('Invalid verification link.', 'danger')
        return redirect(url_for('login'))
        
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET verified = 1 WHERE email = ?', (email,))
        conn.commit()
        
    flash('Account verified successfully! You can now securely login.', 'success')
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('home'))

@app.route('/api/user')
def get_user():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'email': session['email']})
    return jsonify({'logged_in': False})

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='127.0.0.1')
