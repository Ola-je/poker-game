import psycopg2
import os
import json
from psycopg2.extras import Json
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Environment variables for database connection
DB_NAME = os.getenv("POSTGRES_DB", "poker")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")

def get_db_connection():
    """Establishes and returns a database connection."""
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn

def create_hands_table_if_not_exists():
    """Creates the 'hands' table in the database if it doesn't already exist."""
    conn = None
    try:
        # Connect to the default database to create the poker database
        default_conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        default_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = default_conn.cursor()

        # Check if the poker database exists, if not, create it
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
        
        cursor.close()
        default_conn.close()

        # Connect to the newly created (or existing) poker database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create the hands table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hands (
                id UUID PRIMARY KEY,
                starting_stacks JSONB NOT NULL,
                player_names JSONB NOT NULL,
                player_cards JSONB NOT NULL,
                action_sequence JSONB NOT NULL,
                board_cards JSONB NOT NULL,
                payoffs JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
    except Exception as e:
        print(f"Error creating hands table: {e}")
    finally:
        if conn:
            conn.close()
