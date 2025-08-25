import { BracketMatch } from '@/app/types';

export const getAllMatchesByRound = (bracketMatch: BracketMatch | undefined): { [round: number]: BracketMatch[] } => {
  if (!bracketMatch) return {};
  
  const matchesByRound: { [round: number]: BracketMatch[] } = {};
  
  const traverse = (match: BracketMatch) => {
    if (!matchesByRound[match.round]) {
      matchesByRound[match.round] = [];
    }
    matchesByRound[match.round].push(match);
    
    if (match.children) {
      traverse(match.children[0]);
      traverse(match.children[1]);
    }
  };
  
  traverse(bracketMatch);
  return matchesByRound;
};

export const getRoundName = (roundNumber: number, totalRounds: number) => {
  const roundsFromEnd = totalRounds - roundNumber + 1;
  
  if (roundsFromEnd === 1) return "Final";
  if (roundsFromEnd === 2) return "Semifinals";
  if (roundsFromEnd === 3) return "Quarterfinals";
  if (roundsFromEnd === 4) return "Round of 16";
  if (roundsFromEnd === 5) return "Round of 32";
  
  return `Round ${roundNumber}`;
};
