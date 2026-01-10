#!/bin/bash
set -e

echo "🚀 Starting Flutter web build..."

# Navigate to Flutter project
cd aplicacionWZC/madres_digitales_flutter_new

# Install Flutter
echo "📦 Installing Flutter..."
if [ ! -d "flutter" ]; then
    git clone https://github.com/flutter/flutter.git -b stable --depth 1
fi

export PATH="$PATH:$(pwd)/flutter/bin"

# Verify Flutter
echo "🔍 Verifying Flutter installation..."
flutter --version

# Enable web
echo "🌐 Enabling Flutter web..."
flutter config --enable-web

# Get dependencies
echo "📋 Getting dependencies..."
flutter pub get

# Build for web
echo "🏗️ Building Flutter web app..."
flutter build web --release \
  --base-href="/" \
  --web-renderer html \
  --dart-define=ENVIRONMENT=production \
  --dart-define=API_URL=https://madres-digitales-backend.vercel.app

echo "✅ Build completed successfully!"

# List build output
echo "📁 Build output:"
ls -la build/web/

echo "🎯 Frontend build complete!"