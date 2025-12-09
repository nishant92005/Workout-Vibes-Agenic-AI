#!/usr/bin/env python3
"""
Quick Setup Script for Google OAuth Integration
Run this script to easily configure your Google OAuth credentials
"""

import os
import sys

def setup_google_oauth():
    print("🚀 Google OAuth Quick Setup")
    print("=" * 50)
    
    # Check if .env exists
    env_path = '.env'
    if not os.path.exists(env_path):
        print("❌ .env file not found. Creating one...")
        with open(env_path, 'w') as f:
            f.write("# Google OAuth Configuration\n")
            f.write("GOOGLE_CLIENT_ID=your-google-client-id\n")
            f.write("GOOGLE_CLIENT_SECRET=your-google-client-secret\n")
            f.write("SECRET_KEY=your-secret-key-here\n")
    
    print("\n📋 To complete setup:")
    print("1. Go to: https://console.cloud.google.com/")
    print("2. Create a new project or select existing one")
    print("3. Enable Google+ API")
    print("4. Create OAuth 2.0 Client ID credentials")
    print("5. Add redirect URI: http://localhost:5000/auth/google/callback")
    print("6. Copy your Client ID and Client Secret")
    
    print("\n🔧 Configure your credentials:")
    client_id = input("Enter your Google Client ID: ").strip()
    client_secret = input("Enter your Google Client Secret: ").strip()
    
    if client_id and client_secret:
        # Read current .env content
        with open(env_path, 'r') as f:
            content = f.read()
        
        # Replace placeholders
        content = content.replace('your-google-client-id', client_id)
        content = content.replace('your-google-client-secret', client_secret)
        content = content.replace('your-secret-key-here', 'flask-secret-key-' + os.urandom(16).hex())
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.write(content)
        
        print("\n✅ Configuration saved to .env file!")
        print("🎉 You can now run 'python app.py' and test Google login!")
    else:
        print("\n⚠️  Setup incomplete. Please run this script again with valid credentials.")
        print("📖 Check GOOGLE_OAUTH_SETUP.md for detailed instructions.")

if __name__ == "__main__":
    setup_google_oauth()
