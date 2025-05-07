from flask import Flask, send_from_directory, request, Response
import requests
import os

from webhooks import get_data, set_data, pre_post_hook

USE_WEBHOOKS = False

app = Flask(__name__)
FILES_DIR = "."
PROXY_BASE_URL = "http://stargate.local:8080"

@app.route('/stargate/<path:subpath>', methods=['GET', 'POST'])
def proxy_to_api(subpath):
    # Proxy GET or POST to 192.168.1.95:8080
    target_url = f"{PROXY_BASE_URL}/{subpath}"
    
    try:
        if request.method == 'POST':
            if USE_WEBHOOKS:
                pre_post_hook(subpath, request.json)
            resp = requests.post(target_url, data=request.data, headers=request.headers)
        else:
            if USE_WEBHOOKS:
                return get_data(subpath)
            resp = requests.get(target_url, params=request.args, headers=request.headers)

        return Response(resp.content, status=resp.status_code, content_type=resp.headers.get('Content-Type'))
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}, 502

@app.route('/<path:filename>', methods=['GET'])
def serve_file(filename):
    try:
        if filename.endswith(".svg"):
            response = send_from_directory(FILES_DIR, filename, mimetype='image/svg+xml')
            response.headers['Cache-Control'] = 'public, max-age=604800'  # 7 days
            return response
        return send_from_directory(FILES_DIR, filename)
    except FileNotFoundError:
        return {"error": "File not found"}, 404

@app.route('/', methods=['GET'])
def index():
    return {"message": "Welcome. Use /get/<endpoint> to proxy or /<filename> to get a file."}

# Webhooks -------------------------------------------------------------------------------
@app.route('/sgc/<path:subpath>', methods=['POST'])
def webhook_data_update(subpath):
    try:
        return set_data(subpath, request.json)
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}, 502

if __name__ == '__main__':
    if not os.path.exists(FILES_DIR):
        os.makedirs(FILES_DIR)
    print("http://localhost:5000/retro/dial.html")
    app.run(host='0.0.0.0', port=5000)
