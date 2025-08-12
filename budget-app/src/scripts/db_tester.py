import sqlite3

DB_PATH = '../../data/transactions.db'  # Adjust path if needed

def run_query(sql, params=None):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    try:
        if params:
            cur.execute(sql, params)
        else:
            cur.execute(sql)
        if sql.strip().lower().startswith("select"):
            rows = cur.fetchall()
            for row in rows:
                print(row)
        else:
            conn.commit()
            print("Query executed successfully.")
    except Exception as e:
        print("Error:", e)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # Example usage:
    # Insert a test transaction
    run_query("""SELECT SUM(CASE WHEN Roommate = 'Sarah' AND Shared = 1 THEN 1 ELSE 0 END) AS Sarah_Shared_Expenses
FROM transactions
WHERE strftime('%Y', Timestamp) = 2024 AND strftime('%m', Timestamp) = 6;
    """)