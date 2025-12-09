import sqlite3
import os

def fix_database():
    db_path = 'workoutvibes.db'
    
    if not os.path.exists(db_path):
        print("Database doesn't exist yet.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current table structure
        cursor.execute("PRAGMA table_info(user)")
        columns = cursor.fetchall()
        print("Current user table columns:", [col[1] for col in columns])
        
        # Create new user table with correct schema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_new (
                id INTEGER PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password VARCHAR(200) NOT NULL
            )
        ''')
        
        # Copy only users with passwords (non-Google users)
        cursor.execute('''
            INSERT OR IGNORE INTO user_new (id, name, email, password)
            SELECT id, name, email, password
            FROM user 
            WHERE password IS NOT NULL AND password != ''
        ''')
        
        # Drop old table and rename new one
        cursor.execute('DROP TABLE IF EXISTS user')
        cursor.execute('ALTER TABLE user_new RENAME TO user')
        
        conn.commit()
        print("Database fixed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error fixing database: {e}")
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    fix_database()
