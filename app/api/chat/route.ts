import OpenAI from 'openai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate that we have messages
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-api-key-here') {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured. Please add your API key to .env.local'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Ask OpenAI for a streaming chat completion given the messages
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Create a ReadableStream from the OpenAI response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while processing your request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
