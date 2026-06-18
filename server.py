#!/usr/bin/env python3
"""Servidor estático simples para o portal de jogos."""
import functools
from http.server import HTTPServer, SimpleHTTPRequestHandler

ROOT = "/Users/davidonati/Documents/Claude/Projects/jogos"
PORT = 8080

Handler = functools.partial(SimpleHTTPRequestHandler, directory=ROOT)
print(f"Servindo {ROOT} em http://localhost:{PORT}")
HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
