"""Entrypoint Vercel (Python Function): Vercel mencari `app` di index.py.

Aplikasi sebenarnya ada di app/main.py; berkas ini hanya mengekspornya ulang.
"""

from app.main import app

__all__ = ["app"]
