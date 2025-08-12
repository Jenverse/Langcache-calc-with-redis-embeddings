import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface SampleQueriesEditorProps {
  defaultQueries: string;
  onSave: (queries: string) => void;
}

export function SampleQueriesEditor({ defaultQueries, onSave }: SampleQueriesEditorProps) {
  const [queries, setQueries] = useState(defaultQueries);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const queryList = queries.split('\n').filter(q => q.trim());
    if (queryList.length > 50) {
      setError('Maximum 50 queries allowed');
      return;
    }
    setError(null);
    onSave(queries);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sample Queries Editor</h2>
        <p className="text-gray-600">
          Edit the sample queries below. Maximum 50 queries allowed, one per line.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={queries}
          onChange={(e) => setQueries(e.target.value)}
          className="w-full h-96 p-4 border rounded-md font-mono text-sm"
          placeholder="Enter queries, one per line..."
        />
      </div>

      <button
        onClick={handleSave}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Queries
      </button>
    </div>
  );
}