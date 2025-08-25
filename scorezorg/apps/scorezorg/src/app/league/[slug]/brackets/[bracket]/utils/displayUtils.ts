import { Match, Player } from '@/app/types';

export const getPlayerName = (playerId: string, players: Player[]) => {
  return players.find(p => p.id === playerId)?.name || 'Unknown Player';
};

export const getWinnerDisplay = (match: Match, players: Player[]) => {
  if (match.winner === undefined) return "Not played";
  if (match.winner === "draw") return "Draw";
  if (typeof match.winner === "number" && match.winner < match.players.length) {
    return getPlayerName(match.players[match.winner].id, players);
  }
  return "Unknown";
};
