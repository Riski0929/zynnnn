const axios = require('axios');

// Function to interact with ChatGPT API (text only)
async function chatGptApi(query, apikey, options = {}) {
  if (!apikey) throw { status: 401, error: 'Unauthorized' };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apikey}`
  };

  const messages = [];
  if (options.prompt) messages.push({ role: 'system', content: options.prompt });
  messages.push({ role: 'user', content: query });

  const payload = {
    model: 'gpt-4', // atau 'gpt-3.5-turbo'
    messages
  };

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });
  const textResponse = response.data.choices[0].message.content;

  return { message: textResponse };
}

// Function to generate image via DALL·E
async function generateImageFromPrompt(prompt, apikey) {
  if (!apikey) throw { status: 401, error: 'Unauthorized' };

  const response = await axios.post('https://api.openai.com/v1/images/generations', {
    prompt,
    n: 1,
    size: '512x512'
  }, {
    headers: {
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json'
    }
  });

  return { media: response.data.data[0].url };
}

// FORMAT NETLIFY FUNCTION
exports.handler = async (event, context) => {
  const params = event.queryStringParameters;
  const { query, prompt, image } = params;

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
    const apikey = process.env.APIKEY_OPENAI;
    if (!apikey) throw new Error('API key is missing.');

    const result = (image === 'true')
      ? await generateImageFromPrompt(query, apikey)
      : await chatGptApi(query, apikey, prompt ? { prompt } : {});

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
