#!/bin/bash
set -e

echo "🚀 Starting Flutter web build for Vercel..."

# Navigate to Flutter project directory
cd aplicacionWZC/madres_digitales_flutter_new

# Install Flutter
echo "📦 Installing Flutter..."
if [ ! -d "flutter" ]; then
    git clone https://github.com/flutter/flutter.git -b stable --depth 1
else
    echo "Flutter already exists, skipping clone..."
fi

export PATH="$PATH:$(pwd)/flutter/bin"

# Verify Flutter installation
echo "🔍 Verifying Flutter installation..."
flutter --version

# Enable web support
echo "🌐 Enabling Flutter web support..."
flutter config --enable-web

# Get dependencies
echo "📋 Getting Flutter dependencies..."
flutter pub get

# Build web app
echo "🏗️ Building Flutter web app..."
ENVIRONMENT_VALUE=${ENVIRONMENT:-production}
API_URL_VALUE=${API_URL:-https://madres-digitales-backend.vercel.app}
BACKEND_URL_VALUE=${BACKEND_URL:-}

flutter build web --release \
  --base-href="/" \
  --web-renderer html \
  --dart-define=ENVIRONMENT=$ENVIRONMENT_VALUE \
  --dart-define=API_URL=$API_URL_VALUE \
  --dart-define=BACKEND_URL=$BACKEND_URL_VALUE

echo "✅ Build completed successfully!"

# Verify critical files exist
echo "🔍 Verifying build output..."
if [ -f "build/web/index.html" ]; then
  echo "✓ index.html found"
else
  echo "✗ index.html NOT found"
  exit 1
fi

if [ -f "build/web/manifest.json" ]; then
  echo "✓ manifest.json found"
else
  echo "⚠️ manifest.json NOT found (optional)"
fi

# List build directory contents
echo "📁 Build directory contents:"
ls -la build/web/

echo "🎯 Build verification complete!"