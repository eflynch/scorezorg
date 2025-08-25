import { useMemo } from 'react';
import { League } from '@/app/types';
import { rankPlayers, generatePlayerStats, getTopPlayers, getPlayerRanking } from '@/app/utils/playerRanking';

/**
 * Custom hook for player rankings and statistics
 */
export function usePlayerStats(league: League | null) {
  const playerStats = useMemo(() => {
    if (!league) return [];
    return generatePlayerStats(league);
  }, [league]);

  const playerRankings = useMemo(() => {
    if (!league) return [];
    return rankPlayers(league);
  }, [league]);

  const getTopN = useMemo(() => 
    (count = 10) => {
      if (!league) return [];
      return getTopPlayers(league, count);
    },
    [league]
  );

  const getRankingForPlayer = useMemo(() => 
    (playerId: string) => {
      if (!league) return undefined;
      return getPlayerRanking(league, playerId);
    },
    [league]
  );

  return {
    playerStats,
    playerRankings,
    getTopPlayers: getTopN,
    getPlayerRanking: getRankingForPlayer,
    hasData: league !== null && league.players.length > 0
  };
}
