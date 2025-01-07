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
}

export function TransactionTable({
  count = 0,
  page = 0,
  rows = [],
  rowsPerPage = 0,
  onPageChange = noop,
  onRowsPerPageChange = noop
}: TransactionsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((transaction) => transaction.id);
  }, [rows]);

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Roommate</TableCell>
              <TableCell>Shared</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
            return (
                <TableRow hover key={row.id}>
                  <TableCell sx={{ width: '200px' }}>{dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                  <TableCell sx={{ width: '150px' }}>{row.category}</TableCell>
                  <TableCell sx={{ width: '100px' }}>{row.amount}</TableCell>
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
