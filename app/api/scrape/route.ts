// app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import browserbaseUtil from '@/utils/browserbase';

export async function POST(request: NextRequest) {
    const logs: string[] = [];
    try {
        logs.push("Received scrape request");
        const { urls } = await request.json() as { urls: string[] };

        if (!Array.isArray(urls) || urls.length === 0) {
            logs.push("Invalid or empty URLS array");
            return NextResponse.json(
                { error: 'Invalid or empty URLS array', logs },
                { status: 400 }
            );
        }

        logs.push(`Attempting to scrape URLs: ${urls.join(', ')}`);
        const results = await browserbaseUtil.loadURLs(urls);
        logs.push("Scraping completed");

        const success = results.every(result => !result.startsWith('Error'));

        return NextResponse.json({
            success,
            data: results,
            sessionId: browserbaseUtil.currentSession?.id,
            logs
        });
    } catch (error) {
        logs.push(`Error scraping URLs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Error scraping URLs:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error', logs },
            { status: 500 }
        );
    }
}