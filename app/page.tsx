// app/page.tsx
'use client';

import { useState } from 'react';
import { ProductData, ApiResponse } from '@/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProductData | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json: ApiResponse = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate content');
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Product AI Generator</h1>
        <p className="text-gray-500 mb-8">
          Paste a product URL to generate an optimized description and key features.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Product URL
            </label>
            <input
              type="url"
              id="url"
              required
              placeholder="https://example.com/products/awesome-shoes"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
          >
            {isLoading ? 'Analyzing & Generating...' : 'Generate Content'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            🚨 {error}
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{result.title}</h2>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Optimized Description
              </h3>
              <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                {result.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                Key Features
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.features.map((feature, index) => (
                  <li key={index} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Reviews */}
            {result.reviews && result.reviews.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Customer Reviews
                </h3>
                <div className="space-y-4">
                  {result.reviews.map((review, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800">{review.name}</span>
                        <div className="flex text-yellow-400 text-lg">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < review.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">"{review.review}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}