// lib/openrouter.ts
import { ProductData } from '@/types';

export async function generateProductInfo(rawText: string): Promise<ProductData> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not defined in .env.local');
    }

    const prompt = `ACT AS an expert e-commerce copywriter.
    
    GOAL: Transform the raw product text below into high-converting marketing copy.
    
    INSTRUCTIONS:
    1. Tone: writes like a human, not a robot. Use simple, everyday words (Grade 8 reading level). Avoid "AI clichés" like "unleash," "elevate," "unlock," "masterpiece," "symphony," or "game-changer."
    2. Title: Create a catchy, clear product title.
    3. Description: Write a persuasive 3-4 sentence paragraph. Focus on BENEFITS. Address pain points. Be direct and authentic.
    4. Features: Extract 4-6 key selling points. Keep them EXTREMELY SHORT (max 6 words). Must fit on one line on mobile.
    
    CRITICAL OUTPUT RULE: Return ONLY valid, parseable JSON. Do not wrap in markdown code blocks.
    
    Required JSON Format:
    {
      "title": "Your optimized title",
      "description": "Your persuasive description",
      "features": ["Short Feature 1", "Short Feature 2", "Short Feature 3", "Short Feature 4"]
    }

    Raw Product Text:
    ${rawText.slice(0, 4000)}`;

    console.log('Sending request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Product Generator Tool',
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    // Check HTTP status
    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
        });
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const json = await response.json();

    // Log the full response for debugging
    console.log('OpenRouter Response:', JSON.stringify(json, null, 2));

    // Check for API-level errors
    if (json.error) {
        console.error('OpenRouter returned error:', json.error);
        throw new Error(`OpenRouter error: ${json.error.message || JSON.stringify(json.error)}`);
    }

    if (!json.choices || json.choices.length === 0) {
        console.error('No choices in response. Full response:', json);
        throw new Error('No response from AI - the model did not return any content. Check the console logs for details.');
    }

    try {
        const content = json.choices[0].message.content;

        // Clean up potential markdown formatting
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanContent) as ProductData;
    } catch (e) {
        console.error("Failed to parse AI response:", e);
        console.error("Raw content:", json.choices[0]?.message?.content);
        throw new Error("AI response was not valid JSON");
    }
}