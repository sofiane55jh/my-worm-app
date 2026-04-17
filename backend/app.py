from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATA_FILE = 'prayer_data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'prayers': {}, 'city': 'الجزائر', 'douaas': []}

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(load_data())

@app.route('/api/data', methods=['POST'])
def save_data_api():
    data = request.json
    save_data(data)
    return jsonify({'status': 'success'})

@app.route('/api/record-prayer', methods=['POST'])
def record_prayer():
    prayer_name = request.json.get('prayer')
    data = load_data()
    if 'prayers' not in data:
        data['prayers'] = {}
    data['prayers'][prayer_name] = data['prayers'].get(prayer_name, 0) + 1
    save_data(data)
    return jsonify({'status': 'success', 'count': data['prayers'][prayer_name]})

@app.route('/api/douaa', methods=['POST'])
def add_douaa():
    douaa_text = request.json.get('douaa')
    data = load_data()
    if 'douaas' not in data:
        data['douaas'] = []
    data['douaas'].append({'text': douaa_text, 'date': str(datetime.now())})
    save_data(data)
    return jsonify({'status': 'success'})

@app.route('/api/douaas', methods=['GET'])
def get_douaas():
    data = load_data()
    return jsonify(data.get('douaas', []))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
