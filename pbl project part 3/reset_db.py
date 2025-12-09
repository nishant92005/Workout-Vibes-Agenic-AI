import os
import sqlite3

# Remove existing database
if os.path.exists('workoutvibes.db'):
    os.remove('workoutvibes.db')
    print("Removed old database")

# Import and recreate with new schema
from app import app, db

with app.app_context():
    db.create_all()
    print("Created new database with updated schema")
