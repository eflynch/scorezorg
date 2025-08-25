'use client';
import { use, useContext } from "react";
import { useRouter } from "next/navigation";
import { LeagueContext } from "@/app/contexts";
import { TabNavigation } from "@/app/components";
import { BracketMatch } from "@/app/types";

// Helper function to count rounds in a tournament tree
const countRounds = (finalMatch: BracketMatch | undefined): number => {
  if (!finalMatch) return 0;
  
  const getAllRounds = (match: BracketMatch): number[] => {
    const rounds = [match.round];
    if (match.children) {
      rounds.push(...getAllRounds(match.children[0]));
      rounds.push(...getAllRounds(match.children[1]));
    }
    return rounds;
  };
  
  const allRounds = getAllRounds(finalMatch);
  return Math.max(...allRounds);
};

export default function BracketsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague } = useContext(LeagueContext);
  const router = useRouter();
  const { slug } = use(params);

  const handleDeleteBracket = async (bracketId: string, bracketName: string) => {
    if (!updateLeague) return;

    const confirmMessage = `Are you sure you want to delete the bracket "${bracketName}"?\n\nThis will:\n- Remove the bracket from the league\n- Delete ALL tournament matches in this bracket\n- Remove all seedings and tournament data\n- This action cannot be undone\n\nType "DELETE" to confirm.`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput !== "DELETE") {
      if (userInput !== null) {
        alert('Bracket deletion cancelled. You must type "DELETE" exactly to confirm.');
      }
      return;
    }

    try {
      await updateLeague((league) => ({
        ...league,
        brackets: league.brackets.filter(bracket => bracket.id !== bracketId)
      }));
      
      alert(`Bracket "${bracketName}" has been successfully deleted.`);
    } catch (error) {
      console.error('Failed to delete bracket:', error);
      alert('Failed to delete bracket. Please try again.');
    }
  };

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <span className="px-5 text-2xl font-bold">Brackets</span>
        {league?.brackets?.map(bracket => (
          <div key={bracket.id} className="w-full px-5 py-2 border-b hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => router.push(`/league/${slug}/brackets/${bracket.id}`)}
                className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{bracket.name}</span>
                  <span className="text-gray-500 text-xs">
                    {countRounds(bracket.finalMatch)} rounds • {bracket.players.length} players
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleDeleteBracket(bracket.id, bracket.name)}
                className="ml-3 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="Delete bracket"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button 
          className="px-5 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow px-2 mt-2" 
          onClick={() => {
            if (!updateLeague) return;
            updateLeague((league) => ({
              ...league, 
              brackets: [...(league.brackets || []), {
                  id: String(Date.now()),
                  name: 'New Bracket',
                  players: [], // Start with empty players list
                  seedings: []
              }] 
            }));
          }}
        >
          Add Bracket
        </button>
      </div>
    </div>
  );
}
