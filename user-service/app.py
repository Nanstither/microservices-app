from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'user-service'})

@app.route('/users')
def get_users():
    return jsonify({'users': [{'id': 1, 'name': 'Admin'}]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

