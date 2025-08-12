import { QueryMatch } from '../utils/cacheHitCalculator';
import type { Dispatch, SetStateAction } from 'react';

export type TabType = 'calculator' | 'matches' | 'sample-queries';

export interface EstimatorState {
  processing: boolean;
  error: string | null;
  fileContent: { data: string[] } | null;
  showResults: boolean;
  queries: string[];
  estimatedHitRate: number;
  selectedModel: string;
}

export interface UseEstimatorStateReturn {
  estimatorState: EstimatorState;
  setEstimatorState: Dispatch<SetStateAction<EstimatorState>>;
  matchedQueries: QueryMatch[];
  setMatchedQueries: Dispatch<SetStateAction<QueryMatch[]>>;
}

export interface CalculatorInputs {
  dailyQueries: number;
  inputTokensPerQuery: number;
  outputTokensPerQuery: number;
  llmInputCostPerMillion: number;
  llmOutputCostPerMillion: number;
  cacheHitRate: number;
  embeddingCostPerMillion: number;
  cacheStorageCost: number;
  similarityThreshold: number;
}

export interface Calculations {
  monthlyQueries: number;
  yearlyQueries: number;
  monthlyTokens: number;
  yearlyTokens: number;
  monthlyLLMCostWithoutCache: number;
  yearlyLLMCostWithoutCache: number;
  monthlyTotalCostWithCache: number;
  yearlyTotalCostWithCache: number;
  monthlySavings: number;
  yearlySavings: number;
}
