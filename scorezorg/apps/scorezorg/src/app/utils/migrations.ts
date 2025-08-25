import { League } from '@/app/types';

/**
 * Current schema version - increment this when making breaking changes
 */
export const CURRENT_LEAGUE_VERSION = 0;

/**
 * Version-based migration system for League data
 */

export interface MigrationResult {
  success: boolean;
  originalVersion: number;
  newVersion: number;
  changes: string[];
  data: League;
}

/**
 * Migrates a league to the current version
 */
export function migrateLeagueToCurrentVersion(rawLeague: unknown): MigrationResult {
  const league = rawLeague as Record<string, unknown>;
  const originalVersion = (league.version as number) ?? -1; // -1 for pre-versioned data
  
  let currentData = { ...league };
  const changes: string[] = [];
  let migrationVersion = originalVersion;

  // Handle pre-versioned data (version -1 -> 0)
  if (originalVersion === -1) {
    currentData = migrateFromPreVersioned(currentData);
    changes.push('Migrated from pre-versioned data to version 0');
    migrationVersion = 0;
  }

  // Future migrations would go here:
  // if (migrationVersion === 0) {
  //   currentData = migrateFromV0ToV1(currentData);
  //   changes.push('Migrated from version 0 to version 1');
  //   migrationVersion = 1;
  // }

  // Ensure we're at the current version
  if (migrationVersion !== CURRENT_LEAGUE_VERSION) {
    throw new Error(`Cannot migrate from version ${originalVersion} to ${CURRENT_LEAGUE_VERSION}`);
  }

  return {
    success: true,
    originalVersion,
    newVersion: CURRENT_LEAGUE_VERSION,
    changes,
    data: currentData as League
  };
}

/**
 * Migrates pre-versioned league data to version 0
 */
function migrateFromPreVersioned(league: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...league };

  // Add version field
  migrated.version = 0;

  // Ensure sport field exists and handle deprecated values
  if (!migrated.sport) {
    migrated.sport = 'simple';
  } else if (migrated.sport === 'ping-pong') {
    migrated.sport = 'simple'; // Migrate deprecated ping-pong to simple
  }

  // Ensure required arrays exist
  if (!Array.isArray(migrated.players)) {
    migrated.players = [];
  }
  if (!Array.isArray(migrated.seasons)) {
    migrated.seasons = [];
  }
  if (!Array.isArray(migrated.brackets)) {
    migrated.brackets = [];
  }

  // Ensure timestamps exist
  if (!migrated.createdAt) {
    migrated.createdAt = new Date().toISOString();
  }
  if (!migrated.updatedAt) {
    migrated.updatedAt = new Date().toISOString();
  }

  // Clean up seasons - remove sport field if it exists (moved to league level)
  if (Array.isArray(migrated.seasons)) {
    migrated.seasons = migrated.seasons.map((season: unknown) => {
      const s = { ...(season as Record<string, unknown>) };
      if ('sport' in s) {
        delete s.sport;
      }
      return s;
    });
  }

  // Clean up brackets - remove rounds field if it exists (replaced by finalMatch)
  if (Array.isArray(migrated.brackets)) {
    migrated.brackets = migrated.brackets.map((bracket: unknown) => {
      const b = { ...(bracket as Record<string, unknown>) };
      if ('rounds' in b) {
        delete b.rounds;
      }
      // Ensure required fields
      if (!Array.isArray(b.players)) b.players = [];
      if (!Array.isArray(b.seedings)) b.seedings = [];
      if (!b.name) b.name = 'Untitled Bracket';
      return b;
    });
  }

  return migrated;
}

/**
 * Checks if a league needs migration
 */
export function needsMigration(league: unknown): boolean {
  const l = league as Record<string, unknown>;
  const version = l.version as number;
  return version === undefined || version < CURRENT_LEAGUE_VERSION;
}

/**
 * Gets the version of a league object
 */
export function getLeagueVersion(league: unknown): number {
  const l = league as Record<string, unknown>;
  return (l.version as number) ?? -1;
}

/**
 * Validates if a league is at the current version
 */
export function isCurrentVersion(league: unknown): boolean {
  return getLeagueVersion(league) === CURRENT_LEAGUE_VERSION;
}

/**
 * Safe league loader with automatic migration
 */
export function loadLeagueWithMigration(rawData: unknown): League {
  try {
    if (!needsMigration(rawData)) {
      return rawData as League;
    }

    const result = migrateLeagueToCurrentVersion(rawData);
    
    if (result.changes.length > 0) {
      console.log(`🔄 League migrated from v${result.originalVersion} to v${result.newVersion}:`, result.changes);
    }

    return result.data;
  } catch (error) {
    console.error('❌ Failed to migrate league data:', error);
    
    // Return minimal valid league as fallback
    return {
      slug: 'error-league',
      name: 'Error Loading League',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: CURRENT_LEAGUE_VERSION,
      sport: 'simple',
      players: [],
      seasons: [],
      brackets: []
    };
  }
}

/**
 * Creates a new league with the current version
 */
export function createNewLeague(data: Omit<League, 'version'>): League {
  return {
    ...data,
    version: CURRENT_LEAGUE_VERSION
  };
}
