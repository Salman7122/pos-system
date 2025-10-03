from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder=".", static_url_path="")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    if os.path.exists(filename):
        return send_from_directory(".", filename)
    else:
        # مهم! يرجع index.html بدل 404
        return send_from_directory(".", "index.html")

if __name__ == "__main__":
    app.run(port=8081, debug=True)

