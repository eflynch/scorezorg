import { Player, Bracket } from '@/app/types';

interface PlayerListProps {
  bracketPlayers: Player[];
  availablePlayers: Player[];
  bracket: Bracket;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayer: (playerId: string) => void;
}

export const PlayerList = ({ 
  bracketPlayers, 
  availablePlayers, 
  bracket, 
  onRemovePlayer, 
  onAddPlayer 
}: PlayerListProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Players ({bracketPlayers.length})</h2>
      
      {/* Current Players */}
      <div className="mb-4">
        {bracketPlayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {bracketPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                <span className="font-medium">
                  {player.name}
                  {bracket.seedings.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      (#{bracket.seedings.find(s => s.playerId === player.id)?.seed || 'N/A'})
                    </span>
                  )}
                </span>
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  disabled={bracket.finalMatch !== undefined}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No players in this bracket</div>
        )}
      </div>

      {/* Add Players */}
      {availablePlayers.length > 0 && !bracket.finalMatch && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Add Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {availablePlayers.map(player => (
              <div key={player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                <span>{player.name}</span>
                <button
                  onClick={() => onAddPlayer(player.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
