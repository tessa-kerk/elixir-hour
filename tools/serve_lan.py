"""Temp LAN server (0.0.0.0) so a phone on the same wifi can open the build.
Threaded + no-store, same as serve.py but reachable off-box. Usage: python tools/serve_lan.py [port]"""
import os, sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8650
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
class H(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate"); super().end_headers()
    def log_message(self, *a): pass
httpd = ThreadingHTTPServer(("0.0.0.0", PORT), partial(H, directory=ROOT))
print("LAN server on 0.0.0.0:%d serving %s" % (PORT, ROOT))
httpd.serve_forever()
