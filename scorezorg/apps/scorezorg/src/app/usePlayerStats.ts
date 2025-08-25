import { League } from "./types";

export const usePlayerSeasonStats = (league:League, playerId:string, seasonId?:string) => {
    const stats = {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
    };

    league.seasons.forEach(season => {
        if (seasonId && season.id !== seasonId) {
            return;
        }
        season.matches.forEach(match => {
            const playerIndex = match.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                stats.matchesPlayed += 1;
                if (match.winner === undefined) {
                    // Match not yet played, don't count win/loss/draw
                } else if (match.winner === "draw") {
                    stats.draws += 1;
                } else if (match.winner === playerIndex) {
                    stats.wins += 1;
                } else {
                    stats.losses += 1;
                }
            }
        });
    });

    return stats;
}