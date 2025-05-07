const axios = require('axios');

exports.handler = async (event) => {
  const query = event.queryStringParameters?.query;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: false, message: "Parameter 'query' wajib diisi." })
    };
  }

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
    'dnt': '1',
    'referer': 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'x-app-version': 'c056fb7',
    'x-pinterest-appstate': 'active',
    'x-requested-with': 'XMLHttpRequest'
  };

  try {
    const { data } = await axios.get(baseUrl, { headers, params });
    const results = data.resource_response?.data?.results ?? [];
    const result = results.map(item => ({
      pin: 'https://www.pinterest.com/pin/' + (item.id ?? ''),
      link: item.link ?? '',
      created_at: new Date(item.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      id: item.id ?? '',
      images_url: item.images?.['736x']?.url ?? '',
      grid_title: item.grid_title ?? ''
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: true, query, result }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: false, message: `Error: ${e.message}` }, null, 2)
    };
  }
};
