import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface SavingsChartProps {
  monthlyLLMCostWithoutCache: number;
  embeddingCostPerMonth: number;
  storagePrice: number;
}

export function SavingsChart({ monthlyLLMCostWithoutCache, embeddingCostPerMonth, storagePrice }: SavingsChartProps) {
  // Generate data points for cache hit ratios from 0 to 100
  const data = Array.from({ length: 11 }, (_, i) => {
    const cacheHitRatio = i * 10;
    const llmCostWithCache = monthlyLLMCostWithoutCache * (1 - cacheHitRatio / 100);
    const totalCostWithCache = llmCostWithCache + embeddingCostPerMonth + storagePrice;
    const savings = monthlyLLMCostWithoutCache - totalCostWithCache;
    
    return {
      cacheHitRatio,
      savings,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Savings by Cache Hit Rate
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }} // Increased left margin
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="cacheHitRatio" 
              label={{ 
                value: 'Cache Hit Rate (%)', 
                position: 'bottom', 
                offset: 0 
              }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              label={{ 
                value: 'Monthly Savings ($)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -40, // Adjusted offset
                style: {
                  textAnchor: 'middle'
                }
              }}
              width={100} // Fixed width for Y-axis to accommodate currency values
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Cache Hit Rate: ${label}%`}
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
