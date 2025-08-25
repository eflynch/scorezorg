'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sport } from '@/app/types';

export default function NewLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('simple');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a league name');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/league', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), sport }),
      });

      if (!res.ok) {
        throw new Error('Failed to create league');
      }

      const newLeague = await res.json();
      console.log('Created league:', newLeague);
      router.push(`/league/${newLeague.slug}`);
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Failed to create league. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <button 
            onClick={() => router.push('/league')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Leagues
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create New League</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              League Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter league name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
              Sport Type
            </label>
            <select
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="simple">Simple Score</option>
              <option value="tennis">Tennis</option>
              <option value="other">Other</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Choose the scoring system for your league. This cannot be changed later.
            </p>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isCreating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } transition-colors`}
          >
            {isCreating ? 'Creating League...' : 'Create League'}
          </button>
        </form>
      </div>
    </div>
  );
}
