#!/bin/bash

# Generate JSON schemas from TypeScript types
echo "🔧 Generating JSON schemas..."

cd /Users/eflynch/repos/scorezorg/scorezorg/apps/scorezorg

# Generate schemas for each type
npx typescript-json-schema src/app/types.ts League --out schemas/league.schema.json --required
npx typescript-json-schema src/app/types.ts Player --out schemas/player.schema.json --required  
npx typescript-json-schema src/app/types.ts Match --out schemas/match.schema.json --required

# Generate TypeScript schema definitions for client-side use
echo "🔧 Generating TypeScript schema definitions..."

# Read the JSON files and create the TypeScript file
{
  echo "// Auto-generated schema definitions"
  echo "// Run \`npm run generate-schemas\` to regenerate"
  echo ""
  
  echo "export const leagueSchema = "
  cat schemas/league.schema.json
  echo " as const;"
  echo ""
  
  echo "export const playerSchema = "
  cat schemas/player.schema.json  
  echo " as const;"
  echo ""
  
  echo "export const matchSchema = "
  cat schemas/match.schema.json
  echo " as const;"
} > src/app/schemas.ts

echo "✅ JSON schemas generated successfully!"
echo ""
echo "Generated files:"
echo "  - schemas/league.schema.json"
echo "  - schemas/player.schema.json" 
echo "  - schemas/match.schema.json"
echo "  - src/app/schemas.ts (for client-side use)"
echo ""
echo "You can now use the validators from src/app/validators.ts in both server and client code!"
