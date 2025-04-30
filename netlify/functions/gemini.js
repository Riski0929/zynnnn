const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const FormData = require('form-data');

const apikeyList = [
  'AIzaSyDoyBsozIUfDGGvxMYkFQTsEzsob7a0pFQ',
  'AIzaSyDgzEssV7L2ZB6ybKmIr2XvN5ZV8Jyu8OQ',
  'AIzaSyC8eiu4jeYWSgW-mTZmnb1Ki6ieWT8YmrE'
];

function randomApikey() {
  return apikeyList[Math.floor(Math.random() * apikeyList.length)];
}

async function uploadToCatbox(buffer, filename = 'image.png') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, filename);

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders()
  });

  return res.data;
}

async function geminiAi(query, apikey, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!apikey) reject({ status: 401, error: 'Unauthorized' });

      const gemini = new GoogleGenerativeAI(apikey);
      const model = gemini.getGenerativeModel({
        ...(options.prompt ? { systemInstruction: options.prompt } : {}),
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: {
          responseModalities: ['Text', 'Image']
        }
      });

      const { response } = await model.generateContent([
        { text: query },
        ...(options.media ? [{
          inlineData: {
            mimeType: options.mime,
            data: Buffer.from(options.media).toString('base64')
          }
        }] : [])
      ]);

      const hasil = {};

      if (
        response?.promptFeedback?.blockReason === 'OTHER' ||
        response?.candidates?.[0]?.finishReason === 'IMAGE_SAFETY'
      ) return resolve(hasil);

      for (const part of response.candidates[0].content.parts) {
        if (part.text) hasil.message = part.text;

        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          const uniqueFilename = `gemini_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
          const uploaded = await uploadToCatbox(buffer, uniqueFilename);
          hasil.media = uploaded;
        }
      }

      resolve(hasil);
    } catch (e) {
      reject(e);
    }
  });
}

// FORMAT NETLIFY FUNCTION
exports.handler = async (event, context) => {
  const params = event.queryStringParameters;
  const { query, prompt } = params;

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
    const apikey = randomApikey();

    const result = await geminiAi(query, apikey, {
      ...(prompt ? { prompt } : {})
    });

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
