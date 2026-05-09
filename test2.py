import os
import sys
import traceback
from app import app
from flask import request

app.config['TESTING'] = True
client = app.test_client()

try:
    response = client.post('/login', data={'email': 'test@test.com', 'password': 'password'})
    print("Status:", response.status_code)
    if response.status_code == 500:
        print("Data:", response.data.decode('utf-8'))
except Exception as e:
    traceback.print_exc()

