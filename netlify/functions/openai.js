const { OpenAI } = require("openai")

const openai = new OpenAI({
  apiKey: process.env.APIKEY_OPENAI,
});

// Chat only
async function chatGptApi(query, prompt = '') {
  const messages = [];
  if (prompt) messages.push({ role: 'system', content: prompt });
  messages.push({ role: 'user', content: query });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // atau 'gpt-3.5-turbo'
    messages,
  });

  return { message: response.choices[0].message.content };
}

// Image generation
async function generateImageFromPrompt(prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3", // pakai "dall-e-2" kalau API kamu belum support DALL·E 3
    prompt,
    n: 1,
    size: "1024x1024"
  });

  return { media: response.data[0].url };
}

// Netlify handler
exports.handler = async (event, context) => {
  const { query, prompt, image } = event.queryStringParameters || {};

  if (!query) {
    return {
      statusCode: 406,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'Masukkan parameter query'
      }, null, 2)
    };
  }

  try {
    if (!process.env.APIKEY_OPENAI) throw new Error('API key is missing.');

    const result = image === 'true'
      ? await generateImageFromPrompt(query)
      : await chatGptApi(query, prompt);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: true,
        creator: 'Kyy',
        result
      }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 500,
        message: `Terjadi kesalahan: ${e.message}`
      }, null, 2)
    };
  }
};
