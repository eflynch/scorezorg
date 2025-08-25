'use client';
import { use, useContext } from "react";
import { LeagueContext } from "../league-context";
import TabNavigation from "../tab-navigation";

export default function PlayersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { league, updateLeague} = useContext(LeagueContext);
  const { slug } = use(params);

  return (
    <div>
      <TabNavigation slug={slug} />
      <div className="flex px-5 flex-col items-start mt-6">
        <span className="px-5 text-2xl font-bold">Players</span>
        {league?.players.map(player => (
          <a
            key={player.id}
            href={`/league/${slug}/players/${player.id}`}
            className="px-5 text-sm text-700 hover:underline block"
          >
            {player.name}
          </a>
        ))}
        <button className="px-5 text-black bg-blue-200 rounded hover:bg-blue-300 transition-colors text-sm font-semibold shadow px-2" onClick={() => updateLeague((league) => ({...league, players: [...league.players, { id: String(Date.now()), name: 'New Player' }] }))}>
          Add Player
        </button>
      </div>
    </div>
  );
}
