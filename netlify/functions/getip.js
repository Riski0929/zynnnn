const axios = require('axios');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';

    const { data } = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);

    // Setup transporter with environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail', // atau ganti dengan service lain sesuai kebutuhan
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: `Hai Owner`,
      to: process.env.RECEIVER_EMAIL,
      subject: 'New IP Logged',
      text: `IP: ${data.ip}
Region: ${data.region}
City: ${data.city}
Country: ${data.country}
Location: ${data.loc}
Org: ${data.org}`
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

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
