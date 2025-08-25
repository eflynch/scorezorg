import { League, Match, TennisScore, SimpleScore, BracketMatch } from '@/app/types';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  
  // Overall statistics
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  
  // Score-based statistics
  totalPointsScored: number;
  totalPointsConceded: number;
  averagePointsScored: number;
  averagePointsConceded: number;
  pointDifferential: number;
  
  // Tennis-specific statistics (when applicable)
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  
  // Activity metrics
  seasonsParticipated: number;
  tournamentsParticipated: number;
  
  // Performance indicators
  winStreak: number;
  currentStreak: number; // positive for wins, negative for losses
  
  // Ranking score (calculated composite score)
  rankingScore: number;
}

export interface PlayerRanking {
  rank: number;
  stats: PlayerStats;
  previousRank?: number;
  rankChange?: number;
}

/**
 * Analyzes a match to extract statistics for both players
 */
function analyzeMatch(match: Match): { 
  player1Stats: Partial<PlayerStats>; 
  player2Stats: Partial<PlayerStats>; 
} {
  const player1Stats: Partial<PlayerStats> = {
    totalMatches: 1,
    wins: 0,
    losses: 0,
    draws: 0,
    totalPointsScored: 0,
    totalPointsConceded: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0
  };

  const player2Stats: Partial<PlayerStats> = {
    totalMatches: 1,
    wins: 0,
    losses: 0,
    draws: 0,
    totalPointsScored: 0,
    totalPointsConceded: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0
  };

  // Determine match outcome
  if (match.winner === 0) {
    player1Stats.wins = 1;
    player2Stats.losses = 1;
  } else if (match.winner === 1) {
    player1Stats.losses = 1;
    player2Stats.wins = 1;
  } else if (match.winner === "draw") {
    player1Stats.draws = 1;
    player2Stats.draws = 1;
  }

  // Analyze scores if available
  if (match.scores) {
    if ('points' in match.scores) {
      // Simple scoring
      const simpleScore = match.scores as SimpleScore;
      player1Stats.totalPointsScored = simpleScore.points[0] || 0;
      player1Stats.totalPointsConceded = simpleScore.points[1] || 0;
      player2Stats.totalPointsScored = simpleScore.points[1] || 0;
      player2Stats.totalPointsConceded = simpleScore.points[0] || 0;
    } else if ('sets' in match.scores) {
      // Tennis scoring
      const tennisScore = match.scores as TennisScore;
      let player1SetsWon = 0;
      let player2SetsWon = 0;
      let player1GamesWon = 0;
      let player2GamesWon = 0;
      
      tennisScore.sets.forEach(set => {
        const p1Games = set.games[0] || 0;
        const p2Games = set.games[1] || 0;
        
        player1GamesWon += p1Games;
        player2GamesWon += p2Games;
        
        // Determine set winner
        if (p1Games > p2Games) {
          player1SetsWon++;
        } else if (p2Games > p1Games) {
          player2SetsWon++;
        }
        
        // Add tiebreak points to games if applicable
        if (set.tiebreak) {
          player1GamesWon += (set.tiebreak[0] || 0) / 10; // Weight tiebreak points less
          player2GamesWon += (set.tiebreak[1] || 0) / 10;
        }
      });
      
      player1Stats.setsWon = player1SetsWon;
      player1Stats.setsLost = player2SetsWon;
      player1Stats.gamesWon = player1GamesWon;
      player1Stats.gamesLost = player2GamesWon;
      
      player2Stats.setsWon = player2SetsWon;
      player2Stats.setsLost = player1SetsWon;
      player2Stats.gamesWon = player2GamesWon;
      player2Stats.gamesLost = player1GamesWon;
      
      // For tennis, use games as "points" for consistency
      player1Stats.totalPointsScored = player1GamesWon;
      player1Stats.totalPointsConceded = player2GamesWon;
      player2Stats.totalPointsScored = player2GamesWon;
      player2Stats.totalPointsConceded = player1GamesWon;
    }
  }

  return { player1Stats, player2Stats };
}

/**
 * Calculates win streak and current streak for a player
 */
function calculateStreaks(matches: Match[], playerId: string): { winStreak: number; currentStreak: number } {
  let winStreak = 0;
  let currentStreak = 0;
  let maxWinStreak = 0;
  
  // Sort matches by date (most recent first)
  const sortedMatches = matches
    .filter(match => match.date && match.winner !== undefined)
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
    
  for (let i = 0; i < sortedMatches.length; i++) {
    const match = sortedMatches[i];
    const playerIndex = match.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) continue;
    
    const isWin = match.winner === playerIndex;
    const isDraw = match.winner === "draw";
    
    if (i === 0) {
      // Current streak
      if (isWin) currentStreak = 1;
      else if (isDraw) currentStreak = 0;
      else currentStreak = -1;
    } else {
      // Update current streak
      if (isWin && currentStreak >= 0) currentStreak++;
      else if (isWin && currentStreak < 0) break; // End of current streak
      else if (!isWin && !isDraw && currentStreak <= 0) currentStreak--;
      else if (!isWin && !isDraw && currentStreak > 0) break; // End of current streak
    }
    
    // Track win streaks
    if (isWin) {
      winStreak++;
      maxWinStreak = Math.max(maxWinStreak, winStreak);
    } else if (!isDraw) {
      winStreak = 0;
    }
  }
  
  return { winStreak: maxWinStreak, currentStreak };
}

/**
 * Calculates a composite ranking score for a player
 */
function calculateRankingScore(stats: PlayerStats): number {
  if (stats.totalMatches === 0) return 0;
  
  // Base score from win rate (0-100 points)
  const winRateScore = stats.winRate * 100;
  
  // Point differential bonus/penalty (scaled)
  const pointDiffScore = Math.min(Math.max(stats.pointDifferential / Math.max(stats.totalMatches, 1), -20), 20);
  
  // Activity bonus (more matches = higher confidence in ranking)
  const activityBonus = Math.min(stats.totalMatches * 0.5, 10);
  
  // Streak bonus
  const streakBonus = Math.max(stats.currentStreak * 2, 0);
  
  // Tennis-specific bonuses
  let tennisBonus = 0;
  if (stats.setsWon > 0 || stats.setsLost > 0) {
    const setWinRate = stats.setsWon / (stats.setsWon + stats.setsLost);
    tennisBonus = setWinRate * 5; // Small bonus for set performance
  }
  
  return winRateScore + pointDiffScore + activityBonus + streakBonus + tennisBonus;
}

/**
 * Generates comprehensive player statistics from a league
 */
export function generatePlayerStats(league: League): PlayerStats[] {
  const playerStatsMap = new Map<string, PlayerStats>();
  
  // Initialize stats for all players
  league.players.forEach(player => {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      totalPointsScored: 0,
      totalPointsConceded: 0,
      averagePointsScored: 0,
      averagePointsConceded: 0,
      pointDifferential: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      seasonsParticipated: 0,
      tournamentsParticipated: 0,
      winStreak: 0,
      currentStreak: 0,
      rankingScore: 0
    });
  });
  
  // Count seasons participated
  league.seasons?.forEach(season => {
    season.players.forEach(playerId => {
      const stats = playerStatsMap.get(playerId);
      if (stats) {
        stats.seasonsParticipated++;
      }
    });
  });
  
  // Count tournaments participated
  league.brackets?.forEach(bracket => {
    bracket.players.forEach(playerId => {
      const stats = playerStatsMap.get(playerId);
      if (stats) {
        stats.tournamentsParticipated++;
      }
    });
  });
  
  // Collect all matches from all seasons and brackets
  const allMatches: Match[] = [];
  
  // Add season matches
  league.seasons?.forEach(season => {
    allMatches.push(...season.matches);
  });
  
  // Add bracket matches (recursively extract from bracket tree)
  league.brackets?.forEach(bracket => {
    const extractMatches = (bracketMatch: BracketMatch): Match[] => {
      const matches = [bracketMatch.match];
      if (bracketMatch.children) {
        matches.push(...extractMatches(bracketMatch.children[0]));
        matches.push(...extractMatches(bracketMatch.children[1]));
      }
      return matches;
    };
    
    if (bracket.finalMatch) {
      allMatches.push(...extractMatches(bracket.finalMatch));
    }
  });
  
  // Analyze each match
  allMatches.forEach(match => {
    if (match.players.length >= 2) {
      const { player1Stats, player2Stats } = analyzeMatch(match);
      
      // Update player 1
      const p1Stats = playerStatsMap.get(match.players[0].id);
      if (p1Stats) {
        p1Stats.totalMatches += player1Stats.totalMatches || 0;
        p1Stats.wins += player1Stats.wins || 0;
        p1Stats.losses += player1Stats.losses || 0;
        p1Stats.draws += player1Stats.draws || 0;
        p1Stats.totalPointsScored += player1Stats.totalPointsScored || 0;
        p1Stats.totalPointsConceded += player1Stats.totalPointsConceded || 0;
        p1Stats.setsWon += player1Stats.setsWon || 0;
        p1Stats.setsLost += player1Stats.setsLost || 0;
        p1Stats.gamesWon += player1Stats.gamesWon || 0;
        p1Stats.gamesLost += player1Stats.gamesLost || 0;
      }
      
      // Update player 2
      const p2Stats = playerStatsMap.get(match.players[1].id);
      if (p2Stats) {
        p2Stats.totalMatches += player2Stats.totalMatches || 0;
        p2Stats.wins += player2Stats.wins || 0;
        p2Stats.losses += player2Stats.losses || 0;
        p2Stats.draws += player2Stats.draws || 0;
        p2Stats.totalPointsScored += player2Stats.totalPointsScored || 0;
        p2Stats.totalPointsConceded += player2Stats.totalPointsConceded || 0;
        p2Stats.setsWon += player2Stats.setsWon || 0;
        p2Stats.setsLost += player2Stats.setsLost || 0;
        p2Stats.gamesWon += player2Stats.gamesWon || 0;
        p2Stats.gamesLost += player2Stats.gamesLost || 0;
      }
    }
  });
  
  // Calculate derived statistics and streaks
  playerStatsMap.forEach((stats, playerId) => {
    // Calculate win rate
    if (stats.totalMatches > 0) {
      stats.winRate = stats.wins / stats.totalMatches;
    }
    
    // Calculate averages
    if (stats.totalMatches > 0) {
      stats.averagePointsScored = stats.totalPointsScored / stats.totalMatches;
      stats.averagePointsConceded = stats.totalPointsConceded / stats.totalMatches;
    }
    
    // Calculate point differential
    stats.pointDifferential = stats.totalPointsScored - stats.totalPointsConceded;
    
    // Calculate streaks
    const playerMatches = allMatches.filter(match => 
      match.players.some(p => p.id === playerId)
    );
    const { winStreak, currentStreak } = calculateStreaks(playerMatches, playerId);
    stats.winStreak = winStreak;
    stats.currentStreak = currentStreak;
    
    // Calculate ranking score
    stats.rankingScore = calculateRankingScore(stats);
  });
  
  return Array.from(playerStatsMap.values());
}

/**
 * Ranks players based on their statistics
 */
export function rankPlayers(league: League, previousRankings?: PlayerRanking[]): PlayerRanking[] {
  const playerStats = generatePlayerStats(league);
  
  // Sort by ranking score (descending)
  const sortedStats = playerStats.sort((a, b) => b.rankingScore - a.rankingScore);
  
  // Create rankings with rank numbers
  const rankings: PlayerRanking[] = sortedStats.map((stats, index) => {
    const previousRank = previousRankings?.find(r => r.stats.playerId === stats.playerId)?.rank;
    
    return {
      rank: index + 1,
      stats,
      previousRank,
      rankChange: previousRank ? previousRank - (index + 1) : undefined
    };
  });
  
  return rankings;
}

/**
 * Gets top N players by ranking
 */
export function getTopPlayers(league: League, count = 10): PlayerRanking[] {
  return rankPlayers(league).slice(0, count);
}

/**
 * Gets ranking for a specific player
 */
export function getPlayerRanking(league: League, playerId: string): PlayerRanking | undefined {
  const rankings = rankPlayers(league);
  return rankings.find(r => r.stats.playerId === playerId);
}
