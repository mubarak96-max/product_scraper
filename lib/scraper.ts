// lib/scraper.ts
import * as cheerio from 'cheerio';

export async function scrapeProductUrl(url: string): Promise<string> {
    try {
        // 1. Fetch the HTML
        // We add a User-Agent to look like a real browser, otherwise many sites block the request.
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();

        // 2. Load into Cheerio
        const $ = cheerio.load(html);

        // 3. Remove clutter (scripts, styles, ads)
        $('script, style, noscript, iframe, link, svg').remove();

        // 4. Extract body text
        // We grab the main content or body, then clean up whitespace.
        const rawText = $('body').text().replace(/\s+/g, ' ').trim();

        // Limit text length to avoid token limits (approx 8000 chars is usually plenty)
        return rawText.substring(0, 8000);
    } catch (error) {
        console.error('Scraping error:', error);
        throw new Error('Could not scrape the product page. Ensure the URL is public.');
    }
}