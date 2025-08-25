'use client';
import { use, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { EditBox } from "@/app/components";
import { BracketMatch, Player, Score } from "@/app/types";
import { useBracketOperations } from "./hooks/useBracketOperations";
import { PlayerList, TournamentDisplay } from "./components";

export default function BracketPage({ params }: { params: Promise<{ slug: string; bracket: string }> }) {
  const { league } = useContext(LeagueContext);
  const router = useRouter();
  const { slug: leagueSlug, bracket: bracketId } = use(params);

  const bracket = league?.brackets.find(b => b.id === bracketId);
  
  // Get available players not in this bracket
  const availablePlayers = useMemo(() => {
    if (!league || !bracket) return [];
    return league.players.filter(player => !bracket.players.includes(player.id));
  }, [league, bracket]);

  // Get players in this bracket
  const bracketPlayers = useMemo(() => {
    if (!league || !bracket) return [];
    return league.players.filter(player => bracket.players.includes(player.id));
  }, [league, bracket]);

  const {
    updateBracketName,
    addPlayerToBracket,
    removePlayerFromBracket,
    updateMatch,
    generateTournament
  } = useBracketOperations(bracket?.id || '');

  if (!bracket) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-lg">Bracket not found</div>
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/brackets`)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Brackets
        </button>
      </div>
    );
  }

  const handleUpdateMatch = (matchId: string, winnerId: string | null, score?: Score) => {
    // Convert winnerId to winner index for the existing logic
    const targetMatch = findMatchById(bracket.finalMatch, matchId);
    if (!targetMatch) return;

    let winner: number | "draw" | undefined;
    if (winnerId === null) {
      winner = undefined;
    } else {
      const winnerIndex = targetMatch.match.players.findIndex((p: Player) => p.id === winnerId);
      if (winnerIndex !== -1) {
        winner = winnerIndex;
      }
    }

    // Update both winner and score
    updateMatch(matchId, winner, score);
  };

  // Helper function to find a match by ID in the tournament tree
  const findMatchById = (bracketMatch: BracketMatch | undefined, matchId: string): BracketMatch | null => {
    if (!bracketMatch) return null;
    if (bracketMatch.match.id === matchId) return bracketMatch;
    
    if (bracketMatch.children) {
      const leftResult = findMatchById(bracketMatch.children[0], matchId);
      if (leftResult) return leftResult;
      const rightResult = findMatchById(bracketMatch.children[1], matchId);
      if (rightResult) return rightResult;
    }
    
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/league/${leagueSlug}/brackets`)}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Brackets
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-lg text-gray-600">Bracket:</span>
          <EditBox
            value={bracket.name}
            onSave={updateBracketName}
            className="text-3xl font-bold py-2 px-4"
            placeholder="Enter bracket name"
          />
        </div>
      </div>

      {/* Players Section */}
      <PlayerList
        bracketPlayers={bracketPlayers}
        availablePlayers={availablePlayers}
        bracket={bracket}
        onRemovePlayer={removePlayerFromBracket}
        onAddPlayer={addPlayerToBracket}
      />

      {/* Tournament Generation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Tournament</h2>
            <p className="text-sm text-gray-600 mt-1">
              Seedings are automatically based on current player rankings
            </p>
          </div>
          {!bracket.finalMatch ? (
            <button
              onClick={() => generateTournament(bracketPlayers)}
              disabled={bracketPlayers.length < 2}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                bracketPlayers.length >= 2
                  ? 'bg-green-200 text-black hover:bg-green-300'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Generate Tournament
            </button>
          ) : (
            <button
              onClick={() => generateTournament(bracketPlayers)}
              className="px-4 py-2 rounded font-semibold transition-colors bg-yellow-200 text-black hover:bg-yellow-300"
            >
              Regenerate Tournament
            </button>
          )}
        </div>

        {bracket.finalMatch ? (
          <TournamentDisplay
            finalMatch={bracket.finalMatch}
            players={league?.players || []}
            onUpdateMatch={handleUpdateMatch}
            sport={league?.sport || 'simple'}
          />
        ) : (
          <div className="text-gray-500 italic">No tournament generated yet</div>
        )}
      </div>
    </div>
  );
}
