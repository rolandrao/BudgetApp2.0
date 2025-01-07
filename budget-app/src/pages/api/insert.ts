import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


async function openDatabase() {
  return open({
    filename: 'data/transactions.db',
    driver: sqlite3.Database,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const preprocessedData = req.body;

  if (!Array.isArray(preprocessedData)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    const db = await openDatabase();

    const insertPromises = preprocessedData.map(row => {
        console.log("INSERTING ROW", row);
      const { Timestamp, Amount, Category, Roommate, Shared, Notes } = row;
      return db.run(
        'INSERT INTO transactions (timestamp, amount, category, roommate, shared, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [Timestamp, Amount, Category, Roommate, 1, Notes]
      );
    });

    await Promise.all(insertPromises);

    res.status(200).json({ message: 'Data inserted successfully', insertedCount: preprocessedData.length });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}