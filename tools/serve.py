#!/usr/bin/env python
"""Local preview server for Elixir Hour (kept in the repo, excluded from deploy).

Serves game/ over http so the Night Cap download and the /cap share page behave
exactly as they will on the deployed site — over http(s) the canvas is same-origin,
so toBlob() exports cleanly (opening the build from disk / file:// taints the canvas
and Download fails by browser rule).

ThreadingHTTPServer (not the single-threaded default) so a held audio/asset
connection can't block the next request; Cache-Control:no-store so a refresh always
gets the freshly-built files.

Usage (run from game/):   python tools/serve.py [port]      (default 8000)
Then open:                http://localhost:8000/
Share page directly:      http://localhost:8000/cap/#<fragment>
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))  # serve game/


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


def main():
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), partial(Handler, directory=ROOT))
    print("Elixir Hour preview: http://localhost:%d/  (Ctrl+C to stop)" % PORT)
    print("serving %s" % ROOT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
