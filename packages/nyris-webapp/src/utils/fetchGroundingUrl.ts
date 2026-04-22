export const fetchGroundedContent = async (prompt: string) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_API_KEY';
  const geminiModel = 'gemini-3.1-flash-lite-preview';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          // Enable Google Search grounding
          tools: [{ googleSearch: {} }],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `HTTP Error: ${response.status}`,
      );
    }

    const data = await response.json();

    // 1. Extract the main text safely using optional chaining
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No content generated.';
    //   setResultText(text);

    // 2. Extract the Grounding Citation URLs
    const metadata = data.candidates?.[0]?.groundingMetadata;
    const extractedCitations: { title: any; url: any }[] = [];

    // Check if groundingChunks exist in the response
    if (metadata?.groundingChunks) {
      metadata.groundingChunks.forEach(
        (chunk: { web: { uri: any; title: any } }) => {
          // URLs from Google Search are stored in the 'web' object
          if (chunk.web && chunk.web.uri) {
            extractedCitations.push({
              title: chunk.web.title || 'Untitled Source',
              url: chunk.web.uri,
            });
          }
        },
      );
    }
    console.log({ extractedCitations });
    return { text, citations: extractedCitations };
    //   setCitations(extractedCitations);
  } catch (err) {
    console.error('Fetch error:', err);
    //   setError(err.message);
  } finally {
    //   setIsLoading(false);
  }
};
