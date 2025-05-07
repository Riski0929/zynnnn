const axios = require('axios')

exports.handler = async (event) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';

  
    const { data } = await axios.get(`https://ipinfo.io/${ip}?token=ISI_TOKEN_DISINI`);

    
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "IP Logger", email: process.env.SENDER_EMAIL },
      to: [{ email: process.env.RECEIVER_EMAIL }],
      subject: "New IP Logged",
      textContent: `IP: ${data.ip}
Region: ${data.region}
City: ${data.city}
Country: ${data.country}
Location: ${data.loc}
Org: ${data.org}`
    }, {
      headers: {
        'api-key': process.env.ZYNN_KEY,
        'Content-Type': 'application/json'
      }
    });

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
