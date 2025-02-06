"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import Papa from 'papaparse';
import { FormControl, FormControlLabel, FormLabel, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import page from '../page';
import { parse } from 'json2csv';

export default function Page(): React.JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [step, setStep] = useState(1);
  const [preprocessedData, setPreprocessedData] = useState<any[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentRowData, setCurrentRowData] = useState<any>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [roommate, setRoommate] = useState('Roland');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'd') {
        handleNextRow();
      } else if (event.key === 'a') {
        handlePreviousRow();
      } else if (event.key === 's') {
        handleClassifyRow('Shared');
      } else if (event.key === 'w') {
        handleClassifyRow('Not Shared');
      } else if (event.key === 'x') {
        handleClassifyRow('N/A');
      }
    };

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentRow, currentRowData, preprocessedData]);

  const handleUpload = () => {
    if (selectedFiles) {
      const data: any[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = file.name.toLowerCase();

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let fileData = results.data;

            // Preprocess data based on filename
            if (fileName.includes('marriott')) {
              fileData = fileData.map((row: any) => {
                // Example preprocessing step
                return {
                  Timestamp: row['Transaction Date'], // Rename column
                  Amount: -row['Amount'], // Rename column
                  Category: '', // Set category
                  Roommate: roommate, // TODO MAKE THIS DYNAMIC
                  Shared: '', // Keep column
                  Notes: row['Description'], // Keep column
                };
              });
            } else if (fileName.includes('apple')) {
              fileData = fileData.map((row: any) => {
                // Example preprocessing step
                return {
                  Timestamp: row['Transaction Date'], // Rename column
                  Amount: row['Amount (USD)'], // Rename column
                  Category: '', // Set category
                  Roommate: roommate, // TODO MAKE THIS DYNAMIC
                  Shared: '', // Keep column
                  Notes: row['Description'], // Keep column
                };
              });
            } else if (fileName.includes('capital_one')) {
              fileData = fileData.map((row: any) => {
                // Example preprocessing step
                return {
                  Timestamp: row['Transaction Date'], // Rename column
                  Amount: row['Debit'], // Rename column
                  Category: '', // Set category
                  Roommate: roommate, // TODO MAKE THIS DYNAMIC
                  Shared: '', // Keep column
                  Notes: row['Description'], // Keep column
                };
              });
            }

            data.push(...fileData);
            if (i === selectedFiles.length - 1) {
              setPreprocessedData(data);
              setCurrentRowData(data[0]);
              setStep(2);
            }
          },
        });
      }
    }
  };

  const handleDownloadCSV = () => {
    const csv = parse(preprocessedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'preprocessed_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNextRow = () => {
    if (currentRow < preprocessedData.length - 1) {
      const nextRow = currentRow + 1;
      setCurrentRow(nextRow);
      setCurrentRowData(preprocessedData[nextRow]);
    }
  };

  const handlePreviousRow = () => {
    if (currentRow > 0) {
      const prevRow = currentRow - 1;
      setCurrentRow(prevRow);
      setCurrentRowData(preprocessedData[prevRow]);
    }
  };

  const handleClassifyRow = (classification: string) => {
    let classify = '';
    if (classification === 'Shared') {
      classify = 'Yes';
    } else if (classification === 'Not Shared') {
      classify = 'No';
    } else {
      classify = 'N/A';
    }
    const updatedData = [...preprocessedData]
    updatedData[currentRow] = {...currentRowData, Shared: classify};
    setPreprocessedData(updatedData);
    handleNextRow();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    setCurrentRowData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const allRowsClassified = () => {
    return preprocessedData.every(row => row.Shared && row.Category);
  };

  const handleFinish = () => {
    setStep(3);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoommateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoommate(event.target.value);
  }

  const handleBackToStep2 = () => {
    setStep(2);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  const handleConfirmAndSubmit = async () => {

    const filteredData = preprocessedData.filter(row => row.Shared != 'N/A');
    
    const reformattedData = filteredData.map(row => {
      const date = new Date(row.Timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      return { ...row, Timestamp: formattedTimestamp };
    });


    try {
      // Replace with your actual API endpoint or database insertion logic
      const response = await fetch('/api/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reformattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit data');
      }

      alert('Data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Expense Reporting</Typography>
        </Stack>
      </Stack>
      {step === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Upload CSV Files
                </Button>
              </label>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Roommate</FormLabel>
                <RadioGroup
                  aria-label="roommate"
                  name="roommate"
                  value={roommate}
                  onChange={handleRoommateChange}
                >
                  <FormControlLabel value="Roland" control={<Radio />} label="Roland" />
                  <FormControlLabel value="Sarah" control={<Radio />} label="Sarah" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFiles}
                sx={{ ml: 2 }}
              >
                Process Upload
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      {step === 2 && preprocessedData.length > 0 && (
        <Box>
          <Typography variant="h6">Classify Data</Typography>
          <Typography variant="body1">
            Row {currentRow + 1} of {preprocessedData.length}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Timestamp"
                name="Timestamp"
                value={currentRowData.Timestamp || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Amount"
                name="Amount"
                value={formatCurrency(currentRowData.Amount) || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Roommate"
                name="Roommate"
                value={currentRowData.Roommate || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Shared"
                name="Shared"
                value={currentRowData.Shared || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" margin="normal">
                <Typography component="legend">Category</Typography>
                <RadioGroup
                  name="Category"
                  value={currentRowData.Category || ''}
                  onChange={handleInputChange}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="Notes"
                value={currentRowData.Notes || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            onClick={() => handleClassifyRow('Shared')}
            sx={{ mt: 2 }}
          >
            Shared
          </Button>
          <Button
            variant="contained"
            onClick={() => handleClassifyRow('Not Shared')}
            sx={{ mt: 2, ml: 2 }}
          >
            Not Shared
          </Button>
          <Button
            variant="contained"
            onClick={() => handleClassifyRow('N/A')}
            sx={{ mt: 2, ml: 2 }}
          >
            N/A
          </Button>
          <Button
            variant="contained"
            onClick={handlePreviousRow}
            sx={{ mt: 2, ml: 2 }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNextRow}
            disabled={currentRow === preprocessedData.length - 1}
            sx={{ mt: 2, ml: 2 }}
          >
            Next
          </Button>
          <Button
            variant="contained"
            onClick={handleFinish}
            disabled={!allRowsClassified()}
            sx={{ mt: 2, ml: 2 }}
          >
            Finish
          </Button>
        </Box>
      )}
      {step === 3 && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleConfirmAndSubmit}
            >
              Confirm and Submit
            </Button>
            <Button
              variant="contained"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </Button>
            <Button
              variant="contained"
              onClick={handleBackToStep2}
            >
              Back to Step 2
            </Button>

          </Stack>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Roommate</TableCell>
                  <TableCell>Shared</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preprocessedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.Timestamp}</TableCell>
                    <TableCell>{formatCurrency(row.Amount)}</TableCell>
                    <TableCell>{row.Category}</TableCell>
                    <TableCell>{row.Roommate}</TableCell>
                    <TableCell>{row.Shared}</TableCell>
                    <TableCell>{row.Notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25]}
            component="div"
            count={preprocessedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
    </Stack>
  );
}