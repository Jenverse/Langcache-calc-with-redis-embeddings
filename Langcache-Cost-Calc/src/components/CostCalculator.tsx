import React from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { SavingsChart } from './SavingsChart';

interface CostCalculatorProps {
  inputs: {
    dailyQueries: number;
    inputTokensPerQuery: number;
    outputTokensPerQuery: number;
    llmInputCostPerMillion: number;
    llmOutputCostPerMillion: number;
    cacheHitRate: number;
    embeddingCostPerMillion: number;
    cacheStorageCost: number;
    similarityThreshold: number;
  };
  calculations: {
    monthlyQueries: number;
    yearlyQueries: number;
    monthlyLLMCostWithoutCache: number;
    yearlyLLMCostWithoutCache: number;
    monthlyTotalCostWithCache: number;
    yearlyTotalCostWithCache: number;
    monthlySavings: number;
    yearlySavings: number;
  };
  onInputChange: (name: string, value: number) => void;
}

export function CostCalculator({ inputs, calculations, onInputChange }: CostCalculatorProps) {
  const dailyQueriesFormatted = inputs.dailyQueries.toLocaleString();
  const monthlyQueriesFormatted = (inputs.dailyQueries * 30).toLocaleString();
  
  // Calculate costs without cache
  const monthlyInputCost = (inputs.dailyQueries * 30 * inputs.inputTokensPerQuery * inputs.llmInputCostPerMillion) / 1_000_000;
  const monthlyOutputCost = (inputs.dailyQueries * 30 * inputs.outputTokensPerQuery * inputs.llmOutputCostPerMillion) / 1_000_000;
  const monthlyLLMCostWithoutCache = monthlyInputCost + monthlyOutputCost;
  
  // Calculate costs with cache
  const monthlyLLMCostWithCache = monthlyLLMCostWithoutCache * (1 - inputs.cacheHitRate / 100);
  const monthlyEmbeddingCost = calculations.monthlyEmbeddingCost;
  const monthlyCacheStorageCost = inputs.cacheStorageCost;
  
  const totalWithCache = monthlyLLMCostWithCache + monthlyEmbeddingCost + monthlyCacheStorageCost;
  
  const withoutCacheFormula = `Cost Calculation:
• Monthly Queries: ${dailyQueriesFormatted}/day × 30 = ${monthlyQueriesFormatted}
• Input Cost: ${monthlyQueriesFormatted} × ${inputs.inputTokensPerQuery} × $${inputs.llmInputCostPerMillion}/1M = ${formatCurrency(monthlyInputCost)}
• Output Cost: ${monthlyQueriesFormatted} × ${inputs.outputTokensPerQuery} × $${inputs.llmOutputCostPerMillion}/1M = ${formatCurrency(monthlyOutputCost)}
• Total Cost: ${formatCurrency(monthlyInputCost)} + ${formatCurrency(monthlyOutputCost)} = ${formatCurrency(calculations.monthlyLLMCostWithoutCache)}`;

  const withCacheFormula = `Cost Calculation:
• LLM Cost: ${formatCurrency(monthlyLLMCostWithoutCache)} × (1 - ${inputs.cacheHitRate}%) = ${formatCurrency(monthlyLLMCostWithCache)}
• Embedding Cost: ${monthlyQueriesFormatted} × ${inputs.inputTokensPerQuery} × $${inputs.embeddingCostPerMillion}/1M = ${formatCurrency(monthlyEmbeddingCost)}
• Storage Cost (flat monthly): ${formatCurrency(monthlyCacheStorageCost)}
• Total Cost: ${formatCurrency(monthlyLLMCostWithCache)} + ${formatCurrency(monthlyEmbeddingCost)} + ${formatCurrency(monthlyCacheStorageCost)} = ${formatCurrency(totalWithCache)}`;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <Calculator className="w-6 h-6 mr-2 text-indigo-600" />
          Cost Calculator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Input Parameters</h3>
              
              <InputField
                label="Daily Queries"
                value={inputs.dailyQueries}
                onChange={(value) => onInputChange('dailyQueries', value)}
                hint="Enter the number of queries per day"
              />
              
              <InputField
                label="Input Tokens per Query"
                value={inputs.inputTokensPerQuery}
                onChange={(value) => onInputChange('inputTokensPerQuery', value)}
                hint="Average number of input tokens per query"
              />
              
              <InputField
                label="Output Tokens per Query"
                value={inputs.outputTokensPerQuery}
                onChange={(value) => onInputChange('outputTokensPerQuery', value)}
                hint="Average number of output tokens per query"
              />
              
              <InputField
                label="LLM Input Cost per Million Tokens ($)"
                value={inputs.llmInputCostPerMillion}
                onChange={(value) => onInputChange('llmInputCostPerMillion', value)}
                hint="Cost per million tokens for input processing"
              />
              
              <InputField
                label="LLM Output Cost per Million Tokens ($)"
                value={inputs.llmOutputCostPerMillion}
                onChange={(value) => onInputChange('llmOutputCostPerMillion', value)}
                hint="Cost per million tokens for output generation"
              />
              
              <InputField
                label="Cache Hit Rate (%)"
                value={inputs.cacheHitRate}
                onChange={(value) => onInputChange('cacheHitRate', value)}
                hint="Estimated percentage of cache hits"
              />
              
              <InputField
                label="Embedding Cost per Million Tokens ($)"
                value={inputs.embeddingCostPerMillion}
                onChange={(value) => onInputChange('embeddingCostPerMillion', value)}
                hint="Cost per million tokens for embeddings"
              />
              
              <InputField
                label="Cache Storage Cost ($ per month)"
                value={inputs.cacheStorageCost}
                onChange={(value) => onInputChange('cacheStorageCost', value)}
                hint="Monthly cost for cache storage"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Results Display */}
            <ResultCard
              title="Monthly Cost Without Cache"
              value={calculations.monthlyLLMCostWithoutCache}
              formula={withoutCacheFormula}
            />
            <ResultCard
              title="Monthly Cost With Cache"
              value={totalWithCache}
              formula={withCacheFormula}
            />
            <ResultCard
              title="Monthly Savings"
              value={calculations.monthlyLLMCostWithoutCache - totalWithCache}
              highlight
            />
          </div>
        </div>
      </div>

      <SavingsChart 
        monthlyLLMCostWithoutCache={calculations.monthlyLLMCostWithoutCache}
        embeddingCostPerMonth={(inputs.dailyQueries * 30 * inputs.inputTokensPerQuery * inputs.embeddingCostPerMillion) / 1_000_000}
        storagePrice={inputs.cacheStorageCost}
      />
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}

function InputField({ label, value, onChange, hint }: InputFieldProps) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full rounded-md border-2 border-indigo-200 
            px-3 py-1 focus:border-indigo-500 focus:ring-indigo-500 
            hover:border-indigo-300 transition-colors
            text-gray-900 placeholder-gray-400
            shadow-sm"
        />
      </div>
      {hint && (
        <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

interface ResultCardProps {
  title: string;
  value: number;
  highlight?: boolean;
  formula?: string;
}

function ResultCard({ title, value, highlight, formula }: ResultCardProps) {
  return (
    <div className={`p-4 rounded-md ${highlight ? 'bg-green-50' : 'bg-gray-50'}`}>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <p className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {formatCurrency(value)}
      </p>
      {formula && (
        <div className="mt-2 p-2 bg-white rounded-md text-sm text-gray-600 font-mono whitespace-pre-wrap">
          {formula}
        </div>
      )}
    </div>
  );
}
