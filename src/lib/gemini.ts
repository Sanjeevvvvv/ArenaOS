export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function sendMessageToGemini(messages: ChatMessage[], systemPrompt?: string, language?: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Failed to communicate with ArenaAI:', error);
    return "I'm sorry, I am currently experiencing connection difficulties. The local emergency system remains fully functional. Please proceed with standard operations.";
  }
}
