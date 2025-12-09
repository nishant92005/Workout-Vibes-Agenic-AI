#!/usr/bin/env python3
"""
Database migration script to update User table schema
Removes Google OAuth fields and adds created_at column
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    db_path = 'workoutvibes.db'
    
    if not os.path.exists(db_path):
        print("Database doesn't exist yet. Will be created when app runs.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if we need to migrate
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'created_at' in columns:
            print("Database already migrated.")
            return
        
        print("Starting database migration...")
        
        # Create new user table with updated schema
        cursor.execute('''
            CREATE TABLE user_new (
                id INTEGER PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(200) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Copy data from old table (only users with passwords)
        cursor.execute('''
            INSERT INTO user_new (id, name, email, password, created_at)
            SELECT id, name, email, password, COALESCE(datetime('now'), datetime('now'))
            FROM user 
            WHERE password IS NOT NULL AND password != ''
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE user')
        cursor.execute('ALTER TABLE user_new RENAME TO user')
        
        conn.commit()
        print("Database migration completed successfully!")
        print("Removed Google OAuth users and updated schema.")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_database()
