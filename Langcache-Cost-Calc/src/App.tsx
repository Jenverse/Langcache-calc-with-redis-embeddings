import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { TabButton } from './components/TabButton';
import { CacheHitEstimator } from './components/CacheHitEstimator';
import { CostCalculator } from './components/CostCalculator';
import { MatchedQueries } from './components/MatchedQueries';
import { calculateCacheHitRate, EMBEDDING_MODELS, type EmbeddingModel } from './utils/cacheHitCalculator';
import { parseFile } from './utils/fileParser';
import { useCostCalculations } from './hooks/useCostCalculations';
import { useEstimatorState } from './hooks/useEstimatorState';
import { TabType, EstimatorState, CalculatorInputs } from './types';
import { Loader2 } from 'lucide-react';
import { SampleQueriesEditor } from './components/SampleQueriesEditor';
import { SAMPLE_QUERIES } from './utils/constants';

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <h2 className="text-red-800 text-lg font-semibold">Something went wrong</h2>
        <button
          onClick={() => setHasError(false)}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
    </div>
  );
}

function App() {
  useEffect(() => {
    console.log('Environment check:', {
      hasApiKey: !!import.meta.env.VITE_GOOGLE_API_KEY,
      apiKeyLength: import.meta.env.VITE_GOOGLE_API_KEY?.length || 0
    });
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const { inputs, setInputs, calculations } = useCostCalculations();
  const { estimatorState, setEstimatorState, matchedQueries, setMatchedQueries } = useEstimatorState();
  const [sampleQueries, setSampleQueries] = useState(SAMPLE_QUERIES);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setEstimatorState((prev: EstimatorState) => ({
      ...prev,
      processing: true,
      error: null,
      fileContent: null,
      showResults: false,
    }));

    try {
      const queries = await parseFile(file);
      setEstimatorState((prev: EstimatorState) => ({
        ...prev,
        fileContent: { data: queries },
        processing: false,
        error: null,
      }));
    } catch (error) {
      setEstimatorState((prev: EstimatorState) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error processing file',
        fileContent: null,
        processing: false,
        showResults: false,
      }));
    }
  }, []);

  const calculateHitRate = useCallback(async () => {
    if (!estimatorState.fileContent) {
      setEstimatorState((prev: EstimatorState) => ({
        ...prev,
        error: "Please upload a file first",
        showResults: false,
      }));
      return;
    }

    console.log('Starting hit rate calculation...');

    setEstimatorState((prev: EstimatorState) => ({ 
      ...prev, 
      processing: true, 
      error: null 
    }));

    try {
      const queries = estimatorState.fileContent.data
        .flat()
        .filter((query: unknown): query is string => 
          typeof query === 'string' && query.trim().length > 0
        );

      console.log('Filtered queries:', queries);

      if (queries.length === 0) {
        throw new Error("No valid queries found in the file.");
      }

      // Find the selected model object
      const selectedModel = EMBEDDING_MODELS.find(
        (model) => model.name === estimatorState.selectedModel
      );

      console.log('Selected model:', selectedModel);

      if (!selectedModel) {
        throw new Error("Selected model not found");
      }

      const result = await calculateCacheHitRate(
        queries,
        selectedModel,
        inputs.similarityThreshold
      );

      console.log('Calculation result:', result);

      setMatchedQueries(result.matchedPairs);
      setEstimatorState((prev: EstimatorState) => ({
        ...prev,
        queries,
        estimatedHitRate: result.hitRate,
        processing: false,
        showResults: true,
      }));

      setInputs((prev: CalculatorInputs) => ({
        ...prev,
        cacheHitRate: Math.round(result.hitRate),
      }));
    } catch (error) {
      console.error('Error in calculateHitRate:', error);
      setEstimatorState((prev: EstimatorState) => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : "An error occurred while processing queries",
        showResults: false,
      }));
    }
  }, [estimatorState.fileContent, estimatorState.selectedModel, inputs.similarityThreshold, setInputs]);

  const renderCalculatorTab = () => (
    <ErrorBoundary>
      <CacheHitEstimator
        estimatorState={estimatorState}
        similarityThreshold={inputs.similarityThreshold}
        onFileUpload={handleFileUpload}
        onCalculate={calculateHitRate}
        sampleQueries={sampleQueries}
        onNavigateToTab={setActiveTab}
      />
      <CostCalculator
        inputs={inputs}
        calculations={calculations}
        onInputChange={(name, value) => setInputs(prev => ({ ...prev, [name]: value }))}
      />
    </ErrorBoundary>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">Redis LangCache Savings Calculator</h1>
          <p className="text-lg text-gray-600">Calculate potential cost savings when using semantic caching for LLM applications</p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" role="tablist">
              <TabButton
                active={activeTab === 'calculator'}
                onClick={() => setActiveTab('calculator')}
                label="Calculator"
                data-tab="calculator"
              />
              <TabButton
                active={activeTab === 'matches'}
                onClick={() => setActiveTab('matches')}
                label="Matched Queries"
                data-tab="matches"
              />
              <TabButton
                active={activeTab === 'sample-queries'}
                onClick={() => setActiveTab('sample-queries')}
                label="Sample Queries"
                data-tab="sample-queries"
              />
            </nav>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === 'calculator' ? (
            renderCalculatorTab()
          ) : activeTab === 'matches' ? (
            <ErrorBoundary>
              <MatchedQueries matches={matchedQueries} />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
              <SampleQueriesEditor
                defaultQueries={sampleQueries}
                onSave={(queries) => {
                  setSampleQueries(queries);
                  // Optional: Show a success message
                  alert('Sample queries updated successfully!');
                }}
              />
            </ErrorBoundary>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
