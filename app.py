import os
import sys
import json
import socket
import webbrowser
import threading
import time
from flask import Flask, render_template, jsonify, request, send_from_directory, send_file

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
LETTER_DIR = os.path.join(BASE_DIR, 'LetterandMusic')
PICTURES_DIR = os.path.join(BASE_DIR, 'PictureOFMemories')
TIMINGS_FILE = os.path.join(DATA_DIR, 'timings.json')
LETTER_FILE = os.path.join(LETTER_DIR, 'DearLovelyShane.txt')
AUDIO_FILENAME = 'Anson Seabra - Welcome to Wonderland (Official Lyric Video).mp3'

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.jinja_env.auto_reload = True

def find_available_port(start_port=5000, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def load_data():
    """Loads stanzas, audio info, and photo mappings."""
    if os.path.exists(TIMINGS_FILE):
        try:
            with open(TIMINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading {TIMINGS_FILE}: {e}")
    
    # Fallback to reading raw files if timings.json doesn't exist
    paragraphs = []
    if os.path.exists(LETTER_FILE):
        with open(LETTER_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

    all_pics = []
    if os.path.exists(PICTURES_DIR):
        all_pics = sorted(os.listdir(PICTURES_DIR))

    stanzas = []
    for idx, p in enumerate(paragraphs):
        lines = [line.strip() for line in p.split('\n') if line.strip()]
        stanzas.append({
            'id': idx + 1,
            'title': f'Chapter {idx+1}',
            'startTime': round(idx * 11.1, 1),
            'endTime': round((idx + 1) * 11.1, 1),
            'lines': lines,
            'text': p,
            'photos': [all_pics[idx % len(all_pics)]] if all_pics else []
        })

    return {
        'song': {
            'title': 'Welcome to Wonderland',
            'artist': 'Anson Seabra',
            'duration': 201.10,
            'file': AUDIO_FILENAME
        },
        'recipient': 'Lovely Shane',
        'occasion': '22nd Birthday',
        'stanzas': stanzas,
        'all_photos': all_pics
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    data = load_data()
    return jsonify(data)

@app.route('/api/save-timings', methods=['POST'])
def save_timings():
    try:
        updated_data = request.get_json(force=True)
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(TIMINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, indent=2, ensure_ascii=False)
        return jsonify({'status': 'success', 'message': 'Timings saved successfully'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/add-stanza', methods=['POST'])
def add_stanza():
    try:
        new_stanza = request.get_json(force=True)
        data = load_data()
        data['stanzas'].append(new_stanza)
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(TIMINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return jsonify({'status': 'success', 'stanzas': data['stanzas']})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/media/audio')
def stream_audio():
    audio_path = os.path.join(LETTER_DIR, AUDIO_FILENAME)
    if not os.path.exists(audio_path):
        return "Audio file not found", 404
    return send_file(audio_path, mimetype='audio/mpeg', conditional=True)

@app.route('/media/photo/<path:filename>')
def serve_photo(filename):
    return send_from_directory(PICTURES_DIR, filename, max_age=3600)

@app.route('/api/photos')
def list_photos():
    if not os.path.exists(PICTURES_DIR):
        return jsonify([])
    photos = sorted(os.listdir(PICTURES_DIR))
    return jsonify(photos)

def open_browser(port):
    time.sleep(1.2)
    url = f"http://127.0.0.1:{port}"
    print(f"\n✨ Opening website in browser: {url} ✨\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    # Read PORT from environment (for Render / cloud deployments) or find available port locally
    env_port = os.environ.get('PORT')
    if env_port:
        port = int(env_port)
        host = '0.0.0.0'
    else:
        port = find_available_port(5000)
        host = '127.0.0.1'

    print("=" * 60)
    print(" LOVELY SHANE'S 22ND BIRTHDAY PHOTOBOOK & LYRIC MONTAGE")
    print("=" * 60)
    print(f" Starting server on: http://{host}:{port}")
    print(" Press Ctrl+C to stop the server.")
    print("=" * 60)

    # Launch browser automatically only in local development
    if not os.environ.get("RENDER") and not os.environ.get("PORT") and not os.environ.get("WERKZEUG_RUN_MAIN"):
        threading.Thread(target=open_browser, args=(port,), daemon=True).start()

    app.run(host=host, port=port, debug=False)
