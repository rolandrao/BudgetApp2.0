import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';


async function openDatabase() {
  return open({
    filename: 'data/transactions.db',
    driver: sqlite3.Database,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await openDatabase();

    const rolandTotal = await db.get(
      'SELECT SUM(amount) as total FROM transactions WHERE roommate = ? AND shared = ?',
      ['Roland', true]
    );

    const sarahTotal = await db.get(
      'SELECT SUM(amount) as total FROM transactions WHERE roommate = ? AND shared = ?',
      ['Sarah', true]
    );


    const money_owed = ((rolandTotal.total-sarahTotal.total)/2) + 1340;

    res.status(200).json({
        money_owed: money_owed,
    });
  } catch (error) {
    console.error('Error querying data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}