import { BracketMatch, Player } from '@/app/types';

interface MatchCardProps {
  match: BracketMatch;
  roundName: string;
  matchIndex: number;
  players: Player[];
  onUpdateMatch: (matchId: string, winnerId: string | null, score?: string) => void;
}

export const MatchCard = ({ 
  match, 
  roundName, 
  matchIndex, 
  players, 
  onUpdateMatch 
}: MatchCardProps) => {
  const player1 = match.match.players[0];
  const player2 = match.match.players[1];
  const player1Name = player1?.name || 'BYE';
  const player2Name = player2?.name || 'BYE';
  const winnerId = match.match.winner !== undefined && match.match.winner !== 'draw' 
    ? match.match.players[match.match.winner]?.id 
    : null;
  
  const handleScoreSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedWinnerId = formData.get('winner') as string;
    const score = formData.get('score') as string;
    
    // If there was already a winner and user is changing it, show confirmation
    if (winnerId && selectedWinnerId !== winnerId && selectedWinnerId !== "") {
      const currentWinnerName = winnerId === player1?.id ? player1Name : player2Name;
      const newWinnerName = selectedWinnerId === player1?.id ? player1Name : player2Name;
      const confirmed = confirm(
        `Are you sure you want to change the winner from ${currentWinnerName} to ${newWinnerName}? This may affect other matches in the tournament.`
      );
      if (!confirmed) {
        return;
      }
    }
    
    // Allow clearing the winner by selecting empty value
    if (selectedWinnerId === "") {
      onUpdateMatch(match.match.id, null, score || undefined);
    } else if (selectedWinnerId && (selectedWinnerId === player1?.id || selectedWinnerId === player2?.id)) {
      onUpdateMatch(match.match.id, selectedWinnerId, score || undefined);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="text-sm text-gray-600 mb-2">
        {roundName} - Match {matchIndex + 1}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`font-medium ${winnerId === player1?.id ? 'text-green-600' : ''}`}>
            {player1Name}
          </span>
          {winnerId === player1?.id && <span className="text-green-600">✓</span>}
        </div>
        
        <div className="text-center text-gray-400 text-sm">vs</div>
        
        <div className="flex items-center justify-between">
          <span className={`font-medium ${winnerId === player2?.id ? 'text-green-600' : ''}`}>
            {player2Name}
          </span>
          {winnerId === player2?.id && <span className="text-green-600">✓</span>}
        </div>
      </div>

      {match.match.scores && (
        <div className="mt-2 text-sm text-gray-600">
          Score: {JSON.stringify(match.match.scores)}
        </div>
      )}

      {winnerId && (
        <div className="mt-2 text-sm font-medium text-green-600">
          Winner: {winnerId === player1?.id ? player1Name : player2Name}
        </div>
      )}

      {/* Show form if both players exist, neither is TBD, and neither is BYE */}
      {player1 && player2 && 
       player1.id !== 'tbd' && player2.id !== 'tbd' && 
       !player1.id.startsWith('bye-') && !player2.id.startsWith('bye-') && (
        <form onSubmit={handleScoreSubmit} className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Winner:</label>
            <select 
              name="winner" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              defaultValue={winnerId || ""}
            >
              <option value="">No winner selected</option>
              <option value={player1.id}>{player1Name}</option>
              <option value={player2.id}>{player2Name}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Score (optional):</label>
            <input 
              type="text" 
              name="score"
              placeholder="e.g., 6-4, 6-3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {winnerId ? 'Update Match' : 'Set Winner'}
          </button>
        </form>
      )}
      
      {/* Show message if match cannot be played yet */}
      {(player1?.id === 'tbd' || player2?.id === 'tbd') && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600 text-center">
          This match cannot be played until previous rounds are completed.
        </div>
      )}
      
      {/* Show message for BYE matches */}
      {(player1?.id.startsWith('bye-') || player2?.id.startsWith('bye-')) && (
        <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-700 text-center">
          Winner automatically determined due to BYE.
        </div>
      )}
    </div>
  );
};
