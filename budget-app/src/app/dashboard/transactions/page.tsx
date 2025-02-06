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
import { Grid, InputLabel, Select, MenuItem, Modal, Box, TextField, FormControl, RadioGroup, FormControlLabel, Radio} from '@mui/material';

import { config } from '@/config';
import { TransactionFilters } from '@/components/dashboard/transactions/transaction-filter';
import { TransactionTable } from '@/components/dashboard/transactions/transaction-table';
import type { Transaction } from '@/components/dashboard/transactions/transaction-table';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    Timestamp: '',
    Amount: '',
    Category: '',
    Shared: 'Yes',
    Roommate: '',
    Notes: ''
  })

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, category, minAmount, maxAmount, roommates, shared, notes]);  


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


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setFormData((prevData) => ({
      ...prevData,
      Timestamp: date ? date.toISOString() : ''
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([formData])
      });
      if (response.ok){
        console.log('Record Added Successfully');
        fetchTransactions();
      } else{
        console.error('Failed to add record');
      }
    } catch (error) {
      console.log('An error has occurred: ', error);
    }
    console.log(formData);
    setFormData({
      Timestamp: '',
      Amount: '',
      Category: '',
      Shared: 'Yes',
      Roommate: '',
      Notes: ''
    });
    handleClose();
  };

  const handlePageChange = (event: unknown | null, newPage: number) => {
    setPage(newPage);
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const paginatedTransactions = applyPagination(transactions, page, rowsPerPage);

  return (
    <>
      <Button variant="contained" onClick={handleOpen} style={{ position: 'absolute', top: 100, right: 100 }}>
        Add Record
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Add New Record
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <DatePicker
                label="Timestamp"
                value={dayjs(formData.Timestamp)}
                onChange={handleDateChange}
                // renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Amount"
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Roommate</InputLabel>
                <Select
                  name="Roommate"
                  value={formData.Roommate}
                  onChange={handleChange}
                >
                  <MenuItem value="Roland">Roland</MenuItem>
                  <MenuItem value="Sarah">Sarah</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" margin="normal">
                <Typography component="legend">Shared</Typography>
                <RadioGroup
                  name="Shared"
                  value={formData.Shared}
                  onChange={handleChange}
                  row
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <FormControl component="fieldset" margin="normal">
            <Typography component="legend">Category</Typography>
            <RadioGroup
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="Bills" control={<Radio />} label="Bills" />
              <FormControlLabel value="Cat" control={<Radio />} label="Cat" />
              <FormControlLabel value="Food" control={<Radio />} label="Food" />
              <FormControlLabel value="Fun" control={<Radio />} label="Fun" />
              <FormControlLabel value="Groceries" control={<Radio />} label="Groceries" />
              <FormControlLabel value="Miscellaneous" control={<Radio />} label="Miscellaneous" />
              <FormControlLabel value="Shopping" control={<Radio />} label="Shopping" />
              <FormControlLabel value="Subscriptions" control={<Radio />} label="Subscriptions" />
              <FormControlLabel value="Transportation" control={<Radio />} label="Transportation" />
              <FormControlLabel value="Uber Eats" control={<Radio />} label="Uber Eats" />
            </RadioGroup>
          </FormControl>
          <TextField
            label="Notes"
            name="Notes"
            value={formData.Notes}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Modal>
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
    </>
  );
}

function applyPagination(rows: Transaction[], page: number, rowsPerPage: number): Transaction[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
