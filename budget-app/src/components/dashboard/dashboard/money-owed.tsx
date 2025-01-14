import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';
import { useState, useEffect } from 'react';

export interface MoneyOwedProps {
  sx?: SxProps;
}

export function MoneyOwed({ sx }: MoneyOwedProps): React.JSX.Element {
  const [moneyOwed, setMoneyOwed] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`/api/getOwedMoney`);
      const data = await response.json();
      setMoneyOwed(data.money_owed);
    }

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(moneyOwed);
  }


  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Money Owed by {moneyOwed > 0 ? 'Sarah': 'Roland'}
            </Typography>
            <Typography variant="h4">{formatCurrency(moneyOwed)}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
