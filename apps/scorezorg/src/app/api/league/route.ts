import { League } from "@/app/types";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { generate } from "random-words";
import { CURRENT_LEAGUE_VERSION } from "@/app/utils/migrations";

const generateSlug = () => {
    // join some random words from the dictionary. use a library
    return generate({ exactly: 4, join: "-" });
}

const createLeague = async (slug: string, content: League) => {
    try {
        const result = await query(
            'INSERT INTO leagues (slug, content) VALUES ($1, $2) RETURNING *',
            [slug, content]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching league data:', error);
        throw new Error('Failed to fetch league data');
    }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 405 });
}

// Post
export async function POST(request: NextRequest) {
    // add a new league to the database
    const slug = generateSlug();
    console.log('Adding league:', slug);
    
    try {
        const body = await request.json();
        const { name = "New League", sport = 'simple' } = body;
        
        const newLeague = await createLeague(slug, {
            slug,
            name,
            sport,
            version: CURRENT_LEAGUE_VERSION,
            players: [],
            seasons: [],
            brackets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        return new NextResponse(
            JSON.stringify(newLeague), 
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }), 
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

}