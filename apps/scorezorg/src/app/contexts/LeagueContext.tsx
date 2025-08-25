'use client'
 
import { League } from '@/app/types'
import { createContext, useEffect, useState } from 'react'

export const LeagueContext = createContext<{ league: League | null; updateLeague: ((updater: (league: League) => League) => Promise<League>) | null }>({ league: null, updateLeague: null });

export function LeagueProvider({
  children,
  slug
}: {
  children: React.ReactNode,
  slug: string
}) {

  const [ league, setLeague ] = useState<League | null>(null);
  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const res = await fetch(`/api/league/${slug}`);
        const data = await res.json();
        if (res.status !== 200) {
          throw new Error(data.error || 'Failed to fetch league data');
        }
        
        // Server handles migration automatically, so we can directly use the data
        setLeague(data);
      } catch (error) {
        console.error('Error fetching league:', error);
        setLeague(null);
      }
    };
    fetchLeague();
  }, [slug]);

  const updateLeague = async (updater: (league: League) => League) => {
    if (league === null) {
      throw new Error('League data is not available');
    }
    const updatedLeague = updater(league);
    setLeague(updatedLeague);
    const response = await fetch(`http://localhost:3000/api/league/${slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedLeague }),
      }
    );
    if (response.status !== 200) {
      throw new Error('Failed to update league');
    }
    return updatedLeague;
  };

  return <LeagueContext.Provider value={{ league, updateLeague }}>{children}</LeagueContext.Provider>
}