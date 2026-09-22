import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { SiteConfigData, DEFAULT_SITE_CONFIG } from '@/lib/siteConfigTypes';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin permissions required.' },
        { status: 401 }
      );
    }

    const { prompt, currentConfig }: { prompt: string; currentConfig?: SiteConfigData } =
      await req.json();

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'ANTHROPIC_API_KEY environment variable is not configured. Please set ANTHROPIC_API_KEY in your .env file.',
        },
        { status: 500 }
      );
    }

    const contextConfig = currentConfig || DEFAULT_SITE_CONFIG;

    const systemPrompt = `You are an expert AI UI/UX visual theme designer for DocVault.
Your task is to take a natural language theme request from an admin and propose a complete, beautiful visual theme and copy configuration.

Current Configuration Context:
${JSON.stringify(contextConfig, null, 2)}

REQUIREMENTS:
1. You MUST return ONLY a raw valid JSON object matching the exact SiteConfig structure below.
2. DO NOT include markdown code fences (like \`\`\`json or \`\`\`), commentary, or any text before/after the JSON.
3. Ensure color combinations are accessible, high-contrast, modern, and dark-mode friendly unless user explicitly requests light theme.
4. Set backgroundTheme to one of: "aurora", "particles", "waves", "cybergrid".
5. Set loginLayout style to one of: "centered", "split", "fullBackground".

REQUIRED JSON OUTPUT FORMAT:
{
  "branding": {
    "siteName": "string",
    "logoUrl": "string or null",
    "faviconUrl": "string or null",
    "loginPageLogoUrl": "string or null"
  },
  "theme": {
    "primaryColor": "hex string e.g. #3b82f6",
    "secondaryColor": "hex string e.g. #8b5cf6",
    "accentColor": "hex string e.g. #10b981",
    "backgroundColor": "hex string e.g. #09090b",
    "textColor": "hex string e.g. #f4f4f5",
    "fontFamily": "Inter | Geist | Roboto | Outfit | Playfair Display | Fira Code",
    "borderRadius": "string e.g. 16px"
  },
  "content": {
    "loginHeadline": "string",
    "loginSubtext": "string",
    "footerText": "string",
    "ctaButtonText": "string",
    "emptyStateMessages": {
      "noDocuments": "string",
      "noExpiring": "string"
    }
  },
  "loginLayout": {
    "style": "centered | split | fullBackground",
    "show3DBackground": boolean,
    "backgroundTheme": "aurora | particles | waves | cybergrid"
  }
}`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate a custom theme proposal based on this request: "${prompt.trim()}"`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('[AI Assist] Anthropic API Error:', errText);
      return NextResponse.json(
        {
          success: false,
          error: `AI Service Error (${anthropicRes.status}): ${anthropicRes.statusText}`,
        },
        { status: 502 }
      );
    }

    const aiData = await anthropicRes.json();
    const rawText = aiData?.content?.[0]?.text || '';

    // Clean JSON response string (strip markdown code blocks if AI generated them)
    let cleanedJsonText = rawText.trim();
    if (cleanedJsonText.startsWith('```')) {
      cleanedJsonText = cleanedJsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let proposal: Partial<SiteConfigData>;
    try {
      proposal = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error('[AI Assist] JSON Parse Failure:', parseError, rawText);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI theme response into valid SiteConfig JSON.',
          rawResponse: rawText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'AI Assist endpoint error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
