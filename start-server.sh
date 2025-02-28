#!/bin/bash
python3 -m http.server 8000 &
echo "Server started at http://localhost:8000"
echo "To stop the server, run: pkill -f 'python3 -m http.server'"
