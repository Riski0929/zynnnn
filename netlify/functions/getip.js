const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';

    // Ambil info IP dari ipinfo.io
    const { data } = await axios.get(`https://ipinfo.io/${ip}?token=bf2e607b007c45`); // Public token gratis

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: true,
        result: {
          ip: data.ip,
          region: data.region,
          city: data.city,
          country: data.country,
          loc: data.loc,
          org: data.org
        }
      }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        message: `Terjadi kesalahan: ${e.message}`
      }, null, 2)
    };
  }
};
