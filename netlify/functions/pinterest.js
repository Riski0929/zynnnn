const axios = require('axios');

exports.handler = async (event) => {
  const query = event.queryStringParameters?.query;
  if (!query) {
    return {
      statusCode: 400,
      body: 'Query parameter is required'
    };
  }

  try {
    const baseUrl = 'https://www.pinterest.com/resource/BaseSearchResource/get/';
    const params = {
      source_url: '/search/pins/?q=' + encodeURIComponent(query),
      data: JSON.stringify({
        options: {
          isPrefetch: false,
          query,
          scope: 'pins',
          no_fetch_context_on_resource: false
        },
        context: {}
      }),
      _: Date.now()
    };

    const headers = {
      'accept': 'application/json, text/javascript, */*, q=0.01',
      'accept-encoding': 'gzip, deflate',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-requested-with': 'XMLHttpRequest',
      'referer': 'https://www.pinterest.com/'
    };

    const { data } = await axios.get(baseUrl, { headers, params });
    const results = data.resource_response?.data?.results ?? [];

    if (!results.length) {
      return {
        statusCode: 404,
        body: 'No image found'
      };
    }

    const imageUrl = results[0]?.images?.['736x']?.url;
    if (!imageUrl) {
      return {
        statusCode: 404,
        body: 'Image URL not found'
      };
    }

    const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const contentType = imageRes.headers['content-type'] || 'image/jpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType
      },
      body: imageRes.data.toString('base64'),
      isBase64Encoded: true
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};
