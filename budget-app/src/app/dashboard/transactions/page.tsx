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
import { ChartBarHorizontal, EnvelopeSimple } from '@phosphor-icons/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SelectInput, { SelectChangeEvent } from '@mui/material/Select/SelectInput';

// export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;


export default function Page(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortColumn, setSortColumn] = useState<keyof Transaction | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatWindowRef = React.useRef<HTMLDivElement>(null);

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
  const [openEdit, setOpenEdit] = useState(false);
  const [aggData, setAggData] = useState<{ sum: number | null; avg: number | null; min: number | null; max: number | null }>({
    sum: null,
    avg: null,
    min: null,
    max: null,
  });
  const [formData, setFormData] = useState({
    Timestamp: '',
    Amount: '',
    Category: '',
    Shared: 'Yes',
    Roommate: '',
    Notes: ''
  })
  const [editFormData, setEditFormData] = useState({
    id: '',
    Timestamp: '',
    Amount: '',
    Category: '',
    Shared: '',
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

    var sum = data.reduce((acc: number, transaction: Transaction) => acc + transaction.amount, 0);
    var avg = sum / data.length;
    var min = data.length > 0 ? Math.min(...data.map((transaction: Transaction) => transaction.amount)) : 0;
    var max = data.length > 0 ? Math.max(...data.map((transaction: Transaction) => transaction.amount)) : 0;

    if (min < 0) {
      min = 0;
    }

    const aggData = {
      sum: sum,
      avg: avg,
      min: min,
      max: max
    }

    setTransactions(data);
    setAggData(aggData);
  }

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setCategory('');
    setMinAmount('');
    setMaxAmount('');
    setRoommates([]);
    setShared(false);
    setNotes('');
    setSortColumn('timestamp')
    setSortOrder('desc');
  }


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setEditFormData((prevData) => ({
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

  const handleEditDateChange = (date: dayjs.Dayjs | null) => {
    setEditFormData((prevData) => ({
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

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([editFormData])
      });
      if (response.ok){
        console.log('Record Updated Successfully');
        fetchTransactions();
      } else{
        console.error('Failed to update record');
      }
    } catch (error) {
      console.log('An error has occurred: ', error);
    }
    console.log(editFormData);
    setEditFormData({
      id: '',
      Timestamp: '',
      Amount: '',
      Category: '',
      Shared: 'Yes',
      Roommate: '',
      Notes: ''
    });
    handleCloseEdit();
  }


  const handleRowClick = (transaction: Transaction) => {
    setEditFormData({
      id: transaction.id,
      Timestamp: transaction.timestamp,
      Amount: transaction.amount.toString(),
      Category: transaction.category,
      Shared: transaction.shared ? 'Yes' : 'No',
      Roommate: transaction.roommate,
      Notes: transaction.notes
    });
    handleOpenEdit();
  };

  const handleSort = (column: keyof Transaction) => {
    const isAsc = sortColumn === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortColumn(column);
  }

  const sortedTransactions = React.useMemo(() => {
    if (!sortColumn) return transactions;
    return [...transactions].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortColumn, sortOrder]);

  const handlePageChange = (event: unknown | null, newPage: number) => {
    setPage(newPage);
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const paginatedTransactions = applyPagination(sortedTransactions, page, rowsPerPage);
  

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    setInput('');
    // Call your backend API with the question and transaction data
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input, transactions }),
    });
    const data = await res.json();
    setMessages((msgs) => [...msgs, { sender: 'bot', text: data.answer }]);
    // Scroll to bottom
    setTimeout(() => {
      chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
    }, 100);
  };

  return (
    <>
      <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
        <Typography variant="body1">
          Sum: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(aggData.sum || 0)}
        </Typography>
        <Typography variant="body1">
          Average: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(aggData.avg || 0)}
        </Typography>
        <Typography variant="body1">
          Min: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(aggData.min || 0)}
        </Typography>
        <Typography variant="body1">
          Max: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(aggData.max || 0)}
        </Typography>
        <Box sx={{ marginLeft: 'auto' }}>
          <Button variant="contained" onClick={handleOpen}>
            Add Record
          </Button>
        </Box>
      </Stack>
      {/* THIS IS THE MODAL FOR EDITING DATA */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Edit Record
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <DatePicker
                label="Timestamp"
                value={dayjs(editFormData.Timestamp)}
                onChange={handleEditDateChange}
                // renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Amount"
                name="Amount"
                value={editFormData.Amount}
                onChange={(event) => handleEditChange(event as SelectChangeEvent<string>)}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Roommate</InputLabel>
                <Select
                  name="Roommate"
                  value={editFormData.Roommate}
                  onChange={(event) => handleEditChange(event as React.ChangeEvent<HTMLInputElement>)}
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
                  value={editFormData.Shared}
                  onChange={handleEditChange}
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
              value={editFormData.Category}
              onChange={handleEditChange}
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
            value={editFormData.Notes}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleSaveChanges} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Modal>
      {/* THIS IS THE MODAL FOR ADDING ONE RECORD TO THE DATABASE MANUALLY */}
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
                onChange={(event) => handleChange(event as SelectChangeEvent<string>)}
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
        handleClearFilters={handleClearFilters}
      />
      <TransactionTable
        count={transactions.length}
        page={page}
        rows={paginatedTransactions}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleRowClick}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
      />
    </Stack>
    </>
  );
}

function applyPagination(rows: Transaction[], page: number, rowsPerPage: number): Transaction[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
