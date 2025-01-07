import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Transaction } from '@/components/dashboard/transactions/transaction-table';

async function openDb() {
  return open({
    filename: 'data/transactions.db',
    driver: sqlite3.Database
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { startDate, endDate, category, minAmount, maxAmount, roommates, shared, notes } = req.query;

  const db = await openDb();

  let query = `
    SELECT * FROM transactions
  `;
  const params: (string | number)[] = [];

  if (roommates?.includes('Roland') && roommates.includes('Sarah')) {
    query += ' WHERE Roommate IN ("Roland", "Sarah")';
  } else if (roommates?.includes('Roland')) {
    query += ' WHERE Roommate = "Roland"';
  } else if (roommates?.includes('Sarah')) {
    query += ' WHERE Roommate = "Sarah"';
  }


  if (startDate != '') {
    query += ' AND TIMESTAMP >= ?';
    params.push(startDate as string);
  }

  if (endDate != '') {
    query += ' AND TIMESTAMP <= ?';
    params.push(endDate as string);
  }

  if (category != '') {
    query += ' AND Category = ?';
    params.push(category as string);
  }

  if (minAmount != '') {
    query += ' AND Amount >= ?';
    params.push(Number(minAmount));
  }

  if (maxAmount != '') {
    query += ' AND Amount <= ?';
    params.push(Number(maxAmount));
  }

  if (shared != 'false') {
    query += ' AND Shared = ?';
    params.push(shared === 'true' ? 1 : 0);
  }

  if (notes != '') {
    query += ' AND Notes Like ?';
    params.push(notes as string);
  }

  query += '\nORDER BY TIMESTAMP DESC';

  console.log(query);
  console.log(params);

  const transactions = await db.all(query, params);
  await db.close();

    const formattedTransactions: Transaction[] = transactions.map((transaction: any) => ({
    id: transaction.id,
    timestamp: transaction.timestamp,
    category: transaction.category,
    amount: transaction.amount,
    roommate: transaction.roommate,
    shared: transaction.shared === 1,
    notes: transaction.notes
  }));

  console.log(formattedTransactions)

  res.status(200).json(formattedTransactions);
}