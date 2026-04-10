exports.handler = async (event) => {
  const path = event.rawPath || event.path || '';

  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

  // ✅ Gemini API 프록시
  if (path.includes('/api/gemini')) {
    try {
      const { prompt, maxTokens = 2000 } = body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: { message: 'GEMINI_API_KEY not configured' } }) };
      }

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 1 },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { statusCode: response.status, body: JSON.stringify({ error }) };
      }

      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
    }
  }

  // ✅ Claude API 프록시
  if (path.includes('/api/claudeProxy') || path.includes('/api/claude')) {
    try {
      const { model, max_tokens, messages } = body;
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not configured' } }) };
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model, max_tokens, messages }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { statusCode: response.status, body: JSON.stringify({ error }) };
      }

      const data = await response.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
};
