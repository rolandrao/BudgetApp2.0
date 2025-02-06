'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';
import { Collapse } from '@mui/material';
import { url } from 'inspector';

function noop(): void {
  // do nothing
}

export interface Transaction {
  id: string;
  timestamp: Date;
  category: string;
  amount: number;
  roommate: string;
  shared: boolean;
  notes: string;
}

interface TransactionsTableProps {
  count?: number;
  page?: number;
  rows?: Transaction[];
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRowClick: (transaction: Transaction) => void;
  onSort: (column: keyof Transaction) => void;
  sortColumn: keyof Transaction | null;
  sortOrder: 'asc' | 'desc';
}

export function TransactionTable({
  count = 0,
  page = 0,
  rows = [],
  rowsPerPage = 0,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  onRowClick = () => {},
  onSort = () => {},
  sortColumn,
  sortOrder
}: TransactionsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((transaction) => transaction.id);
  }, [rows]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  const createSortHandler = (column: keyof Transaction) => () => {
    onSort(column);
  };

  const sortableColumnStyle = {
    cursor: 'pointer',
  }

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell onClick={createSortHandler('timestamp')} style={sortableColumnStyle}>
                Timestamp {sortColumn === 'timestamp' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={createSortHandler('category')} style={sortableColumnStyle}>
                Category {sortColumn === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={createSortHandler('amount')} style={sortableColumnStyle}>
                Amount {sortColumn === 'amount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={createSortHandler('roommate')} style={sortableColumnStyle}>
                Roommate {sortColumn === 'roommate' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell onClick={createSortHandler('shared')} style={sortableColumnStyle}>
                Shared {sortColumn === 'shared' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
            return (
                <TableRow hover key={row.id} onClick={() => onRowClick(row)}>
                  <TableCell sx={{ width: '200px' }}>{dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                  <TableCell sx={{ width: '150px' }}>{row.category}</TableCell>
                  <TableCell sx={{ width: '130px' }}>{formatCurrency(row.amount)}</TableCell>
                  <TableCell sx={{ width: '150px' }}>{row.roommate}</TableCell>
                  <TableCell sx={{ width: '100px' }}>{row.shared ? 'Yes': 'No'}</TableCell>
                  <TableCell>{row.notes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Card>
  );
}
