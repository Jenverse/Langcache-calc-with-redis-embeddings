import React from 'react';
import { List } from 'lucide-react';
import { QueryMatch } from '../utils/cacheHitCalculator';

interface MatchedQueriesProps {
  matches: QueryMatch[];
}

export function MatchedQueries({ matches }: MatchedQueriesProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <List className="w-6 h-6 mr-2 text-indigo-600" />
        Top 25 Matched Queries
      </h2>
      
      {matches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Similarity Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matches.map((match, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {match.originalQuery}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {match.matchedQuery}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(match.similarity * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No matched queries found. Upload a file and calculate cache hit rate to see matches.
        </div>
      )}
    </div>
  );
}