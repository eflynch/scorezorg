#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Generating JSON schemas...');

// Generate JSON schemas
try {
  execSync('npx typescript-json-schema src/app/types.ts League --out schemas/league.schema.json --required', { stdio: 'inherit' });
  execSync('npx typescript-json-schema src/app/types.ts Player --out schemas/player.schema.json --required', { stdio: 'inherit' });
  execSync('npx typescript-json-schema src/app/types.ts Match --out schemas/match.schema.json --required', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to generate JSON schemas:', error.message);
  process.exit(1);
}

console.log('🔧 Generating TypeScript schema definitions...');

// Read JSON schemas
const leagueSchema = JSON.parse(fs.readFileSync('schemas/league.schema.json', 'utf8'));
const playerSchema = JSON.parse(fs.readFileSync('schemas/player.schema.json', 'utf8'));
const matchSchema = JSON.parse(fs.readFileSync('schemas/match.schema.json', 'utf8'));

// Generate TypeScript file
const tsContent = `// Auto-generated schema definitions
// Run \`npm run generate-schemas\` to regenerate

export const leagueSchema = ${JSON.stringify(leagueSchema, null, 2)} as const;

export const playerSchema = ${JSON.stringify(playerSchema, null, 2)} as const;

export const matchSchema = ${JSON.stringify(matchSchema, null, 2)} as const;
`;

// Write TypeScript file
fs.writeFileSync('src/app/schemas.ts', tsContent);

console.log('✅ JSON schemas generated successfully!');
console.log('');
console.log('Generated files:');
console.log('  - schemas/league.schema.json');
console.log('  - schemas/player.schema.json');
console.log('  - schemas/match.schema.json');
console.log('  - src/app/schemas.ts (for client-side use)');
console.log('');
console.log('You can now use the validators from src/app/validators.ts in both server and client code!');
