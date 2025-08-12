import { useState, useMemo } from 'react';

export function useCostCalculations() {
  const [inputs, setInputs] = useState({
    dailyQueries: 1000000, // 1M queries
    inputTokensPerQuery: 1000,
    outputTokensPerQuery: 1000,
    llmInputCostPerMillion: .075,
    llmOutputCostPerMillion: .60,
    cacheHitRate: 20,
    embeddingCostPerMillion: 0.02,
    cacheStorageCost: 100, // Changed from 0.0001 to 100 (flat monthly cost)
    similarityThreshold: 0.85,
  });

  const calculations = useMemo(() => {
    const monthlyQueries = inputs.dailyQueries * 30;
    const yearlyQueries = monthlyQueries * 12;
    
    const monthlyInputTokens = monthlyQueries * inputs.inputTokensPerQuery;
    const monthlyOutputTokens = monthlyQueries * inputs.outputTokensPerQuery;
    const yearlyInputTokens = yearlyQueries * inputs.inputTokensPerQuery;
    const yearlyOutputTokens = yearlyQueries * inputs.outputTokensPerQuery;
    
    // Calculate LLM costs separately for input and output tokens
    const monthlyLLMInputCostWithoutCache = (monthlyInputTokens / 1_000_000) * inputs.llmInputCostPerMillion;
    const monthlyLLMOutputCostWithoutCache = (monthlyOutputTokens / 1_000_000) * inputs.llmOutputCostPerMillion;
    const monthlyLLMCostWithoutCache = monthlyLLMInputCostWithoutCache + monthlyLLMOutputCostWithoutCache;
    
    const yearlyLLMInputCostWithoutCache = (yearlyInputTokens / 1_000_000) * inputs.llmInputCostPerMillion;
    const yearlyLLMOutputCostWithoutCache = (yearlyOutputTokens / 1_000_000) * inputs.llmOutputCostPerMillion;
    const yearlyLLMCostWithoutCache = yearlyLLMInputCostWithoutCache + yearlyLLMOutputCostWithoutCache;
    
    const cacheHitRateDecimal = inputs.cacheHitRate / 100;
    const monthlyLLMCostWithCache = monthlyLLMCostWithoutCache * (1 - cacheHitRateDecimal);
    const yearlyLLMCostWithCache = yearlyLLMCostWithoutCache * (1 - cacheHitRateDecimal);
    
    const monthlyEmbeddingCost = (monthlyInputTokens * cacheHitRateDecimal / 1_000_000) * inputs.embeddingCostPerMillion;
    const yearlyEmbeddingCost = (yearlyInputTokens * cacheHitRateDecimal / 1_000_000) * inputs.embeddingCostPerMillion;
    
    const monthlyCacheCost = monthlyQueries * cacheHitRateDecimal * inputs.cacheStorageCost;
    const yearlyCacheCost = yearlyQueries * cacheHitRateDecimal * inputs.cacheStorageCost;
    
    const monthlyTotalCostWithCache = monthlyLLMCostWithCache + monthlyEmbeddingCost + monthlyCacheCost;
    const yearlyTotalCostWithCache = yearlyLLMCostWithCache + yearlyEmbeddingCost + yearlyCacheCost;

    const monthlySavings = monthlyLLMCostWithoutCache - monthlyTotalCostWithCache;
    const yearlySavings = yearlyLLMCostWithoutCache - yearlyTotalCostWithCache;

    return {
      monthlyQueries,
      yearlyQueries,
      monthlyInputTokens,
      monthlyOutputTokens,
      yearlyInputTokens,
      yearlyOutputTokens,
      monthlyLLMCostWithoutCache,
      yearlyLLMCostWithoutCache,
      monthlyLLMCostWithCache,
      yearlyLLMCostWithCache,
      monthlyEmbeddingCost,
      yearlyEmbeddingCost,
      monthlyCacheCost,
      yearlyCacheCost,
      monthlyTotalCostWithCache,
      yearlyTotalCostWithCache,
      monthlySavings,
      yearlySavings
    };
  }, [inputs]);

  return { inputs, setInputs, calculations };
}
