'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Desktop as DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';
import { DeviceTablet as DeviceTabletIcon } from '@phosphor-icons/react/dist/ssr/DeviceTablet';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import type { ApexOptions } from 'apexcharts';
import Box from '@mui/material/Box';

import { Chart } from '@/components/core/chart';

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, Icon>;

export interface CategoryBreakdownProps {
  year: number;
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function CategoryBreakdown({ year, chartSeries, labels, sx }: CategoryBreakdownProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title={`Expense Category Breakdown for ${year}`} />
      <CardContent>
          <Chart height={400} options={chartOptions} series={chartSeries} type="donut" width="100%" sx={{pt:8}}/>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [
      '#FF5733', // Red
      '#33FF57', // Green
      '#3357FF', // Blue
      '#FF33A1', // Pink
      '#FF8C33', // Orange
      '#33FFF5', // Cyan
      '#8C33FF', // Purple
      '#FFD433', // Yellow
      '#33FF8C'  // Light Green
    ],
    dataLabels: { enabled: false },
    labels,
    legend: {
      show: true,
      position: 'right',
      labels: {useSeriesColors: true},
      markers: {
        width: 12,
        height: 12,
        radius: 12
      },
      itemMargin: {
        horizontal: 0,
        vertical: 2
      }

    },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { 
      fillSeriesColor: false,
      y: {
        formatter: (value) => new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value)
      }
    },
  };
} 
