from flask import Flask, send_from_directory, request, Response
import requests
import os

app = Flask(__name__)
FILES_DIR = "."
PROXY_BASE_URL = "http://stargate.local:8080"

@app.route('/stargate/<path:subpath>', methods=['GET', 'POST'])
def proxy_to_api(subpath):
    # Proxy GET or POST to 192.168.1.95:8080
    target_url = f"{PROXY_BASE_URL}/{subpath}"
    
    try:
        if request.method == 'POST':
            resp = requests.post(target_url, data=request.data, headers=request.headers)
        else:
            resp = requests.get(target_url, params=request.args, headers=request.headers)

        return Response(resp.content, status=resp.status_code, content_type=resp.headers.get('Content-Type'))
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}, 502

@app.route('/<path:filename>', methods=['GET'])
def serve_file(filename):
    try:
        return send_from_directory(FILES_DIR, filename)
    except FileNotFoundError:
        return {"error": "File not found"}, 404

@app.route('/', methods=['GET'])
def index():
    return {"message": "Welcome. Use /get/<endpoint> to proxy or /<filename> to get a file."}

if __name__ == '__main__':
    if not os.path.exists(FILES_DIR):
        os.makedirs(FILES_DIR)
    app.run(host='0.0.0.0', port=5000)
