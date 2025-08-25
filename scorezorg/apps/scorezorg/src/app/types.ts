
export type Player = {
    id: string;
    name: string;
}

export type TennisScore = {
    sets: Array<{
        games: number[];
        tiebreak?: number[];
    }>;
}

export type SimpleScore = {
    points: number[];
}

export type Score = TennisScore | SimpleScore;

export type Match = {
    id: string;
    players: Player[];
    date?: string;
    scores?: Score;
    winner?: number | "draw";
}

export type Season = {
    id: string;
    name: string;
    players: string[];
    startDate: string;
    endDate: string;
    matches: Match[];
    sport?: 'tennis' | 'ping-pong' | 'simple' | 'other';
}

export type BracketMatch = {
    id: string;
    match: Match;
    children?: [BracketMatch, BracketMatch]; // Left and right child matches that feed into this match
    round: number; // Round number (1 = first round, higher numbers = later rounds)
    position: number; // Position within the round for ordering/display
}

export type Bracket = {
    id: string;
    players: string[];
    seedings: { playerId: string; seed: number }[];
    name: string;
    finalMatch?: BracketMatch; // Root of the tree - the championship match
}

export type League = {
    slug: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    players: Player[];
    seasons: Season[];
    brackets: Bracket[];
}

// Export the validator - this will be replaced by the generated one
export { isLeague as LeagueValidator } from './validators';