// lib/openrouter.ts
import { ProductData } from '@/types';

export async function generateProductInfo(rawText: string): Promise<ProductData> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not defined in .env.local');
    }

    const prompt = `Analyze this product page text and return ONLY a JSON object (no markdown, no explanation).

Format:
{
  "title": "Short catchy product name",
  "description": "3 sentence SEO-optimized description",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
}

Product Text:
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