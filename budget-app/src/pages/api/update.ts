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
      const { id, Timestamp, Amount, Category, Roommate, Shared, Notes } = row;
      return db.run(
        'UPDATE transactions SET timestamp = ?, amount = ?, category = ?, roommate = ?, shared = ?, notes = ? WHERE id = ?',
        [Timestamp, Amount, Category, Roommate, Shared === "Yes" ? 1 : 0, Notes, id]
      );
    });

    await Promise.all(insertPromises);

    res.status(200).json({ message: 'Data updated successfully', insertedCount: preprocessedData.length });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
