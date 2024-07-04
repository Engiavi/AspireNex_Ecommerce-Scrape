"use client"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type PriceChartProps = {
  currentPrice: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
};

const PriceChart = ({ currentPrice, averagePrice, lowestPrice, highestPrice }: PriceChartProps) => {
  const data: ChartData<'line'> = {
    labels: ['Current Price', 'Average Price', 'Lowest Price', 'Highest Price'],
    datasets: [
      {
        label: 'Product Prices',
        data: [currentPrice, averagePrice, lowestPrice, highestPrice],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Product Price Comparison',
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceChart;
