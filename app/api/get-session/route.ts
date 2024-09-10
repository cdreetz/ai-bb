import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.browserbase.com/v1/sessions/${id}`, {
      method: 'GET',
      headers: {
        'X-BB-API-Key': process.env.BROWSERBASE_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sessionData = await response.json();

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Error fetching session', message: (error as Error).message },
      { status: 500 }
    );
  }
}
