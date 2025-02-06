"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { TextField, MenuItem, Checkbox, FormControlLabel, Select, InputLabel, FormControl, Box, Stack, Grow, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { X } from '@phosphor-icons/react/dist/ssr/X';


interface TransactionFiltersProps {
  startDate: dayjs.Dayjs | null;
  setStartDate: (date: dayjs.Dayjs | null) => void;
  endDate: dayjs.Dayjs | null;
  setEndDate: (date: dayjs.Dayjs | null) => void;
  category: string;
  setCategory: (category: string) => void;
  minAmount: string;
  setMinAmount: (amount: string) => void;
  maxAmount: string;
  setMaxAmount: (amount: string) => void;
  roommates: string[];
  setRoommates: (roommates: string[]) => void;
  shared: boolean;
  setShared: (shared: boolean) => void;
  notes: string,
  setNotes: (notes: string) => void;
  handleClearFilters: () => void;
}

export function TransactionFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  category,
  setCategory,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  roommates,
  setRoommates,
  shared,
  setShared,
  notes,
  setNotes,
  handleClearFilters
}: TransactionFiltersProps): React.JSX.Element {

  const [inputValueNotes, setInputValueNotes] = React.useState(notes);
  const [inputValueMin, setInputValueMin] = React.useState(minAmount);
  const [inputValueMax, setInputValueMax] = React.useState(maxAmount);

  const handleRoommateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setRoommates([...roommates, value]);
    } else {
      setRoommates(roommates.filter((roommate) => roommate !== value));
    }
  };

  const handleNotesKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setNotes(inputValueNotes);
    }

  };
  const handleMinKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setMinAmount(inputValueMin);
    }

  };
  const handleMaxKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setMaxAmount(inputValueMax);
    }

  };

  const handleClearInputValues = () => {
    setInputValueMin('');
    setInputValueMax('');
    setInputValueNotes('');
  }


  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            sx={{ minWidth: 150 }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            sx={{ minWidth: 150 }}
          />
        </LocalizationProvider>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            label="Category"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Bills">Bills</MenuItem>
            <MenuItem value="Cat">Cat</MenuItem>
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Fun">Fun</MenuItem>
            <MenuItem value="Groceries">Groceries</MenuItem>
            <MenuItem value="Miscellaneous">Miscellaneous</MenuItem>
            <MenuItem value="Shopping">Shopping</MenuItem>
            <MenuItem value="Subscriptions">Subscriptions</MenuItem>
            <MenuItem value="Transportation">Transportation</MenuItem>
            <MenuItem value="Uber Eats">Uber Eats</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Minimum Amount"
          type="number"
          value={inputValueMin}
          onChange={(event) => setInputValueMin(event.target.value)}
          onKeyDown={handleMinKeyDown}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Maximum Amount"
          type="number"
          value={inputValueMax}
          onChange={(event) => setInputValueMax(event.target.value)}
          onKeyDown={handleMaxKeyDown}
          sx={{ minWidth: 150 }}
        />
        <FormControl sx={{ minWidth: 150, height:"100%" }}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={roommates.includes('Roland')}
                  onChange={handleRoommateChange}
                  value="Roland"
                />
              }
              label="Roland"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={roommates.includes('Sarah')}
                  onChange={handleRoommateChange}
                  value="Sarah"
                />
              }
              label="Sarah"
            />
        <FormControlLabel
          control={
            <Checkbox
              checked={shared}
              onChange={(event) => setShared(event.target.checked)}
            />
          }
          label="Shared Only"
        />
          </Stack>
          </FormControl>
        <OutlinedInput
          value={inputValueNotes}
          onChange={(event) => setInputValueNotes(event.target.value)}
          onKeyDown={handleNotesKeyDown}
          fullWidth
          placeholder="Search Notes"
          startAdornment={
            <InputAdornment position="start">
              <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
            </InputAdornment>
          }
          sx={{ width: 600 }}
        />
        <label >
          <Button
            variant="contained"
            component="span"
            startIcon={<X size={32} />}
            onClick={() => {
              handleClearFilters();
              handleClearInputValues();
            }}
          >
            Clear Filters
          </Button>
        </label>

      </Stack>
    </Card>
  );
}