import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function openDb() {
  return open({
    filename: 'data/transactions.db',
    driver: sqlite3.Database
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { year, includeRoland, includeSarah } = req.query;
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }

    let query_addendum = '';
    if (includeRoland === 'true' && includeSarah === 'true') {
        query_addendum = 'AND (roommate = "Roland" OR roommate = "Sarah")';
    } else if (includeRoland === 'true') {
        query_addendum = 'AND roommate = "Roland"';
    } else if (includeSarah === 'true') {
        query_addendum = 'AND roommate = "Sarah"';
    }

    let query = `
    SELECT strftime('%m', Timestamp) as month, SUM(Amount) as total
    FROM transactions
    WHERE strftime('%Y', Timestamp) = ?
    `;
    query += query_addendum;

    query += `
    GROUP BY month
    ORDER BY month
    `;


  const db = await openDb();
  const data = await db.all(
    query,
    [year.toString()]
  );
  await db.close();

  const monthlyAvg = Array(12).fill(0);
  data.forEach(row => {
    const monthIndex = parseInt(row.month, 10) - 1; // Convert month to 0-indexed
    monthlyAvg[monthIndex] = row.total;
  });

  res.status(200).json(monthlyAvg);
}