import React, { useState } from 'react';
import { Percent, Upload, FileText } from 'lucide-react';
import { EMBEDDING_MODELS } from '../utils/cacheHitCalculator';
// import sampleQueries from '../assets/sample-queries.txt';

// Instead, include the content directly as a constant
const SAMPLE_QUERIES = `What is the capital of France?
What's the capital city of France?
Tell me about Paris, the capital of France
What is the population of Tokyo?
How many people live in Tokyo?
What's the weather like in New York?
How's the weather in NYC today?
What's the current weather in New York City?
Explain quantum computing
What is quantum computing and how does it work?
Give me an introduction to quantum computers
What are the benefits of meditation?
Why should I meditate daily?
What are the advantages of regular meditation practice?
How to make chocolate chip cookies?
What's the best recipe for chocolate chip cookies?
Recipe for homemade chocolate chip cookies
What is machine learning?
Explain artificial intelligence and machine learning
How does ML work?`;

interface CacheHitEstimatorProps {
  estimatorState: {
    selectedModel: string;
    processing: boolean;
    error: string | null;
    showResults: boolean;
    estimatedHitRate: number | null;
  };
  similarityThreshold: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  sampleQueries: string;
  onNavigateToTab: (tab: TabType) => void;
}

export function CacheHitEstimator({
  estimatorState,
  similarityThreshold,
  onFileUpload,
  onCalculate,
  sampleQueries,
  onNavigateToTab
}: CacheHitEstimatorProps) {
  const [fileOption, setFileOption] = useState<'sample' | 'upload'>('sample');
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const handleSampleFileSelect = async () => {
    try {
      const blob = new Blob([sampleQueries], { type: 'text/plain' });
      const file = new File([blob], 'sample-queries.txt', { type: 'text/plain' });
      
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileUpload(syntheticEvent);
    } catch (error) {
      console.error('Error loading sample file:', error);
    }
  };

  // Call handleSampleFileSelect when component mounts
  React.useEffect(() => {
    if (fileOption === 'sample') {
      handleSampleFileSelect();
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasUploadedFile(!!event.target.files?.[0]);
    onFileUpload(event);
  };

  const handleOptionChange = (option: 'sample' | 'upload') => {
    setFileOption(option);
    if (option === 'sample') {
      handleSampleFileSelect();
    }
  };

  const handleViewSample = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToTab('sample-queries');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <Percent className="w-6 h-6 mr-2 text-purple-600" />
        Cache Hit Rate Estimator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embedding Model
            </label>
            <div className="bg-white p-3 rounded-md border-2 border-indigo-200">
              <span className="text-gray-900 font-medium">
                {EMBEDDING_MODELS[0].name}
              </span>
              <div className="text-sm text-gray-600 mt-1">
                Dimensions: {EMBEDDING_MODELS[0].dimensions} | Threshold: {EMBEDDING_MODELS[0].similarityThreshold}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Using Redis LangCache embedding model
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Query Source
            </label>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="sample"
                  name="fileOption"
                  value="sample"
                  checked={fileOption === 'sample'}
                  onChange={() => handleOptionChange('sample')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <div className="ml-2">
                  <label htmlFor="sample" className="block text-sm text-gray-700">
                    Check cache hit rate with our sample queries
                  </label>
                  <a 
                    href="#"
                    onClick={handleViewSample}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    View sample query list
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="upload"
                  name="fileOption"
                  value="upload"
                  checked={fileOption === 'upload'}
                  onChange={() => handleOptionChange('upload')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="upload" className="ml-2 block text-sm text-gray-700">
                  Upload My Own File
                </label>
              </div>

              {fileOption === 'upload' && (
                <div className="ml-6 mt-2">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <span className="mt-1 text-xs text-gray-500 block">
                    Supported formats: .txt, .csv, .xlsx
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onCalculate}
            disabled={estimatorState.processing || (fileOption === 'upload' && !hasUploadedFile)}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {estimatorState.processing ? (
              <span>Processing...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Calculate Hit Rate
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {estimatorState.error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md">
              {estimatorState.error}
            </div>
          )}

          {estimatorState.showResults && (
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-700">
                Estimated Cache Hit Rate: {estimatorState.estimatedHitRate?.toFixed(2)}%
              </p>
              <p className="text-sm text-green-700 mt-2">
                Check your matched queries list{' '}
                <button
                  onClick={() => document.querySelector('[data-tab="matches"]')?.click()}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  Matched Queries here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
