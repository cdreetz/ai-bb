import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.browserbase.com/v1/sessions', {
      method: 'GET',
      headers: {
        'X-BB-API-Key': process.env.BROWSERBASE_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sessions = await response.json();
    // Find the last running session
    const lastRunningSession = sessions.find((session: { status: string }) => session.status === 'RUNNING');

    // Always return a 200 status code with the session data
    return NextResponse.json({
      lastSessionId: lastRunningSession ? lastRunningSession.id : null,
      allSessions: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    // Return a 500 status code for server errors
    return NextResponse.json({ message: 'Error fetching sessions', error: (error as Error).message }, { status: 500 });
  }
}
