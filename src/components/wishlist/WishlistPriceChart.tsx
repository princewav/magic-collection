'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Wishlist } from '@/types/wishlist';
import { CardWithQuantity } from '@/types/card';

interface WishlistPriceChartProps {
  wishlist: Wishlist;
}

export function WishlistPriceChart({ wishlist }: WishlistPriceChartProps) {
  const chartData = wishlist.cards
    .map((card) => {
      const priceEur = card.prices?.eur
        ? parseFloat(card.prices.eur) * card.quantity
        : null;
      return {
        name: card.name,
        price: priceEur,
        quantity: card.quantity,
      };
    })
    .filter((card) => card.price !== null && card.price > 0)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); // Sort by price descending

  if (chartData.length === 0) {
    return (
      <div className="text-muted-foreground mt-8 text-center">
        No price data available for cards in this wishlist.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Card Price Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="price" fill="#8884d8">
            <LabelList dataKey="name" content={<CustomBarLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as {
      name: string;
      price: number;
      quantity: number;
    };
    return (
      <div className="bg-popover rounded-md border p-2 shadow-md">
        <p className="font-semibold">{data.name}</p>
        <p>Price: €{data.price?.toFixed(2)}</p>
        <p>Quantity: {data.quantity}</p>
      </div>
    );
  }

  return null;
};

// Custom Bar Label Component
const CustomBarLabel = (props: any) => {
  const { x, y, width, value, payload } = props;

  // Check if payload and necessary properties exist
  if (
    !payload ||
    typeof payload.name === 'undefined' ||
    typeof payload.quantity === 'undefined'
  ) {
    return null; // Don't render label if data is missing
  }

  const { name, quantity } = payload as {
    name: string;
    quantity: number;
    price: number;
  };

  // Adjust label position slightly above the bar
  const yPos = y - 5;
  const xPos = x + width / 2;

  return (
    <text
      x={xPos}
      y={yPos}
      fill="#666"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="10"
    >
      {name}
    </text>
  );
};
