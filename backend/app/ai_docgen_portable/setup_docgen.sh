#!/bin/bash

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install FFmpeg based on OS
echo "[INFO] Detecting OS and installing FFmpeg..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if ! command -v brew &> /dev/null; then
        echo "[ERROR] Homebrew not found. Please install Homebrew first: https://brew.sh/"
        exit 1
    fi
    brew install ffmpeg
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get update
    sudo apt-get install -y ffmpeg
else
    echo "[WARNING] Unsupported OS. Please install FFmpeg manually."
fi

echo "[INFO] Setup complete. Please ensure you have a .env file with your GEMINI_API_KEY and MODEL_NAME in the project root." 