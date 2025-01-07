"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { useState, useEffect } from 'react';

import { config } from '@/config';
import { YearlySpending } from '@/components/dashboard/dashboard/yearly-spending';
import { LatestOrders } from '@/components/dashboard/dashboard/latest-orders';
import { LatestProducts } from '@/components/dashboard/dashboard/latest-products';
import { MonthlyAverages } from '@/components/dashboard/dashboard/monthly-averages';
import { TasksProgress } from '@/components/dashboard/dashboard/tasks-progress';
import { HighestCategory } from '@/components/dashboard/dashboard/highest-category';
import { TotalProfit } from '@/components/dashboard/dashboard/total-profit';
import { CategoryBreakdown } from '@/components/dashboard/dashboard/category-breakdown';
import { TextField, Checkbox, FormControlLabel } from '@mui/material';

// export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;




export default function Page(): React.JSX.Element {
  const [yearToSee, setYearToSee] = useState(2024);
  const [yearToSeeTotal, setYearToSeeTotal] = useState(0.0);
  const [yearToCompare, setYearToCompare] = useState(2023);
  const [yearToCompareTotal, setYearToCompareTotal] = useState(0.0);
  const [monthlyTotalsSeries, setMonthlyTotalsSeries] = useState([{ name: 'Year 1', data: [] }, { name: 'Year 2', data: [] }]);
  const [categoryLabels, setCategoryLabels] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [includeRoland, setIncludeRoland] = useState(true);
  const [includeSarah, setIncludeSarah] = useState(true);
  const [highestCategoryLabel, setHighestCategoryLabel] = useState();
  const [highestCategoryYearToSee, setHighestCategoryYearToSee] = useState(0);
  const [highestCategoryYearToCompare, setHighestCategoryYearToCompare] = useState(0);


  useEffect(() => {
    async function fetchData() {
      const year1_response = await fetch(`/api/getMonthlyAverages?year=${yearToSee}&includeRoland=${includeRoland}&includeSarah=${includeSarah}`);
      const data1 = await year1_response.json();
      const year2_response = await fetch(`/api/getMonthlyAverages?year=${yearToCompare}&includeRoland=${includeRoland}&includeSarah=${includeSarah}`);
      const data2 = await year2_response.json();
      const pie_response1 = await fetch(`/api/getCategoryBreakdown?year=${yearToSee}&includeRoland=${includeRoland}&includeSarah=${includeSarah}`);
      const {labels: labels1, values: values1} = await pie_response1.json();
      const pie_response2 = await fetch(`/api/getCategoryBreakdown?year=${yearToCompare}&includeRoland=${includeRoland}&includeSarah=${includeSarah}`);
      const {labels: labels2, values: values2} = await pie_response2.json();


      setMonthlyTotalsSeries([
        { name: yearToSee.toString(), data: data1 },
        { name: yearToCompare.toString(), data: data2 }
      ]);

      const total1 = data1.reduce((acc: any, curr: any) => acc + curr, 0);
      const total2 = data2.reduce((acc: any, curr: any) => acc + curr, 0);
      setYearToSeeTotal(total1)
      setYearToCompareTotal(total2);
      setCategoryLabels(labels1);
      setCategoryData(values1);



      let maxIndex = 0;
      for (let i = 1; i < values1.length; i++) {
        if (values1[i] > values1[maxIndex]) {
          maxIndex = i;
        }
      }
      const highestLabel = labels1[maxIndex];
      const highestValueYearToSee = values1[maxIndex];

      const correspondingIndex = labels2.indexOf(highestLabel);
      const highestValueYearToCompare = correspondingIndex !== -1 ? values2[correspondingIndex] : 0;

      console.log(highestValueYearToSee);
      console.log(highestValueYearToCompare);
      console.log(highestLabel);

      setHighestCategoryLabel(highestLabel);
      setHighestCategoryYearToSee(parseFloat(highestValueYearToSee));
      setHighestCategoryYearToCompare(parseFloat(highestValueYearToCompare));

    }
    fetchData();
  }, [yearToSee, yearToCompare, includeRoland, includeSarah]);

  useEffect(() => {
    console.log("Year To See Total:", yearToSeeTotal);
    console.log("Year To Compare Total:", yearToCompareTotal);
  }, [yearToSeeTotal, yearToCompareTotal]);

  const handleYearToSeeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYearToSee(Number(event.target.value));
  };

  const handleYearToCompareChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYearToCompare(Number(event.target.value));
  };



  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12} spacing={3}>
        <TextField
          label="Year to see"
          type="number"
          value={yearToSee}
          onChange={handleYearToSeeChange}
          sx={{ marginBottom: 2, width:"15%", paddingRight: 2}}
        />
        <TextField
          label="Year to compare to"
          type="number"
          value={yearToCompare}
          onChange={handleYearToCompareChange}
          sx={{ marginBottom: 2, width:"15%", paddingRight: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeRoland}
              onChange={(event) => setIncludeRoland(event.target.checked)}
            />
          }
          label="Include Roland"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeSarah}
              onChange={(event) => setIncludeSarah(event.target.checked)}
            />
          }
          label="Include Sarah"
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <YearlySpending yearToSee={yearToSee} yearToCompare={yearToCompare} diff={(((yearToSeeTotal - yearToCompareTotal)/yearToCompareTotal)*100).toFixed(2)} sx={{ height: '100%' }} value={yearToSeeTotal.toString()} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <HighestCategory diff={(((highestCategoryYearToSee-highestCategoryYearToCompare)/highestCategoryYearToCompare)*100).toFixed(2)} yearToCompare={yearToCompare} sx={{ height: '100%' }} label={highestCategoryLabel} value={highestCategoryYearToSee} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TasksProgress sx={{ height: '100%' }} value={75.5} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} value="$15k" />
      </Grid>
      <Grid lg={8} xs={12}>
        <MonthlyAverages
          yearToSee={yearToSee}
          setYearToSee={setYearToSee}
          yearToCompare={yearToCompare}
          setYearToCompare={setYearToCompare}
          chartSeries={monthlyTotalsSeries}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <CategoryBreakdown 
          year={yearToSee} 
          chartSeries={categoryData} 
          labels={categoryLabels}
          sx={{ height: '100%' }} 
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <LatestProducts
          products={[
            {
              id: 'PRD-005',
              name: 'Soja & Co. Eucalyptus',
              image: '/assets/product-5.png',
              updatedAt: dayjs().subtract(18, 'minutes').subtract(5, 'hour').toDate(),
            },
            {
              id: 'PRD-004',
              name: 'Necessaire Body Lotion',
              image: '/assets/product-4.png',
              updatedAt: dayjs().subtract(41, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-003',
              name: 'Ritual of Sakura',
              image: '/assets/product-3.png',
              updatedAt: dayjs().subtract(5, 'minutes').subtract(3, 'hour').toDate(),
            },
            {
              id: 'PRD-002',
              name: 'Lancome Rouge',
              image: '/assets/product-2.png',
              updatedAt: dayjs().subtract(23, 'minutes').subtract(2, 'hour').toDate(),
            },
            {
              id: 'PRD-001',
              name: 'Erbology Aloe Vera',
              image: '/assets/product-1.png',
              updatedAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={8} md={12} xs={12}>
        <LatestOrders
          orders={[
            {
              id: 'ORD-007',
              customer: { name: 'Ekaterina Tankova' },
              amount: 30.5,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-006',
              customer: { name: 'Cao Yu' },
              amount: 25.1,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-004',
              customer: { name: 'Alexa Richardson' },
              amount: 10.99,
              status: 'refunded',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-003',
              customer: { name: 'Anje Keizer' },
              amount: 96.43,
              status: 'pending',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-002',
              customer: { name: 'Clarke Gillebert' },
              amount: 32.54,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
            {
              id: 'ORD-001',
              customer: { name: 'Adam Denisov' },
              amount: 16.76,
              status: 'delivered',
              createdAt: dayjs().subtract(10, 'minutes').toDate(),
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
