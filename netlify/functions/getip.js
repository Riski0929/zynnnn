const axios = require('axios');

// Simpan IP di memory global
let ipList = global.ipList || [];
global.ipList = ipList;

const saveIp = (ip) => {
  if (!ipList.includes(ip)) {
    ipList.push(ip);
  }
};

exports.handler = async (event) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    saveIp(ip);

    const { data } = await axios.get(`https://ipinfo.io/${ip}?token=bf2e607b007c45`);

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
      body: JSON.stringify({ status: false, message: `Error: ${e.message}` }, null, 2)
    };
  }
};
