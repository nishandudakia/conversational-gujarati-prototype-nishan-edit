import React, { useState } from 'react';

interface SearchResult {
  phonetic: string;
  english: string;
  breakdown: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      } else if (data.error) {
        setResults([{ phonetic: 'Error', english: data.error, breakdown: '' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setResults([{ phonetic: 'Error', english: 'Failed to fetch', breakdown: '' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Gujarati Search</h3>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in English..."
        className="w-full p-2 border border-gray-300 rounded mb-2"
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      <div className="mt-2">
        {results.map((result, index) => (
          <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
            <div className="font-mono">{result.phonetic}</div>
            <div className="text-sm text-gray-600">{result.english}</div>
            <div className="text-xs text-blue-600 mt-1">Pronunciation: {result.breakdown}</div>
          </div>
        ))}
      </div>
    </div>
  );
}