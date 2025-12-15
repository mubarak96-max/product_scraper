// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { scrapeProductUrl } from '@/lib/scraper';
import { generateProductInfo } from '@/lib/openrouter';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
        }

        // 1. Scrape
        const rawText = await scrapeProductUrl(url);

        // 2. Generate
        const productData = await generateProductInfo(rawText);

        // 3. Respond
        return NextResponse.json({ success: true, data: productData });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}