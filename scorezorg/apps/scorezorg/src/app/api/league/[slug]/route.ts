import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../../lib/db';
import { isLeague } from '@/app/validators';
import { loadLeagueWithMigration, needsMigration } from '@/app/utils/migrations';

const getLeagueData = async (slug: string) => {
    try {
        const result = await query(
            'SELECT content FROM leagues WHERE slug = $1',
            [slug]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0].content;
    } catch (error) {
        console.error('Error fetching league data:', error);
        throw new Error('Failed to fetch league data');
    }
}
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  
  try {
    // You can now use the slug parameter
    console.log('League slug:', slug);

    // now I want to get this data from the database
    const rawLeagueData = await getLeagueData(slug);

    if (!rawLeagueData) {
      return new NextResponse(
        JSON.stringify({ error: 'League not found' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle migration on server-side
    let leagueData = rawLeagueData;
    if (needsMigration(rawLeagueData)) {
      console.log('🔄 Server: League data needs migration, migrating...');
      leagueData = loadLeagueWithMigration(rawLeagueData);
      
      // Save migrated data back to database
      try {
        await query(
          'UPDATE leagues SET content = $1 WHERE slug = $2',
          [leagueData, slug]
        );
        console.log('✅ Server: Migrated league data saved to database');
      } catch (updateError) {
        console.error('⚠️ Server: Failed to save migrated data:', updateError);
        // Continue with migrated data even if save fails
      }
    }

    return new NextResponse(
      JSON.stringify(leagueData), 
      {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  
  try {
    // You can now use the slug parameter
    console.log('Deleting league with slug:', slug);

    const result = await query(
        'DELETE FROM leagues WHERE slug = $1 RETURNING *',
        [slug]
    );

    if (result.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'League not found' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify(result.rows[0]), 
      {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params;
  const { content } = await request.json();

  // Handle migration before validation
  let leagueData = content;
  if (needsMigration(content)) {
    console.log('🔄 Server: Incoming league data needs migration, migrating...');
    leagueData = loadLeagueWithMigration(content);
  }

  if (!isLeague(leagueData)) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid league data' }), 
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  try {
    // You can now use the slug parameter
    console.log('Updating league with slug:', slug);

    const result = await query(
        'UPDATE leagues SET content = $1 WHERE slug = $2 RETURNING *',
        [leagueData, slug]
    );

    if (result.rows.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'League not found' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify(result.rows[0]), 
      {
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