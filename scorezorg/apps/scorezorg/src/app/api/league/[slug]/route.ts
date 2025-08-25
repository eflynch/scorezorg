import { NextResponse, NextRequest } from 'next/server';
import { query } from '../../../../lib/db';
import { isLeague } from '@/app/validators';

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
    const leagueData = await getLeagueData(slug);

    if (!leagueData) {
      return new NextResponse(
        JSON.stringify({ error: 'League not found' }), 
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

  if (!isLeague(content)) {
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
        [content, slug]
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