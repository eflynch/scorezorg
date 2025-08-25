import Ajv from 'ajv';
import { League, Player, Match } from './types';
import { leagueSchema, playerSchema, matchSchema } from './schemas';

// Create AJV instance
const ajv = new Ajv();

// Compile validators
const validateLeague = ajv.compile(leagueSchema);
const validatePlayer = ajv.compile(playerSchema);
const validateMatch = ajv.compile(matchSchema);

// Type guard functions
export const isLeague = (data: unknown): data is League => {
  const valid = validateLeague(data);
  if (!valid) {
    console.error('League validation failed:', validateLeague.errors);
  }
  return valid;
};

export const isPlayer = (data: unknown): data is Player => {
  const valid = validatePlayer(data);
  if (!valid) {
    console.error('Player validation failed:', validatePlayer.errors);
  }
  return valid;
};

export const isMatch = (data: unknown): data is Match => {
  const valid = validateMatch(data);
  if (!valid) {
    console.error('Match validation failed:', validateMatch.errors);
  }
  return valid;
};

// Validation functions that throw errors
export const validateLeagueData = (data: unknown): League => {
  if (!isLeague(data)) {
    throw new Error(`Invalid league data: ${JSON.stringify(validateLeague.errors)}`);
  }
  return data;
};

export const validatePlayerData = (data: unknown): Player => {
  if (!isPlayer(data)) {
    throw new Error(`Invalid player data: ${JSON.stringify(validatePlayer.errors)}`);
  }
  return data;
};

export const validateMatchData = (data: unknown): Match => {
  if (!isMatch(data)) {
    throw new Error(`Invalid match data: ${JSON.stringify(validateMatch.errors)}`);
  }
  return data;
};

// Export the raw validators for advanced use cases
export { validateLeague, validatePlayer, validateMatch };
