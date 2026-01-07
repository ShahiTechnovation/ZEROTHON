import sys
import os
from pathlib import Path

# Add the parent directory to sys.path so we can import main and zerothan_cli
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.append(str(parent_dir))

from main import app

# Vercel expects 'app' to be exposed
# This works with Vercel's Python runtime for ASGI
