"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { config } from '@/config';
import { TransactionFilters } from '@/components/dashboard/transactions/transaction-filter';
import { TransactionTable } from '@/components/dashboard/transactions/transaction-table';
import type { Transaction } from '@/components/dashboard/transactions/transaction-table';

// export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;


export default function Page(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [category, setCategory] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [roommates, setRoommates] = useState<string[]>(['Roland', 'Sarah']);
  const [shared, setShared] = useState(false);
  const [notes, setNotes] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {

      const queryParams = new URLSearchParams({
        startDate: startDate ? startDate.toISOString() : '',
        endDate: endDate ? endDate.toISOString() : '',
        category,
        minAmount,
        maxAmount,
        roommates: roommates.join(','),
        shared: shared.toString(),
        notes
      });



      const response = await fetch(`/api/getTransactions?${queryParams.toString()}`);
      const data = await response.json();

      setTransactions(data);
    }
    
    fetchTransactions();
  
  }, [startDate, endDate, category, minAmount, maxAmount, roommates, shared, notes]);  

  const handlePageChange = (event: unknown | null, newPage: number) => {
    setPage(newPage);
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const paginatedTransactions = applyPagination(transactions, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Transactions</Typography>
        </Stack>
      </Stack>
      <TransactionFilters 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        category={category}
        setCategory={setCategory}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        roommates={roommates}
        setRoommates={setRoommates}
        shared={shared}
        setShared={setShared}
        notes={notes}
        setNotes={setNotes}
      />
      <TransactionTable
        count={transactions.length}
        page={page}
        rows={paginatedTransactions}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Stack>
  );
}

function applyPagination(rows: Transaction[], page: number, rowsPerPage: number): Transaction[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
