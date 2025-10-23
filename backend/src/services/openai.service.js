import OpenAI from 'openai';

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('🤖 OpenAI service configured');
} else {
  console.log('ℹ️  OpenAI API key not configured, AI image generation will be disabled');
}

/**
 * Generate AI image using DALL-E
 */
export const generateAIImage = async (prompt) => {
  if (!openai) {
    console.log('🖼️  AI image generation skipped (no API key configured)');
    throw new Error('OpenAI service not configured');
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });

    return response.data[0].url;
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw new Error('Failed to generate AI image');
  }
};

/**
 * Generate text using GPT (optional - for future use)
 */
export const generateText = async (prompt, options = {}) => {
  if (!openai) {
    console.log('💬 Text generation skipped (no API key configured)');
    throw new Error('OpenAI service not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: options.model || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI text generation error:', error);
    throw new Error('Failed to generate text');
  }
};

