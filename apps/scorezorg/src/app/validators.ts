import Ajv from 'ajv';
import { League } from './types';
import { leagueSchema } from './schemas';

// Create AJV instance
const ajv = new Ajv();

// Compile validator
const validateLeague = ajv.compile(leagueSchema);

// Type guard function
export const isLeague = (data: unknown): data is League => {
  const valid = validateLeague(data);
  if (!valid) {
    console.error('League validation failed:', validateLeague.errors);
  }
  return valid;
};

// Validation function that throws errors
export const validateLeagueData = (data: unknown): League => {
  if (!isLeague(data)) {
    throw new Error(`Invalid league data: ${JSON.stringify(validateLeague.errors)}`);
  }
  return data;
};

// Export the raw validator for advanced use cases
export { validateLeague };
