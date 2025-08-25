// This can be used in API routes (server-side)
import { validateLeagueData, isLeague } from '../validators';
import { League } from '../types';

export function validateApiLeagueData(requestBody: unknown): League {
  try {
    // This works on the server
    return validateLeagueData(requestBody);
  } catch (error) {
    throw new Error(`Invalid league data received: ${error}`);
  }
}

export function isValidLeague(data: unknown): data is League {
  // Type guard that works on server
  return isLeague(data);
}

// Example usage in API route:
export async function handleLeagueUpdate(requestBody: unknown) {
  // Validate the incoming data
  const league = validateApiLeagueData(requestBody);
  
  // Now we can safely use the league data
  console.log(`Updating league: ${league.name}`);
  
  // Database update logic would go here...
  return { success: true, league };
}
