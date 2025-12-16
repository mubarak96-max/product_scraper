// lib/openrouter.ts
import { ProductData } from '@/types';

export async function generateProductInfo(rawText: string): Promise<ProductData> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not defined in .env.local');
    }

    const prompt = `ACT AS an expert e-commerce copywriter specializing in conversion-focused product descriptions.
GOAL: Transform raw product information into persuasive marketing copy that drives sales.
TONE & STYLE:

Write like a real person having a conversation, not a corporate marketing robot
Use simple, everyday language (Grade 8 reading level)
Be direct and authentic—no fluff or hype
BANNED PHRASES: "unleash," "elevate," "unlock," "masterpiece," "symphony," "game-changer," "revolutionize," "transform your life," "take X to the next level"

OUTPUT FORMAT:
Title: (50-60 characters)

Clear, benefit-driven product name
Include key differentiator if possible

Description: (3-4 sentences, 60-100 words)

Lead with the main benefit or problem solved
Focus on outcomes, not just what it is
Make it specific and tangible
DO NOT start with a question

Key Features: (4-6 short bullet points)

Maximum 6 words each (must fit one line on mobile)
Lead with benefit, not technical spec
Example: "Charges fully in 30 minutes" NOT "Fast-charging technology"

IMPORTANT:

Benefits = what the customer gains ("saves you 2 hours daily")
Features = what it has ("built-in timer")
Always prioritize benefits
    
    CRITICAL OUTPUT RULE: Return ONLY valid, parseable JSON. Do not wrap in markdown code blocks.
    
    Required JSON Format:
    {
      "title": "Your optimized title",
      "description": "Your persuasive description",
      "features": ["Short bullet point 1", "Short bullet point 2", "Short bullet point 3", "Short bullet point 4"]
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