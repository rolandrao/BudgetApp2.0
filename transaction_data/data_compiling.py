import sqlite3
import csv
from datetime import datetime

def create_database(db_name):
    """Creates a SQLite database and a transactions table."""
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # Create the transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            category TEXT,
            amount REAL,
            roommate TEXT,
            shared BOOLEAN,
            notes TEXT
        )
    ''')

    conn.commit()
    conn.close()

def import_csv_to_database(csv_file, db_name):
    """Imports CSV data into the SQLite database."""
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)

        for row in reader:
            # Convert fields to appropriate types
            if ':' not in row['Timestamp']:
                timestamp = datetime.strptime(row['Timestamp'], '%m/%d/%Y')
            else:
                timestamp = datetime.strptime(row['Timestamp'], '%m/%d/%Y %H:%M:%S')
            expense_category = row['Category']
            amount = float(row['Amount'].replace('$', '').replace(',', ''))
            who_paid = row['Who paid?']
            shared = row['Shared?'].lower() in ['true', '1', 'yes']  # Convert to boolean
            notes = row['Notes']

            # Insert data into the transactions table
            cursor.execute('''
                INSERT INTO transactions (timestamp, category, amount, roommate, shared, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (timestamp, expense_category, amount, who_paid, shared, notes))

    conn.commit()
    conn.close()

# Example usage
if __name__ == "__main__":
    database_name = "transactions.db"
    csv_file_path = "transactions.csv"  # Replace with your CSV file path

    create_database(database_name)
    for filepath in ['Monthly Budgets 2022 - responses.csv', 'Monthly Budgets 2023 - responses.csv', 'Monthly Budgets 2024 - responses.csv']:
        import_csv_to_database(filepath, database_name)
        print(f"Data from {filepath} has been successfully imported into {database_name}.")

    print("Operation Completed.")

