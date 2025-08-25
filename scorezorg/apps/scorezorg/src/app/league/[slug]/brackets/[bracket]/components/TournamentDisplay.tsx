import { BracketMatch, Player } from '@/app/types';
import { getAllMatchesByRound, getRoundName } from '../utils/tournamentUtils';
import { MatchCard } from './MatchCard';

interface TournamentDisplayProps {
  finalMatch: BracketMatch;
  players: Player[];
  onUpdateMatch: (matchId: string, winnerId: string | null, score?: string) => void;
}

export const TournamentDisplay = ({ 
  finalMatch, 
  players, 
  onUpdateMatch 
}: TournamentDisplayProps) => {
  const matchesByRound = getAllMatchesByRound(finalMatch);
  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Tournament Bracket</h2>
      
      <div className="space-y-8">
        {rounds.map(round => {
          const roundMatches = matchesByRound[round];
          const roundName = getRoundName(round, rounds.length);
          
          return (
            <div key={round} className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 text-center">{roundName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roundMatches.map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    roundName={roundName}
                    matchIndex={index}
                    players={players}
                    onUpdateMatch={onUpdateMatch}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Tournament Tree Visualization */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Tournament Tree</h3>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <TournamentTree match={finalMatch} players={players} />
        </div>
      </div>
    </div>
  );
};

interface TournamentTreeProps {
  match: BracketMatch;
  players: Player[];
  level?: number;
}

const TournamentTree = ({ match, players, level = 0 }: TournamentTreeProps) => {
  const player1 = match.match.players[0];
  const player2 = match.match.players[1];
  const winnerId = match.match.winner !== undefined && match.match.winner !== 'draw' 
    ? match.match.players[match.match.winner]?.id 
    : null;

  return (
    <div className="flex flex-col items-center">
      {match.children && (
        <div className="flex gap-8 mb-4">
          <TournamentTree match={match.children[0]} players={players} level={level + 1} />
          <TournamentTree match={match.children[1]} players={players} level={level + 1} />
        </div>
      )}
      
      <div className="bg-white border border-gray-300 rounded p-3 min-w-[200px] text-center">
        <div className="text-xs text-gray-500 mb-1">
          Round {match.round} - Position {match.position}
        </div>
        <div className="space-y-1">
          <div className={`text-sm ${winnerId === player1?.id ? 'font-bold text-green-600' : ''}`}>
            {player1?.name || 'TBD'}
            {winnerId === player1?.id && ' ✓'}
          </div>
          <div className="text-xs text-gray-400">vs</div>
          <div className={`text-sm ${winnerId === player2?.id ? 'font-bold text-green-600' : ''}`}>
            {player2?.name || 'TBD'}
            {winnerId === player2?.id && ' ✓'}
          </div>
        </div>
      </div>
    </div>
  );
};
