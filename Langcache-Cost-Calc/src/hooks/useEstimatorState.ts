import { useState } from 'react';
import { EstimatorState, UseEstimatorStateReturn } from '../types';
import { QueryMatch } from '../utils/cacheHitCalculator';
import { EMBEDDING_MODELS } from '../utils/cacheHitCalculator';

export function useEstimatorState(): UseEstimatorStateReturn {
  const [estimatorState, setEstimatorState] = useState<EstimatorState>({
    processing: false,
    error: null,
    fileContent: null,
    showResults: false,
    queries: [],
    estimatedHitRate: 0,
    selectedModel: "Redis: langcache-embed-v1" // Default to langcache model
  });

  const [matchedQueries, setMatchedQueries] = useState<QueryMatch[]>([]);

  return {
    estimatorState,
    setEstimatorState,
    matchedQueries,
    setMatchedQueries
  };
}
